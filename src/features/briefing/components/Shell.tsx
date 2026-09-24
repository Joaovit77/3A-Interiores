"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { Progress } from "../engine/progress";
import { SaveLaterDialog } from "./SaveLaterDialog";

interface ShellProps {
  progress: Progress;
  children: ReactNode;
  footer?: ReactNode;
}

export function Shell({ progress, children, footer }: ShellProps) {
  const percent = Math.round(progress.fraction * 100);
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-xl px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-base leading-tight font-semibold"
          >
            Luísa Amélia Interiores
          </Link>
          <SaveLaterDialog />
        </div>
        <div className="mt-3">
          <p className="text-sm text-ink-soft">
            Etapa {progress.stageNumber} de {progress.stageCount} ·{" "}
            {progress.stageTitle}
          </p>
          <div
            role="progressbar"
            aria-label="Progresso do briefing"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand"
          >
            <div
              className="h-full rounded-full bg-ink transition-[width] duration-300"
              style={{ width: `${Math.max(percent, 2)}%` }}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-8 pb-40">
        {children}
      </main>
      {footer ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-xl gap-3 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
}
