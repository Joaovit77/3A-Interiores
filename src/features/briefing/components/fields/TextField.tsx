"use client";

import type { TextFieldDef } from "../../definition/types";
import { fieldError, fieldHint, fieldLabel, inputBase } from "../ui";
import type { FieldProps } from "./types";

export function TextField({
  field,
  value,
  onChange,
  error,
  hideLegend,
}: FieldProps) {
  const def = field.def as TextFieldDef;
  const id = `field-${field.key}`;
  const describedBy = [def.hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  const common = {
    id,
    value: typeof value === "string" ? value : "",
    maxLength: def.maxLength,
    placeholder: def.placeholder,
    required: def.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
    className: inputBase,
    onChange: (e: { target: { value: string } }) =>
      onChange(e.target.value === "" ? undefined : e.target.value),
  };
  const type =
    def.kind === "email"
      ? "email"
      : def.autoComplete === "tel"
        ? "tel"
        : "text";

  return (
    <div>
      <label
        htmlFor={id}
        className={hideLegend ? "sr-only" : `${fieldLabel} mb-2`}
      >
        {def.label}
      </label>
      {def.hint ? (
        <p id={`${id}-hint`} className={`${fieldHint} mb-2`}>
          {def.hint}
        </p>
      ) : null}
      {def.kind === "textarea" ? (
        <textarea rows={4} {...common} />
      ) : (
        <input
          type={type}
          autoComplete={def.autoComplete ?? "off"}
          inputMode={
            type === "email" ? "email" : type === "tel" ? "tel" : undefined
          }
          {...common}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className={fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
