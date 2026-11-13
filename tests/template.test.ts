import { afterEach, describe, expect, it, vi } from "vitest";
import { readPublicCatalog } from "../lib/catalog-server";
import { whatsappUrl } from "../lib/contact";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("modelo sem dados e contato opcional", () => {
  it("prévia sem backend começa vazia e não consulta nem apresenta contatos", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const catalog = await readPublicCatalog();
    expect(catalog).toMatchObject({
      demo: true,
      products: [],
      categories: [],
      productTypes: [],
      settings: { whatsapp: "", instagram: null, address: null },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(["", null, "123", "javascript:alert(1)"])(
    "não cria link sem telefone configurado: %s",
    (phone) => {
      expect(whatsappUrl(phone)).toBeNull();
    },
  );
  it("normaliza contato e preserva texto do pedido sem interpretar sua query", () => {
    const url = new URL(
      whatsappUrl("+55 (00) 00000-0000", "Produto A & B? opção=única")!,
    );
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/5500000000000");
    expect(url.searchParams.get("text")).toBe("Produto A & B? opção=única");
  });
});
