import { expect, type Page } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectNoSeriousA11yViolations,
} from "./helpers";

export type StepActions = Record<string, (page: Page) => Promise<void>>;

export const passo = (page: Page) =>
  new URL(page.url()).searchParams.get("passo");

/** Clica numa opção pelo texto visível, dentro do conteúdo da tela. */
export const choose = (page: Page, text: string) =>
  page.locator("main").getByText(text, { exact: true }).first().click();

export const primary = (page: Page) => page.locator("div.fixed button").last();

export async function start(page: Page) {
  await page.goto("/briefing");
  await page.getByLabel(/Li e concordo/).check();
  await page.getByRole("button", { name: "Começar" }).click();
  await expect(page).toHaveURL(/passo=nome/);
}

/** Avança uma tela e espera a URL mudar. */
export async function advance(page: Page) {
  const before = passo(page);
  await primary(page).click();
  await page.waitForFunction(
    (prev) => new URL(location.href).searchParams.get("passo") !== prev,
    before,
  );
}

export const minimalAnswers: StepActions = {
  nome: (p) => p.getByLabel("Primeiro nome").fill("Ana Teste"),
  "tipo-imovel": (p) => choose(p, "Apartamento"),
  localizacao: (p) => p.getByLabel("Cidade").fill("Cidade Exemplo"),
  ambientes: (p) => choose(p, "Sala de estar"),
  email: (p) => p.getByLabel("E-mail").fill("ana@exemplo.com"),
};

interface WalkOptions {
  /** Roda axe e o teste de overflow em cada tela. */
  audit?: boolean;
}

/** Percorre o briefing até a revisão, aplicando as ações de cada tela. */
export async function walkToReview(
  page: Page,
  actions: StepActions,
  options: WalkOptions = {},
) {
  const visited: string[] = [];
  for (let i = 0; i < 150; i++) {
    const current = passo(page);
    if (!current) throw new Error("URL sem passo");
    visited.push(current);
    await expect(page.locator("h1")).toBeVisible();
    await actions[current]?.(page);
    if (options.audit) {
      await expectNoHorizontalOverflow(page);
      await expectNoSeriousA11yViolations(page);
    }
    if (current === "revisao") return visited;
    await advance(page);
  }
  throw new Error("O fluxo não chegou à revisão");
}
