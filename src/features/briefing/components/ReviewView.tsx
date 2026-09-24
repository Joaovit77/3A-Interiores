"use client";

import Link from "next/link";
import type { RefObject } from "react";

import type { SummaryStage } from "../engine/summary";
import { REVIEW_KEY } from "../engine/progress";

interface ReviewViewProps {
  summary: SummaryStage[];
  headingRef: RefObject<HTMLHeadingElement | null>;
}

/** Resumo final por etapa. Respostas escondidas não aparecem. */
export function ReviewView({ summary, headingRef }: ReviewViewProps) {
  const editHref = (screenKey: string) =>
    `/briefing/responder?passo=${screenKey}&de=${REVIEW_KEY}`;

  return (
    <div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[2.1rem] leading-[1.1] font-medium text-balance focus:outline-none"
      >
        Confira suas respostas
      </h1>
      <p className="mt-3 text-base text-ink-soft">
        Se quiser mudar algo, use «Editar».
      </p>

      <div className="mt-8 flex flex-col gap-10">
        {summary.map((stage) => (
          <section key={stage.id} aria-labelledby={`resumo-${stage.id}`}>
            <h2
              id={`resumo-${stage.id}`}
              className="border-b border-line pb-2 font-display text-2xl font-medium"
            >
              {stage.title}
            </h2>
            {stage.screens.length === 0 && stage.notes.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">
                Nada respondido nesta etapa.
              </p>
            ) : null}
            <div className="mt-2 flex flex-col">
              {stage.screens.map((screen, i) => (
                <div
                  key={`${screen.screenKey}-${i}`}
                  className="border-b border-line py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold">
                      {screen.room ? (
                        <span className="block text-sm font-medium text-ink-soft">
                          {screen.room}
                        </span>
                      ) : null}
                      {screen.title}
                    </h3>
                    {screen.inheritedFrom ? null : (
                      <Link
                        href={editHref(screen.screenKey)}
                        className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium underline underline-offset-4"
                      >
                        Editar<span className="sr-only">: {screen.title}</span>
                      </Link>
                    )}
                  </div>
                  <dl className="mt-2 flex flex-col gap-2">
                    {screen.entries.map((entry) => (
                      <div key={entry.key}>
                        <dt
                          className={
                            entry.repeatsTitle
                              ? "sr-only"
                              : "text-sm text-ink-soft"
                          }
                        >
                          {entry.label}
                        </dt>
                        <dd className="text-base break-words whitespace-pre-line">
                          {entry.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              {stage.notes.map((note) => (
                <p
                  key={note}
                  className="mt-4 rounded-xl bg-rose px-4 py-3 text-sm"
                >
                  {note}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
