import type { ImageRef, OptionDef } from "./types";

/**
 * Listas de opções PROVISÓRIAS aprovadas no B1. O conteúdo será refinado com a
 * Luísa durante os testes do B2. Faixas de orçamento e períodos de prazo ainda
 * não têm valores definidos.
 */

const placeholder = (alt: string): ImageRef => ({ kind: "placeholder", alt });

const opts = (entries: [string, string][]): OptionDef[] =>
  entries.map(([value, label]) => ({ value, label }));

/** Saídas para quem ainda não sabe responder perguntas de gosto. */
export const UNSURE: OptionDef[] = [
  { value: "ainda_nao_sei", label: "Ainda não sei", exclusive: true },
  {
    value: "descobrir_com_designer",
    label: "Quero descobrir junto com a designer",
    exclusive: true,
  },
];

export const UNSURE_VALUES = UNSURE.map((o) => o.value);

export const YES_NO = opts([
  ["sim", "Sim"],
  ["nao", "Não"],
]);

export const AGE_RANGES = opts([
  ["0-5", "Até 5 anos"],
  ["6-12", "6 a 12 anos"],
  ["13-17", "13 a 17 anos"],
  ["18-29", "18 a 29 anos"],
  ["30-44", "30 a 44 anos"],
  ["45-59", "45 a 59 anos"],
  ["60+", "60 anos ou mais"],
  ["nao_informar", "Prefiro não informar"],
]);

export const RELATIONSHIP = opts([
  ["casal", "Casal"],
  ["familia_filhos", "Família com filhos"],
  ["parentes", "Pais ou outros parentes"],
  ["amigos", "Amigos que dividem"],
  ["outra", "Outra"],
]);

export const PROPERTY_TYPES = opts([
  ["apartamento", "Apartamento"],
  ["casa", "Casa"],
  ["casa_condominio", "Casa em condomínio"],
  ["cobertura", "Cobertura"],
  ["outro", "Outro"],
]);

export const TENURE = opts([
  ["proprio", "Próprio"],
  ["alugado", "Alugado"],
  ["outro", "Outro"],
]);

export const PROPERTY_AGE = opts([
  ["novo", "Novo ou na planta"],
  ["ate_10", "Até 10 anos"],
  ["10_30", "10 a 30 anos"],
  ["mais_30", "Mais de 30 anos"],
  ["nao_sei", "Não sei"],
]);

export const INFRASTRUCTURE = opts([
  ["ar_condicionado", "Ar-condicionado"],
  ["gas_encanado", "Gás encanado"],
  ["aquecimento_agua", "Aquecimento de água"],
  ["planejados", "Móveis planejados"],
  ["automacao", "Automação"],
  ["outro", "Outro"],
]);

export const LIFESTYLE = opts([
  ["trabalho_fora", "Trabalho fora"],
  ["trabalho_casa", "Trabalho em casa"],
  ["recebe_amigos", "Recebemos amigos com frequência"],
  ["cozinha_muito", "Cozinhamos muito"],
  ["viaja", "Viajamos bastante"],
  ["rotina_corrida", "Rotina corrida"],
  ["fica_em_casa", "Gostamos de ficar em casa"],
  ["outro", "Outro"],
]);

export const STAFF_FREQUENCY = opts([
  ["todos_dias", "Todos os dias"],
  ["algumas_semana", "Algumas vezes por semana"],
  ["semanal", "Uma vez por semana"],
  ["eventual", "De vez em quando"],
]);

export const PETS: OptionDef[] = [
  { value: "nao_tenho", label: "Não tenho", exclusive: true },
  { value: "cachorro", label: "Cachorro" },
  { value: "gato", label: "Gato" },
  { value: "outro", label: "Outro" },
];

export const PET_SIZES = opts([
  ["pequeno", "Pequeno"],
  ["medio", "Médio"],
  ["grande", "Grande"],
]);

export const WORK_FREQUENCY = opts([
  ["todo_dia", "Todo dia"],
  ["alguns_dias", "Alguns dias"],
  ["eventual", "De vez em quando"],
]);

export const WORK_WHERE: OptionDef[] = [
  { value: "quarto", label: "Quarto" },
  { value: "sala", label: "Sala" },
  { value: "escritorio", label: "Escritório" },
  { value: "nao_sei", label: "Ainda não sei", exclusive: true },
];

export const MEALS_WHERE = opts([
  ["mesa_jantar", "Mesa de jantar"],
  ["bancada", "Bancada ou ilha"],
  ["sofa", "No sofá"],
  ["varanda", "Varanda"],
  ["varia", "Varia"],
]);

