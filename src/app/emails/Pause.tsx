// src/app/emails/Pause.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";

export const Pause = () => {
  const pricingUrl = "https://www.vidnarrate.com/pricing";

  return (
    <Html>
      <Head />
      <Preview>Your Latest Payment 😎</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {},
          },
        }}
      >
        <Body className="bg-white text-base font-sans">
          <Container className="bg-white p-8">
            <Text className="leading-6">
              Hello there,
            </Text>

            <Text className="mt-4 leading-6">
              It looks like your latest payment didn’t go through. 
              No worries, it does happen. It might just be the bank having a short nap.
            </Text>

            <Text className="mt-4 leading-6">
              Your VidNarrate video generation and YouTube scheduling are temporarily on pause for now.
            </Text>

            <Text className="mt-4 leading-6">
              Remember, if you have questions or need a hand, you can drop us a line at{" "}
              <Link href="mailto:aimeromailbox@gmail.com">Customer Support </Link> or reply to this email 😊
            </Text>

            <Text className="mt-4 leading-6">
              Here's the good news: We are currently running a double-up promo which doubles the amount of video you can generate{" "}
              <span className="font-bold underline">at no additional cost to you</span>.
            </Text>

            <Text className="mt-4 leading-6">
              To get things rolling again, you can pick a plan on our:{" "}
              <Link href={pricingUrl}>Pricing Page</Link> and then let us know if you want the double up applied to your subscription.
            </Text>

            <Text className="mt-4 leading-6">
              As a Vidnarrate user, you always have access to Customer Support every day of the week and even on weekends! We look forward to hearing from you.
            </Text>

            <Text className="mt-6 mb-0 leading-6">Cheers,</Text>
            <Text className="m-0 font-bold leading-6">The VidNarrate Team</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Pause;
