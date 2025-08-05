import { getSession } from "next-auth/react";

export async function getUserSession(ctx) {
  const session = await getSession(ctx);
  return session;
}


