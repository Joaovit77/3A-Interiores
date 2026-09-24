"use client";

import {
  PENDING_MODULE_MESSAGE,
  ROOM_TYPES,
  type RoomSelection,
} from "../../definition/rooms";
import { fieldError } from "../ui";
import { Stepper } from "./Stepper";
import type { FieldProps } from "./types";

/** Seleção de ambientes, com quantidade para os que podem se repetir. */
export function RoomsField({
  field,
  value,
  onChange,
  error,
  hideLegend,
}: FieldProps) {
  const selection = (value as RoomSelection | undefined) ?? {};
  const set = (type: string, count: number) => {
    const next = { ...selection, [type]: count };
    if (count <= 0) delete next[type];
    onChange(Object.keys(next).length ? next : undefined);
  };
  const pending = ROOM_TYPES.filter(
    (r) => !r.hasModule && (selection[r.type] ?? 0) > 0,
  );
  const errorId = `field-${field.key}-error`;

  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      aria-invalid={!!error || undefined}
    >
      <legend
        className={
          hideLegend ? "sr-only" : "mb-3 block text-base font-semibold"
        }
      >
        {field.def.label}
      </legend>
      <div className="grid grid-cols-2 gap-3">
        {ROOM_TYPES.filter((r) => !r.multiple).map((room) => (
          <label
            key={room.type}
            className="flex min-h-16 cursor-pointer items-center rounded-card border border-line bg-surface px-4 py-3 text-base font-medium transition-colors has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink"
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={(selection[room.type] ?? 0) > 0}
              onChange={(e) => set(room.type, e.target.checked ? 1 : 0)}
            />
            {room.label}
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {ROOM_TYPES.filter((r) => r.multiple).map((room) => (
          <div
            key={room.type}
            className={`flex items-center justify-between gap-3 rounded-card border px-4 py-3 ${
              (selection[room.type] ?? 0) > 0
                ? "border-ink bg-sand"
                : "border-line bg-surface"
            }`}
          >
            <span className="text-base font-medium">{room.label}s</span>
            <Stepper
              label={`Quantidade de ${room.label.toLowerCase()}s`}
              value={selection[room.type] ?? 0}
              min={0}
              max={6}
              onChange={(n) => set(room.type, n)}
            />
          </div>
        ))}
      </div>
      <div aria-live="polite">
        {pending.length ? (
          <p className="mt-4 rounded-xl bg-rose px-4 py-3 text-sm text-ink">
            <span className="font-semibold">
              {pending.map((r) => r.label).join(", ")}.
            </span>{" "}
            {PENDING_MODULE_MESSAGE}
          </p>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className={fieldError}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