export const CARE = opts([
  ["sim", "Sim"],
  ["nao", "Não"],
  ["conversar", "Prefiro conversar sobre isso"],
]);

export const CARE_NEEDS = opts([
  ["altura", "Altura de alguém (bem acima ou abaixo da média)"],
  ["mobilidade", "Mobilidade ou circulação"],
  ["outra", "Outra necessidade"],
]);

/** Renders reais da Luísa (site legado), usados como imagens provisórias. */
export const STYLES: OptionDef[] = [
  {
    value: "render_cozinha",
    label: "Cozinha em verde e madeira, com plantas",
    image: {
      kind: "render",
      src: "/briefing/provisorio/cozinha-verde-madeira.jpg",
      alt: "Cozinha com armários verdes e de madeira, ilha central e parede com vasos de plantas",
    },
  },
  {
    value: "render_escritorio",
    label: "Escritório em madeira e terracota",
    image: {
      kind: "render",
      src: "/briefing/provisorio/escritorio-madeira-terracota.jpg",
      alt: "Escritório com estante de madeira, paredes cor de terracota e luminárias pendentes",
    },
  },
  {
    value: "render_quarto",
    label: "Quarto claro em madeira e verde-claro",
    image: {
      kind: "render",
      src: "/briefing/provisorio/quarto-claro-madeira.jpg",
      alt: "Quarto com cabeceira de madeira, armário verde-claro e paredes bege",
    },
  },
  {
    value: "render_banheiro",
    label: "Banheiro em tons de pêssego e madeira",
    image: {
      kind: "render",
      src: "/briefing/provisorio/banheiro-pessego-madeira.jpg",
      alt: "Banheiro com paredes cor de pêssego, gabinete de madeira escura e banheira",
    },
  },
  ...UNSURE,
];

const withPlaceholders = (entries: [string, string][]): OptionDef[] =>
  entries.map(([value, label]) => ({
    value,
    label,
    image: placeholder(label),
  }));

export const MOODS: OptionDef[] = [
  ...withPlaceholders([
    ["clara_leve", "Clara e leve"],
    ["aconchegante", "Aconchegante"],
    ["natural", "Natural"],
    ["sobria", "Sóbria"],
    ["elegante", "Elegante"],
  ]),
  ...UNSURE,
];

export const LIGHT_DARK: OptionDef[] = [
  ...withPlaceholders([
    ["claros", "Mais claros"],
    ["escuros", "Mais escuros"],
  ]),
  { value: "equilibrio", label: "Um equilíbrio" },
  ...UNSURE,
];

export const PALETTES: OptionDef[] = [
  ...withPlaceholders([
    ["paleta_1", "Paleta 1"],
    ["paleta_2", "Paleta 2"],
    ["paleta_3", "Paleta 3"],
    ["paleta_4", "Paleta 4"],
  ]),
  ...UNSURE,
];

export const PALETTE_VALUES = ["paleta_1", "paleta_2", "paleta_3", "paleta_4"];

export const MATERIALS: OptionDef[] = [
  ...withPlaceholders([
    ["madeira_clara", "Madeira clara"],
    ["madeira_escura", "Madeira escura"],
    ["pedra", "Pedra"],
    ["concreto", "Concreto"],
    ["metal", "Metal"],
    ["fibras", "Palha e fibras"],
    ["tecidos", "Tecidos macios"],
    ["vidro", "Vidro"],
  ]),
  ...UNSURE,
];

export const FURNITURE_LINES: OptionDef[] = [
  ...withPlaceholders([
    ["retas", "Linhas retas"],
    ["organicas", "Linhas orgânicas"],
  ]),
  { value: "os_dois", label: "Gosto dos dois" },
  ...UNSURE,
];

export const FURNITURE_WEIGHT: OptionDef[] = [
  ...withPlaceholders([
    ["leve", "Leve"],
    ["robusto", "Robusto"],
  ]),
  { value: "os_dois", label: "Gosto dos dois" },
  ...UNSURE,
];

export const GREENERY: OptionDef[] = withPlaceholders([
  ["nenhum", "Nenhum"],
  ["um_pouco", "Um pouco"],
  ["bastante", "Bastante"],
  ["muito", "Muito"],
]);

export const LIVING_USES = opts([
  ["tv", "Assistir TV"],
  ["receber", "Receber pessoas"],
  ["descansar", "Descansar"],
  ["ler", "Ler"],
  ["trabalhar", "Trabalhar ou estudar"],
  ["refeicoes", "Fazer refeições"],
  ["outro", "Outro"],
]);

