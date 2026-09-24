"use client";

import type { RefObject } from "react";

import { primaryButton } from "./ui";

interface ConfirmationViewProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}

export function ConfirmationView({
  headingRef,
  onRestart,
}: ConfirmationViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[2.4rem] leading-[1.1] font-medium text-balance focus:outline-none"
      >
        Recebemos seu briefing
      </h1>
      <p className="text-lg">
        No produto final, a Luísa entraria em contato pelo e-mail informado.
      </p>
      <p className="rounded-xl bg-rose px-4 py-3 text-sm">
        <strong className="font-semibold">Protótipo.</strong> Nada foi enviado
        nem salvo. Obrigado por testar.
      </p>
      <button
        type="button"
        className={`${primaryButton} w-full`}
        onClick={onRestart}
      >
        Recomeçar o protótipo
      </button>
    </div>
  );
}
