import React from "react";
import { LockClosedIcon, XIcon } from "@heroicons/react/solid";
import { commitSession, getSession } from "../session";
import { Form, json, redirect, useRouteData } from "remix";
import db from "../../db";
import { bcrypt } from "../crypto";

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

  try {
    const user = await db.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (!(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new Error("Incorrect password");
    }
    let dbSession = await db.session.create({
      data: {
        userId: user.id,
      },
    });
    session.set("sessionId", dbSession.id);
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error(error.message);
    session.flash("error", error.message);
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export async function loader({ request }) {
  let session = await getSession(request.headers.get("Cookie"));
  return json(
    {
      email: session.get("email"),
      password: session.get("password"),
      emailError: session.get("emailError"),
      passwordError: session.get("passwordError"),
      message: session.get("message"),
      error: session.get("error"),
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
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {session.message && (
            <div className="relative bg-indigo-600 rounded-md">
              <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
                <div className="pr-16 sm:text-center sm:px-16">
                  <p className="font-medium text-white">
                    <span className="md:hidden">{session.message}</span>
                    <span className="hidden md:inline">{session.message}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
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
          <ul>
            {session.error && (
              <li class="flex items-center py-1">
                <div className="bg-red-200 text-red-70 rounded-full p-1 fill-current ">
                  <XIcon className="h-4 w-4" />
                </div>
                <span className="text-red-700 font-medium text-sm ml-3">
                  {session.error}
                </span>
              </li>
            )}
          </ul>

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
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon
                  className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
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
