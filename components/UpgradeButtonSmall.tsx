"use client";

import { useRouter } from "next/navigation";
import { Button } from './ui/button';
import { app } from '@/firebase';
import { getCheckoutUrl } from '@/app/_account/stripePayment';

const UpgradeButtonSmall = () => {
  const router = useRouter();
  const priceId = 'price_1PwkyVLqZXIo1J6dwuKYUk4I'; // Starter monthly plan - $19

  const upgradeSub = async () => {
    if (!priceId) {
      console.error("No priceId provided for upgrade");
      return;
    }

    try {
      // Store the purchase amount for Meta pixel tracking (as fallback)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('meta_purchase_amount', '19'); // Starter monthly price
        sessionStorage.setItem('datafast_purchase_plan', 'starter');
        sessionStorage.setItem('datafast_purchase_billing', 'monthly');
      }
      
      const checkoutUrl = await getCheckoutUrl(app, priceId);
      router.push(checkoutUrl);
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return (
    <div className="flex justify-center">
      <Button 
        onClick={upgradeSub} 
        className='bg-green-600 text-white text-xl hover:bg-green-300 flex items-center justify-center py-4 px-6'
        style={{ minWidth: '250px' }}
      >
        <div className="flex items-center justify-center">
         
          <span className="mx-2 whitespace-normal text-center">
            Generate More...
          </span>
          <span role="img" aria-label="point left">⏭ </span>
        </div>
      </Button>
    </div>
  );
};

export default UpgradeButtonSmall;
