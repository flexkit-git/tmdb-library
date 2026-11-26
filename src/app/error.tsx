"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

import { StatusPage } from "@/components/status-page";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      eyebrow="Technical difficulties"
      title="Please stand by"
      description="Something went wrong while loading this page. It’s usually a hiccup talking to the movie database, so trying again often does it."
    >
      <Button size="lg" className="h-11 px-6 text-sm" onClick={() => retry()}>
        Try again
      </Button>
      <Button asChild variant="outline" size="lg" className="h-11 px-6 text-sm">
        <Link href="/">Back to trending</Link>
      </Button>
    </StatusPage>
  );
}
