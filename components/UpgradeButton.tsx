import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Button } from './ui/button';
import { auth, app } from '@/firebase';
import { getCheckoutUrl } from '@/app/_account/stripePayment';
import { PLANS } from '@/src/config/stripe';

// Adding index signature to allow any string key
const promotionCodeMap: { [key: string]: string } = {
  REMOVE20: 'promo_1QGajlLqZXIo1J6dn3VLXRTn',
  remove20: 'promo_1QGajlLqZXIo1J6dn3VLXRTn', // example mapping
  //CCMBF30:  'promo_1QPLS5LqZXIo1J6dHX2UIM3m',
};

type UpgradeButtonProps = {
  priceId?: string; 
  className?: string;
  billingPeriod?: 'monthly' | 'yearly';
  planName?: string; // Plan name for tracking
};

const UpgradeButton = ({ priceId, billingPeriod = 'monthly', planName }: UpgradeButtonProps) => {
  const [couponCode, setCouponCode] = useState(''); // State to store coupon code
  const [error, setError] = useState(''); // State to store any errors
  const [isLoading, setIsLoading] = useState(false); // State to track loading
  const router = useRouter();

  // Clear coupon code whenever billing period changes
  useEffect(() => {
    setCouponCode('');
    setError('');
  }, [billingPeriod]);

  const upgradeSub = async () => {
    if (!priceId) {
      console.error("No priceId provided for upgrade");
      return;
    }

    // Prevent multiple clicks
    if (isLoading) {
      return;
    }
  
    // Initialize as undefined instead of null
    let promoApiId: string | undefined = undefined;
  
    // Validate the user-entered coupon code and convert it to the promotion API ID
    if (couponCode) {
      promoApiId = promotionCodeMap[couponCode]; // Set to undefined if not found
      if (!promoApiId) {
        setError('Invalid promotion code. Please try again with capital letters and no spaces.');
        return;
      }
    }
  
    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors
      
      // Store plan info in sessionStorage for tracking on success page
      if (typeof window !== 'undefined' && planName) {
        sessionStorage.setItem('datafast_purchase_plan', planName);
        sessionStorage.setItem('datafast_purchase_billing', billingPeriod);
        
        // Store the purchase amount for Meta pixel tracking (as fallback)
        const planDetails = PLANS.find(p => p.name.toLowerCase() === planName.toLowerCase());
        if (planDetails) {
          const amount = planDetails.price[billingPeriod]?.amount || 0;
          sessionStorage.setItem('meta_purchase_amount', amount.toString());
        }
      }
      
      const checkoutUrl = await getCheckoutUrl(app, priceId, promoApiId); // This is now valid
      router.push(checkoutUrl);
    } catch (error) {
      console.error("Error during checkout:", error);
      setError('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };
  

  return (
    <>
      {/* Input for Coupon Code - only show for monthly plans */}
      {billingPeriod === 'monthly' && (
        <input
          type="text"
          placeholder="Coupon Code Here"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="input-class mb-2 ml-8"
          disabled={isLoading}
        />
      )}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <Button 
        onClick={upgradeSub} 
        disabled={isLoading}
        className='w-full rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed'
      >
        {isLoading ? (
          <>
            <Loader2 className='h-5 w-5 mr-2 animate-spin' />
            🔒 Preparing secure Checkout...
          </>
        ) : (
          <>
            👑 Get Access 👑 <ArrowRight className='h-5 w-5 ml-1.5' />
          </>
        )}
      </Button>
    </>
  );
};

export default UpgradeButton;
