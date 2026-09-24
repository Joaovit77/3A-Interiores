import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChoiceField } from "@/features/briefing/components/fields/ChoiceField";
import { CounterField } from "@/features/briefing/components/fields/CounterField";
import { RoomsField } from "@/features/briefing/components/fields/RoomsField";
import { UploadField } from "@/features/briefing/components/fields/UploadField";
import type { FieldProps } from "@/features/briefing/components/fields/types";
import {
  KITCHEN_PRIORITIES,
  PETS,
  YES_NO,
} from "@/features/briefing/definition/options";
import type {
  AnswerValue,
  FieldDef,
} from "@/features/briefing/definition/types";
import type { FieldInstance } from "@/features/briefing/engine/flow";

function Harness({
  Component,
  def,
  initial,
  onValue,
}: {
  Component: (props: FieldProps) => React.ReactNode;
  def: FieldDef;
  initial?: AnswerValue;
  onValue?: (v: AnswerValue | undefined) => void;
}) {
  const [value, setValue] = useState<AnswerValue | undefined>(initial);
  const field: FieldInstance = {
    key: def.id,
    def,
    options:
      def.kind === "choice" && Array.isArray(def.options)
        ? def.options
        : undefined,
  };
  return (
    <Component
      field={field}
      value={value}
      onChange={(v) => {
        setValue(v);
        onValue?.(v);
      }}
    />
  );
}

describe("ChoiceField", () => {
  it("escolha única usa rádios agrupados num fieldset com legenda", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(
      <Harness
        Component={ChoiceField}
        def={{
          id: "q",
          kind: "choice",
          layout: "cards",
          label: "Tem planta?",
          options: YES_NO,
        }}
        onValue={onValue}
      />,
    );
    const group = screen.getByRole("group", { name: "Tem planta?" });
    expect(group).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Sim" }));
    expect(onValue).toHaveBeenLastCalledWith("sim");
    expect(screen.getByRole("radio", { name: "Sim" })).toBeChecked();
  });

  it("opção exclusiva limpa as demais, e vice-versa", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(
      <Harness
        Component={ChoiceField}
        def={{
          id: "p",
          kind: "choice",
          layout: "cards",
          multiple: true,
          label: "Bichos",
          options: PETS,
        }}
        onValue={onValue}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Cachorro" }));
    await user.click(screen.getByRole("checkbox", { name: "Gato" }));
    expect(onValue).toHaveBeenLastCalledWith(["cachorro", "gato"]);
    await user.click(screen.getByRole("checkbox", { name: "Não tenho" }));
    expect(onValue).toHaveBeenLastCalledWith(["nao_tenho"]);
    await user.click(screen.getByRole("checkbox", { name: "Gato" }));
    expect(onValue).toHaveBeenLastCalledWith(["gato"]);
  });

  it("respeita o limite de escolhas", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        Component={ChoiceField}
        def={{
          id: "prioridades",
          kind: "choice",
          layout: "chips",
          multiple: true,
          max: 3,
          label: "Prioridades",
          options: KITCHEN_PRIORITIES,
        }}
      />,
    );
    for (const name of [
      "Muito armazenamento",
      "Bancada ampla",
      "Fácil de limpar",
    ]) {
      await user.click(screen.getByRole("checkbox", { name }));
    }
    expect(screen.getByRole("checkbox", { name: "Estética" })).toBeDisabled();
    expect(
      screen.getByRole("checkbox", { name: "Bancada ampla" }),
    ).toBeEnabled();
  });

  it("mostra o erro ligado ao grupo", () => {
    render(
      <ChoiceField
        field={{
          key: "q",
          def: {
            id: "q",
            kind: "choice",
            layout: "cards",
            label: "Tipo",
            options: YES_NO,
          },
          options: YES_NO,
        }}
        value={undefined}
        onChange={() => {}}
        error="Escolha uma opção para continuar."
      />,
    );
    expect(
      screen.getByRole("group", { name: "Tipo" }),
    ).toHaveAccessibleDescription("Escolha uma opção para continuar.");
  });
});

describe("RoomsField", () => {
  it("aceita quantidade e avisa sobre ambientes sem módulo (B1.1)", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(
      <Harness
        Component={RoomsField}
        def={{ id: "spaces.rooms", kind: "rooms", label: "Ambientes" }}
        onValue={onValue}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Sala de estar" }));
    await user.click(
      screen.getByRole("button", { name: "Aumentar quantidade de banheiros" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Aumentar quantidade de banheiros" }),
    );
    expect(onValue).toHaveBeenLastCalledWith({ sala: 1, banheiro: 2 });
    expect(screen.queryByText(/Anotado/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Varanda" }));
    expect(screen.getByText(/Anotado\. Vamos conversar/)).toBeInTheDocument();
  });
});

describe("CounterField", () => {
  it("não passa dos limites", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        Component={CounterField}
        def={{
          id: "n",
          kind: "counter",
          label: "Moradores",
          min: 1,
          max: 2,
          initial: 1,
        }}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Diminuir moradores" }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Aumentar moradores" }),
    );
    expect(screen.getByRole("status", { name: "Moradores" })).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByRole("button", { name: "Aumentar moradores" }),
    ).toBeDisabled();
  });
});

describe("UploadField (simulado)", () => {
  beforeEach(() => {
    let n = 0;
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => `blob:teste-${++n}`),
      revokeObjectURL: vi.fn(),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("adiciona e remove arquivos só em memória", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(
      <Harness
        Component={UploadField}
        def={{
          id: "fotos",
          kind: "upload",
          label: "Adicionar fotos",
          accept: "image/*",
          maxFiles: 2,
        }}
        onValue={onValue}
      />,
    );
    const input = screen.getByLabelText(/Adicionar fotos/);
    const files = [
      new File(["a"], "sala.jpg", { type: "image/jpeg" }),
      new File(["b"], "planta.jpg", { type: "image/jpeg" }),
      new File(["c"], "extra.jpg", { type: "image/jpeg" }),
    ];
    await user.upload(input, files);
    expect(
      screen.getByRole("list", { name: "Arquivos adicionados" }).children,
    ).toHaveLength(2);
    expect(screen.getByText(/Limite de 2 arquivos/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover sala.jpg" }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:teste-1");
    expect(onValue).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: "planta.jpg" }),
    ]);
  });
});
