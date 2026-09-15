import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/my")({ component: MyTickets });

function MyTickets() {
  return <Navigate to="/" />;
}
