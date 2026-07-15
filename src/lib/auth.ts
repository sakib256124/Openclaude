import "server-only";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export type AppSessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
};

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & AppSessionUser;
  }

  interface User {
    role: Role;
    isActive: boolean;
  }
}

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

const sessionMaxAge = Number(process.env.SESSION_TIMEOUT_MINUTES ?? 60) * 60;

type AppJwtFields = {
  role?: Role;
  isActive?: boolean;
};

function getLocalDemoUser(email: string, password: string) {
  const allowAnyLocalLogin =
    process.env.LOCAL_DEMO_LOGIN_ANY === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.LOCAL_DEMO_LOGIN_ANY !== "false");

  if (!allowAnyLocalLogin || !email || !password) {
    return null;
  }

  return {
    id: `local-demo-${email}`,
    email,
    name: email.split("@")[0] || "Local Demo User",
    role: "ADMIN" as Role,
    isActive: true
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
    updateAge: Math.min(15 * 60, sessionMaxAge)
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const localDemoUser = getLocalDemoUser(parsed.data.email, parsed.data.password);

        let user: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;

        try {
          user = await prisma.user.findUnique({
            where: { email: parsed.data.email }
          });
        } catch {
          return localDemoUser;
        }

        if (!user?.passwordHash || !user.isActive) {
          return localDemoUser;
        }

        const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!validPassword) {
          return localDemoUser;
        }

        try {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            }),
            prisma.activityLog.create({
              data: {
                userId: user.id,
                action: "auth.login",
                resourceType: "session",
                service: "auth",
                status: "SUCCESS",
                safeMessage: "User signed in."
              }
            })
          ]);
        } catch {
          // Login should still work if audit logging is temporarily unavailable.
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as typeof token & AppJwtFields;

      if (user) {
        appToken.sub = user.id;
        appToken.email = user.email;
        appToken.name = user.name;
        appToken.role = user.role;
        appToken.isActive = user.isActive;
      }

      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as typeof token & AppJwtFields;

      session.user.id = token.sub ?? "";
      session.user.email = token.email ?? "";
      session.user.name = token.name ?? null;
      session.user.role = appToken.role ?? "VIEWER";
      session.user.isActive = appToken.isActive ?? false;
      return session;
    }
  },
  events: {
    async signOut(message) {
      const userId = "token" in message ? message.token?.sub : message.session?.userId;

      if (!userId) {
        return;
      }

      try {
        await prisma.activityLog.create({
          data: {
            userId,
            action: "auth.logout",
            resourceType: "session",
            service: "auth",
            status: "SUCCESS",
            safeMessage: "User signed out."
          }
        });
      } catch {
        // Ignore audit write failures during local demos without a database.
      }
    }
  }
});

export async function getCurrentUser(): Promise<AppSessionUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    isActive: session.user.isActive
  };
}
