import { env } from "@/env";

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIN: "1d",
  },
};
