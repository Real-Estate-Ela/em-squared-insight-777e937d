import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/paketler")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "paketler" });
  },
});
