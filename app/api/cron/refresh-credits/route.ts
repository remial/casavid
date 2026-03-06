// app/api/cron/refresh-credits/route.ts
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Security: Verify the request is from an authorized source
// You should set this in your environment variables
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error('Unauthorized cron job request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting credit refresh job...');
    
    const now = admin.firestore.Timestamp.now();
    const usersRef = admin.firestore().collection('users');
    
    // Find all users whose nextCreditRefresh is in the past or today
    const usersToRefresh = await usersRef
      .where('isSubscribed', '==', true)
      .where('nextCreditRefresh', '<=', now)
      .get();

    if (usersToRefresh.empty) {
      console.log('No users need credit refresh at this time');
      return NextResponse.json({ 
        success: true, 
        message: 'No users to refresh',
        refreshed: 0 
      });
    }

    let refreshedCount = 0;
    const errors: string[] = [];

    for (const userDoc of usersToRefresh.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      try {
        const { subLevel, billingPeriod } = userData;
        
        if (!subLevel || !billingPeriod) {
          console.warn(`User ${userId} missing subLevel or billingPeriod, skipping`);
          continue;
        }

        // Determine credits and limits based on subLevel
        let credits = 0;
        let maxCredits = 0;
        let weeklyLimit = 0;
        let seriesLimit = 1;

        if (subLevel === 1) {
          credits = 13;
          maxCredits = 13;
          weeklyLimit = 3;
        } else if (subLevel === 2) {
          credits = 31;
          maxCredits = 31;
          weeklyLimit = 7;
        } else if (subLevel === 3) {
          credits = 62;
          maxCredits = 62;
          weeklyLimit = 14;
        }

        // Calculate next refresh date (1 month from now for both monthly and yearly)
        const nextRefreshDate = new Date();
        nextRefreshDate.setMonth(nextRefreshDate.getMonth() + 1);
        const nextCreditRefresh = admin.firestore.Timestamp.fromDate(nextRefreshDate);

        // Update user with refreshed credits
        await usersRef.doc(userId).update({
          credits: maxCredits, // Reset to max credits
          lastCreditRefresh: now,
          nextCreditRefresh,
          weeklyLimit,
          seriesLimit,
        });

        console.log(`✓ Refreshed credits for user ${userId} (${billingPeriod}, subLevel ${subLevel})`);
        refreshedCount++;
      } catch (error) {
        const errorMsg = `Failed to refresh user ${userId}: ${(error as Error).message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Credit refresh job completed. Refreshed: ${refreshedCount}, Errors: ${errors.length}`);
    
    return NextResponse.json({
      success: true,
      refreshed: refreshedCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Credit refresh job failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(req: Request) {
  return GET(req);
}



