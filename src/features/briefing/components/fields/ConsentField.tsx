"use client";

import { fieldError, fieldHint } from "../ui";
import type { FieldProps } from "./types";

export function ConsentField({ field, value, onChange, error }: FieldProps) {
  const id = `field-${field.key}`;
  const describedBy = [field.def.hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="rounded-card border border-line bg-surface p-4 has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink">
      <div className="flex gap-3">
        <input
          id={id}
          type="checkbox"
          checked={value === true}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={(e) => onChange(e.target.checked ? true : undefined)}
          className="mt-0.5 size-6 shrink-0 accent-ink"
        />
        <label htmlFor={id} className="text-base font-medium">
          {field.def.label}
        </label>
      </div>
      {field.def.hint ? (
        <p id={`${id}-hint`} className={`${fieldHint} pl-9`}>
          {field.def.hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={`${fieldError} pl-9`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
