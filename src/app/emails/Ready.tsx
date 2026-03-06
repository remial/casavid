import {
  Body,
  Button,
  Column,
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

interface ReadyEmailProps {
  videoPageUrl: string; // Accept the videoPageUrl as a prop
}

const baseUrl = `https://www.casavid.com`;

export const ReadyEmail = ({ videoPageUrl }: ReadyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>🎉 Your Video is Ready on CasaVid</Preview>
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
            <Heading className="text-center my-0 leading-8">
              🎉Your Video is Ready 
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">
                  Your video is now ready to view on CasaVid! You can watch it on your personal video page below:
                </Text>
              </Row>
            </Section>

            {/* Embed the videoPageUrl in a button */}
            <div className="flex justify-center">
              <Button
                className="bg-green-600 text-white rounded-lg py-3 px-[18px]"
                href={videoPageUrl} // Link to the video page URL
              >
                View Your Video
              </Button>
            </div>

            {/* Add some additional text below if necessary */}
            <Section>
              <Text className="text-center mt-20">
                We hope you enjoy your new video! Thank you for using CasaVid.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReadyEmail;
