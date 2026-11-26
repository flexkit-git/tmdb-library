import type { ReactNode } from "react";

import { Eyebrow } from "@/components/section-heading";

/** Shared layout for full-page states such as "not found" and "something broke". */
export function StatusPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Actions, e.g. a link home or a retry button. */
  children: ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-6xl leading-[0.9] font-black tracking-tight text-balance uppercase sm:text-7xl">
        {title}
      </h1>
      <p className="mt-5 max-w-md text-pretty text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}
