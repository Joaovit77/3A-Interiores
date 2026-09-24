import * as O from "./options";
import { ROOMS_FIELD } from "./rooms";
import type { Ctx, FieldDef, OptionDef, StageDef } from "./types";

const IMAGES_ACCEPT = "image/*";
const PLAN_ACCEPT = "image/*,application/pdf";

const PET_FIELDS: { rule: string; type: string; label: string }[] = [
  { rule: "petDog", type: "cachorro", label: "Cachorros" },
  { rule: "petCat", type: "gato", label: "Gatos" },
  { rule: "petOther", type: "outro", label: "Outros animais" },
];

const petFields = (): FieldDef[] =>
  PET_FIELDS.flatMap(({ rule, type, label }) => [
    {
      id: `household.pets_${type}_count`,
      kind: "counter",
      label: `${label}: quantos?`,
      min: 1,
      max: 10,
      initial: 1,
      when: [rule],
    },
    {
      id: `household.pets_${type}_size`,
      kind: "choice",
      layout: "chips",
      label: `${label}: de que porte?`,
      options: O.PET_SIZES,
      multiple: true,
      when: [rule],
    },
  ]);

const heightFields = (ctx: Ctx): FieldDef[] =>
  ctx.residents.map((r) => ({
    id: `resident.${r.id}.height_cm`,
    kind: "number",
    label: `Pessoa ${r.index}`,
    unit: "cm",
    min: 50,
    max: 250,
  }));

const selectedRoomOptions = (ctx: Ctx): OptionDef[] =>
  ctx.rooms.map((r) => ({ value: r.id, label: r.label }));

/** Pré-marca os usos da sala a partir das respostas da Etapa 4 (valor herdado). */
export const livingUsesDefault = (ctx: Ctx) => {
  const uses: string[] = [];
  const workWhere = ctx.get("spaces.work_where");
  if (ctx.get("spaces.work_needs") === "sim" && Array.isArray(workWhere)) {
    if ((workWhere as string[]).includes("sala")) uses.push("trabalhar");
  }
  const meals = ctx.get("spaces.meals_where");
  if (Array.isArray(meals) && (meals as string[]).includes("sofa"))
    uses.push("refeicoes");
  return uses.length ? uses : undefined;
};

