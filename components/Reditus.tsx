// components/Reditus.tsx

import Script from 'next/script';

const Reditus = () => {
  return (
    <>
     
      <Script id="reditus-script" strategy="lazyOnload">
        {`
          (function (w, d, s, p, t) { w.gr = w.gr || function () { w.gr.ce = null; w.gr.q = w.gr.q || []; w.gr.q.push(arguments); }; p = d.getElementsByTagName(s)[0]; t = d.createElement(s); t.async = true; t.src = "https://script.getreditus.com/v2.js"; p.parentNode.insertBefore(t, p); })(window, document, "script"); gr("initCustomer", "679ef770-b2ae-4667-9131-47d694b5efb6"); gr("track", "pageview");
          
        `}
      </Script>
    </>
  );
};

export default Reditus;
