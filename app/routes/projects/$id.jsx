import React, { useRef, useEffect } from "react";
import {
  useRouteData,
  Form,
  redirect,
  usePendingFormSubmit,
  useSubmit,
} from "remix";
import db from "../../../db";

export function headers({ loaderHeaders, parentHeaders }) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control"),
  };
}

export let action = async ({ request, params }) => {
  let body = new URLSearchParams(await request.text());
  switch (request.method.toLowerCase()) {
    case "post": {
      let content = body.get("content");
      await db.task.create({
        data: {
          content,
          projectId: +params.id,
          complete: false,
        },
      });
      break;
    }
    case "put": {
      console.log(body.get("complete"));
      await db.task.update({
        where: {
          id: +body.get("id"),
        },
        data: {
          complete: JSON.parse(body.get("complete")),
        },
      });
    }
  }
  return redirect(`/projects/${params.id}`);
};

export async function loader({ params }) {
  const project = await db.project.findUnique({
    where: {
      id: +params.id,
    },
    include: { tasks: true },
  });
  let res = new Response(JSON.stringify(project), {
    headers: { "Content-Type": "application/json" },
  });
  res.headers.set("Cache-Control", "max-age=60");
  return res;
}

export default function ProjectShow() {
  const project = useRouteData();
  let pendingFormSubmit = usePendingFormSubmit();
  const submit = useSubmit();
  const ref = useRef(null);
  useEffect(() => {
    if (pendingFormSubmit) {
      console.log("submitting");
      if (ref.current) ref.current.value = "";
    }
  }, [pendingFormSubmit]);
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {project.title}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Deletes
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Completes
          </button>
        </div>
      </div>
      <div className="space-y-6 sm:space-y-5 divide-y divide-gray-200">
        <div className="pt-6 sm:pt-5">
          <div role="group" aria-labelledby="label-email">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
              {project.tasks.map((task) => (
                <div key={task.id} className="mt-4 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          onChange={(e) => {
                            submit(
                              {
                                complete: String(e.target.checked),
                                id: String(task.id),
                              },
                              {
                                method: "put",
                                replace: true,
                              }
                            );
                          }}
                          id="complete"
                          checked={task.complete}
                          name="complete"
                          type="checkbox"
                          className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="comments"
                          className="font-medium text-gray-700"
                        >
                          {task.content}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {pendingFormSubmit &&
                pendingFormSubmit.method.toLowerCase() === "post" && (
                  <div className="mt-4 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg space-y-4">
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            disabled
                            id="comments"
                            name="comments"
                            type="checkbox"
                            className="focus:ring-green-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="comments"
                            className="font-medium text-gray-400"
                          >
                            {pendingFormSubmit.data.get("content")}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              <div className="mt-4 sm:mt-0 sm:col-span-2">
                <div className="max-w-lg space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="comments"
                        name="comments"
                        type="checkbox"
                        disabled
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <Form method="post" replace>
                        <input
                          ref={ref}
                          type="text"
                          name="content"
                          id="content"
                          className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="New Task..."
                          aria-describedby="email-description"
                        />
                      </Form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
