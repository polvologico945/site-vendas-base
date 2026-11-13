# Validação do modelo

Data: 2026-11-13. @author Carla Evelyn.

## Escopo

Esta cópia foi preparada com histórico Git novo, identidade genérica e catálogo
inicial vazio. Foram removidos materiais comerciais, contatos, fotos e links de
deployment de outra loja. Os arquivos `.env.local`, caches, builds, relatórios e
credenciais não fazem parte da distribuição.

As imagens públicas são SVGs neutros. O JPEG de teste foi gerado por código;
o HEIC é uma amostra pública de terceiro com origem/licença documentadas. Registros
fictícios e credenciais simuladas ficam em `tests/`, sem usuário padrão no SQL.

## Resultado desta preparação

- Instalação limpa por `npm ci`: concluída.
- Verificador do modelo, ESLint, TypeScript e formatação: aprovados.
- 70 testes de lógica/SQL aprovados, incluindo catálogo vazio, personalização e contraste.
- Build de produção e 23 cenários Chromium/Playwright aprovados.
- JPEG/HEIC, cache entre telas, recuperação de acesso e navegação móvel exercitados.
- Regressão de cores validada executando o personalizador com principal branca e
  destaque vermelho antes do build de produção; identidade genérica restaurada
  byte a byte depois. Cabeçalho, capa, rodapé, filtros, galeria, carrinho, painel,
  login e recuperação foram conferidos por estilos computados no Chromium.

## Verificações

Consulte o workflow GitHub Actions para o resultado de cada commit. A sequência é:

```bash
npm ci
npm run verify:template
npm run format:check
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

O verificador do modelo inspeciona nomes de arquivos e padrões conhecidos de
segredos, imprimindo apenas os nomes que precisam de revisão. É uma proteção
complementar, não um detector universal de dados sensíveis.

## Cenários

- Instalação SQL vazia, reexecução, FKs, triggers, permissões e bancos legados.
- Catálogo sem backend/sem produtos e contatos ausentes, sem URLs de exemplo ativas.
- Assistente com nomes contendo apóstrofo, validação e preservação de loja existente.
- Paletas claras/escuras, branco/vermelho, contraste e prévia das cores no painel.
- Carrinho inválido/antigo, opções removidas e preço conferido antes do pedido.
- Galerias sob demanda, capa com pausa e cache compartilhado entre telas.
- Upload JPEG/HEIC real, conversão para WebP, duplicatas e falha parcial.
- Recuperação com PKCE, tokens do Dashboard, TokenHash e rejeição de link expirado.
- Teclado, retorno de foco, fundo isolado, menos movimento e viewport móvel.

Os testes de navegador usam backend HTTP/Auth/Storage **local simulado**. O SQL é
executado em PostgreSQL/PGlite. Não são enviadas mensagens nem modificadas contas
Supabase reais. As capturas e medições são produzidas em `test-results/` e ficam
nos artefatos temporários do CI.

## Limitações

A validação local não mede cache CDN, SMTP ou um projeto Supabase real. Faça um
teste em ambiente próprio antes da publicação. Chromium móvel não equivale a um
iPhone/Safari físico. Acessibilidade precisa também de avaliação humana. O modelo
não inclui gateway, pedidos persistidos, reserva de estoque ou cálculo de frete.
