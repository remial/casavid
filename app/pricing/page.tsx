"use client"
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import UpgradeButton from '@/components/UpgradeButton'
import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PLANS } from '@/src/config/stripe'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Check,
  HelpCircle,
  Minus,
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useState } from 'react'

type BillingPeriod = 'monthly' | 'yearly';

const Page = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const pricingItems = [
    {
      plan: 'Starter',
      tagline: 'Perfect for trying it out',
      quota: 5,
      features: [
        { text: '5 videos per month' },
        { text: 'Up to 10 photos per video' },
        { text: '30-second videos' },
        { text: 'AI narration' },
        { text: 'Auto subtitles' },
        { 
          text: '720p quality',
          negative: true 
        },
        { 
          text: 'CasaVid watermark',
          negative: true 
        },
        { 
          text: 'Email support',
          negative: true 
        },
      ],
    },
    {
      plan: 'Pro',
      tagline: 'For active agents',
      quota: 20,
      features: [
        { text: '20 videos per month' },
        { text: 'Up to 10 photos per video' },
        { text: '60-second videos' },
        { text: 'AI narration + 4 voices' },
        { text: 'Auto subtitles' },
        { text: '1080p HD quality' },
        { text: 'No watermark' },
        { text: 'Priority support' },
      ],
    },
    {
      plan: 'Business',
      tagline: 'For teams & brokerages',
      quota: -1,
      features: [
        { text: 'Unlimited videos' },
        { text: 'Up to 10 photos per video' },
        { text: '2-minute videos' },
        { text: 'All voice styles' },
        { text: 'Custom branding/logo' },
        { text: '4K quality option' },
        { text: 'Priority processing' },
        { text: 'Dedicated support' },
      ],
    },
  ]

  return (
    <>
      <MaxWidthWrapper className='mb-8 mt-8 text-center max-w-7xl'>
        <div className='mx-auto mb-10 sm:max-w-lg'>
          <h1 className='text-3xl font-bold sm:text-4xl text-gray-800'>
            Turn Every Listing Into a Video Tour 🏠
          </h1>
          <p className='mt-4 text-lg text-gray-600'>
            Choose the plan that fits your needs
          </p>
          <p className='mt-2 text-sm text-gray-500'>
            All plans include AI narration &amp; subtitles
          </p>
        </div>

        <div className='pt-8 grid grid-cols-1 gap-8 lg:grid-cols-3'>
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const planDetails = PLANS.find(p => p.slug === plan.toLowerCase());
              const yearlyPrice = planDetails?.price.yearly.amount || 0;
              const priceId = planDetails?.price[billingPeriod].priceIds.production;
              
              const displayPrice = billingPeriod === 'yearly' 
                ? Math.ceil(yearlyPrice / 12)
                : planDetails?.price.monthly.amount || 0;

              return (
                <div
                  key={plan}
                  className={cn(
                    'relative rounded-xl bg-white shadow-lg',
                    {
                      'border-2 border-blue-500 shadow-blue-100': plan === 'Pro',
                      'border border-gray-200': plan !== 'Pro',
                    }
                  )}>
                  {plan === 'Pro' && (
                    <div className='absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-blue-500 px-3 py-1.5 text-sm font-medium text-white'>
                      Most Popular!
                    </div>
                  )}

                  <div className='p-6'>
                    <h3 className='my-2 text-center font-display text-2xl font-bold text-gray-800'>
                      {plan}
                    </h3>
                    <p className='text-gray-500 text-sm'>
                      {tagline}
                    </p>
                    <p className='my-4 font-display text-4xl font-bold text-gray-800'>
                      ${displayPrice}
                      <span className='text-base font-normal text-gray-500'>/month</span>
                    </p>
                    <p className='text-sm text-gray-600 font-medium'>
                      {quota === -1 ? 'Unlimited videos' : `${quota} videos per month`}
                    </p>
                  </div>

                  <ul className='my-6 space-y-4 px-6'>
                    {features.map(({ text, footnote, negative }) => (
                      <li key={text} className='flex items-start space-x-3'>
                        <div className='flex-shrink-0 mt-0.5'>
                          {negative ? (
                            <Minus className='h-5 w-5 text-gray-300' />
                          ) : (
                            <Check className='h-5 w-5 text-green-600' />
                          )}
                        </div>
                        <p className={cn('text-sm text-gray-600', { 'text-gray-400': negative })}>
                          {text}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className='border-t border-gray-100' />
                  <div className='p-6'>
                    {user ? (
                      <UpgradeButton 
                        priceId={priceId} 
                        billingPeriod={billingPeriod} 
                        planName={plan} 
                      />
                    ) : (
                      <Link
                        href="/auth/signin"
                        className={buttonVariants({ 
                          className: cn(
                            'w-full',
                            plan === 'Pro' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          )
                        })}
                        onClick={(e) => {
                          e.preventDefault();
                          signIn();
                        }}
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </TooltipProvider>
        </div>

        {/* What's included section */}
        <div className='mt-16 max-w-4xl mx-auto'>
          <h3 className='text-xl font-bold text-gray-800 mb-6'>What's included in every video:</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {[
              { icon: '🎙️', text: 'Professional AI narration' },
              { icon: '📝', text: 'Auto-generated subtitles' },
              { icon: '🎬', text: 'Smooth Ken Burns transitions' },
              { icon: '🎵', text: 'Background music' },
              { icon: '📱', text: 'Multiple export formats' },
              { icon: '☁️', text: 'Cloud storage for videos' },
            ].map(({ icon, text }) => (
              <div key={text} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                <span className='text-2xl'>{icon}</span>
                <span className='text-sm text-gray-700'>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All plans include */}
        <div className='mt-12 max-w-3xl mx-auto'>
          <h3 className='text-lg font-bold text-gray-800 mb-4'>All plans include:</h3>
          <div className='flex flex-wrap justify-center gap-4'>
            {[
              'Unlimited revisions',
              'Fast processing',
              'Download anytime',
              'Share to social media',
              'MLS-ready exports',
            
            ].map((feature) => (
              <span key={feature} className='flex items-center gap-1 text-sm text-gray-600'>
                <Check className='h-4 w-4 text-green-600' />
                {feature}
              </span>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </>
  )
}

export default Page
