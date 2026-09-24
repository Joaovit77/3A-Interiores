import { describe, expect, it } from "vitest";

import type { Answers } from "@/features/briefing/definition/types";
import { buildFlow } from "@/features/briefing/engine/flow";
import { progressFor } from "@/features/briefing/engine/progress";
import { buildSummary } from "@/features/briefing/engine/summary";
import { firstInvalidScreen } from "@/features/briefing/engine/validation";

const keys = (answers: Answers) => buildFlow(answers).screens.map((s) => s.key);

const base: Answers = {
  "intro.name": "Ana",
  "household.count": 1,
  "property.type": "apartamento",
  "property.city": "Cidade Exemplo",
  "spaces.rooms": { sala: 1 },
  "contact.email": "ana@exemplo.com",
};

describe("fluxo mínimo", () => {
  it("mostra só os módulos dos ambientes escolhidos", () => {
    const flow = keys(base);
    expect(flow).toContain("sala-usos");
    expect(flow.some((k) => k.startsWith("cozinha-"))).toBe(false);
    expect(flow.some((k) => k.startsWith("banheiro-"))).toBe(false);
  });

  it("não mostra relação nem convivência com um morador só", () => {
    const flow = keys(base);
    expect(flow).not.toContain("relacao");
    expect(flow).not.toContain("convivencia");
    expect(keys({ ...base, "household.count": 2 })).toEqual(
      expect.arrayContaining([
        "relacao",
        "convivencia",
        "pessoa-1",
        "pessoa-2",
      ]),
    );
  });

  it("é válido com os campos obrigatórios preenchidos", () => {
    expect(firstInvalidScreen(buildFlow(base))).toBe(-1);
  });

  it("bloqueia a primeira tela obrigatória vazia", () => {
    const flow = buildFlow({ ...base, "intro.name": "" });
    expect(flow.screens[firstInvalidScreen(flow)].key).toBe("nome");
  });

  it("exige pelo menos um ambiente", () => {
    const flow = buildFlow({ ...base, "spaces.rooms": {} });
    expect(flow.screens[firstInvalidScreen(flow)].key).toBe("ambientes");
  });

  it("não torna orçamento nem prazo obrigatórios", () => {
    const flow = buildFlow(base);
    const optional = flow.screens.filter((s) =>
      ["orcamento", "prazo"].includes(s.key),
    );
    expect(
      optional.flatMap((s) => s.fields).every((f) => !f.def.required),
    ).toBe(true);
  });
});

describe("filtro de acessibilidade, mobilidade ou ergonomia", () => {
  const care = {
    ...base,
    "spaces.rooms": { sala: 1, cozinha: 1, banheiro: 1 },
  };

  it("não abre detalhes sem consentimento", () => {
    const flow = buildFlow({ ...care, "household.care_needed": "sim" });
    const screen = flow.screens.find((s) => s.key === "cuidados")!;
    expect(screen.fields.map((f) => f.key)).toEqual([
      "household.care_needed",
      "household.care_consent",
    ]);
  });

  it("«Prefiro conversar» não abre nada", () => {
    const flow = keys({ ...care, "household.care_needed": "conversar" });
    expect(flow).not.toContain("alturas");
    expect(flow).not.toContain("banheiro-1-barras");
  });

  it("mostra perguntas de adaptação só com o contexto certo", () => {
    const withMobility = keys({
      ...care,
      "household.care_needed": "sim",
      "household.care_consent": true,
      "household.care_needs": ["mobilidade"],
    });
    expect(withMobility).toEqual(
      expect.arrayContaining([
        "banheiro-1-barras",
        "banheiro-1-porta",
        "sala-adaptacoes",
        "cozinha-piso",
      ]),
    );
    expect(withMobility).not.toContain("alturas");

    const withHeight = keys({
      ...care,
      "household.care_needed": "sim",
      "household.care_consent": true,
      "household.care_needs": ["altura"],
    });
    expect(withHeight).toEqual(
      expect.arrayContaining([
        "alturas",
        "sala-alturas",
        "banheiro-1-altura-espelho",
      ]),
    );
    expect(withHeight).not.toContain("banheiro-1-barras");

    const without = keys(care);
    expect(without).not.toContain("banheiro-1-barras");
    expect(without).not.toContain("banheiro-1-porta");
    expect(without).not.toContain("cozinha-piso");
  });
});

