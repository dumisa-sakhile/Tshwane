import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/funding')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/funding"!</div>
}
