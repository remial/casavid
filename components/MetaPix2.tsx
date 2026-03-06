//components/MetaPix2.tsx
import Script from 'next/script';
import { FC } from 'react';

// Define props type for MetaPix
interface MetaPixProps {
  event?: 'Purchase';
}

const MetaPix2: FC<MetaPixProps> = ({ event }) => {
  const pixelId = '1943527686101052';

  return (
    <>
      <Script id="meta-pixel-script" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
          ${event === 'Purchase' ? "fbq('track', 'Purchase');" : ''}
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView${
            event === 'Purchase' ? '&ev=Purchase' : ''
          }&noscript=1`}
          alt="Facebook Pixel"
        />
      </noscript>
    </>
  );
};

export default MetaPix2;
