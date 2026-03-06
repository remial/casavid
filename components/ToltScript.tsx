// components/ToltScript.tsx

import Script from 'next/script';

const ToltScript = () => {
  return (
    <>
      <Script
        id="tolt-script"
        src="https://cdn.tolt.io/tolt.js"
        data-tolt="9d3d1aa2-96ba-4724-9bdc-571dd26c23ec"
        strategy="lazyOnload"
      />
    </>
  );
};

export default ToltScript;

