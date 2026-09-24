"use client";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** Botões − e + com o valor anunciado para leitores de tela. */
export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  const button =
    "flex size-12 items-center justify-center rounded-full border border-ink/25 text-xl text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className={button}
        aria-label={`Diminuir ${label.toLowerCase()}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <span aria-hidden="true">−</span>
      </button>
      <output
        aria-live="polite"
        aria-label={label}
        className="min-w-8 text-center text-2xl font-semibold tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        className={button}
        aria-label={`Aumentar ${label.toLowerCase()}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
