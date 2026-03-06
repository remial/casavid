import Script from 'next/script';
import { FC } from 'react';

interface MetaPixProps {
  event?: 'Purchase';
  value?: number;
  currency?: string;
}

const MetaPix: FC<MetaPixProps> = ({ event, value, currency = 'USD' }) => {
  const pixelId = '2196454821184339';

  const getPurchaseEventCode = () => {
    if (event !== 'Purchase') return '';
    
    if (value && value > 0) {
      return `fbq('track', 'Purchase', {value: ${value}, currency: '${currency}'});`;
    }
    return `fbq('track', 'Purchase', {value: 0.00, currency: '${currency}'});`;
  };

  const getNoscriptUrl = () => {
    let url = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView`;
    if (event === 'Purchase') {
      url += `&ev=Purchase`;
      if (value && value > 0) {
        url += `&cd[value]=${value}&cd[currency]=${currency}`;
      }
    }
    url += '&noscript=1';
    return url;
  };

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
          ${getPurchaseEventCode()}
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={getNoscriptUrl()}
          alt="Facebook Pixel"
        />
      </noscript>
    </>
  );
};

export default MetaPix;
