import React from "react";
import { LockClosedIcon, XIcon } from "@heroicons/react/solid";
import { commitSession, getSession } from "../session";
import { Form, json, redirect, useRouteData } from "remix";
import { createPasswordHash } from "../crypto";
import db from "../../db";

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
  if (!body.passwordConfirm) {
    errored = true;
    session.flash("passwordConfirmError", "Password Confirm is required");
  }

  // TODO: password matches
  if (body.password !== body.passwordConfirm) {
    errored = true;
    session.flash("passwordConfirmError", "Passwords do not match");
  }
  // TODO: password is appropriate

  if (errored) {
    session.flash("email", body.email);
    session.flash("password", body.password);
    session.flash("passwordConfirm", body.passwordConfirm);
    return redirect("/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  try {
    let user = await db.user.create({
      data: {
        email: body.email,
        passwordHash: await createPasswordHash(body.password),
      },
    });
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
    console.error(error);
    session.flash("error", "Could not create the user or session");
    return redirect("/signup", {
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
      passwordConfirm: session.get("passwordConfirm"),
      passwordConfirmError: session.get("passwordConfirmError"),
      error: session.get("error"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function Signup() {
  const session = useRouteData();
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign up for an account
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
                placeholder={"Email address"}
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
                placeholder={"Password"}
              />
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="sr-only">
                Password
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                defaultValue={session.passwordConfirm}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  session.passwordConfirmError
                    ? "border-red-300"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none ${
                  session.passwordConfirmError
                    ? "focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-indigo-500 focus:border-indigo-500"
                } focus:z-10 sm:text-sm`}
                placeholder={"Confirm Password"}
              />
            </div>
          </div>
          <ul>
            {session.emailError && (
              <li class="flex items-center py-1">
                <div className="bg-red-200 text-red-70 rounded-full p-1 fill-current ">
                  <XIcon className="h-4 w-4" />
                </div>
                <span className="text-red-700 font-medium text-sm ml-3">
                  {session.emailError}
                </span>
              </li>
            )}
            {session.passwordConfirmError && (
              <li class="flex items-center py-1">
                <div className="bg-red-200 text-red-70 rounded-full p-1 fill-current ">
                  <XIcon className="h-4 w-4" />
                </div>
                <span className="text-red-700 font-medium text-sm ml-3">
                  {session.passwordConfirmError}
                </span>
              </li>
            )}
            {session.passwordError && (
              <li class="flex items-center py-1">
                <div className="bg-red-200 text-red-70 rounded-full p-1 fill-current ">
                  <XIcon className="h-4 w-4" />
                </div>
                <span className="text-red-700 font-medium text-sm ml-3">
                  {session.passwordError}
                </span>
              </li>
            )}
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
              Sign up
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
