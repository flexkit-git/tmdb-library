import type { Metadata } from "next";
import Link from "next/link";

import { StatusPage } from "@/components/status-page";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404"
      title="Lost the plot"
      description="We couldn’t find that page. It may have been removed, or the link might be wrong."
    >
      <Button asChild size="lg" className="h-11 px-6 text-sm">
        <Link href="/">Back to trending</Link>
      </Button>
    </StatusPage>
  );
}
