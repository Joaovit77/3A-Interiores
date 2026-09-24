import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectNoSeriousA11yViolations,
  trackExternalRequests,
} from "./helpers";

test("a página inicial provisória carrega", async ({ page, baseURL }) => {
  const external = trackExternalRequests(page, baseURL!);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Luísa Amélia Interiores" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoSeriousA11yViolations(page);
  expect(external).toEqual([]);
});