export const LIVING_TIME = opts([
  ["pouco", "Pouco"],
  ["algumas_horas", "Algumas horas por dia"],
  ["boa_parte", "Boa parte do dia"],
]);

export const TV_SIZES = opts([
  ["ate_50", "Até 50 polegadas"],
  ["55_65", "De 55 a 65 polegadas"],
  ["mais_65", "Mais de 65 polegadas"],
  ["nao_sei", "Não sei"],
]);

export const DEVICES = opts([
  ["videogame", "Videogame"],
  ["som", "Som ou soundbar"],
  ["tv_box", "TV box"],
  ["outro", "Outro"],
]);

export const GUEST_FREQUENCY = opts([
  ["raramente", "Raramente"],
  ["as_vezes", "Às vezes"],
  ["frequencia", "Com frequência"],
]);

export const GUEST_COUNT = opts([
  ["ate_4", "Até 4 pessoas"],
  ["5_10", "De 5 a 10 pessoas"],
  ["mais_10", "Mais de 10 pessoas"],
]);

export const BOOKS = opts([
  ["alguns", "Alguns"],
  ["estante", "Uma estante"],
  ["muitos", "Muitos"],
]);

export const LIVING_STORAGE: OptionDef[] = [
  ...withPlaceholders([
    ["rack", "Rack"],
    ["painel", "Painel"],
    ["estante", "Estante"],
  ]),
  { value: "nenhum", label: "Nenhum", exclusive: true },
  { value: "nao_sei", label: "Não sei", exclusive: true },
];

export const PALETTE_SAME = opts([
  ["sim", "Sim, seguir essa direção"],
  ["diferente", "Quero algo diferente aqui"],
]);

export const LIGHT_TEMPERATURE: OptionDef[] = [
  ...withPlaceholders([
    ["quente", "Luz mais quente"],
    ["fria", "Luz mais fria"],
  ]),
  { value: "tanto_faz", label: "Tanto faz" },
  { value: "ainda_nao_sei", label: "Ainda não sei" },
];

export const LIGHT_SPREAD: OptionDef[] = [
  ...withPlaceholders([
    ["espalhada", "Luz espalhada"],
    ["pontual", "Luz pontual"],
  ]),
  { value: "tanto_faz", label: "Tanto faz" },
  { value: "ainda_nao_sei", label: "Ainda não sei" },
];

export const RUG = opts([
  ["sim", "Sim"],
  ["nao", "Não"],
  ["tanto_faz", "Tanto faz"],
]);

export const WINDOWS: OptionDef[] = [
  ...withPlaceholders([
    ["cortina", "Cortina"],
    ["persiana", "Persiana"],
  ]),
  { value: "ambas", label: "As duas" },
  { value: "nenhuma", label: "Nenhuma" },
  { value: "nao_sei", label: "Não sei" },
];

export const KITCHEN_FREQUENCY = opts([
  ["quase_nunca", "Quase nunca"],
  ["algumas_semana", "Algumas vezes por semana"],
  ["todo_dia", "Todo dia"],
  ["varias", "Várias refeições por dia"],
]);

export const KITCHEN_MEALS: OptionDef[] = [
  { value: "cafe", label: "Café da manhã" },
  { value: "almoco", label: "Almoço" },
  { value: "jantar", label: "Jantar" },
  { value: "lanches", label: "Lanches" },
  { value: "nenhuma", label: "Nenhuma", exclusive: true },
];

export const KITCHEN_LAYOUT: OptionDef[] = [
  ...withPlaceholders([
    ["aberta", "Aberta"],
    ["semiaberta", "Semiaberta"],
    ["fechada", "Fechada"],
  ]),
  { value: "tanto_faz", label: "Tanto faz" },
];

export const KITCHEN_INTEGRATION = opts([
  ["sim", "Sim"],
  ["em_parte", "Em parte"],
  ["nao", "Não"],
]);

export const STORAGE_LEVEL = opts([
  ["pouco", "Pouco"],
  ["medio", "Médio"],
  ["muito", "Muito"],
]);

export const KITCHEN_STORAGE_ITEMS = opts([
  ["mantimentos", "Mantimentos em estoque"],
  ["bebidas", "Bebidas (vinhos, cervejeira…)"],
  ["utensilios", "Utensílios"],
  ["loucas", "Louças"],
  ["outro", "Outro"],
]);

export const PANTRY = opts([
  ["frequente", "Pouco e com frequência"],
  ["mes", "Compra do mês"],
  ["estoque", "Estoque grande"],
]);

