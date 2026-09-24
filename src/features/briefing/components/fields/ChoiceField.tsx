"use client";

import type { ChoiceFieldDef, OptionDef } from "../../definition/types";
import { fieldError, fieldHint } from "../ui";
import { ProvisionalImage } from "./ProvisionalImage";
import type { FieldProps } from "./types";

function toggle(
  options: OptionDef[],
  selected: string[],
  value: string,
  max?: number,
): string[] {
  const option = options.find((o) => o.value === value);
  if (selected.includes(value)) return selected.filter((v) => v !== value);
  if (option?.exclusive) return [value];
  const exclusive = new Set(
    options.filter((o) => o.exclusive).map((o) => o.value),
  );
  const next = [...selected.filter((v) => !exclusive.has(v)), value];
  return max && next.length > max ? selected : next;
}

function Check() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-paper group-has-checked:border-ink group-has-checked:bg-ink"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5 opacity-0 group-has-checked:opacity-100"
      >
        <path
          d="M3.5 8.5l3 3 6-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </span>
  );
}

/**
 * Escolha única ou múltipla, em cards, chips ou imagens.
 * Por baixo são inputs nativos de rádio ou checkbox dentro de um fieldset.
 */
export function ChoiceField({
  field,
  value,
  onChange,
  error,
  hideLegend,
}: FieldProps) {
  const def = field.def as ChoiceFieldDef;
  const options = field.options ?? [];
  const multiple = !!def.multiple;
  const selected = Array.isArray(value)
    ? (value as string[])
    : typeof value === "string"
      ? [value]
      : [];
  const atMax = !!def.max && selected.length >= def.max;
  const name = field.key;
  const describedBy = [def.hint && `${name}-hint`, error && `${name}-error`]
    .filter(Boolean)
    .join(" ");

  const imageOptions =
    def.layout === "images" ? options.filter((o) => o.image) : [];
  const textOptions =
    def.layout === "images" ? options.filter((o) => !o.image) : options;

  const select = (option: OptionDef) => {
    if (multiple) onChange(toggle(options, selected, option.value, def.max));
    else onChange(option.value);
  };

  const input = (option: OptionDef) => {
    const checked = selected.includes(option.value);
    return (
      <input
        type={multiple ? "checkbox" : "radio"}
        name={name}
        value={option.value}
        checked={checked}
        disabled={multiple && atMax && !checked}
        onChange={() => select(option)}
        className="sr-only"
      />
    );
  };

  const cardBase =
    "group relative flex cursor-pointer rounded-card border border-line bg-surface transition-colors has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink has-disabled:cursor-not-allowed has-disabled:opacity-50";

  return (
    <fieldset
      aria-describedby={describedBy || undefined}
      aria-invalid={!!error || undefined}
    >
      <legend
        className={
          hideLegend ? "sr-only" : "mb-3 block text-base font-semibold"
        }
      >
        {def.label}
        {def.max ? (
          <span className="font-normal text-ink-soft"> (até {def.max})</span>
        ) : null}
      </legend>
      {def.hint ? (
        <p id={`${name}-hint`} className={`${fieldHint} -mt-1 mb-3`}>
          {def.hint}
        </p>
      ) : null}

      {imageOptions.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {imageOptions.map((option) => (
            <label key={option.value} className={`${cardBase} flex-col`}>
              {input(option)}
              <ProvisionalImage image={option.image!} />
              <span className="flex items-start justify-between gap-2 px-3 py-3">
                <span className="text-sm leading-snug font-medium">
                  {option.label}
                  {option.description ? (
                    <span className="mt-0.5 block text-xs font-normal text-ink-soft">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <Check />
              </span>
            </label>
          ))}
        </div>
      ) : null}

      {textOptions.length > 0 ? (
        def.layout === "chips" ||
        (def.layout === "images" && imageOptions.length > 0) ? (
          <div
            className={`flex flex-wrap gap-2 ${imageOptions.length ? "mt-3" : ""}`}
          >
            {textOptions.map((option) => (
              <label
                key={option.value}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-surface px-4 text-[0.95rem] transition-colors has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink has-disabled:cursor-not-allowed has-disabled:opacity-50"
              >
                {input(option)}
                {option.label}
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {textOptions.map((option) => (
              <label
                key={option.value}
                className={`${cardBase} min-h-14 items-center gap-4 px-5 py-4`}
              >
                {input(option)}
                <span className="flex-1">
                  <span className="block text-base font-medium">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-0.5 block text-sm text-ink-soft">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <Check />
              </label>
            ))}
          </div>
        )
      ) : null}

      {error ? (
        <p id={`${name}-error`} className={fieldError}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
