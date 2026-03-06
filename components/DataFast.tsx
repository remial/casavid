// components/DataFast.tsx

import Script from 'next/script';

const DataFast = () => {
  return (
    <>
      {/* Queue script for reliable tracking - ensures events are captured even when triggered before main script loads */}
      <Script
        id="datafast-queue"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.datafast = window.datafast || function() {
              window.datafast.q = window.datafast.q || [];
              window.datafast.q.push(arguments);
            };
          `,
        }}
      />
      <Script
        id="datafast-script"
        strategy="afterInteractive"
        defer
        data-website-id="dfid_FNXO2l1O9pvThevsFsnPL"
        data-domain="www.vidnarrate.com"
        src="https://datafa.st/js/script.js"
      />
    </>
  );
};

export default DataFast;

