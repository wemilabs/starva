import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
// import { Resend } from "resend";

import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
// import VerificationEmail from "@/components/emails/verification-email";
// import PasswordResetEmail from "@/components/emails/password-reset-email";

// const resend = new Resend(process.env.RESEND_API_KEY!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  // emailAndPassword: {
  //   enabled: true,
  //   sendResetPassword: async ({ user, url }) => {
  //     try {
  //       await resend.emails.send({
  //         from: "Acme <onboarding@resend.dev>",
  //         to: [user.email],
  //         subject: "Reset your password",
  //         react: PasswordResetEmail({
  //           userName: user.name,
  //           resetUrl: url,
  //           requestTime: new Date().toLocaleString(),
  //         }),
  //       });
  //     } catch (error) {
  //       const e = error as Error;
  //       console.error(e.message);
  //     }
  //   },
  //   onPasswordReset: async ({ user }) => {
  //     console.log(`Password for user ${user.email} has been reset.`);
  //   },
  // },
  // emailVerification: {
  //   sendVerificationEmail: async ({ user, url }) => {
  //     try {
  //       await resend.emails.send({
  //         from: "Acme <onboarding@resend.dev>",
  //         to: [user.email],
  //         subject: "Verify your email address",
  //         react: VerificationEmail({
  //           userName: user.name,
  //           verificationUrl: url,
  //         }),
  //       });
  //     } catch (error) {
  //       const e = error as Error;
  //       console.error(e.message);
  //     }
  //   },
  //   sendOnSignUp: true,
  // },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});
