import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

import ForgotPasswordEmail from "@/components/emails/reset-password";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersTable } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: schema.usersTable,
      sessions: schema.sessionsTable,
      accounts: schema.accountsTable,
      verifications: schema.verificationsTable,
    }
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const [userData, enterprises] = await Promise.all([
        db.query.usersTable.findFirst({
          where: eq(usersTable.id, user.id),
        }),
        db.query.usersToEnterprisesTable.findMany({
          where: eq(schema.usersToEnterprisesTable.userId, user.id),
          with: {
            enterprise: true,
            user: true,
          },
        }),
      ]);
      //Ao adaptar para múltiplas empresas, o usuário pode ter mais de uma empresa associada. Deve-se atualizar a lógica para lidar com isso.
      const enterprise = enterprises?.[0];
      return {
        user: {
          ...user,
          phone: userData?.phone,
          docNumber: userData?.docNumber,
          subscriptionStatus: userData?.subscriptionStatus,
          enterprise: enterprise?.enterpriseId
            ? {
              id: enterprise?.enterpriseId,
              name: enterprise?.enterprise?.name,
              avatarImageURL: enterprise?.enterprise?.avatarImageURL,
            }
            : undefined,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "users",
    additionalFields: {
      phone: {
        type: "string",
        fieldName: "phone",
        required: false,
      },
      docNumber: {
        type: "string",
        fieldName: "docNumber",
        required: false,
      },
      subscriptionStatus: {
        type: "string",
        fieldName: "subscriptionStatus",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        from: `${process.env.NAME_FOR_ACCOUNT_MANAGEMENT_SUBMISSIONE} <${process.env.EMAIL_FOR_ACCOUNT_MANAGEMENT_SUBMISSION}>`,
        to: user.email,
        subject: "Redefina sua senha - iGenda App",
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email,
        }),
      });
    },
  },
});
