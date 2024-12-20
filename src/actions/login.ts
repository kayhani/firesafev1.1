"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";



const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if(!validatedFields) {
        return { error: "Invalid fields"};
    };

    const {email, password} = validatedFields.data as { email: string; password: string };;

    try{
        await signIn("credentials", {
            email,
            password,
            redirectTo:  DEFAULT_LOGIN_REDIRECT,
        })

    }catch(error){
        if(error instanceof AuthError) {
            switch(error.type) {
                case "CredentialsSignin": 
                        return {error: "Invalid credentials!"}
                default:
                        return {error: "Something went wrong!"}
            }
        }
        throw error;
    }
};

export default login;