describe("piso antiderrapante", () => {
  const kitchen = { ...base, "spaces.rooms": { cozinha: 1 } };

  it("aparece com idosos ou crianças pequenas", () => {
    expect(keys({ ...kitchen, "resident.p1.age_range": "60+" })).toContain(
      "cozinha-piso",
    );
    expect(keys({ ...kitchen, "resident.p1.age_range": "0-5" })).toContain(
      "cozinha-piso",
    );
    expect(
      keys({ ...kitchen, "resident.p1.age_range": "30-44" }),
    ).not.toContain("cozinha-piso");
  });

  it("ignora a faixa etária de um morador que deixou de existir", () => {
    const answers = {
      ...kitchen,
      "household.count": 1,
      "resident.p2.age_range": "60+",
    };
    expect(keys(answers)).not.toContain("cozinha-piso");
    expect(keys({ ...answers, "household.count": 2 })).toContain(
      "cozinha-piso",
    );
  });
});

describe("banheiros", () => {
  const two: Answers = {
    ...base,
    "spaces.rooms": { banheiro: 2 },
    "style.palette": ["paleta_1"],
    "room.banheiro-1.mirror": "redondo",
    "room.banheiro-1.fixtures": "preto",
    "room.banheiro-1.storage_solutions": ["gavetoes"],
    "room.banheiro-1.users": "todos",
  };

  it("pergunta sobre reaproveitar só a partir do segundo", () => {
    const flow = keys(two);
    expect(flow).not.toContain("banheiro-1-mesma-direcao");
    expect(flow).toContain("banheiro-2-mesma-direcao");
  });

  it("com «Sim», herda a direção visual e continua perguntando o funcional", () => {
    const flow = buildFlow({ ...two, "room.banheiro-2.reuse_previous": "sim" });
    const bath2 = flow.screens
      .filter((s) => s.key.startsWith("banheiro-2-"))
      .map((s) => s.key);
    expect(bath2).toEqual(
      expect.arrayContaining(["banheiro-2-quem-usa", "banheiro-2-se-arrumar"]),
    );
    expect(bath2).not.toContain("banheiro-2-espelho");
    expect(bath2).not.toContain("banheiro-2-metais");
    expect(bath2).not.toContain("banheiro-2-armazenamento");
    expect(flow.effective["room.banheiro-2.mirror"]).toBe("redondo");
    expect(flow.derived["room.banheiro-2.mirror"]).toEqual({
      kind: "inherited",
      from: "room.banheiro-1.mirror",
    });
    // Quem usa não é herdado.
    expect(flow.effective["room.banheiro-2.users"]).toBeUndefined();
  });

  it("com «Não», pergunta tudo de novo", () => {
    const flow = keys({ ...two, "room.banheiro-2.reuse_previous": "nao" });
    expect(flow).toEqual(
      expect.arrayContaining(["banheiro-2-espelho", "banheiro-2-metais"]),
    );
  });

  it("mostra as preferências herdadas no resumo", () => {
    const flow = buildFlow({ ...two, "room.banheiro-2.reuse_previous": "sim" });
    const details = buildSummary(flow).find((s) => s.id === "detalhes")!;
    const inherited = details.screens.find((s) => s.inheritedFrom);
    expect(inherited?.room).toBe("Banheiro 2");
    expect(inherited?.entries.map((e) => e.value)).toContain("Preto fosco");
  });
});

