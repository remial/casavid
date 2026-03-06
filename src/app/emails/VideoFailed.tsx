import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface VideoFailedEmailProps {
  userId: string;
  userEmail: string;
  errorMessage: string;
  videoType: string;
  timestamp: string;
}

const baseUrl = `https://www.vidnarrate.com`;

export const VideoFailedEmail = ({ 
  userId, 
  userEmail, 
  errorMessage, 
  videoType,
  timestamp 
}: VideoFailedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>🚨 Video Generation Failed - Customer Alert</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#2250f4",
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
            src={`${baseUrl}/homespg.png`}
            width="100"
            height="75"
            alt="VidNarrate"
            className="mx-auto my-20"
          />
          <Container className="bg-white p-45">
            <Heading className="text-center my-0 leading-8 text-red-600">
              🚨 Director Yelled Cut!
            </Heading>

            <Section>
              <Text className="text-base font-bold mt-4">
                A customer's video generation failed.
              </Text>
              
              <Text className="text-base bg-gray-100 p-4 rounded">
                <strong>User ID:</strong> {userId}<br />
                <strong>Email:</strong> {userEmail}<br />
                <strong>Video Type:</strong> {videoType}<br />
                <strong>Time:</strong> {timestamp}
              </Text>

              <Text className="text-base mt-4">
                <strong>Error:</strong>
              </Text>
              <Text className="text-sm bg-red-50 p-4 rounded text-red-800 font-mono">
                {errorMessage}
              </Text>
            </Section>

            <Section>
              <Text className="text-center mt-20 text-gray-500 text-sm">
                This is a rate-limited alert. You will not receive another notification about video failures for the next 4 hours.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VideoFailedEmail;

