"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if(!validatedFields) {
        return { error: "Invalid fields"};
    };

    const { email, password, name } = validatedFields.data as { email: string; password: string; name: string};
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await getUserByEmail(email);

    if(existingUser) {
        return {error: "Email already use!"};
    };

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // TODO : Send verification token email

    return { success: "User created"};
};

export default register;