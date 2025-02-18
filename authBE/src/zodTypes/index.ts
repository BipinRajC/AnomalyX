import { z } from "zod";

export const SignUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(3)
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})