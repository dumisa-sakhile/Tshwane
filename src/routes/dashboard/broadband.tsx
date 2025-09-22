import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/broadband')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/broadband"!</div>
}
