import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
// O script de operação é JavaScript nativo e também é exercitado sem subprocesso.
// @ts-expect-error O módulo operacional .mjs é validado em execução.
import { personalizeProject } from "../scripts/personalize.mjs";
async function workspace() {
  const root = await mkdtemp(join(tmpdir(), "site-template-"));
  await mkdir(join(root, "config"));
  await mkdir(join(root, "supabase"));
  for (const file of [
    "config/site.json",
    "supabase/schema.sql",
    "package.json",
    "package-lock.json",
  ])
    await writeFile(join(root, file), await readFile(file));
  return root;
}
describe("personalização reutilizável", () => {
  it("atualiza identidade e instala SQL com apóstrofo sem sobrescrever a loja já salva", async () => {
    const root = await workspace();
    const db = new PGlite();
    try {
      await personalizeProject(root, {
        name: "Loja d'Exemplo",
        id: "minha-loja",
        primaryColor: "#123456",
      });
      const config = JSON.parse(
        await readFile(join(root, "config/site.json"), "utf8"),
      );
      expect(config.name).toBe("Loja d'Exemplo");
      expect(
        JSON.parse(await readFile(join(root, "package-lock.json"), "utf8"))
          .packages[""].name,
      ).toBe("minha-loja");
      await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
        create table auth.users(id uuid primary key,email text);
        create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
        create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
        create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);`);
      await db.exec(await readFile(join(root, "supabase/schema.sql"), "utf8"));
      expect(
        (
          await db.query(
            "select store_name,primary_color,whatsapp from public.store_settings",
          )
        ).rows,
      ).toEqual([
        {
          store_name: "Loja d'Exemplo",
          primary_color: "#123456",
          whatsapp: "",
        },
      ]);
      await db.exec(
        "update public.store_settings set store_name='Loja cadastrada';",
      );
      await personalizeProject(root, { name: "Outro nome" });
      await db.exec(await readFile(join(root, "supabase/schema.sql"), "utf8"));
      expect(
        (await db.query("select store_name from public.store_settings")).rows,
      ).toEqual([{ store_name: "Loja cadastrada" }]);
    } finally {
      await db.close();
      await rm(root, { recursive: true, force: true });
    }
  });
  it("valida identificador e cores antes de modificar arquivos", async () => {
    const root = await workspace();
    try {
      const before = await readFile(join(root, "config/site.json"), "utf8");
      await expect(
        personalizeProject(root, { id: "../outro" }),
      ).rejects.toThrow(/identificador/);
      await expect(
        personalizeProject(root, { primaryColor: "vermelho" }),
      ).rejects.toThrow(/cores/);
      expect(await readFile(join(root, "config/site.json"), "utf8")).toBe(
        before,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
