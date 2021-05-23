import { redirect } from "remix";
import { commitSession, getSession, destroySession } from "../session";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  //   await destroySession(session);
  session.set("sessionId", null);
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Logout() {
  return <></>;
}
