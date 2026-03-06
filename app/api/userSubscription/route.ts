//api/userSubscription
import { getUserSubscriptionPlan } from '@/lib/stripesub';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from "next/server";


export async function GET(req: Request, res: Response) {
  
  try {
    
    const isSubscribed = await getUserSubscriptionPlan();
   

    const body = JSON.stringify(isSubscribed);
    const buffer = Buffer.from(body);
   
    return new NextResponse(buffer);
  } catch (error : any) {
    
    return new NextResponse(error.message, { status: 500 });
  }
}