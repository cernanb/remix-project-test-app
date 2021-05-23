import React from "react";
import { LockClosedIcon } from "@heroicons/react/solid";
import { commitSession, getSession } from "../session";
import { Form, json, redirect, useRouteData } from "remix";

export async function action({ request }) {
  let body = Object.fromEntries(new URLSearchParams(await request.text()));
  let errored = false;
  let session = await getSession(request.headers.get("Cookie"));
  if (!body.email) {
    errored = true;
    session.flash("emailError", "Email is required");
  }
  if (!body.password) {
    errored = true;
    session.flash("passwordError", "Password is required");
  }

  if (errored) {
    session.flash("email", body.email);
    session.flash("password", body.password);
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("user", "foo");
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function loader({ request }) {
  let session = await getSession(request.headers.get("Cookie"));
  return json(
    {
      email: session.get("email"),
      password: session.get("password"),
      emailError: session.get("emailError"),
      passwordError: session.get("passwordError"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function Login() {
  const session = useRouteData();
  console.log(session);
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <Form className="mt-8 space-y-6" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={session.email}
                // required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  session.emailError ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none ${
                  session.emailError
                    ? "focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-indigo-500 focus:border-indigo-500"
                } focus:z-10 sm:text-sm`}
                placeholder={
                  session.emailError ? `${session.emailError}` : "Email address"
                }
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                defaultValue={session.password}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  session.passwordError ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none ${
                  session.passwordError
                    ? "focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-indigo-500 focus:border-indigo-500"
                } focus:z-10 sm:text-sm`}
                placeholder={
                  session.passwordError
                    ? `${session.passwordError}`
                    : "Password"
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  aria-hidden="true"
                />
              </span>
              Sign in
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
