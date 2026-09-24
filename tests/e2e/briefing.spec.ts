import { expect, test } from "@playwright/test";

import {
  advance,
  choose,
  minimalAnswers,
  passo,
  start,
  walkToReview,
  type StepActions,
} from "./briefing.helpers";
import {
  expectNoHorizontalOverflow,
  expectNoSeriousA11yViolations,
  trackExternalRequests,
} from "./helpers";

const fullAnswers: StepActions = {
  ...minimalAnswers,
  moradores: async (p) => {
    await p
      .getByRole("button", { name: "Aumentar quantidade de moradores" })
      .click();
  },
  "pessoa-1": (p) => choose(p, "60 anos ou mais"),
  "pessoa-2": (p) => choose(p, "Até 5 anos"),
  relacao: (p) => choose(p, "Família com filhos"),
  planta: (p) => choose(p, "Não"),
  ambientes: async (p) => {
    await choose(p, "Sala de estar");
    await choose(p, "Cozinha");
    const more = p.getByRole("button", {
      name: "Aumentar quantidade de banheiros",
    });
    await more.click();
    await more.click();
  },
  animais: (p) => choose(p, "Cachorro"),
  cuidados: async (p) => {
    await choose(p, "Sim");
    await p.getByLabel(/Autorizo o uso/).check();
    await choose(p, "Mobilidade ou circulação");
    await choose(p, "Altura de alguém (bem acima ou abaixo da média)");
  },
  paletas: (p) => choose(p, "Paleta 2"),
  "sala-usos": async (p) => {
    await choose(p, "Assistir TV");
    await choose(p, "Ler");
  },
  "banheiro-1-metais": (p) => choose(p, "Preto fosco"),
  "banheiro-2-mesma-direcao": (p) => choose(p, "Sim"),
  prazo: (p) => choose(p, "Entre 3 e 6 meses"),
};

