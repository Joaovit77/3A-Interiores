import { PALETTE_VALUES } from "./options";
import type { AnswerValue, Ctx, Rule } from "./types";

/**
 * Regras condicionais do briefing. Telas e campos referenciam as regras pelo
 * nome, o que permite inspecioná-las no DevPanel e testá-las isoladamente.
 *
 * Regras só leem respostas visíveis e anteriores no fluxo: respostas de telas
 * escondidas não influenciam nada enquanto estiverem escondidas.
 */

const list = (value: AnswerValue | undefined): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];

const includes = (value: AnswerValue | undefined, item: string) =>
  list(value).includes(item);

const num = (value: AnswerValue | undefined) =>
  typeof value === "number" ? value : 0;

const careConsented = (c: Ctx) =>
  c.get("household.care_needed") === "sim" &&
  c.get("household.care_consent") === true;

const careNeed = (c: Ctx, need: string) =>
  careConsented(c) && includes(c.get("household.care_needs"), need);

const anyResidentAge = (c: Ctx, ranges: string[]) =>
  c.residents.some((r) =>
    ranges.includes(String(c.get(`resident.${r.id}.age_range`) ?? "")),
  );

const hasRoomType = (c: Ctx, type: string) =>
  c.rooms.some((r) => r.type === type);

/**
 * Característica do ambiente que justifica perguntar sobre piso antiderrapante.
 * Nenhum critério foi definido pela Luísa ainda, então fica desligado.
 */
const kitchenCharacteristicSuggestsNonSlip = (ctx: Ctx): boolean => {
  void ctx;
  return false;
};

export const RULES = {
  multipleResidents: {
    label: "2 ou mais moradores",
    test: (c) => num(c.get("household.count")) >= 2,
  },
  decisionMakersYes: {
    label: "Outra pessoa participa das decisões",
    test: (c) => c.get("household.decision_makers") === "sim",
  },
  planYes: {
    label: "Tem planta do imóvel",
    test: (c) => c.get("property.has_plan") === "sim",
  },
  planNo: {
    label: "Não tem planta do imóvel",
    test: (c) => c.get("property.has_plan") === "nao",
  },
  noPlanSent: {
    label: "Planta não enviada",
    test: (c) => c.get("property.has_plan") !== "sim",
  },
  keepItemsYes: {
    label: "Há itens que vão continuar",
    test: (c) => c.get("property.keep_has") === "sim",
  },
  staffYes: {
    label: "Alguém trabalha na casa",
    test: (c) => c.get("household.staff_has") === "sim",
  },
  hasPets: {
    label: "Tem animais",
    test: (c) => list(c.get("household.pets")).some((p) => p !== "nao_tenho"),
  },
  petDog: {
    label: "Tem cachorro",
    test: (c) => includes(c.get("household.pets"), "cachorro"),
  },
  petCat: {
    label: "Tem gato",
    test: (c) => includes(c.get("household.pets"), "gato"),
  },
  petOther: {
    label: "Tem outro animal",
    test: (c) => includes(c.get("household.pets"), "outro"),
  },
  workYes: {
    label: "Alguém trabalha ou estuda em casa",
    test: (c) => c.get("spaces.work_needs") === "sim",
  },
  careYes: {
    label: "Filtro de acessibilidade, mobilidade ou ergonomia = Sim",
    test: (c) => c.get("household.care_needed") === "sim",
  },
  careConsented: {
    label: "Consentimento para dados de acessibilidade",
    test: careConsented,
  },
  careHeight: {
    label: "Necessidade de altura indicada",
    test: (c) => careNeed(c, "altura"),
  },
  careMobility: {
    label: "Necessidade de mobilidade ou circulação indicada",
    test: (c) => careNeed(c, "mobilidade"),
  },
  keepsakesYes: {
    label: "Tem objetos afetivos",
    test: (c) => c.get("style.keepsakes_has") === "sim",
  },
  paletteChosen: {
    label: "Escolheu uma direção de cores",
    test: (c) =>
      list(c.get("style.palette")).some((v) => PALETTE_VALUES.includes(v)),
  },
  wantsGreenery: {
    label: "Quer algum verde em casa",
    test: (c) => {
      const v = c.get("style.greenery");
      return typeof v === "string" && v !== "nenhum";
    },
  },
  // Sala (escopo do ambiente)
  livingTv: {
    label: "Sala: assistir TV",
    test: (c) => includes(c.local("uses"), "tv"),
  },
  livingGuests: {
    label: "Sala: receber pessoas",
    test: (c) => includes(c.local("uses"), "receber"),
  },
  livingReading: {
    label: "Sala: ler",
    test: (c) => includes(c.local("uses"), "ler"),
  },
  livingTvOrReading: {
    label: "Sala: assistir TV ou ler",
    test: (c) =>
      includes(c.local("uses"), "tv") || includes(c.local("uses"), "ler"),
  },
  // Cozinha
  kitchenIntegration: {
    label: "Cozinha não fechada e sala no projeto",
    test: (c) => {
      const layout = c.local("layout");
      return (
        hasRoomType(c, "sala") &&
        typeof layout === "string" &&
        layout !== "fechada"
      );
    },
  },
  kitchenPantry: {
    label: "Cozinha: guarda mantimentos",
    test: (c) => includes(c.local("storage_items"), "mantimentos"),
  },
  nonSlipContext: {
    label:
      "Contexto para piso antiderrapante (mobilidade, idosos, crianças pequenas ou característica do ambiente)",
    test: (c) =>
      careNeed(c, "mobilidade") ||
      anyResidentAge(c, ["60+", "0-5"]) ||
      kitchenCharacteristicSuggestsNonSlip(c),
  },
  // Ambientes com direção de cor
  roomPaletteDifferent: {
    label: "Ambiente com cores diferentes da direção geral",
    test: (c) => c.local("palette_same") === "diferente",
  },
  // Banheiro
  notFirstOfType: {
    label: "Segundo ambiente do mesmo tipo em diante",
    test: (c) => c.scope.kind === "room" && c.scope.room.index > 1,
  },
  // Hábitos, prazo
  dietYes: {
    label: "Hábito alimentar influencia a cozinha",
    test: (c) => c.get("habits.diet_influences") === "sim",
  },
  constraintsYes: {
    label: "Há restrições",
    test: (c) => c.get("project.constraints") === "sim",
  },
  deadlineChosen: {
    label: "Escolheu um período de prazo",
    test: (c) => {
      const v = c.get("project.deadline");
      return typeof v === "string" && v !== "sem_data";
    },
  },
  eventsYes: {
    label: "Algum acontecimento influencia o prazo",
    test: (c) => c.get("project.events") === "sim",
  },
} satisfies Record<string, Rule>;

export type RuleName = keyof typeof RULES;

export function evaluateRule(name: string, ctx: Ctx): boolean {
  const rule = (RULES as Record<string, Rule>)[name];
  if (!rule) throw new Error(`Regra desconhecida: ${name}`);
  return rule.test(ctx);
}
