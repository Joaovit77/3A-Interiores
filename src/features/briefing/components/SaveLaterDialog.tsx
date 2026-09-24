"use client";

import { useRef } from "react";

import { primaryButton, textButton } from "./ui";

/** Explica como «salvar e continuar» vai funcionar. No protótipo, nada é salvo. */
export function SaveLaterDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className={textButton}
        onClick={() => dialog.current?.showModal()}
      >
        <span className="sr-only">Salvar e </span>Continuar depois
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="salvar-titulo"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl bg-paper p-6 text-ink backdrop:bg-ink/40"
      >
        <h2 id="salvar-titulo" className="font-display text-3xl font-medium">
          Salvar e continuar depois
        </h2>
        <p className="mt-3 text-base">
          No briefing final, você vai informar seu e-mail e receber um código
          para continuar de onde parou, em qualquer aparelho, sem criar conta.
        </p>
        <p className="mt-3 rounded-xl bg-rose px-4 py-3 text-sm">
          Neste protótipo nada é salvo. Se você fechar ou recarregar a página,
          as respostas se perdem.
        </p>
        <form method="dialog" className="mt-6">
          <button type="submit" className={`${primaryButton} w-full`}>
            Entendi
          </button>
        </form>
      </dialog>
    </>
  );
}