export const STAGES: StageDef[] = [
  {
    id: "conhecer",
    title: "Vamos conhecer vocês",
    goal: "Quem vai viver no espaço.",
    items: [
      {
        type: "screen",
        screen: {
          id: "nome",
          title: "Como podemos te chamar?",
          sources: ["O01"],
          fields: [
            {
              id: "intro.name",
              kind: "text",
              label: "Primeiro nome",
              required: true,
              autoComplete: "given-name",
              maxLength: 60,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "decisoes",
          title: "Mais alguém participa das decisões do projeto?",
          sources: ["O01"],
          fields: [
            {
              id: "household.decision_makers",
              kind: "choice",
              layout: "cards",
              label: "Mais alguém participa das decisões do projeto?",
              options: O.YES_NO,
            },
            {
              id: "household.other_names",
              kind: "text",
              label: "Como essa pessoa se chama?",
              hint: "Se forem várias pessoas, separe os nomes por vírgula.",
              when: ["decisionMakersYes"],
              maxLength: 120,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "moradores",
          title: "Quantas pessoas vão morar no espaço?",
          sources: ["O02"],
          fields: [
            {
              id: "household.count",
              kind: "counter",
              label: "Quantidade de moradores",
              min: 1,
              max: 12,
              initial: 1,
              required: true,
            },
          ],
        },
      },
      {
        type: "perResident",
        screen: {
          id: "pessoa",
          title: (c) =>
            c.scope.kind === "resident" && c.residents.length > 1
              ? `Sobre a pessoa ${c.scope.index}`
              : "Sobre quem vai morar",
          description: "Só o que ajuda a projetar. Tudo aqui é opcional.",
          sources: ["O03", "O05"],
          fields: [
            {
              id: "age_range",
              kind: "choice",
              layout: "chips",
              label: "Faixa de idade",
              options: O.AGE_RANGES,
            },
            {
              id: "occupation",
              kind: "text",
              label: "O que essa pessoa faz no dia a dia?",
              hint: "Profissão ou ocupação.",
              maxLength: 80,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "relacao",
          title: "Qual a relação entre as pessoas que vão morar juntas?",
          sources: ["O06"],
          when: ["multipleResidents"],
          fields: [
            {
              id: "household.relationship",
              kind: "choice",
              layout: "cards",
              label: "Relação entre os moradores",
              options: O.RELATIONSHIP,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "convivencia",
          title: "Como vocês convivem em casa?",
          description: "Conte o que achar importante.",
          sources: ["O11"],
          when: ["multipleResidents"],
          fields: [
            {
              id: "household.dynamics",
              kind: "textarea",
              label: "Como vocês convivem em casa?",
              maxLength: 1500,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "origem",
          title: "De onde vocês são?",
          sources: ["O09"],
          fields: [
            {
              id: "household.origin_city",
              kind: "text",
              label: "Cidade ou lugar de origem",
              maxLength: 120,
            },
            {
              id: "household.origin_story",
              kind: "textarea",
              label: "Tem algo desse lugar que gostariam de sentir em casa?",
              maxLength: 1500,
            },
          ],
        },
      },
    ],
  },
  {
    id: "imovel",
    title: "O imóvel",
    goal: "O espaço e o que já existe nele.",
    items: [
      {
        type: "screen",
        screen: {
          id: "tipo-imovel",
          title: "Que tipo de imóvel é?",
          sources: ["O14"],
          fields: [
            {
              id: "property.type",
              kind: "choice",
              layout: "cards",
              label: "Tipo de imóvel",
              options: O.PROPERTY_TYPES,
              required: true,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "localizacao",
          title: "Em que cidade e bairro fica o imóvel?",
          description: "Não precisamos do endereço completo agora.",
          sources: ["O15"],
          fields: [
            {
              id: "property.city",
              kind: "text",
              label: "Cidade",
              required: true,
              autoComplete: "address-level2",
              maxLength: 80,
            },
            {
              id: "property.neighborhood",
              kind: "text",
              label: "Bairro",
              autoComplete: "address-level3",
              maxLength: 80,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "posse",
          title: "O imóvel é próprio ou alugado?",
          sources: ["O17"],
          fields: [
            {
              id: "property.tenure",
              kind: "choice",
              layout: "cards",
              label: "Situação do imóvel",
              options: O.TENURE,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "idade-imovel",
          title: "Quantos anos o imóvel tem, mais ou menos?",
          sources: ["O18"],
          fields: [
            {
              id: "property.age_range",
              kind: "choice",
              layout: "cards",
              label: "Idade do imóvel",
              options: O.PROPERTY_AGE,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "planta",
          title: "Você tem a planta do imóvel?",
          sources: ["O16"],
          fields: [
            {
              id: "property.has_plan",
              kind: "choice",
              layout: "cards",
              label: "Você tem a planta do imóvel?",
              options: O.YES_NO,
            },
            {
              id: "property.plan_files",
              kind: "upload",
              label: "Envie a planta",
              hint: "PDF ou imagem.",
              accept: PLAN_ACCEPT,
              maxFiles: 5,
              when: ["planYes"],
            },
            {
              id: "property.area_m2",
              kind: "number",
              label: "Sabe a metragem aproximada?",
              hint: "Pode deixar em branco.",
              unit: "m²",
              min: 1,
              max: 5000,
              when: ["planNo"],
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "infraestrutura",
          title: "O que o imóvel já tem que devemos considerar?",
          sources: ["O19"],
          fields: [
            {
              id: "property.infrastructure",
              kind: "choice",
              layout: "chips",
              multiple: true,
              label: "Infraestrutura existente",
              options: O.INFRASTRUCTURE,
            },
            {
              id: "property.infrastructure_note",
              kind: "textarea",
              label: "Quer detalhar algo?",
              maxLength: 800,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "itens-mantidos",
          title: "Há móveis ou objetos que vão continuar?",
          sources: ["O20"],
          fields: [
            {
              id: "property.keep_has",
              kind: "choice",
              layout: "cards",
              label: "Há móveis ou objetos que vão continuar?",
              options: O.YES_NO,
            },
            {
              id: "property.keep_items",
              kind: "textarea",
              label: "Quais?",
              when: ["keepItemsYes"],
              maxLength: 1500,
            },
            {
              id: "property.keep_photos",
              kind: "upload",
              label: "Se quiser, envie fotos",
              accept: IMAGES_ACCEPT,
              maxFiles: 10,
              when: ["keepItemsYes"],
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "itens-eliminados",
          title: "E o que vai sair?",
          sources: ["O21"],
          fields: [
            {
              id: "property.remove",
              kind: "textarea",
              label: "O que vai sair?",
              maxLength: 1500,
            },
            {
              id: "property.remove_photos",
              kind: "upload",
              label: "Se quiser, envie fotos",
              accept: IMAGES_ACCEPT,
              maxFiles: 10,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "fotos-atuais",
          title: "Quer mostrar como o espaço está hoje?",
          description:
            "Fotos ajudam a Luísa a entender o que já existe: móveis, revestimentos e o clima do ambiente. Se preferir, continue sem enviar.",
          sources: [],
          isNew: true,
          fields: [
            {
              id: "property.current_photos",
              kind: "upload",
              label: "Adicionar fotos",
              accept: IMAGES_ACCEPT,
              maxFiles: 15,
            },
          ],
        },
      },
    ],
  },
  {
    id: "ambientes",
    title: "Ambientes do projeto",
    goal: "O que será projetado. O resto do briefing se adapta a essa escolha.",
    items: [
      {
        type: "screen",
        screen: {
          id: "ambientes",
          title: "Quais ambientes entram no projeto?",
          description:
            "Marque todos. Para banheiros e quartos, informe a quantidade.",
          sources: ["O22", "O23"],
          fields: [
            {
              id: ROOMS_FIELD,
              kind: "rooms",
              label: "Ambientes do projeto",
              required: true,
            },
          ],
        },
      },
    ],
  },
  {
    id: "rotina",
    title: "Como vocês vivem",
    goal: "Rotina e necessidades práticas do dia a dia.",
    items: [
      {
        type: "screen",
        screen: {
          id: "rotina",
          title: "Como é a rotina de vocês?",
          description: "Marque o que combina.",
          sources: ["O10"],
          fields: [
            {
              id: "household.lifestyle",
              kind: "choice",
              layout: "chips",
              multiple: true,
              label: "Rotina",
              options: O.LIFESTYLE,
            },
            {
              id: "household.lifestyle_note",
              kind: "textarea",
              label: "Quer contar mais sobre a rotina?",
              maxLength: 1000,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "funcionarios",
          title: "Alguém trabalha na casa?",
          description: "Por exemplo, diarista ou babá.",
          sources: ["O12"],
          fields: [
            {
              id: "household.staff_has",
              kind: "choice",
              layout: "cards",
              label: "Alguém trabalha na casa?",
              options: O.YES_NO,
            },
            {
              id: "household.staff_frequency",
              kind: "choice",
              layout: "chips",
              label: "Com que frequência?",
              options: O.STAFF_FREQUENCY,
              when: ["staffYes"],
            },
            {
              id: "household.staff_sleeps_in",
              kind: "choice",
              layout: "chips",
              label: "Dorme no local?",
              options: O.YES_NO,
              when: ["staffYes"],
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "animais",
          title: "Tem bichos em casa?",
          sources: ["O13"],
          fields: [
            {
              id: "household.pets",
              kind: "choice",
              layout: "cards",
              multiple: true,
              label: "Animais de estimação",
              options: O.PETS,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "animais-detalhes",
          title: "Conte um pouco sobre eles",
          sources: ["O13"],
          when: ["hasPets"],
          fields: [
            ...petFields(),
            {
              id: "household.pets_needs",
              kind: "textarea",
              label: "Tem algo sobre eles que o projeto precisa considerar?",
              hint: "Por exemplo: caminha, arranhador, comedouro, área de banho.",
              maxLength: 1000,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "trabalho",
          title:
            "Alguém precisa de um lugar para trabalhar ou estudar em casa?",
          sources: ["O24"],
          fields: [
            {
              id: "spaces.work_needs",
              kind: "choice",
              layout: "cards",
              label:
                "Alguém precisa de um lugar para trabalhar ou estudar em casa?",
              options: O.YES_NO,
            },
            {
              id: "spaces.work_people",
              kind: "counter",
              label: "Quantas pessoas?",
              min: 1,
              max: 12,
              initial: 1,
              when: ["workYes"],
            },
            {
              id: "spaces.work_frequency",
              kind: "choice",
              layout: "chips",
              label: "Com que frequência?",
              options: O.WORK_FREQUENCY,
              when: ["workYes"],
            },
            {
              id: "spaces.work_where",
              kind: "choice",
              layout: "chips",
              multiple: true,
              label: "Onde vocês imaginam esse espaço?",
              options: O.WORK_WHERE,
              when: ["workYes"],
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "refeicoes",
          title: "Onde vocês costumam fazer as refeições?",
          sources: ["O25"],
          fields: [
            {
              id: "spaces.meals_where",
              kind: "choice",
              layout: "chips",
              multiple: true,
              label: "Onde vocês fazem as refeições?",
              options: O.MEALS_WHERE,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "necessidades-praticas",
          title:
            "Tem algo prático do dia a dia que o projeto precisa resolver?",
          description:
            "Por exemplo: falta de lugar para guardar, circulação apertada.",
          sources: ["O26"],
          fields: [
            {
              id: "spaces.functional_needs",
              kind: "textarea",
              label: "Necessidades práticas",
              maxLength: 1500,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "cuidados",
          title:
            "Existe alguma necessidade de acessibilidade, mobilidade ou ergonomia que devemos considerar?",
          sources: ["O27", "O07"],
          fields: [
            {
              id: "household.care_needed",
              kind: "choice",
              layout: "cards",
              label:
                "Existe alguma necessidade de acessibilidade, mobilidade ou ergonomia que devemos considerar?",
              options: O.CARE,
            },
            {
              id: "household.care_consent",
              kind: "consent",
              label:
                "Autorizo o uso dessas informações apenas para o meu projeto.",
              hint: "São informações sensíveis. Sem essa autorização, não pedimos detalhes; a Luísa conversa com você depois.",
              when: ["careYes"],
            },
            {
              id: "household.care_needs",
              kind: "choice",
              layout: "cards",
              multiple: true,
              label: "O que devemos considerar?",
              options: O.CARE_NEEDS,
              when: ["careConsented"],
            },
            {
              id: "household.care_details",
              kind: "textarea",
              label: "Se quiser, conte mais.",
              maxLength: 1500,
              when: ["careConsented"],
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "alturas",
          title: "Qual a altura aproximada de quem precisamos considerar?",
          description: "Preencha só para as pessoas que importam aqui.",
          sources: ["O07"],
          when: ["careHeight"],
          fields: heightFields,
        },
      },
    ],
  },
  {
    id: "estilo",
    title: "Estilo e sensações",
    goal: "Seu gosto, principalmente por imagens. Não precisa conhecer nomes de estilos.",
    items: [
      {
        type: "screen",
        screen: {
          id: "estilos",
          title: "Quais desses ambientes têm mais a ver com você?",
          description: "Escolha quantos quiser.",
          sources: ["O29"],
          fields: [
            {
              id: "style.styles",
              kind: "choice",
              layout: "images",
              multiple: true,
              label: "Ambientes que têm a ver com você",
              options: O.STYLES,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "atmosfera",
          title: "Qual dessas atmosferas combina mais com o que você imagina?",
          sources: ["O30"],
          fields: [
            {
              id: "style.mood",
              kind: "choice",
              layout: "images",
              multiple: true,
              label: "Atmosferas",
              options: O.MOODS,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "claro-escuro",
          title: "Você prefere ambientes mais claros ou mais escuros?",
          sources: ["O31"],
          fields: [
            {
              id: "style.light_dark",
              kind: "choice",
              layout: "images",
              label: "Claro ou escuro",
              options: O.LIGHT_DARK,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "paletas",
          title: "Quais combinações de cor te atraem?",
          description:
            "Essa direção vale para a casa toda. Depois, em cada ambiente, você pode manter ou mudar.",
          sources: ["O31"],
          fields: [
            {
              id: "style.palette",
              kind: "choice",
              layout: "images",
              multiple: true,
              label: "Paletas de cor",
              options: O.PALETTES,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "materiais",
          title: "Quais materiais você gostaria de ver e tocar no dia a dia?",
          sources: ["O32"],
          fields: [
            {
              id: "style.materials",
              kind: "choice",
              layout: "images",
              multiple: true,
              label: "Materiais",
              options: O.MATERIALS,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "moveis",
          title: "Que tipo de móvel combina com você?",
          sources: ["O33"],
          fields: [
            {
              id: "style.furniture_lines",
              kind: "choice",
              layout: "images",
              label: "Linhas",
              options: O.FURNITURE_LINES,
            },
            {
              id: "style.furniture_weight",
              kind: "choice",
              layout: "images",
              label: "Presença",
              options: O.FURNITURE_WEIGHT,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "verde",
          title: "Quanto verde você quer em casa?",
          sources: ["O35"],
          fields: [
            {
              id: "style.greenery",
              kind: "choice",
              layout: "images",
              label: "Quantidade de plantas",
              options: O.GREENERY,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "objetos-afetivos",
          title: "Tem objetos com história que precisam de um lugar especial?",
          sources: ["O34", "O43"],
          fields: [
            {
              id: "style.keepsakes_has",
              kind: "choice",
              layout: "cards",
              label:
                "Tem objetos com história que precisam de um lugar especial?",
              options: O.YES_NO,
            },
            {
              id: "style.keepsakes_description",
              kind: "textarea",
              label: "Quais são?",
              when: ["keepsakesYes"],
              maxLength: 1500,
            },
            {
              id: "style.keepsakes_rooms",
              kind: "choice",
              layout: "chips",
              multiple: true,
              label: "Em qual ambiente você imagina cada um?",
              options: selectedRoomOptions,
              when: ["keepsakesYes"],
            },
            {
              id: "style.keepsakes_photos",
              kind: "upload",
              label: "Se quiser, envie fotos",
              accept: IMAGES_ACCEPT,
              maxFiles: 10,
              when: ["keepsakesYes"],
            },
          ],
        },
      },
    ],
  },
  {
    id: "detalhes",
    title: "Ambiente por ambiente",
    goal: "Detalhes só dos ambientes que você escolheu.",
    items: [{ type: "roomModules" }],
  },
  {
    id: "habitos",
    title: "Hábitos e sustentabilidade",
    goal: "Hábitos que influenciam materiais e espaços.",
    items: [
      {
        type: "screen",
        screen: {
          id: "sustentabilidade",
          title: "Sustentabilidade na sua casa",
          sources: ["O80", "O81", "O82", "O83"],
          fields: [
            {
              id: "habits.sustainable_materials",
              kind: "choice",
              layout: "chips",
              label: "Quão importante é usar materiais sustentáveis?",
              options: O.SUSTAINABILITY_IMPORTANCE,
            },
            {
              id: "habits.practices",
              kind: "matrix",
              label: "E estes hábitos?",
              rows: O.PRACTICE_ROWS,
              columns: O.PRACTICE_COLUMNS,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "habitos-alimentares",
          title:
            "Existe algum hábito alimentar que influencia a organização ou o uso da cozinha?",
          sources: ["O84"],
          fields: [
            {
              id: "habits.diet_influences",
              kind: "choice",
              layout: "cards",
              label:
                "Existe algum hábito alimentar que influencia a organização ou o uso da cozinha?",
              options: O.YES_NO,
            },
            {
              id: "habits.diet_details",
              kind: "textarea",
              label: "Conte como ele influencia.",
              when: ["dietYes"],
              maxLength: 1000,
            },
          ],
        },
      },
    ],
  },
  {
    id: "referencias",
    title: "Suas referências",
    goal: "Imagens que você mesmo guardou.",
    items: [
      {
        type: "screen",
        screen: {
          id: "referencias",
          title: "Tem imagens de ambientes que você admira?",
          description: "Envie aqui ou cole links. Evite fotos com pessoas.",
          sources: ["O36", "O36b"],
          fields: [
            {
              id: "references.client_files",
              kind: "upload",
              label: "Enviar imagens",
              accept: IMAGES_ACCEPT,
              maxFiles: 20,
            },
            {
              id: "references.client_links",
              kind: "textarea",
              label: "Links (Pinterest, Instagram, sites)",
              hint: "Um link por linha.",
              maxLength: 2000,
            },
          ],
        },
      },
    ],
  },
  {
    id: "investimento",
    title: "Orçamento e prazo",
    goal: "Nenhuma das perguntas desta etapa é obrigatória.",
    items: [
      {
        type: "screen",
        screen: {
          id: "orcamento",
          title: "Qual faixa de investimento vocês imaginam para o projeto?",
          sources: ["O85"],
          fields: [
            {
              id: "project.budget",
              kind: "choice",
              layout: "cards",
              label: "Faixa de investimento",
              options: O.BUDGET,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "restricoes",
          title: "Existe alguma restrição que devemos saber?",
          description:
            "Por exemplo: regras do condomínio, contrato de aluguel, orçamento em etapas.",
          sources: ["O86"],
          fields: [
            {
              id: "project.constraints",
              kind: "choice",
              layout: "cards",
              label: "Existe alguma restrição que devemos saber?",
              options: O.YES_NO,
            },
            {
              id: "project.constraints_details",
              kind: "textarea",
              label: "Conte qual é.",
              when: ["constraintsYes"],
              maxLength: 1000,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "prazo",
          title: "Para quando vocês gostariam de ter o projeto pronto?",
          sources: ["O87"],
          fields: [
            {
              id: "project.deadline",
              kind: "choice",
              layout: "cards",
              label: "Prazo",
              options: O.DEADLINE,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "prazo-eventos",
          title: "Algum acontecimento influencia esse prazo?",
          description: "Por exemplo: mudança ou fim do contrato de aluguel.",
          sources: ["O88"],
          when: ["deadlineChosen"],
          fields: [
            {
              id: "project.events",
              kind: "choice",
              layout: "cards",
              label: "Algum acontecimento influencia esse prazo?",
              options: O.YES_NO,
            },
            {
              id: "project.events_details",
              kind: "textarea",
              label: "Qual?",
              when: ["eventsYes"],
              maxLength: 1000,
            },
          ],
        },
      },
    ],
  },
  {
    id: "final",
    title: "Para terminar",
    goal: "Um espaço aberto e seus dados de contato.",
    items: [
      {
        type: "screen",
        screen: {
          id: "necessidade-especifica",
          title: "Tem alguma necessidade específica que ainda não apareceu?",
          sources: ["O90", "O28"],
          fields: [
            {
              id: "closing.unaddressed_need",
              kind: "textarea",
              label: "Necessidade específica",
              maxLength: 2000,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "algo-mais",
          title: "Quer contar mais alguma coisa?",
          sources: ["O89"],
          fields: [
            {
              id: "closing.additional",
              kind: "textarea",
              label: "Mais alguma coisa",
              maxLength: 2000,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "email",
          title: "Qual e-mail podemos usar para responder?",
          description:
            "No produto final, ele também serve para continuar o briefing em outro aparelho.",
          sources: ["O08"],
          fields: [
            {
              id: "contact.email",
              kind: "email",
              label: "E-mail",
              required: true,
              autoComplete: "email",
              maxLength: 120,
            },
          ],
        },
      },
      {
        type: "screen",
        screen: {
          id: "contato",
          title: "Quer deixar um telefone?",
          sources: ["O08"],
          fields: [
            {
              id: "contact.phone",
              kind: "text",
              label: "Telefone (opcional)",
              autoComplete: "tel",
              maxLength: 30,
            },
            {
              id: "contact.preference",
              kind: "choice",
              layout: "chips",
              label: "Como prefere que a gente entre em contato?",
              options: O.CONTACT_PREFERENCE,
            },
          ],
        },
      },
    ],
  },
];
