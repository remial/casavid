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

interface SecurityAlertEmailProps {
  userId: string;
  userEmail: string;
  maliciousInput: string;
  inputType: string;
  timestamp: string;
}

const baseUrl = `https://www.casavid.com`;

export const SecurityAlertEmail = ({ 
  userId, 
  userEmail, 
  maliciousInput, 
  inputType,
  timestamp 
}: SecurityAlertEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>🛡️ Security Alert - Potential XSS Attack Blocked</Preview>
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
            alt="CasaVid"
            className="mx-auto my-20"
          />
          <Container className="bg-white p-45">
            <Heading className="text-center my-0 leading-8 text-orange-600">
              🛡️ Security Alert: Attack Blocked
            </Heading>

            <Section>
              <Text className="text-base font-bold mt-4">
                A potential XSS/injection attack was blocked.
              </Text>
              
              <Text className="text-base bg-gray-100 p-4 rounded">
                <strong>User ID:</strong> {userId}<br />
                <strong>Email:</strong> {userEmail}<br />
                <strong>Input Type:</strong> {inputType}<br />
                <strong>Time:</strong> {timestamp}
              </Text>

              <Text className="text-base mt-4">
                <strong>Blocked Input:</strong>
              </Text>
              <Text className="text-sm bg-orange-50 p-4 rounded text-orange-800 font-mono break-all">
                {maliciousInput}
              </Text>
            </Section>

            <Section>
              <Text className="text-base mt-4 bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
                <strong>Recommended Action:</strong><br />
                Review this user's activity. Consider warning or banning if this appears intentional.
              </Text>
            </Section>

            <Section>
              <Text className="text-center mt-20 text-gray-500 text-sm">
                This is a rate-limited alert. You will not receive another security notification for the next 1 hour.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SecurityAlertEmail;
