//src/app/emails/Welcome.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
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
      <Preview>Welcome to CasaVid! Get 20% off with code REMOVE20</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#16a34a",
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
                  <strong>Use code <span style={{ color: '#16a34a' }}>REMOVE20</span> today for <span style={{ color: '#16a34a' }}>20% OFF</span> your first subscription!</strong>
                </Text>

                <Text className="text-base mt-4">
                  Transform your property photos into professional, AI-narrated video tours in minutes.
                </Text>
              </Row>
            </Section>

            <Section style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button
                className="bg-green-600 text-white rounded-lg py-3 px-[18px]"
                href={`${baseUrl}/dashboard`}
              >
                Create Your First Video
              </Button>
            </Section>

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
