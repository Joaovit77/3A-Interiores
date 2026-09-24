"use client";

import type { RefObject } from "react";

import type { AnswerValue } from "../definition/types";
import type { Flow, ScreenInstance } from "../engine/flow";
import { FieldRenderer } from "./fields/FieldRenderer";

interface ScreenViewProps {
  screen: ScreenInstance;
  flow: Flow;
  errors: Record<string, string>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  stageGoal?: string;
  onChange: (key: string, value: AnswerValue | undefined) => void;
}

export function ScreenView({
  screen,
  flow,
  errors,
  headingRef,
  stageGoal,
  onChange,
}: ScreenViewProps) {
  const single = screen.fields.length === 1;
  const room = screen.scope.kind === "room" ? screen.scope.room : undefined;

  return (
    <div>
      {room ? (
        <p className="mb-2 text-sm font-semibold tracking-[0.14em] text-ink-soft uppercase">
          {room.label}
        </p>
      ) : stageGoal ? (
        <p className="mb-2 text-sm text-ink-soft">{stageGoal}</p>
      ) : null}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[2.1rem] leading-[1.1] font-medium text-balance focus:outline-none"
      >
        {screen.title}
      </h1>
      {screen.def.description ? (
        <p className="mt-3 text-base text-ink-soft">{screen.def.description}</p>
      ) : null}
      <div className="mt-8 flex flex-col gap-8">
        {screen.fields.map((field, index) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={flow.effective[field.key]}
            error={errors[field.key]}
            hideLegend={
              index === 0 && (single || field.def.label === screen.title)
            }
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </div>
  );
}
