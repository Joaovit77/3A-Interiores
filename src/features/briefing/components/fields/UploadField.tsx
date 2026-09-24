"use client";

import { useId, useState } from "react";

import type { MockFile, UploadFieldDef } from "../../definition/types";
import { fieldHint } from "../ui";
import type { FieldProps } from "./types";

/**
 * Upload SIMULADO: os arquivos ficam só na memória do navegador (URL `blob:`)
 * e somem ao recarregar. Nada é enviado para servidor.
 */
export function UploadField({
  field,
  value,
  onChange,
  hideLegend,
}: FieldProps) {
  const def = field.def as UploadFieldDef;
  const files = Array.isArray(value) ? (value as MockFile[]) : [];
  const inputId = useId();
  const [notice, setNotice] = useState("");

  const add = (list: FileList | null) => {
    if (!list?.length) return;
    const room = def.maxFiles - files.length;
    const accepted = Array.from(list).slice(0, Math.max(0, room));
    const next = accepted.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setNotice(
      list.length > accepted.length
        ? `Limite de ${def.maxFiles} arquivos. ${accepted.length} ${accepted.length === 1 ? "foi adicionado" : "foram adicionados"}.`
        : `${accepted.length} ${accepted.length === 1 ? "arquivo adicionado" : "arquivos adicionados"}.`,
    );
    onChange([...files, ...next]);
  };

  const remove = (file: MockFile) => {
    URL.revokeObjectURL(file.url);
    const next = files.filter((f) => f.id !== file.id);
    setNotice(`${file.name} removido.`);
    onChange(next.length ? next : undefined);
  };

  return (
    <div>
      <p className={hideLegend ? "sr-only" : "mb-2 text-base font-semibold"}>
        {def.label}
      </p>
      {def.hint ? <p className={`${fieldHint} mb-2`}>{def.hint}</p> : null}
      <label
        htmlFor={inputId}
        className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/30 bg-surface px-4 py-3 text-base font-medium transition-colors hover:border-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          +
        </span>
        {files.length ? "Adicionar mais" : def.label}
        <input
          id={inputId}
          type="file"
          multiple
          accept={def.accept}
          className="sr-only"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      <p className="mt-2 text-xs text-ink-soft">
        Simulação: nada é enviado. Os arquivos ficam só neste aparelho e somem
        ao recarregar a página.
      </p>
      {files.length ? (
        <ul
          className="mt-3 grid grid-cols-2 gap-3"
          aria-label="Arquivos adicionados"
        >
          {files.map((file) => (
            <li
              key={file.id}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              {file.type.startsWith("image/") ? (
                // Pré-visualização local de um arquivo `blob:`; next/image não se aplica.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex aspect-[4/3] items-center justify-center bg-sand text-sm font-semibold text-ink-soft"
                >
                  {file.type === "application/pdf" ? "PDF" : "Arquivo"}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-sm" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(file)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-lg text-ink hover:bg-sand"
                  aria-label={`Remover ${file.name}`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {notice}
      </p>
    </div>
  );
}
