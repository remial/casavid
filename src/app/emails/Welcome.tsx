//src/app/emails/Welcome.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";


const baseUrl = `https://www.casavid.com`;

export const WelcomeEmail = () => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to CasaVid! Transform your property photos into stunning videos</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#2563eb",
                offwhite: "#fafbfb",
              },
              spacing: {
                0: "0px",
                20: "20px",
                45: "45px",
              },
            },
          },
        }}
      >
        <Body className="bg-offwhite text-base font-sans">
          <Img
            src={`${baseUrl}/logo.png`}
            width="100"
            height="75"
            alt="CasaVid"
            className="mx-auto my-20"
          />
          <Container className="bg-white p-45">
            <Heading className="text-center my-0 leading-8">
              Welcome to CasaVid 🏠
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">
                  Thank you for joining CasaVid! ✨
                </Text>

                <Text className="text-base mt-4">
                  CasaVid transforms your property photos into professional, AI-narrated video tours in minutes. Perfect for real estate agents, property managers, and homeowners.
                </Text>

                <Text className="text-base mt-4">
                  Here's how to create your first property video:
                </Text>
              </Row>
            </Section>

            <ul>
              <li className="mb-20">
                <strong>1. Upload Your Photos</strong> - Add 1-10 high-quality photos of your property
              </li>
              <li className="mb-20">
                <strong>2. Add Property Details</strong> - Specify bedrooms, bathrooms, and key features
              </li>
              <li className="mb-20">
                <strong>3. Choose Your Style</strong> - Select video length and narrator voice
              </li>
              <li className="mb-20">
                <strong>4. Generate & Share</strong> - Get your professional video tour ready to share!
              </li>
            </ul>

            <div className="flex justify-center">
              <Button
                className="bg-blue-600 text-white rounded-lg py-3 px-[18px]"
                href={`${baseUrl}/dashboard`}
              >
                Create Your First Video
              </Button>
            </div>

            <div className="flex justify-center mt-4">
              <Img
                src={`${baseUrl}/samples.png`}
                alt="CasaVid property video samples"
                width="100%"
                className="rounded-lg shadow-lg"
              />
            </div>

            <Text className="text-base mt-4 text-center">
              Questions? Just reply to this email - we're here to help!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
