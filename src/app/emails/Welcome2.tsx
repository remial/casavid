// src/app/emails/Welcome2.tsx
import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";

export const Welcome2 = () => {
  const pricingUrl = "https://www.vidnarrate.com/pricing";
  const discountCode = "REMOVE20";

  return (
    <Html>
      <Head />
      <Preview>Welcome to VidNarrate 🎉</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {},
          },
        }}
      >
        <Body className="bg-white text-base font-sans">
          <Container className="bg-white p-8">
            <Text className="leading-6">Hello there,</Text>

            <Text className="mt-4 leading-6">
              Thank you for visiting VidNarrate today. We are so glad you stopped
              by.
            </Text>

            <Text className="mt-4 leading-6">
              At Vidnarrate, we use{" "}
              <span className="font-bold">the very latest AI technology</span> to
              help you convert any topic you want into stunning videos, and it can also be automatically uploaded to your YouTube channel in seconds!
            </Text>

            <Text className="mt-4 leading-6">
              Here's the good news; our welcome gift to you: use code{" "}
              <span className="text-green-600 font-bold">{discountCode}</span> for
              20% off your first subscription today. Yes! ⭐
            </Text>

            <Text className="mt-2 leading-6">
              You can visit the{" "}
              <Link href={pricingUrl} className="text-blue-500 underline">
                Pricing Page
              </Link>{" "}
              to get started.
            </Text>

            <Text className="mt-4 leading-6">
              Think of us as your personal video butler minus the tuxedo 😄.
            </Text>

            <Text className="mt-4 leading-6">
              As a VidNarrate user, you have access to Customer Support every day of the week,{" "}
              <span className="font-bold">even on weekends</span>! So send us an email if you need
              anything.
            </Text>

            <Text className="mt-4 leading-6">
              We look forward to having you on board our exciting and creative
              ride.
            </Text>

            <Text className="mt-6 mb-0 leading-6">Best regards,</Text>
            <Text className="m-0 font-bold leading-6">
              VidNarrate Customer Support
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Welcome2;
