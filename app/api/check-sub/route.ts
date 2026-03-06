//app/api/check-sub/route.ts
import { adminDB } from "@/firebase-admin";

// Function to check user's subscription status in Firestore
export async function checkSub(userId: string) {
    try {
        // Reference to the customer's subscription document in Firestore
        const subscriptionRef = adminDB.collection('customers').doc(userId).collection('subscriptions');
        const userRef = adminDB.collection('users').doc(userId);
        const subscriptionSnapshot = await subscriptionRef.get();
        const userSnapshot = await userRef.get();

        if (subscriptionSnapshot.empty || !userSnapshot.exists) {
            //console.log("No active subscription found or user does not exist.");
            return { 
                isSubscribed: false, 
                priceId: null, 
                seriesLimit: 0, 
                weeklyLimit: 0, 
                credits: 0,
                subscriptionExpiry: undefined 
            };  // Return default limits
        }

        // Get user data
        const userData = userSnapshot.data();
        let currentCredits = userData?.credits || 0;
        let lastCreditUpdate = userData?.lastCreditUpdate || 0;

        // Iterate through the subscriptions and check the current period end
        let isSubscribed = false;
        let planId: string | null = null;
        let seriesLimit = 0;
        let weeklyLimit = 0;
        let maxCredits = 0;  // Max credits based on plan
        let subscriptionExpiry: number | undefined = undefined;  // Use undefined as fallback

        const currentDate = Math.floor(Date.now() / 1000); // Current date in Unix timestamp (seconds)

        subscriptionSnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.current_period_end && data.current_period_end > currentDate && data.active) {
                // Subscription is valid
                isSubscribed = true;
                subscriptionExpiry = data.current_period_end;  // Set to a number (timestamp)

                // Get the plan id (price)
                if (data.items && data.items[0] && data.items[0].plan && data.items[0].plan.id) {
                    planId = data.items[0].plan.id;
                }

                // Map plan id (price) to series and weekly limits, and set max credits to top-up
                if (planId === "price_1PwkyVLqZXIo1J6dwuKYUk4I") { // First plan id
                    seriesLimit = 1;
                    weeklyLimit = 3;
                    maxCredits = 15;  // Top-up to 15 credits
                } else if (planId === "price_1PwkzpLqZXIo1J6d8eV0CnuK") { // Second plan id
                    seriesLimit = 1;
                    weeklyLimit = 7;
                    maxCredits = 40;  // Top-up to 40 credits
                }

                // Check if credits need to be topped up for this billing period
                if (lastCreditUpdate < data.current_period_start) {
                    // If the user's current credits are less than the maxCredits, top up to maxCredits
                    if (currentCredits < maxCredits) {
                        currentCredits = maxCredits;

                        // Update the user's credits and lastCreditUpdate in Firestore
                        userRef.update({
                            credits: currentCredits,
                            lastCreditUpdate: data.current_period_end // Set this to the current period end
                        });
                    }
                }
            }
        });

        return { 
            isSubscribed, 
            priceId: planId, 
            seriesLimit, 
            weeklyLimit, 
            credits: currentCredits,
            subscriptionExpiry 
        };
    } catch (error) {
        console.error("Error checking user subscription:", error);
        return { 
            isSubscribed: false, 
            priceId: null, 
            seriesLimit: 0, 
            weeklyLimit: 0, 
            credits: 0,
            subscriptionExpiry: undefined 
        };  // Use defaults if error
    }
}
