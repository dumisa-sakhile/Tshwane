import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/workshops_new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/workshops_new"!</div>;
}
