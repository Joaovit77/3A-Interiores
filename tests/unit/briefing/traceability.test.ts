import { describe, expect, it } from "vitest";

import { MODULES } from "@/features/briefing/definition/modules";
import { RULES } from "@/features/briefing/definition/rules";
import { SOURCES } from "@/features/briefing/definition/sources";
import { STAGES } from "@/features/briefing/definition/stages";
import type { ScreenDef } from "@/features/briefing/definition/types";

const allScreens: ScreenDef[] = [
  ...STAGES.flatMap((stage) =>
    stage.items.flatMap((item) =>
      item.type === "roomModules" ? [] : [item.screen],
    ),
  ),
  ...MODULES.flatMap((m) => m.screens),
];

const covered = new Set(allScreens.flatMap((s) => s.sources));

describe("rastreabilidade com o briefing original (B1)", () => {
  it("registra os 90 itens da fonte mais a repetição exata", () => {
    expect(SOURCES).toHaveLength(91);
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(91);
  });

  it("dá destino a todo item que não foi retirado com aprovação", () => {
    const missing = SOURCES.filter((s) => !s.removed && !covered.has(s.id)).map(
      (s) => s.id,
    );
    expect(missing).toEqual([]);
  });

  it("não usa em nenhuma tela o item retirado com aprovação (sexo)", () => {
    const removed = SOURCES.filter((s) => s.removed).map((s) => s.id);
    expect(removed).toEqual(["O04"]);
    expect(covered.has("O04")).toBe(false);
  });

  it("só referencia itens que existem na fonte", () => {
    const known = new Set(SOURCES.map((s) => s.id));
    expect([...covered].filter((id) => !known.has(id))).toEqual([]);
  });

  it("marca como nova toda tela sem item de origem", () => {
    const unmarked = allScreens
      .filter((s) => s.sources.length === 0 && !s.isNew)
      .map((s) => s.id);
    expect(unmarked).toEqual([]);
  });

  it("referencia apenas regras existentes", () => {
    const names = new Set(Object.keys(RULES));
    const used = allScreens.flatMap((s) => [
      ...(s.when ?? []),
      ...(typeof s.fields === "function"
        ? []
        : s.fields.flatMap((f) => f.when ?? [])),
    ]);
    expect(used.filter((n) => !names.has(n))).toEqual([]);
  });
});
