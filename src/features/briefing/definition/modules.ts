import * as O from "./options";
import { livingUsesDefault } from "./stages";
import type { FieldDef, ModuleDef, ScreenDef } from "./types";

/**
 * Módulos profissionais completos no B2: Sala, Cozinha e Banheiro.
 * Os demais ambientes pertencem ao B1.1 e não têm perguntas.
 *
 * Os campos usam ids locais; o motor os prefixa com `room.<instancia>.`.
 */

const paletteScreen = (
  id: string,
  roomName: string,
  sources: string[],
): ScreenDef => ({
  id,
  title: `Seguir esta direção de cores ${roomName}?`,
  description: "É a direção de cores que você escolheu na etapa de estilo.",
  sources,
  when: ["paletteChosen"],
  reusable: true,
  fields: [
    {
      id: "palette_same",
      kind: "choice",
      layout: "cards",
      label: `Seguir esta direção de cores ${roomName}?`,
      options: O.PALETTE_SAME,
    },
    {
      id: "palette",
      kind: "choice",
      layout: "images",
      multiple: true,
      label: "Qual direção para este ambiente?",
      options: O.PALETTES,
      when: ["roomPaletteDifferent"],
    },
  ],
});

const lightingFields: FieldDef[] = [
  {
    id: "lighting_temperature",
    kind: "choice",
    layout: "images",
    label: "Temperatura da luz",
    options: O.LIGHT_TEMPERATURE,
  },
  {
    id: "lighting_spread",
    kind: "choice",
    layout: "images",
    label: "Distribuição da luz",
    options: O.LIGHT_SPREAD,
  },
];

export const LIVING_MODULE: ModuleDef = {
  roomType: "sala",
  screens: [
    {
      id: "usos",
      title: "Para que vocês usam, ou querem usar, a sala?",
      description: "Escolha quantos quiser.",
      sources: ["O40", "O42"],
      isNew: true,
      fields: [
        {
          id: "uses",
          kind: "choice",
          layout: "cards",
          multiple: true,
          label: "Usos da sala",
          options: O.LIVING_USES,
          defaultValue: livingUsesDefault,
        },
      ],
    },
    {
      id: "tempo",
      title: "Quanto tempo vocês passam na sala?",
      sources: ["O38"],
      fields: [
        {
          id: "frequency",
          kind: "choice",
          layout: "cards",
          label: "Tempo na sala",
          options: O.LIVING_TIME,
        },
      ],
    },
    {
      id: "tv",
      title: "De que tamanho é, ou será, a TV?",
      sources: ["O47"],
      when: ["livingTv"],
      fields: [
        {
          id: "tv_size",
          kind: "choice",
          layout: "chips",
          label: "Tamanho da TV",
          options: O.TV_SIZES,
        },
        {
          id: "devices",
          kind: "choice",
          layout: "chips",
          multiple: true,
          label: "Quais aparelhos ficam junto?",
          options: O.DEVICES,
        },
      ],
    },
    {
      id: "visitas",
      title: "Com que frequência vocês recebem pessoas?",
      sources: ["O39", "O37"],
      when: ["livingGuests"],
      fields: [
        {
          id: "guests_frequency",
          kind: "choice",
          layout: "chips",
          label: "Frequência",
          options: O.GUEST_FREQUENCY,
        },
        {
          id: "guests_count",
          kind: "choice",
          layout: "chips",
          label: "Quantas pessoas, em geral?",
          options: O.GUEST_COUNT,
        },
      ],
    },
    {
      id: "livros",
      title: "Quantos livros vocês querem guardar ou expor?",
      sources: ["O41"],
      when: ["livingReading"],
      fields: [
        {
          id: "books",
          kind: "choice",
          layout: "cards",
          label: "Quantidade de livros",
          options: O.BOOKS,
        },
      ],
    },
    {
      id: "apoio",
      title: "Qual desses você imagina na sala?",
      sources: ["O45"],
      when: ["livingTvOrReading"],
      fields: [
        {
          id: "storage_type",
          kind: "choice",
          layout: "images",
          multiple: true,
          label: "Rack, painel ou estante",
          options: O.LIVING_STORAGE,
        },
      ],
    },
    paletteScreen("cores", "na sala", ["O44"]),
    {
      id: "luz",
      title: "Como você imagina a luz da sala?",
      sources: ["O46"],
      fields: lightingFields,
    },
    {
      id: "tapete",
      title: "Gosta de tapete na sala?",
      sources: ["O48"],
      fields: [
        {
          id: "rug",
          kind: "choice",
          layout: "cards",
          label: "Tapete",
          options: O.RUG,
        },
      ],
    },
    {
      id: "plantas",
      title: "Quer plantas na sala?",
      sources: ["O49"],
      when: ["wantsGreenery"],
      fields: [
        {
          id: "plants",
          kind: "choice",
          layout: "cards",
          label: "Plantas",
          options: O.YES_NO,
        },
      ],
    },
    {
      id: "janelas",
      title: "Como você prefere controlar a luz das janelas?",
      sources: ["O50"],
      fields: [
        {
          id: "windows",
          kind: "choice",
          layout: "images",
          label: "Janelas",
          options: O.WINDOWS,
        },
      ],
    },
    {
      id: "adaptacoes",
      title: "Algo na sala precisa ser adaptado?",
      sources: ["O51"],
      when: ["careMobility"],
      fields: [
        {
          id: "accessibility",
          kind: "textarea",
          label: "Adaptações na sala",
          maxLength: 1000,
        },
      ],
    },
    {
      id: "alturas",
      title: "Algum móvel da sala precisa de altura especial?",
      sources: ["O52"],
      when: ["careHeight"],
      fields: [
        {
          id: "special_heights",
          kind: "textarea",
          label: "Alturas especiais",
          maxLength: 1000,
        },
      ],
    },
  ],
};

