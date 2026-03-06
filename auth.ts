//auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAuth, adminDB } from "./firebase-admin";
import admin from "firebase-admin";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { Adapter } from "next-auth/adapters";
import { checkSub } from "./app/api/check-sub/route";

async function sendWelcomeEmail(userEmail: string) {
    console.log("Sending Welcome email to user...");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
    // Send request to email API
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'; // Use environment variable or fallback to localhost
    const emailResponse = await fetch(`${baseUrl}/api/emails/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         userEmail: userEmail, // Pass userEmail as part of the request
      }),
    });
    console.log("User Email is ", userEmail)
  
    if (!emailResponse.ok) {
      console.error('Failed to send email:', await emailResponse.text());
      throw new Error('Failed to send email');
    }
  
    console.log("Welcome email sent successfully to:", userEmail);
}

// Extend NextAuth types to include the new properties
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            isSubscribed?: boolean;
            image?: string | null;
            credits?: number;
            creditsCinema?: number;
            subscriptionExpiry?: number;
            seriesLimit?: number;
            weeklyLimit?: number;
            subLevel?: number;
            // Note: isUS is used internally and transferred via JWT
        };
    }
    interface User {
        isUS?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        credits?: number;
        isUS?: boolean;
    }
}

// The authOptions config
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials) {
                    return Promise.resolve(null);
                }

                const { email, password } = credentials;

                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const firebaseUser = userCredential.user;
                    if (firebaseUser) {
                        const id: string = firebaseUser.uid;
                        const name: string | null = firebaseUser.displayName;
                        const email: string = firebaseUser.email || '';

                        // Fetch subscription data using the new subscription logic
                        const subscriptionData = await checkSub(id);

                        // Construct the user object with subscription data
                        const user = { 
                            id, 
                            name, 
                            email, 
                            isSubscribed: subscriptionData.isSubscribed,
                            subscriptionExpiry: subscriptionData.subscriptionExpiry,
                            seriesLimit: subscriptionData.seriesLimit,
                            weeklyLimit: subscriptionData.weeklyLimit
                        };
                        return Promise.resolve(user);
                    } else {
                        throw new Error('User not found');
                    }
                } catch (error: any) {
                    // Suppress all auth errors - they're mostly user input issues
                    return Promise.resolve(null);
                }
            }
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        newUser: '/dashboard',
    },
    callbacks: {
        signIn: async (params) => {
            const { user, account, profile, email, credentials } = params;
            // Cast params to any to access the req property
            // const req = (params as any).req;
            // // Determine the user's IP address by checking multiple headers
            // let ip = req?.headers["x-forwarded-for"] || req?.headers["x-real-ip"] || req?.connection?.remoteAddress || "";
            // if (Array.isArray(ip)) {
            //     ip = ip[0];
            // }
            // if (typeof ip === "string" && ip.includes(",")) {
            //     ip = ip.split(",")[0].trim();
            // }
            // try {
            //     // Fetch geolocation data using IP
            //     const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
            //     const geoData = await geoResponse.json();
            //     // Attach isUS property to user object based on geolocation
            //     user.isUS = geoData.country === "United States";
            //     console.log("User country determined as:", geoData.country);
            // } catch (error) {
            //     console.error("Failed to determine user's country:", error);
            //     user.isUS = false;
            // }
            return true;
        },
        session: async ({ session, token }) => {
            if (session?.user) {
                if (token.sub) {
                    session.user.id = token.sub;

                    // Use the new subscription logic to update the session
                    const subscriptionData = await checkSub(token.sub);
                    session.user.isSubscribed = subscriptionData.isSubscribed;
                    session.user.subscriptionExpiry = subscriptionData.subscriptionExpiry;
                    session.user.seriesLimit = subscriptionData.seriesLimit;
                    session.user.weeklyLimit = subscriptionData.weeklyLimit;

                    // Create a Firebase custom token
                    const firebaseToken = await adminAuth.createCustomToken(token.sub);
                    session.firebaseToken = firebaseToken;

                    // Handle the credits field with transaction to prevent race conditions
                    const userRef = adminDB.collection('users').doc(token.sub);
                    let shouldSendWelcomeEmail: string | null = null;
                    
                    try {
                        await adminDB.runTransaction(async (transaction) => {
                            const docSnapshot = await transaction.get(userRef);
                            const data = docSnapshot.data();

                            // Ensure the email is only sent if credits are undefined and the email hasn't been sent
                            if ((!docSnapshot.exists || (data && !data.hasOwnProperty('credits'))) && !data?.welcomeEmailSent) {
                                const userEmail = session?.user?.email;
                                if (userEmail) {
                                    // Set credits to 1 if user is from the United States, otherwise 0
                                    const initialCredits = token.isUS ? 0 : 0;
                                    
                                    // Atomic write within transaction to prevent duplicate emails
                                    transaction.set(userRef, { 
                                        credits: initialCredits, 
                                        welcomeEmailSent: true 
                                    }, { merge: true });
                                    
                                    session.user.credits = initialCredits;
                                    
                                    // Mark to send email after transaction commits
                                    shouldSendWelcomeEmail = userEmail;
                                    console.log("Credited User: ", userEmail, "with", initialCredits, "credit(s)");
                                } else {
                                    console.warn("userEmail is undefined, skipping welcome email.");
                                }
                            } else {
                                session.user.credits = data?.credits || 0;
                            }

                            // Set creditsCinema in session from existing data (don't initialize it)
                            session.user.creditsCinema = data?.creditsCinema || 0;

                            // Set subLevel in session
                            session.user.subLevel = data?.subLevel || 0;

                            // Check if the user has isSubscribed field and set it to false.
                            if (!docSnapshot.exists || (data && !data.hasOwnProperty('isSubscribed'))) {
                                transaction.set(userRef, { isSubscribed: false }, { merge: true });
                                session.user.isSubscribed = false;  // Set default isSubscribed to false
                            } else {
                                session.user.isSubscribed = data?.isSubscribed;
                            }
                        });
                        
                        // DISABLED: Welcome email temporarily disabled
                        // if (shouldSendWelcomeEmail) {
                        //     try {
                        //         let emailShouldBeSent = false;
                        //         await adminDB.runTransaction(async (emailTransaction) => {
                        //             const emailDoc = await emailTransaction.get(userRef);
                        //             const emailData = emailDoc.data();
                        //             if (emailData?.welcomeEmailSent === true) {
                        //                 if (!emailData?.welcomeEmailSentAt) {
                        //                     emailTransaction.set(userRef, { 
                        //                         welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp() 
                        //                     }, { merge: true });
                        //                     emailShouldBeSent = true;
                        //                 }
                        //             }
                        //         });
                        //         if (emailShouldBeSent) {
                        //             await sendWelcomeEmail(shouldSendWelcomeEmail);
                        //         } else {
                        //             console.log("Welcome email already sent by another request, skipping duplicate");
                        //         }
                        //     } catch (emailError) {
                        //         console.error("Error in email send verification transaction:", emailError);
                        //         await sendWelcomeEmail(shouldSendWelcomeEmail);
                        //     }
                        // }
                        
                    } catch (error) {
                        console.error("Error accessing Firestore:", error);
                    }
                }
            }
            return session;
        },
        jwt: async ({ user, token }) => {
            if (user) {
                token.sub = user.id;
                // Pass the isUS property from user to token if available
                if (user.hasOwnProperty("isUS")) {
                    token.isUS = user.isUS;
                }
            }
            return token;
        },
    },
    session: {
        strategy: 'jwt',
    },
    adapter: FirestoreAdapter(adminDB) as unknown as Adapter,
    logger: {
        error() {
            // Suppress all auth errors
        },
        warn() {
            // Suppress all auth warnings
        },
        debug() {
            // Suppress debug logs
        },
    },
} satisfies NextAuthOptions;