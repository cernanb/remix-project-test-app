import { useRouteData } from "remix";
import db from "../../db";
import { requireUserSession } from "../session";

import stylesUrl from "../styles/index.css";

export function meta() {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!",
  };
}

export function links() {
  return [{ rel: "stylesheet", href: stylesUrl }];
}

export function loader({ request }) {
  return requireUserSession(request, (session) => {
    return { message: "this is awesome 😎" };
  });
}

export default function Index() {
  let data = useRouteData();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Welcome to Remix!</h2>
      <p>
        <a href="https://remix.run/dashboard/docs">Check out the docs</a> to get
        started.
      </p>
      <p>Message from the loader: {data.message}</p>
    </div>
  );
}
