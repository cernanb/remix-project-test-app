import React from "react";
import { useRouteData } from "remix";
import db from "../../../db";

export function headers({ loaderHeaders, parentHeaders }) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control"),
  };
}

export async function loader({ params }) {
  const project = await db.project.findUnique({
    where: {
      id: +params.id,
    },
  });
  let res = new Response(JSON.stringify(project), {
    headers: { "Content-Type": "application/json" },
  });
  res.headers.set("Cache-Control", "max-age=60");
  return res;
}

export default function ProjectShow() {
  const project = useRouteData();
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
            Delete
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
