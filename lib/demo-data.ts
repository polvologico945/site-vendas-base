import site from "@/config/site.json";
import type { Category, Product, StoreSettings } from "./types";

/** Problema: reutilizar o projeto não pode publicar produtos ou contatos da loja
 * anterior. A prévia usa identidade genérica e catálogo vazio; só o painel do novo
 * projeto cadastra dados reais. Data: 2026-11-13. @author Carla Evelyn */
export const demoSettings: StoreSettings = {
  id: 1,
  store_name: site.name,
  tagline: site.tagline,
  whatsapp: "",
  instagram: null,
  address: null,
  logo_url: site.logo,
  hero_image_url: site.cover,
  hero_image_urls: [site.cover],
  primary_color: site.primaryColor,
  accent_color: site.accentColor,
};
export const demoCategories: Category[] = [];
export const demoProducts: Product[] = [];
