"use client";

import type { CounterFieldDef } from "../../definition/types";
import { fieldHint } from "../ui";
import { Stepper } from "./Stepper";
import type { FieldProps } from "./types";

export function CounterField({
  field,
  value,
  onChange,
  hideLegend,
}: FieldProps) {
  const def = field.def as CounterFieldDef;
  const current = typeof value === "number" ? value : def.initial;
  return (
    <fieldset>
      <legend
        className={
          hideLegend ? "sr-only" : "mb-3 block text-base font-semibold"
        }
      >
        {def.label}
      </legend>
      {def.hint ? <p className={`${fieldHint} mb-3`}>{def.hint}</p> : null}
      <Stepper
        label={def.label}
        value={current}
        min={def.min}
        max={def.max}
        onChange={onChange}
      />
    </fieldset>
  );
}
