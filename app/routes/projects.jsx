import React, { useState } from "react";
import db from "../../db";
import { useRouteData, Form } from "remix";
import { Outlet, Link } from "react-router-dom";
import { BriefcaseIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { format } from "date-fns";

export function loader() {
  return db.project.findMany();
}

export default function Projects() {
  const projects = useRouteData();

  return (
    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
      <div className="flex-1 relative z-0 flex overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last">
          {/* Start main area*/}
          <div className="absolute inset-0 py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
          {/* End main area */}
        </main>
        <aside className="hidden relative xl:order-first xl:flex xl:flex-col flex-shrink-0 w-96 border-r border-gray-200">
          {/* Start secondary column (hidden on smaller screens) */}
          <div className="absolute inset-0 py-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      to={`${project.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div className="truncate">
                            <div className="flex text-sm">
                              <p className="font-medium text-green-600 truncate">
                                {project.title}
                              </p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
                                <BriefcaseIcon
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                                <p>
                                  Created on{" "}
                                  <time dateTime={project.createdAt}>
                                    {format(
                                      new Date(project.createdAt),
                                      "MMM do, yyy"
                                    )}
                                  </time>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <ChevronRightIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="my-4">
              <Form method="post" action="/projects">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="New Project Title..."
                    aria-describedby="email-description"
                  />
                </div>
              </Form>
            </div>
          </div>
          {/* End secondary column */}
        </aside>
      </div>
    </div>
  );
}
