import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/visibility')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/visibility"!</div>
}
