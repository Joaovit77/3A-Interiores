import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Falha se houver violação séria ou crítica de acessibilidade na página atual. */
export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
  ).toEqual([]);
}

/** Falha se a página tiver rolagem horizontal. */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

/** Registra toda requisição feita para fora da origem da aplicação. */
export function trackExternalRequests(page: Page, baseURL: string) {
  const origin = new URL(baseURL).origin;
  const external: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.startsWith("data:") || url.startsWith("blob:")) return;
    if (new URL(url).origin !== origin) external.push(url);
  });
  return external;
}
