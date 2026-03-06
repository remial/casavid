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
  Hr,
} from "@react-email/components";
import * as React from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatLogEmailProps {
  userEmail: string | null;
  userCategory: string;
  messages: ChatMessage[];
  sessionStart: string;
  sessionEnd: string;
}

const baseUrl = `https://www.casavid.com`;

export const ChatLogEmail = ({
  userEmail,
  userCategory,
  messages,
  sessionStart,
  sessionEnd,
}: ChatLogEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Support Chat Log - {userEmail || "Anonymous User"}</Preview>
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
            <Heading className="text-center my-0 leading-8 text-blue-600">
              Support Chat Log
            </Heading>

            <Section>
              <Text className="text-base bg-gray-100 p-4 rounded mt-4">
                <strong>User:</strong> {userEmail || "Anonymous (not signed in)"}
                <br />
                <strong>User Type:</strong> {userCategory}
                <br />
                <strong>Session Start:</strong> {sessionStart}
                <br />
                <strong>Session End:</strong> {sessionEnd}
                <br />
                <strong>Total Messages:</strong> {messages.length}
              </Text>
            </Section>

            <Hr className="my-4" />

            <Section>
              <Text className="text-base font-bold">Conversation:</Text>

              {messages.map((message, index) => (
                <div key={index}>
                  <Text
                    className={`text-sm p-3 rounded mb-2 ${
                      message.role === "user"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <strong>
                      {message.role === "user" ? "Customer" : "CasaVid Bot"}:
                    </strong>
                    <br />
                    {message.content}
                    <br />
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </Text>
                </div>
              ))}
            </Section>

            <Hr className="my-4" />

            <Section>
              <Text className="text-center mt-20 text-gray-500 text-sm">
                This chat log was automatically sent 30 minutes after the last
                message in the conversation.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ChatLogEmail;
