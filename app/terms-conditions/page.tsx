import React from 'react';
import "../../app/globals.css";

const TermsConditions: React.FC = () => {
  return (
    <div className="terms-conditions p-6">
      <h1 className="text-3xl font-bold mb-4">Terms &amp; Conditions</h1>
      <h2 className="text-xl font-semibold mb-2">Last Updated: Mar 2026</h2>
      <h2 className="text-xl font-semibold mb-6">CasaVid operated by Aimero Ltd</h2>

      <p className="mb-6">
        Aimero Ltd offers CasaVid and related services to you, a user, under the condition that you accept all of our set terms, including these Terms of Service and all related policies.
      </p>

      <h3 className="text-lg font-semibold mb-2">Usage of CasaVid Services</h3>
      <p className="mb-4">
        Thank you for choosing CasaVid software solutions and services (the Services). These Terms of Service (the Agreement) define your rights regarding the Service generated data, AI-generated text and image outputs (the Outputs), your use of the Services, and important aspects such as dispute resolution. Please read them attentively. Our privacy policy, detailing data handling, is included in this Agreement. This Agreement is between Aimero Ltd and the entity or person agreeing to these terms (Customer), governing Customer access and use of the Services.
      </p>
      <p className="mb-6">
        This Agreement is effective upon Customer acceptance and commencement of Services use (the Effective Date). These terms may be periodically updated and will be re-presented to the Customer. Continued Services use signifies acceptance of updated terms. Discontinue use if you disagree with the Agreement.
      </p>

    
      <h3 className="text-lg font-semibold mb-2">Service Availability and Quality</h3>
      <p className="mb-6">
        The Services are subject to change, including but not limited to software features, AI models, and algorithms. No guarantees are made regarding quality, stability, uptime, or reliability. Aimero Ltd is not liable for any dependencies formed on the Services or Outputs.
      </p>

      <h3 className="text-lg font-semibold mb-2">AI-Generated Text &amp; Image Outputs</h3>
      <p className="mb-4">
        The CasaVid Services include AI-generated text, images, speech and videos. Users must verify the accuracy and appropriateness of AI-generated content. Aimero Ltd is not liable for any incorrect, inappropriate, or misleading AI-generated content.
      </p>
      <p className="mb-6">
        AI-generated content may not represent real events, objects, or people. They could be fictitious or deformed. Aimero Ltd holds no liability for any consequences arising from the use of these AI-generated content.
      </p>

      <h3 className="text-lg font-semibold mb-2">Age Requirements</h3>
      <p className="mb-6">
        Services are accessible to users 18 years or older, or the minimum age of digital consent in their country. Parental agreement is required for users below the age of authority.
      </p>

      <h3 className="text-lg font-semibold mb-2">Your Information</h3>
      <p className="mb-6">
        By using the Services, you may provide personal information. Our policy outlines how this information is handled. Both parties agree to comply with applicable data protection laws.
      </p>

      <h3 className="text-lg font-semibold mb-2">Copyright and Trademark</h3>
      <p className="mb-6">
        Users own their Uploads. Aimero Ltd owns all Generations. Exclusive rights to reproduce and display Generations are granted to the user, subject to compliance with these terms.
      </p>

      <h3 className="text-lg font-semibold mb-2">DMCA and Takedowns Policy</h3>
      <p className="mb-6">
        If you believe your copyright or trademark is infringed by the Service, contact{' '}
        <a href="mailto:aimeromailbox@gmail.com" className="text-blue-500 underline">
          aimeromailbox@gmail.com
        </a>{' '}
        for request processing.
      </p>

      <h3 className="text-lg font-semibold mb-2">Dispute Resolution and Governing Law</h3>
      <p className="mb-6">
        Disputes will be governed by the laws of the United Kingdom, subject to arbitration in accordance with the UK Arbitration Association Rules.
      </p>

      <h3 className="text-lg font-semibold mb-2">Ownership and Data Privacy</h3>
      <p className="mb-6">
        Aimero Ltd respects your data privacy and security, adhering to strict policies and employing robust security measures.
      </p>

      <h3 className="text-lg font-semibold mb-2">Payment and Billing</h3>
      <p className="mb-4">
        Billing is through a third-party payment service, with the right to terminate Services for violations.
      </p>
      <p className="mb-6">
        We occasionally run discount promotions that can be applied to the first month of a subscription.
      </p>

      <h3 className="text-lg font-semibold mb-2">Refund Policy</h3>
      <p className="mb-6">
        Subscription fees are non-refundable due to server and other operational costs incurred in providing the Services. By subscribing, you acknowledge that all fees paid are final and non-refundable. No credits, refunds, or prorated adjustments will be issued for cancellations or partially used subscription periods.
      </p>

      <h3 className="text-lg font-semibold mb-2">Community Guidelines</h3>
      <p className="mb-6">
        Guidelines emphasize respect, appropriate content, and responsible sharing. Violations may lead to service bans.
      </p>

      <h3 className="text-lg font-semibold mb-2">Limitation of Liability and Indemnity</h3>
      <p className="mb-6">
        Aimero Ltd provides the Services as is without any guarantees. Users are responsible for their use and consequences thereof, including those resulting from AI-generated content such as text and images.
      </p>

      <h3 className="text-lg font-semibold mb-2">Miscellaneous</h3>
      <p className="mb-6">
        Includes clauses on Force Majeure, No Agency, Severability, No Third-Party Beneficiaries, and Survival of certain terms.
      </p>

      <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
      <p>
        For queries or concerns, contact Aimero Ltd at{' '}
        <a href="mailto:aimeromailbox@gmail.com" className="text-blue-500 underline">
          aimeromailbox@gmail.com
        </a>.
      </p>
    </div>
  );
};

export default TermsConditions;
