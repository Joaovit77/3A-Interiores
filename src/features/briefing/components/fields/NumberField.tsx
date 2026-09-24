"use client";

import type { NumberFieldDef } from "../../definition/types";
import { fieldError, fieldHint, fieldLabel, inputBase } from "../ui";
import type { FieldProps } from "./types";

export function NumberField({
  field,
  value,
  onChange,
  error,
  hideLegend,
}: FieldProps) {
  const def = field.def as NumberFieldDef;
  const id = `field-${field.key}`;
  const describedBy = [def.hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label
        htmlFor={id}
        className={hideLegend ? "sr-only" : `${fieldLabel} mb-2`}
      >
        {def.label}
        {def.unit ? <span className="sr-only"> ({def.unit})</span> : null}
      </label>
      {def.hint ? (
        <p id={`${id}-hint`} className={`${fieldHint} mb-2`}>
          {def.hint}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={def.min}
          max={def.max}
          value={typeof value === "number" ? value : ""}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputBase} max-w-40`}
          onChange={(e) => {
            const next =
              e.target.value === "" ? undefined : Number(e.target.value);
            onChange(
              next === undefined || Number.isNaN(next) ? undefined : next,
            );
          }}
        />
        {def.unit ? (
          <span aria-hidden="true" className="text-base text-ink-soft">
            {def.unit}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className={fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
