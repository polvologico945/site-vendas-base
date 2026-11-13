import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

// Problema: um repositório modelo público pode carregar arquivos locais ou chaves
// por engano. Verifica a lista que o Git publicará e comunica apenas nomes de
// arquivos; não imprime valores encontrados. Data: 2026-11-13. @author Carla Evelyn
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const sensitivePaths =
  /(^|\/)(?:\.env(?!\.example$)[^/]*|node_modules|\.next|coverage|test-results|playwright-report|logomarca|Anuncios)(?:\/|$)|\.(?:pem|p12|pfx|sqlite|sqlite3|dump|bak)$/i;
const patterns = [
  /sb_secret_[a-zA-Z0-9_-]{24,}/,
  /https:\/\/[a-z0-9]{20}\.supabase\.co\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
const problems = [];
for (const file of files) {
  if (sensitivePaths.test(file)) {
    problems.push(file);
    continue;
  }
  if (!/\.(?:ts|tsx|mts|mjs|json|sql|md|yml|yaml|env|example|txt)$/.test(file))
    continue;
  const content = await readFile(file, "utf8");
  if (patterns.some((pattern) => pattern.test(content))) problems.push(file);
}
if (problems.length) {
  console.error(
    "Revise estes arquivos antes de publicar:\n" +
      [...new Set(problems)].join("\n"),
  );
  process.exitCode = 1;
} else
  console.log(
    `Modelo verificado: ${files.length} arquivos sem os padrões de dados locais/segredos inspecionados.`,
  );
