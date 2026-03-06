//components/SnapPix.tsx
import Script from 'next/script';
import { FC } from 'react';

// Define props type for SnapPix
interface SnapPixProps {
  event?: 'PURCHASE';
  userEmail?: string;
}

const SnapPix: FC<SnapPixProps> = ({ event, userEmail }) => {
  const pixelId = '4fec6043-1a8d-49a2-8d68-5f8f4454425d';

  return (
    <>
      <Script id="snap-pixel-script" strategy="afterInteractive">
        {`
          (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
          {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
          a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
          r.src=n;var u=t.getElementsByTagName(s)[0];
          u.parentNode.insertBefore(r,u);})(window,document,
          'https://sc-static.net/scevent.min.js');
          
          snaptr('init', '${pixelId}', ${userEmail ? `{ 'user_email': '${userEmail}' }` : '{}'});
          
          snaptr('track', 'PAGE_VIEW');
          ${event === 'PURCHASE' ? "snaptr('track', 'PURCHASE');" : ''}
        `}
      </Script>
    </>
  );
};

export default SnapPix;

