"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { AnswerValue, MockFile } from "../definition/types";
import { buildFlow, isEmptyValue } from "../engine/flow";
import { CONFIRMATION_KEY, progressFor, REVIEW_KEY } from "../engine/progress";
import { buildSummary } from "../engine/summary";
import { firstInvalidScreen, screenErrors } from "../engine/validation";
import { useBriefing } from "../state/BriefingProvider";
import { ConfirmationView } from "./ConfirmationView";
import { ReviewView } from "./ReviewView";
import { ScreenView } from "./ScreenView";
import { Shell } from "./Shell";
import { primaryButton, secondaryButton } from "./ui";

// O DevPanel só existe em desenvolvimento: em build de produção esta constante é
// `null` e o módulo nem entra no bundle.
const DevPanel =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./DevPanel").then((m) => m.DevPanel), {
        ssr: false,
      })
    : null;

const hrefFor = (key: string) => `/briefing/responder?passo=${key}`;

function revokeUploads(answers: Record<string, AnswerValue>) {
  for (const value of Object.values(answers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "object" && item && "url" in item)
          URL.revokeObjectURL((item as MockFile).url);
      }
    }
  }
}

export function BriefingFlow() {
  const { state, dispatch } = useBriefing();
  const router = useRouter();
  const params = useSearchParams();
  const passo = params.get("passo");
  const cameFromReview = params.get("de") === REVIEW_KEY;

  const flow = useMemo(() => buildFlow(state.answers), [state.answers]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const history = useRef<string[]>([]);
  // Os erros só aparecem depois de tentar avançar, e só na tela onde isso aconteceu.
  const [errorScreen, setErrorScreen] = useState<string | null>(null);

  const index = passo ? flow.screens.findIndex((s) => s.key === passo) : -1;
  const screen = index >= 0 ? flow.screens[index] : undefined;
  const isReview = passo === REVIEW_KEY;
  const isConfirmation = passo === CONFIRMATION_KEY && state.submitted;

  // Para onde ir quando a URL não aponta para uma tela válida e visível.
  const redirect = useMemo(() => {
    if (!state.consent) return "/briefing";
    if (state.submitted)
      return isConfirmation ? null : hrefFor(CONFIRMATION_KEY);
    const first = flow.screens[0]?.key;
    const invalid = firstInvalidScreen(flow);
    if (isReview)
      return invalid >= 0 ? hrefFor(flow.screens[invalid].key) : null;
    if (screen)
      return invalid >= 0 && index > invalid
        ? hrefFor(flow.screens[invalid].key)
        : null;
    if (!passo) return hrefFor(first);
    // Tela escondida: volta para a última tela visível antes dela.
    const position = flow.evaluations.findIndex((e) => e.screenKey === passo);
    const previous = flow.evaluations
      .slice(0, Math.max(0, position))
      .findLast((e) => e.visible);
    return hrefFor(previous?.screenKey ?? first);
  }, [
    state.consent,
    state.submitted,
    isConfirmation,
    isReview,
    screen,
    index,
    passo,
    flow,
  ]);

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [passo]);

  const showErrors = errorScreen !== null && errorScreen === passo;

  const errors = useMemo(
    () => (showErrors && screen ? screenErrors(screen, flow.effective) : {}),
    [showErrors, screen, flow.effective],
  );

  useEffect(() => {
    if (showErrors) {
      document
        .querySelector<HTMLElement>('main [aria-invalid="true"]')
        ?.focus();
    }
  }, [showErrors]);

  if (redirect) return null;

  const progress = progressFor(
    flow,
    isConfirmation ? CONFIRMATION_KEY : (passo ?? ""),
  );

  const goTo = (key: string) => {
    if (passo) history.current.push(passo);
    setErrorScreen(null);
    router.push(hrefFor(key));
  };

  const next = () => {
    if (!screen) return;
    if (Object.keys(screenErrors(screen, flow.effective)).length) {
      setErrorScreen(passo);
      return;
    }
    goTo(
      cameFromReview
        ? REVIEW_KEY
        : (flow.screens[index + 1]?.key ?? REVIEW_KEY),
    );
  };

  const back = () => {
    if (cameFromReview) {
      router.push(hrefFor(REVIEW_KEY));
      return;
    }
    const previous = isReview
      ? flow.screens.at(-1)?.key
      : flow.screens[index - 1]?.key;
    if (!previous) {
      router.push("/briefing");
      return;
    }
    if (history.current.at(-1) === previous) {
      history.current.pop();
      router.back();
    } else {
      router.push(hrefFor(previous));
    }
  };

  const submit = () => {
    const invalid = firstInvalidScreen(flow);
    if (invalid >= 0) {
      router.push(hrefFor(flow.screens[invalid].key));
      return;
    }
    dispatch({ type: "submit" });
    router.replace(hrefFor(CONFIRMATION_KEY));
  };

  const restart = () => {
    revokeUploads(state.answers);
    dispatch({ type: "reset" });
    router.push("/briefing");
  };

  const setAnswer = (key: string, value: AnswerValue | undefined) =>
    dispatch({ type: "setAnswer", key, value });

  const devPanel = DevPanel ? (
    <DevPanel flow={flow} state={state} currentKey={passo ?? ""} />
  ) : null;

  if (isConfirmation) {
    return (
      <Shell progress={progress}>
        <ConfirmationView headingRef={headingRef} onRestart={restart} />
      </Shell>
    );
  }

  if (isReview) {
    return (
      <Shell
        progress={progress}
        footer={
          <>
            <button type="button" className={secondaryButton} onClick={back}>
              Voltar
            </button>
            <button
              type="button"
              className={`${primaryButton} flex-1`}
              onClick={submit}
            >
              Enviar briefing
            </button>
          </>
        }
      >
        <ReviewView summary={buildSummary(flow)} headingRef={headingRef} />
        {devPanel}
      </Shell>
    );
  }

  if (!screen) return null;

  const stage = flow.stages.find((s) => s.id === screen.stageId);
  const firstOfStage =
    index === 0 || flow.screens[index - 1].stageId !== screen.stageId;
  const hasRequired = screen.fields.some((f) => f.def.required);
  const untouched = screen.fields.every((f) =>
    isEmptyValue(flow.effective[f.key]),
  );
  const errorCount = Object.keys(errors).length;

  return (
    <Shell
      progress={progress}
      footer={
        <>
          <button type="button" className={secondaryButton} onClick={back}>
            Voltar
          </button>
          <button
            type="button"
            className={`${primaryButton} flex-1`}
            onClick={next}
          >
            {cameFromReview
              ? "Voltar à revisão"
              : !hasRequired && untouched
                ? "Pular"
                : "Continuar"}
          </button>
        </>
      }
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <p role="alert" className="sr-only">
          {errorCount
            ? `Falta responder ${errorCount === 1 ? "um campo obrigatório" : `${errorCount} campos obrigatórios`}.`
            : ""}
        </p>
        <ScreenView
          screen={screen}
          flow={flow}
          errors={errors}
          headingRef={headingRef}
          stageGoal={firstOfStage ? stage?.goal : undefined}
          onChange={setAnswer}
        />
      </form>
      {devPanel}
    </Shell>
  );
}
