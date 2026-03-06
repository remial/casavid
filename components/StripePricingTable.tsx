"use client"
import React, { useEffect } from 'react';

const useScript = (src: any) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src]);
};

export const StripePricingTable = () => {
  useScript('https://js.stripe.com/v3/pricing-table.js');

  return React.createElement('stripe-pricing-table', {
    'pricing-table-id': "prctbl_1OXASTLqZXIo1J6d7fmoj2Gg",
    'publishable-key': "pk_test_51OPvR6LqZXIo1J6d2XeLYxCBbPY5KG6Epb1U7yqKkxQxwG2dQqg2g79183nilav2Jt7gh7hI8vuoRu3MuvluOjjS00WirBjs7W",
  });
};

export default StripePricingTable;