export const KITCHEN_MODULE: ModuleDef = {
  roomType: "cozinha",
  screens: [
    {
      id: "rotina",
      title: "Com que frequência vocês cozinham?",
      sources: ["O53"],
      fields: [
        {
          id: "frequency",
          kind: "choice",
          layout: "cards",
          label: "Frequência",
          options: O.KITCHEN_FREQUENCY,
        },
      ],
    },
    {
      id: "refeicoes",
      title: "Que refeições acontecem na cozinha?",
      sources: ["O54"],
      fields: [
        {
          id: "meals",
          kind: "choice",
          layout: "chips",
          multiple: true,
          label: "Refeições na cozinha",
          options: O.KITCHEN_MEALS,
        },
      ],
    },
    {
      id: "relacao",
      title: "Como a cozinha se relaciona com o resto da casa?",
      sources: ["O55", "O66"],
      fields: [
        {
          id: "layout",
          kind: "choice",
          layout: "images",
          label: "Cozinha aberta ou fechada",
          options: O.KITCHEN_LAYOUT,
        },
        {
          id: "opens_to_living",
          kind: "choice",
          layout: "chips",
          label: "A cozinha se integra com a sala?",
          options: O.KITCHEN_INTEGRATION,
          when: ["kitchenIntegration"],
        },
      ],
    },
    {
      id: "armazenamento",
      title: "Quanto espaço para guardar vocês precisam, e para quê?",
      sources: ["O56", "O58", "O59"],
      fields: [
        {
          id: "storage_level",
          kind: "choice",
          layout: "chips",
          label: "Quanto espaço",
          options: O.STORAGE_LEVEL,
        },
        {
          id: "storage_items",
          kind: "choice",
          layout: "chips",
          multiple: true,
          label: "Para guardar o quê?",
          options: O.KITCHEN_STORAGE_ITEMS,
        },
        {
          id: "pantry",
          kind: "choice",
          layout: "chips",
          label: "Como vocês costumam comprar mantimentos?",
          options: O.PANTRY,
          when: ["kitchenPantry"],
        },
      ],
    },
    {
      id: "eletroportateis",
      title: "Quais aparelhos pequenos vocês usam com frequência?",
      sources: ["O57"],
      fields: [
        {
          id: "small_appliances",
          kind: "choice",
          layout: "chips",
          multiple: true,
          label: "Eletroportáteis",
          options: O.SMALL_APPLIANCES,
        },
        {
          id: "small_appliances_visibility",
          kind: "choice",
          layout: "chips",
          label: "Ficam à vista ou guardados?",
          options: O.APPLIANCES_VISIBILITY,
        },
      ],
    },
    {
      id: "eletrodomesticos",
      title: "Quais eletrodomésticos vão entrar?",
      sources: ["O62"],
      fields: [
        {
          id: "appliances",
          kind: "choice",
          layout: "chips",
          multiple: true,
          label: "Eletrodomésticos",
          options: O.APPLIANCES,
        },
        {
          id: "appliances_specs",
          kind: "textarea",
          label: "Já tem modelos ou medidas?",
          hint: "Pode informar agora ou depois.",
          maxLength: 1500,
        },
      ],
    },
    {
      id: "medidas",
      title: "Sabe as medidas aproximadas da cozinha?",
      description: "Pode deixar para depois.",
      sources: ["O63"],
      when: ["noPlanSent"],
      fields: [
        {
          id: "dimensions",
          kind: "text",
          label: "Medidas aproximadas",
          placeholder: "Ex.: 3 x 2,5 m",
          maxLength: 80,
        },
      ],
    },
    paletteScreen("cores", "na cozinha", ["O60"]),
    {
      id: "luz",
      title: "Como deve ser a luz na cozinha?",
      sources: ["O64"],
      fields: lightingFields,
    },
    {
      id: "prioridades",
      title: "O que é mais importante na cozinha?",
      description: "Escolha até 3.",
      sources: ["O61"],
      fields: [
        {
          id: "priorities",
          kind: "choice",
          layout: "chips",
          multiple: true,
          max: 3,
          label: "Prioridades",
          options: O.KITCHEN_PRIORITIES,
        },
        {
          id: "other_needs",
          kind: "textarea",
          label: "Tem alguma outra necessidade específica na cozinha?",
          maxLength: 1000,
        },
      ],
    },
    {
      id: "piso",
      title: "Prefere piso antiderrapante na cozinha?",
      sources: ["O65"],
      when: ["nonSlipContext"],
      fields: [
        {
          id: "non_slip",
          kind: "choice",
          layout: "cards",
          label: "Piso antiderrapante",
          options: O.NON_SLIP,
        },
      ],
    },
  ],
};

