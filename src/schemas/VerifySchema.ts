import { z } from "zod";

export const VerifySchema = z.object({
  username: z.string(),
  code: z.string(),
});
