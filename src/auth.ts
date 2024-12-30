import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import prisma from "@/lib/prisma";
import { getUserById } from "@/data/user";
import { UserRole } from "@prisma/client";
import { JWT } from "@auth/core/jwt";
import { User as PrismaUser } from "@prisma/client";
import { AdapterUser } from "@auth/core/adapters";

export const { 
    handlers: { GET, POST }, 
    signIn, 
    signOut, 
    auth 
} = NextAuth({
    pages: {
        signIn: "/login",
        error: "/error",
    },
    events: {
        async linkAccount({ user }) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        }
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as PrismaUser).role;
                token.id = user.id;
            }

            return token;
        },
        async session({ token, session }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.role && session.user) {
                session.user.role = token.role as UserRole;
            }
            return session;
        }
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,
});