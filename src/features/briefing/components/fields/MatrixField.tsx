"use client";

import type { MatrixFieldDef } from "../../definition/types";
import type { FieldProps } from "./types";

/** Uma linha por prática, com as mesmas opções em cada linha. */
export function MatrixField({ field, value, onChange }: FieldProps) {
  const def = field.def as MatrixFieldDef;
  const answers = (value as Record<string, string> | undefined) ?? {};
  return (
    <fieldset>
      <legend className="mb-3 block text-base font-semibold">
        {def.label}
      </legend>
      <div className="flex flex-col gap-4">
        {def.rows.map((row) => (
          <fieldset
            key={row.id}
            className="rounded-card border border-line bg-surface p-4"
          >
            <legend className="sr-only">{row.label}</legend>
            <p aria-hidden="true" className="mb-3 text-base font-medium">
              {row.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {def.columns.map((column) => (
                <label
                  key={column.value}
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-surface px-4 text-[0.95rem] transition-colors has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink"
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name={`${field.key}.${row.id}`}
                    value={column.value}
                    checked={answers[row.id] === column.value}
                    onChange={() =>
                      onChange({ ...answers, [row.id]: column.value })
                    }
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </fieldset>
  );
}
