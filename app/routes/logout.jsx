import { redirect } from "remix";
import prisma from "../../db";
import {
  commitSession,
  getSession,
  destroySession,
  getUserSession,
} from "../session";

// export async function loader({ request }) {
//   const session = await getSession(request.headers.get("Cookie"));
//   //   await destroySession(session);
//   session.set("sessionId", null);
//   return redirect("/", {
//     headers: {
//       "Set-Cookie": await commitSession(session),
//     },
//   });
// }

export async function action({ request }) {
  let session = await getUserSession(request);
  const cookieSession = await getSession(request.headers.get("Cookie"));

  if (session) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });
  }

  cookieSession.unset("sessionId");
  cookieSession.flash("message", "You have been logged out");

  return redirect("/login", {
    headers: {
      "Set-Cookie": await commitSession(cookieSession),
    },
  });
}

export default function Logout() {
  return null;
}