export const BATHROOM_MODULE: ModuleDef = {
  roomType: "banheiro",
  reuseFieldId: "reuse_previous",
  screens: [
    {
      id: "mesma-direcao",
      title: "Quer manter a mesma direção visual do banheiro anterior?",
      description:
        "Cores, armazenamento, espelho, iluminação e metais. Quem usa e a rotina deste banheiro continuam sendo perguntados.",
      sources: [],
      isNew: true,
      when: ["notFirstOfType"],
      fields: [
        {
          id: "reuse_previous",
          kind: "choice",
          layout: "cards",
          label: "Manter a mesma direção visual?",
          options: O.YES_NO,
        },
      ],
    },
    {
      id: "quem-usa",
      title: "Quem usa este banheiro?",
      sources: ["O67"],
      fields: [
        {
          id: "users",
          kind: "choice",
          layout: "cards",
          label: "Quem usa",
          options: O.BATHROOM_USERS,
        },
      ],
    },
    {
      id: "se-arrumar",
      title: "Este banheiro é usado para se arrumar?",
      sources: ["O68"],
      fields: [
        {
          id: "grooming",
          kind: "choice",
          layout: "chips",
          multiple: true,
          label: "Uso para se arrumar",
          options: O.GROOMING,
        },
      ],
    },
    {
      id: "armazenamento",
      title: "Quanto você precisa guardar, e quais soluções quer?",
      sources: ["O69", "O70", "O71", "O72"],
      reusable: true,
      fields: [
        {
          id: "storage_level",
          kind: "choice",
          layout: "chips",
          label: "Quanto precisa guardar",
          options: O.STORAGE_LEVEL,
        },
        {
          id: "storage_solutions",
          kind: "choice",
          layout: "images",
          multiple: true,
          label: "Soluções de armazenamento",
          options: O.BATHROOM_SOLUTIONS,
        },
      ],
    },
    paletteScreen("cores", "neste banheiro", ["O73"]),
    {
      id: "espelho",
      title: "Como você imagina o espelho?",
      sources: ["O74"],
      reusable: true,
      fields: [
        {
          id: "mirror",
          kind: "choice",
          layout: "images",
          label: "Espelho",
          options: O.MIRRORS,
        },
      ],
    },
    {
      id: "luz",
      title: "Como deve ser a luz neste banheiro?",
      sources: ["O75"],
      reusable: true,
      fields: lightingFields,
    },
    {
      id: "metais",
      title: "Qual acabamento de metais te agrada?",
      sources: ["O76"],
      reusable: true,
      fields: [
        {
          id: "fixtures",
          kind: "choice",
          layout: "images",
          label: "Metais",
          options: O.FIXTURES,
        },
      ],
    },
    {
      id: "altura-espelho",
      title: "Em que altura o espelho e a bancada precisam ficar?",
      sources: ["O74"],
      when: ["careHeight"],
      fields: [
        {
          id: "mirror_height",
          kind: "textarea",
          label: "Altura do espelho e da bancada",
          maxLength: 500,
        },
      ],
    },
    {
      id: "barras",
      title: "Quer barras de apoio neste banheiro?",
      sources: ["O77"],
      when: ["careMobility"],
      fields: [
        {
          id: "grab_bars",
          kind: "choice",
          layout: "cards",
          label: "Barras de apoio",
          options: O.YES_NO,
        },
      ],
    },
    {
      id: "porta",
      title: "Que tipo de porta funciona melhor neste banheiro?",
      sources: ["O79"],
      when: ["careMobility"],
      fields: [
        {
          id: "door",
          kind: "choice",
          layout: "images",
          label: "Porta",
          options: O.DOORS,
        },
      ],
    },
    {
      id: "adaptacoes",
      title: "Algo neste banheiro precisa ser adaptado?",
      sources: ["O78"],
      when: ["careConsented"],
      fields: [
        {
          id: "accessibility",
          kind: "textarea",
          label: "Adaptações no banheiro",
          maxLength: 1000,
        },
      ],
    },
  ],
};

export const MODULES: ModuleDef[] = [
  LIVING_MODULE,
  KITCHEN_MODULE,
  BATHROOM_MODULE,
];

export function moduleFor(roomType: string): ModuleDef | undefined {
  return MODULES.find((m) => m.roomType === roomType);
}
