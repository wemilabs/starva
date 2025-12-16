import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type VerifyEmailProps = {
  username: string;
  verifyUrl: string;
};

export const VerifyEmail = (props: VerifyEmailProps) => {
  const { username, verifyUrl } = props;
  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Preview>Verify your email - Action required</Preview>
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px] shadow-sm">
            {/* Header */}
            <Section className="mb-[32px] text-center">
              <Heading className="m-0 mb-[8px] font-bold text-[28px] text-gray-900">
                Verify your email address
              </Heading>
              <Text className="m-0 text-[16px] text-gray-600">
                We received a request to verify your email address
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="m-0 mb-[16px] text-[16px] text-gray-700 leading-[24px]">
                Hello, {username}
              </Text>
              <Text className="m-0 mb-[16px] text-[16px] text-gray-700 leading-[24px]">
                Thanks for signing up! To complete your registration and secure
                your account, please verify your email address by clicking the
                button below.
              </Text>
              <Text className="m-0 mb-[24px] text-sm text-gray-700 leading-[24px]">
                This link will expire in 24 hours for security reasons.
              </Text>
            </Section>

            {/* Verify Button */}
            <Section className="mb-[32px] text-center">
              <Button
                className="box-border inline-block rounded-[8px] bg-orange-300 px-[32px] py-[16px] font-semibold text-[16px] text-white no-underline"
                href={verifyUrl}
              >
                Verify Email
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="m-0 mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Link
                className="break-all text-[14px] text-orange-500"
                href={verifyUrl}
              >
                {verifyUrl}
              </Link>
            </Section>

            {/* Security Notice */}
            <Section className="mb-[32px] rounded-[8px] bg-gray-50 p-[20px]">
              <Text className="m-0 mb-[8px] font-semibold text-[14px] text-gray-700 leading-[20px]">
                Security Notice:
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                • If you didn&apos;t request this verification, please ignore
                this email
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                • This link will expire in 24 hours
              </Text>
              <Text className="m-0 text-[14px] text-gray-600 leading-[20px]">
                • For security, never share this link with anyone
              </Text>
            </Section>

            {/* Help */}
            <Section className="mb-[32px]">
              <Text className="m-0 text-[14px] text-gray-600 leading-[20px]">
                Need help? Contact our support team at{" "}
                <Link
                  className="text-orange-500"
                  href="mailto:support@starva.shop"
                >
                  support@starva.shop
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-[32px] border-gray-200 border-t pt-[24px]">
              <Text className="m-0 text-center text-[12px] text-gray-400 leading-[16px]">
                Starva.shop Ltd
                <br />
                KK 456 Gatenga, Niboye, Kicukiro
                <br />
                Kigali, Republic of Rwanda
              </Text>

              <Text className="m-0 mt-[8px] text-center text-[12px] text-gray-400 leading-[16px]">
                <Link className="text-gray-400" href="#">
                  Unsubscribe
                </Link>{" "}
                | © {new Date().getFullYear()} Starva.shop Ltd. All rights
                reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