describe("sala organizada pelos usos", () => {
  const living = { ...base, "spaces.rooms": { sala: 1 } };

  it("mostra detalhes conforme os usos", () => {
    expect(keys(living)).not.toContain("sala-tv");
    const flow = keys({ ...living, "room.sala.uses": ["tv", "ler"] });
    expect(flow).toEqual(
      expect.arrayContaining(["sala-tv", "sala-livros", "sala-apoio"]),
    );
    expect(flow).not.toContain("sala-visitas");
  });

  it("pré-marca trabalho e refeições a partir da Etapa 4", () => {
    const flow = buildFlow({
      ...living,
      "spaces.work_needs": "sim",
      "spaces.work_where": ["sala"],
      "spaces.meals_where": ["sofa"],
    });
    expect(flow.effective["room.sala.uses"]).toEqual([
      "trabalhar",
      "refeicoes",
    ]);
    expect(flow.derived["room.sala.uses"]).toEqual({ kind: "default" });
  });

  it("a escolha explícita vence o valor pré-marcado", () => {
    const flow = buildFlow({
      ...living,
      "spaces.meals_where": ["sofa"],
      "room.sala.uses": [],
    });
    expect(flow.effective["room.sala.uses"]).toEqual([]);
  });
});

describe("respostas escondidas", () => {
  it("ficam fora do resumo e das regras e voltam com a condição", () => {
    const answers: Answers = {
      ...base,
      "household.count": 2,
      "household.relationship": "casal",
    };
    const visible = buildSummary(buildFlow(answers));
    expect(JSON.stringify(visible)).toContain("Casal");

    const hidden = buildFlow({ ...answers, "household.count": 1 });
    expect(hidden.effective["household.relationship"]).toBeUndefined();
    expect(JSON.stringify(buildSummary(hidden))).not.toContain("Casal");

    const back = buildFlow({ ...answers, "household.count": 2 });
    expect(back.effective["household.relationship"]).toBe("casal");
  });

  it("uma resposta escondida não liga regras", () => {
    const answers: Answers = {
      ...base,
      "spaces.rooms": { cozinha: 1 },
      "household.care_needed": "nao",
      "household.care_consent": true,
      "household.care_needs": ["mobilidade"],
    };
    expect(keys(answers)).not.toContain("cozinha-piso");
  });
});

describe("ambientes do B1.1", () => {
  it("são selecionáveis, não têm perguntas e aparecem no resumo", () => {
    const flow = buildFlow({
      ...base,
      "spaces.rooms": { sala: 1, quarto: 2, varanda: 1 },
    });
    expect(flow.screens.some((s) => s.key.startsWith("quarto"))).toBe(false);
    const ambientes = buildSummary(flow).find((s) => s.id === "ambientes")!;
    expect(ambientes.notes[0]).toContain("Quarto 1, Quarto 2, Varanda");
    expect(ambientes.screens[0].entries[0].value).toBe(
      "Sala de estar, Quarto (2), Varanda",
    );
  });

  it("não criam a etapa de detalhes sozinhos", () => {
    const flow = buildFlow({ ...base, "spaces.rooms": { quarto: 1 } });
    expect(flow.stages.map((s) => s.id)).not.toContain("detalhes");
  });
});

describe("prazo", () => {
  it("pergunta sobre acontecimentos só com um período escolhido", () => {
    expect(keys(base)).not.toContain("prazo-eventos");
    expect(keys({ ...base, "project.deadline": "sem_data" })).not.toContain(
      "prazo-eventos",
    );
    expect(keys({ ...base, "project.deadline": "3_6" })).toContain(
      "prazo-eventos",
    );
  });
});

describe("progresso", () => {
  it("é calculado por etapa", () => {
    const flow = buildFlow(base);
    const first = progressFor(flow, "nome");
    expect(first.stageNumber).toBe(1);
    expect(first.fraction).toBe(0);
    const review = progressFor(flow, "revisao");
    expect(review.stageNumber).toBe(review.stageCount);
    expect(review.stageTitle).toBe("Revisar e enviar");
  });
});
