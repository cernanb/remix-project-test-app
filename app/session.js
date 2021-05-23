import { createCookieSessionStorage, redirect, destroySession } from "remix";
import prisma from "../db";

let secrets = "secret";
if (!secrets) {
  throw new Error("You need to set a cookie secret environment variable.");
}

let { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [secrets],
    sameSite: "lax",
  },
});

export async function getUserSession(request) {
  let session = await getSession(request.headers.get("Cookie"));
  return session.get("sessionId");
}

export async function requireUserSession(request, next) {
  let session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("sessionId");
  let userSession = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!userSession) {
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  return next(userSession);
}

export { getSession, commitSession, destroySession };
