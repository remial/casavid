// components/GoogleAdsTag.tsx

import Script from 'next/script';

const GTag = () => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=AW-11323828600"
        async
      />
      <Script id="google-ads-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'AW-11323828600');
          
        `}
      </Script>
    </>
  );
};

export default GTag;
