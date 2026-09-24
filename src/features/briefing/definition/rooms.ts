import type { RoomInstance } from "./types";

export interface RoomType {
  type: string;
  label: string;
  /** Pode haver mais de um ambiente deste tipo (ex.: banheiros, quartos). */
  multiple: boolean;
  /** Tem módulo profissional completo no B2. Os demais pertencem ao B1.1. */
  hasModule: boolean;
}

export const ROOM_TYPES: RoomType[] = [
  { type: "sala", label: "Sala de estar", multiple: false, hasModule: true },
  { type: "cozinha", label: "Cozinha", multiple: false, hasModule: true },
  { type: "banheiro", label: "Banheiro", multiple: true, hasModule: true },
  { type: "quarto", label: "Quarto", multiple: true, hasModule: false },
  {
    type: "escritorio",
    label: "Escritório",
    multiple: false,
    hasModule: false,
  },
  {
    type: "sala_jantar",
    label: "Sala de jantar",
    multiple: false,
    hasModule: false,
  },
  {
    type: "area_servico",
    label: "Área de serviço",
    multiple: false,
    hasModule: false,
  },
  { type: "varanda", label: "Varanda", multiple: false, hasModule: false },
  { type: "lavabo", label: "Lavabo", multiple: false, hasModule: false },
  { type: "outro", label: "Outro ambiente", multiple: false, hasModule: false },
];

/** Mensagem provisória para ambientes sem módulo profissional (dívida B1.1). */
export const PENDING_MODULE_MESSAGE =
  "Anotado. Vamos conversar sobre as necessidades deste ambiente em uma próxima etapa.";

export const ROOMS_FIELD = "spaces.rooms";

export type RoomSelection = Record<string, number>;

/** Transforma a seleção (tipo → quantidade) em instâncias ordenadas. */
export function roomInstances(
  selection: RoomSelection | undefined,
): RoomInstance[] {
  if (!selection) return [];
  const instances: RoomInstance[] = [];
  for (const room of ROOM_TYPES) {
    const total = Math.max(0, Math.floor(selection[room.type] ?? 0));
    for (let index = 1; index <= total; index++) {
      instances.push({
        id: total > 1 || room.multiple ? `${room.type}-${index}` : room.type,
        type: room.type,
        index,
        total,
        label: total > 1 ? `${room.label} ${index}` : room.label,
        hasModule: room.hasModule,
      });
    }
  }
  return instances;
}

export function roomTypeLabel(type: string): string {
  return ROOM_TYPES.find((r) => r.type === type)?.label ?? type;
}
