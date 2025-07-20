import { z } from "zod";

export const userNameSchema = z
  .string()
  .min(2, "username must be greater than 2 char.");

export const SignUpSchema = z.object({
  username: userNameSchema,
  email: z.string(),
  password: z.string(),
});
