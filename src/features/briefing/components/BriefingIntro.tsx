"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useBriefing } from "../state/BriefingProvider";
import { fieldError, primaryButton } from "./ui";

export function BriefingIntro() {
  const { state, dispatch } = useBriefing();
  const router = useRouter();
  const [error, setError] = useState(false);

  const start = () => {
    if (!state.consent) {
      setError(true);
      document.getElementById("consentimento")?.focus();
      return;
    }
    router.push("/briefing/responder");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-12">
      <header>
        <Link href="/" className="font-display text-lg font-semibold">
          Luísa Amélia Interiores
        </Link>
      </header>
      <main className="flex flex-1 flex-col justify-center gap-8 py-10">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-ink-soft uppercase">
            Briefing
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] font-medium text-balance">
            Vamos conhecer o seu projeto
          </h1>
          <p className="mt-5 text-lg text-ink-soft">
            Algumas perguntas sobre quem vai morar, o imóvel, os ambientes e o
            seu gosto. A maioria se responde com um toque, e só aparece o que
            faz sentido para você.
          </p>
        </div>

        <ul className="flex flex-col gap-3 text-base">
          <li className="rounded-card border border-line bg-surface px-5 py-4">
            Quase tudo é opcional. Se não souber, pode pular.
          </li>
          <li className="rounded-card border border-line bg-surface px-5 py-4">
            Se tiver a planta ou fotos do espaço, elas ajudam, mas não são
            obrigatórias.
          </li>
          <li className="rounded-card border border-line bg-surface px-5 py-4">
            Você pode salvar e continuar depois, sem criar conta.
          </li>
        </ul>

        <p className="rounded-xl bg-rose px-4 py-3 text-sm">
          <strong className="font-semibold">Protótipo.</strong> Use dados
          fictícios. Nada é salvo nem enviado, e as respostas somem ao
          recarregar a página.
        </p>

        <div>
          <div className="flex gap-3 rounded-card border border-line bg-surface p-4 has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink">
            <input
              id="consentimento"
              type="checkbox"
              checked={state.consent}
              aria-invalid={error && !state.consent ? true : undefined}
              aria-describedby={
                error && !state.consent ? "consentimento-erro" : undefined
              }
              onChange={(e) => {
                dispatch({ type: "setConsent", value: e.target.checked });
                if (e.target.checked) setError(false);
              }}
              className="mt-0.5 size-6 shrink-0 accent-ink"
            />
            <label htmlFor="consentimento" className="text-base">
              Li e concordo com a política de privacidade.{" "}
              <span className="text-ink-soft">
                (Texto da política em elaboração.)
              </span>
            </label>
          </div>
          {error && !state.consent ? (
            <p id="consentimento-erro" className={fieldError}>
              Para começar, é preciso concordar com a política de privacidade.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className={`${primaryButton} w-full`}
          onClick={start}
        >
          Começar
        </button>
      </main>
    </div>
  );
}
