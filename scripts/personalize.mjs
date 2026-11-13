import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { createInterface } from "node:readline/promises";

/** Problema: copiar um projeto exigia procurar a marca em vários arquivos e podia
 * deixar dados de outra loja. Personaliza identidade, pacote e configuração SQL
 * inicial em conjunto, sem sobrescrever registros existentes nem acessar serviços.
 * Data: 2026-11-13. @author Carla Evelyn */
export async function personalizeProject(root, values) {
  const configPath = resolve(root, "config/site.json");
  const current = JSON.parse(await readFile(configPath, "utf8"));
  const next = {
    ...current,
    ...Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined),
    ),
  };
  if (
    typeof next.name !== "string" ||
    !next.name.trim() ||
    next.name.length > 100
  )
    throw new Error("Informe um nome com até 100 caracteres.");
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(next.id) || next.id.length > 80)
    throw new Error(
      "Use um identificador curto com letras minúsculas, números e hífens.",
    );
  for (const color of [next.primaryColor, next.accentColor])
    if (!/^#[a-f\d]{6}$/i.test(color))
      throw new Error("Use cores no formato #123456.");
  if (typeof next.tagline !== "string" || next.tagline.length > 180)
    throw new Error("A frase principal deve ter até 180 caracteres.");
  next.name = next.name.trim();
  const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
  const sqlPath = resolve(root, "supabase/schema.sql");
  const schema = await readFile(sqlPath, "utf8");
  const marker = /-- SITE_DEFAULTS_START\n[\s\S]*?-- SITE_DEFAULTS_END/;
  if (!marker.test(schema))
    throw new Error("Bloco de configuração inicial não encontrado no SQL.");
  const seed = `-- SITE_DEFAULTS_START
insert into public.store_settings (id, store_name, tagline, whatsapp, instagram, address, logo_url, hero_image_url, primary_color, accent_color)
select 1, ${[next.name, next.tagline, ""].map(literal).join(", ")}, null, null, ${[next.logo, next.cover, next.primaryColor, next.accentColor].map(literal).join(", ")}
where not exists (select 1 from public.store_settings where id = 1);
-- SITE_DEFAULTS_END`;
  const files = [
    [configPath, JSON.stringify(next, null, 2) + "\n"],
    [sqlPath, schema.replace(marker, () => seed)],
  ];
  for (const name of ["package.json", "package-lock.json"]) {
    const path = resolve(root, name);
    const data = JSON.parse(await readFile(path, "utf8"));
    data.name = next.id;
    if (data.packages?.[""]) data.packages[""].name = next.id;
    files.push([path, JSON.stringify(data, null, 2) + "\n"]);
  }
  for (const [path, content] of files) await writeFile(path, content);
  return next;
}

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: "string" },
      id: { type: "string" },
      tagline: { type: "string" },
      primary: { type: "string" },
      accent: { type: "string" },
    },
  });
  const root = fileURLToPath(new URL("../", import.meta.url));
  const current = JSON.parse(
    await readFile(resolve(root, "config/site.json"), "utf8"),
  );
  if (!Object.keys(values).length) {
    if (!process.stdin.isTTY)
      throw new Error(
        'Use --name "Minha Loja" --id minha-loja ou execute em um terminal interativo.',
      );
    const reader = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      for (const [key, label, fallback] of [
        ["name", "Nome da loja", current.name],
        ["id", "Identificador", current.id],
        ["tagline", "Frase principal", current.tagline],
        ["primary", "Cor principal", current.primaryColor],
        ["accent", "Cor de destaque", current.accentColor],
      ])
        values[key] =
          (await reader.question(`${label} [${fallback}]: `)).trim() ||
          fallback;
    } finally {
      reader.close();
    }
  }
  const next = await personalizeProject(root, {
    name: values.name,
    id: values.id,
    tagline: values.tagline,
    primaryColor: values.primary,
    accentColor: values.accent,
  });
  console.log(
    `Identidade atualizada: ${next.name}. Configure contatos e cadastros no painel do seu próprio projeto. O SQL só inicializa uma loja nova; registros existentes são preservados.`,
  );
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
