// components/PricingPage.tsx
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const PricingPage: React.FC = () => {
  return (
    <stripe-pricing-table
      pricing-table-id="'{{PRICING_TABLE_ID}}'"
      publishable-key="pk_test_51OPvR6LqZXIo1J6d2XeLYxCBbPY5KG6Epb1U7yqKkxQxwG2dQqg2g79183nilav2Jt7gh7hI8vuoRu3MuvluOjjS00WirBjs7W"
    >
    </stripe-pricing-table>
  );
}

export default PricingPage;
