import React from "react";
import { redirect } from "remix";
import db from "../../../db";

export let action = async ({ request }) => {
  let body = new URLSearchParams(await request.text());
  let title = body.get("title");
  await db.project.create({
    data: {
      title,
    },
  });
  return redirect("/projects");
};

export default function ProjectIndex() {
  return (
    <div>
      <h1>Select a project to view tasks</h1>
    </div>
  );
}