test.describe("briefing interativo (protótipo B2)", () => {
  // Os percursos completos rodam axe em cada tela e passam do limite padrão de 30 s.
  test.describe.configure({ timeout: 120_000 });

  test("caminho mínimo até a confirmação, sem chamadas externas nem problemas de acessibilidade", async ({
    page,
    baseURL,
  }) => {
    const external = trackExternalRequests(page, baseURL!);
    await page.goto("/briefing");
    await expectNoSeriousA11yViolations(page);
    await expectNoHorizontalOverflow(page);
    await start(page);

    const visited = await walkToReview(page, minimalAnswers, { audit: true });
    expect(visited).toContain("sala-usos");
    expect(
      visited.some(
        (k) => k.startsWith("cozinha-") || k.startsWith("banheiro-"),
      ),
    ).toBe(false);
    expect(visited).not.toContain("relacao");

    await page.getByRole("button", { name: "Enviar briefing" }).click();
    await expect(page).toHaveURL(/passo=confirmacao/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Recebemos seu briefing",
    );
    await expectNoSeriousA11yViolations(page);
    expect(external).toEqual([]);
  });

  test("caminho completo: condicionais, banheiros e resumo", async ({
    page,
  }) => {
    await start(page);
    const visited = await walkToReview(page, fullAnswers);

    // Moradores e contexto
    expect(visited).toEqual(
      expect.arrayContaining(["pessoa-1", "pessoa-2", "relacao", "alturas"]),
    );
    // Sala pelos usos
    expect(visited).toEqual(
      expect.arrayContaining(["sala-tv", "sala-livros", "sala-apoio"]),
    );
    expect(visited).not.toContain("sala-visitas");
    // Antiderrapante com contexto; medidas sem planta
    expect(visited).toEqual(
      expect.arrayContaining(["cozinha-piso", "cozinha-medidas"]),
    );
    // Banheiro 2 reaproveita o visual e continua funcional
    expect(visited).toEqual(
      expect.arrayContaining([
        "banheiro-2-mesma-direcao",
        "banheiro-2-quem-usa",
        "banheiro-2-se-arrumar",
        "banheiro-2-barras",
        "banheiro-2-porta",
        "banheiro-2-altura-espelho",
      ]),
    );
    expect(visited).not.toContain("banheiro-2-metais");
    expect(visited).not.toContain("banheiro-2-espelho");

    const review = page.locator("main");
    await expect(
      review.getByText("Mesma direção visual de: Banheiro 1"),
    ).toBeVisible();
    await expect(review.getByText("Preto fosco")).toHaveCount(2);
    await expectNoSeriousA11yViolations(page);
  });

  test("banheiro 2 com «Não» pede todas as preferências visuais", async ({
    page,
  }) => {
    await start(page);
    const visited = await walkToReview(page, {
      ...fullAnswers,
      "banheiro-2-mesma-direcao": (p) => choose(p, "Não"),
    });
    expect(visited).toEqual(
      expect.arrayContaining([
        "banheiro-2-armazenamento",
        "banheiro-2-espelho",
        "banheiro-2-metais",
        "banheiro-2-luz",
      ]),
    );
  });

  test("ambientes do B1.1 são anotados, sem perguntas, e aparecem no resumo", async ({
    page,
  }) => {
    await start(page);
    const visited = await walkToReview(page, {
      ...minimalAnswers,
      ambientes: async (p) => {
        await choose(p, "Varanda");
        await p
          .getByRole("button", { name: "Aumentar quantidade de quartos" })
          .click();
        await expect(
          p.getByText(
            "Anotado. Vamos conversar sobre as necessidades deste ambiente em uma próxima etapa.",
            {
              exact: false,
            },
          ),
        ).toBeVisible();
      },
    });
    expect(
      visited.some((k) => k.startsWith("quarto") || k.startsWith("varanda")),
    ).toBe(false);
    expect(visited.some((k) => k.startsWith("sala-"))).toBe(false);
    await expect(
      page.locator("main").getByText(/Quarto, Varanda: Anotado/),
    ).toBeVisible();
  });

  test("voltar não perde respostas; resposta escondida some do resumo e volta com a condição", async ({
    page,
  }) => {
    await start(page);
    await page.getByLabel("Primeiro nome").fill("Ana");
    await advance(page); // decisoes
    await advance(page); // moradores
    await page
      .getByRole("button", { name: "Aumentar quantidade de moradores" })
      .click();
    await advance(page); // pessoa-1
    await advance(page); // pessoa-2
    await advance(page); // relacao
    expect(passo(page)).toBe("relacao");
    await choose(page, "Casal");

    // Volta até moradores pelo botão Voltar
    for (const expected of ["pessoa-2", "pessoa-1", "moradores"]) {
      await page.getByRole("button", { name: "Voltar", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`passo=${expected}`));
    }
    await page
      .getByRole("button", { name: "Diminuir quantidade de moradores" })
      .click();
    await advance(page);
    await advance(page);
    expect(passo(page)).not.toBe("relacao");
    expect(passo(page)).not.toBe("pessoa-2");

    // Tenta abrir a tela escondida pela URL: volta para uma tela visível
    await page.goto("/briefing/responder?passo=relacao");
    await expect(page).not.toHaveURL(/passo=relacao/);
  });

  test("reaparece a resposta quando a condição volta a valer", async ({
    page,
  }) => {
    await start(page);
    await page.getByLabel("Primeiro nome").fill("Ana");
    await advance(page);
    await advance(page);
    const more = page.getByRole("button", {
      name: "Aumentar quantidade de moradores",
    });
    const less = page.getByRole("button", {
      name: "Diminuir quantidade de moradores",
    });
    await more.click();
    await advance(page);
    await advance(page);
    await advance(page);
    await choose(page, "Casal");
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    await less.click();
    await more.click();
    await advance(page);
    await advance(page);
    await advance(page);
    expect(passo(page)).toBe("relacao");
    await expect(page.getByRole("radio", { name: "Casal" })).toBeChecked();
  });

  test("campo obrigatório bloqueia o avanço com mensagem acessível", async ({
    page,
  }) => {
    await start(page);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page).toHaveURL(/passo=nome/);
    const input = page.getByLabel("Primeiro nome");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(
      "Preencha este campo para continuar.",
    );
    await expect(input).toBeFocused();
    await expectNoSeriousA11yViolations(page);
  });

  test("upload simulado: pré-visualiza e remove sem enviar nada", async ({
    page,
    baseURL,
  }) => {
    const external = trackExternalRequests(page, baseURL!);
    const posts: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") posts.push(`${r.method()} ${r.url()}`);
    });
    await start(page);
    await walkUntil(page, "fotos-atuais");

    await page.getByLabel("Adicionar fotos").setInputFiles([
      { name: "sala.png", mimeType: "image/png", buffer: pixel },
      { name: "cozinha.png", mimeType: "image/png", buffer: pixel },
    ]);
    const list = page.getByRole("list", { name: "Arquivos adicionados" });
    await expect(list.getByRole("listitem")).toHaveCount(2);
    await expect(list.locator("img").first()).toHaveAttribute("src", /^blob:/);
    await page.getByRole("button", { name: "Remover sala.png" }).click();
    await expect(list.getByRole("listitem")).toHaveCount(1);
    await expectNoSeriousA11yViolations(page);

    expect(external).toEqual([]);
    expect(posts).toEqual([]);
  });

  test("DevPanel não existe no build de produção", async ({ page }) => {
    await start(page);
    await expect(page.getByTestId("dev-panel")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "DEV" })).toHaveCount(0);
  });

  test("dá para responder só com o teclado", async ({ page }) => {
    await start(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Primeiro nome")).toBeFocused();
    await page.keyboard.type("Ana");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/passo=decisoes/);

    // Rádios: Tab chega ao grupo, espaço marca.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("radio", { name: "Sim" })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByRole("radio", { name: "Sim" })).toBeChecked();
    await expect(page.getByLabel("Como essa pessoa se chama?")).toBeVisible();

    // O foco sai do conteúdo e chega aos botões da barra inferior.
    const continueButton = page.getByRole("button", {
      name: "Continuar",
      exact: true,
    });
    for (
      let i = 0;
      i < 6 &&
      !(await continueButton.evaluate((el) => el === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(continueButton).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/passo=moradores/);
  });

  test("diálogo «continuar depois» abre, prende o foco e fecha com Esc", async ({
    page,
  }) => {
    await start(page);
    await page
      .getByRole("button", { name: "Salvar e continuar depois" })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Salvar e continuar depois",
    });
    await expect(dialog).toBeVisible();
    await expectNoSeriousA11yViolations(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("funciona com movimento reduzido", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await start(page);
    await walkToReview(page, minimalAnswers);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Confira suas respostas",
    );
  });

  test("sem consentimento, o fluxo volta para a abertura", async ({ page }) => {
    await page.goto("/briefing/responder?passo=nome");
    await expect(page).toHaveURL(/\/briefing$/);
    await page.getByRole("button", { name: "Começar" }).click();
    await expect(
      page.getByText("Para começar, é preciso concordar"),
    ).toBeVisible();
  });
});

// PNG de 1×1 pixel para os uploads simulados.
const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function walkUntil(
  page: import("@playwright/test").Page,
  target: string,
) {
  for (let i = 0; i < 40 && passo(page) !== target; i++) {
    await minimalAnswers[passo(page) ?? ""]?.(page);
    await advance(page);
  }
  expect(passo(page)).toBe(target);
}