export const SMALL_APPLIANCES = opts([
  ["air_fryer", "Air fryer"],
  ["cafeteira", "Cafeteira"],
  ["micro_ondas", "Micro-ondas"],
  ["batedeira", "Batedeira"],
  ["liquidificador", "Liquidificador"],
  ["outro", "Outro"],
]);

export const APPLIANCES_VISIBILITY = opts([
  ["vista", "À vista"],
  ["guardados", "Guardados"],
  ["misto", "Alguns de cada"],
]);

export const APPLIANCES = opts([
  ["geladeira", "Geladeira"],
  ["fogao", "Fogão ou cooktop"],
  ["forno", "Forno"],
  ["micro_ondas", "Micro-ondas"],
  ["lava_loucas", "Lava-louças"],
  ["coifa", "Coifa ou depurador"],
  ["outro", "Outro"],
]);

export const KITCHEN_PRIORITIES = opts([
  ["armazenamento", "Muito armazenamento"],
  ["bancada", "Bancada ampla"],
  ["limpeza", "Fácil de limpar"],
  ["refeicoes", "Lugar para refeições"],
  ["integracao", "Integração com a casa"],
  ["estetica", "Estética"],
  ["embutidos", "Eletros embutidos"],
]);

export const NON_SLIP = opts([
  ["sim", "Sim"],
  ["nao", "Não"],
  ["tanto_faz", "Tanto faz"],
]);

export const BATHROOM_USERS = opts([
  ["todos", "Todos os moradores"],
  ["especificas", "Pessoas específicas"],
  ["visitas", "Visitas"],
]);

export const GROOMING: OptionDef[] = [
  { value: "maquiagem", label: "Maquiagem" },
  { value: "barbear", label: "Barbear" },
  { value: "pele", label: "Cuidados com a pele" },
  { value: "nenhum", label: "Nenhum", exclusive: true },
];

export const BATHROOM_SOLUTIONS: OptionDef[] = [
  {
    value: "tulha",
    label: "Tulha",
    description: "Cesto de roupa embutido no móvel",
    image: placeholder("Tulha"),
  },
  { value: "gavetoes", label: "Gavetões", image: placeholder("Gavetões") },
  {
    value: "prateleiras",
    label: "Prateleiras",
    image: placeholder("Prateleiras"),
  },
  { value: "nenhuma", label: "Nenhuma", exclusive: true },
];

export const MIRRORS = withPlaceholders([
  ["retangular", "Retangular"],
  ["organico", "Redondo ou orgânico"],
  ["iluminado", "Com iluminação"],
  ["armario", "Com armário"],
]);

export const FIXTURES: OptionDef[] = [
  ...withPlaceholders([
    ["cromado", "Cromado"],
    ["preto", "Preto fosco"],
    ["dourado", "Dourado"],
    ["escovado", "Escovado"],
  ]),
  { value: "tanto_faz", label: "Tanto faz" },
];

export const DOORS: OptionDef[] = [
  ...withPlaceholders([
    ["dentro", "Abre para dentro"],
    ["fora", "Abre para fora"],
    ["correr", "De correr"],
  ]),
  { value: "tanto_faz", label: "Tanto faz" },
];

export const SUSTAINABILITY_IMPORTANCE = opts([
  ["pouco", "Pouco importante"],
  ["importante", "Importante"],
  ["muito", "Muito importante"],
  ["nao_sei", "Não sei"],
]);

export const PRACTICE_ROWS = [
  { id: "coleta", label: "Coleta seletiva" },
  { id: "compostagem", label: "Compostagem" },
  { id: "agua", label: "Reaproveitamento de água" },
];

export const PRACTICE_COLUMNS = opts([
  ["ja_fazemos", "Já fazemos"],
  ["queremos", "Queremos começar"],
  ["nao_aplica", "Não se aplica"],
]);

export const BUDGET = opts([
  ["faixa_1", "Faixa 1 (valores a definir)"],
  ["faixa_2", "Faixa 2 (valores a definir)"],
  ["faixa_3", "Faixa 3 (valores a definir)"],
  ["faixa_4", "Faixa 4 (valores a definir)"],
  ["conversar", "Prefiro conversar sobre investimento"],
]);

export const DEADLINE = opts([
  ["ate_3", "Nos próximos 3 meses"],
  ["3_6", "Entre 3 e 6 meses"],
  ["mais_6", "Daqui a mais de 6 meses"],
  ["sem_data", "Ainda não tenho uma data definida"],
]);

export const CONTACT_PREFERENCE = opts([
  ["email", "E-mail"],
  ["telefone", "Telefone"],
  ["whatsapp", "WhatsApp"],
]);
