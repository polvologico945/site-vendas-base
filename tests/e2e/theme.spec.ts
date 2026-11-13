import { test, expect } from "@playwright/test";
import site from "../../config/site.json";
import { themeStyle } from "../../lib/theme";

const mock = "http://127.0.0.1:54321";
const white = "rgb(255, 255, 255)";
const black = "rgb(0, 0, 0)";
const red = "rgb(208, 27, 27)";

test.beforeEach(async ({ request }) => {
  await request.get(`${mock}/__reset`);
});

test("paleta branca e vermelha alcança capa, navegação, galeria e carrinho", async ({
  page,
  request,
}) => {
  await request.post(`${mock}/__settings`, {
    data: { primary_color: "#FFFFFF", accent_color: "#D01B1B" },
  });
  await request.post(`${mock}/__product`, {
    data: {
      image_urls: [
        `${mock}/storage/v1/object/public/catalog/products/test.jpg`,
        `${mock}/storage/v1/object/public/catalog/products/detail.jpg`,
      ],
    },
  });
  await page.goto("/");
  await expect(page.locator(".topbar")).toHaveCSS("background-color", white);
  await expect(page.locator(".topbar")).toHaveCSS("color", black);
  await expect(page.locator(".hero")).toHaveCSS("background-color", white);
  await expect(page.locator(".hero h1")).toHaveCSS("color", black);
  await expect(page.locator(".hero-shade")).toHaveCSS(
    "background-image",
    /255, 255, 255/,
  );
  await expect(page.locator(".hero .primary-button")).toHaveCSS(
    "background-color",
    red,
  );
  await expect(page.locator(".hero .primary-button")).toHaveCSS("color", white);
  await expect(page.locator(".hero .secondary-button")).toHaveCSS(
    "color",
    black,
  );
  await expect(page.locator("footer")).toHaveCSS("background-color", white);
  await expect(page.locator(".category-pills .active")).toHaveCSS(
    "background-color",
    red,
  );
  await page.screenshot({
    path: "test-results/theme-white-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/theme-white-mobile.png",
    fullPage: true,
  });

  await page
    .getByRole("button", { name: "Ver 2 fotos de Produto de teste" })
    .click();
  await expect(
    page.locator('.gallery-positions button[aria-current="true"]'),
  ).toHaveCSS("background-color", red);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", {
      name: "Adicionar Produto de teste ao carrinho",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Opção A", exact: true }).click();
  await expect(page.locator(".flavor-options .active")).toHaveCSS(
    "color",
    white,
  );
  await page
    .getByRole("button", { name: "Adicionar ao carrinho", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Finalizar pedido" }),
  ).toHaveCSS("background-color", red);
});

test("painel mostra a cor escolhida imediatamente e persiste a paleta", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill("admin@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("senha-de-teste");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("button", { name: "Aparência e loja" }).click();
  await page.getByLabel("Cor principal", { exact: true }).fill("#ffffff");
  await page.getByLabel("Cor de destaque", { exact: true }).fill("#d01b1b");
  await expect(page.locator(".admin-sidebar")).toHaveCSS(
    "background-color",
    white,
  );
  await expect(page.locator(".admin-sidebar")).toHaveCSS("color", black);
  await expect(
    page.getByRole("button", { name: "Salvar configurações" }),
  ).toHaveCSS("background-color", red);
  await page.getByRole("button", { name: "Salvar configurações" }).click();
  await expect(page.getByText("Configurações salvas.")).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".topbar")).toHaveCSS("background-color", white);
  await expect(page.locator(".hero .primary-button")).toHaveCSS(
    "background-color",
    red,
  );
});

test("login e recuperação usam a identidade estática com texto legível no cartão", async ({
  page,
}) => {
  const theme = themeStyle(site.primaryColor, site.accentColor);
  for (const path of ["/admin/login", "/redefinir-senha"]) {
    await page.goto(path);
    await expect(page.locator(".login-card h1")).toHaveCSS(
      "color",
      "rgb(23, 23, 23)",
    );
    expect(
      await page
        .locator("body")
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--brand-bg").trim(),
        ),
    ).toBe(theme["--brand-bg"]);
    const action = page.locator(".login-card button");
    await expect(action).toHaveCSS(
      "background-color",
      hexRgb(theme["--action"]),
    );
    await expect(action).toHaveCSS("color", hexRgb(theme["--on-action"]));
  }
});

function hexRgb(hex: string) {
  const values = [1, 3, 5].map((offset) =>
    parseInt(hex.slice(offset, offset + 2), 16),
  );
  return `rgb(${values.join(", ")})`;
}
