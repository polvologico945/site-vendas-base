# Site Vendas Base

Modelo reutilizável de catálogo de produtos com painel administrativo, galerias e pedido pelo WhatsApp. Feito com Next.js, React, TypeScript e Supabase.

[![Qualidade](https://github.com/polvologico945/site-vendas-base/actions/workflows/ci.yml/badge.svg)](https://github.com/polvologico945/site-vendas-base/actions/workflows/ci.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-17634b)](LICENSE)

**[Criar um novo site a partir deste modelo](https://github.com/polvologico945/site-vendas-base/generate)**

O projeto começa sem produtos, categorias, contatos ou usuários administrativos. Inclui somente identidade genérica, ilustrações neutras e arquivos fictícios isolados para os testes. Cada novo site deve conectar seu próprio backend.

<details>
<summary>Prévia do modelo com catálogo vazio</summary>

![Prévia do modelo genérico](docs/images/preview.png)

</details>

## O que está pronto

- Catálogo responsivo com busca e filtros por categoria/tipo.
- Marcas, preços promocionais, opções do produto e disponibilidade.
- Carrinho persistente com atualização de preços antes do pedido.
- Pedido pelo WhatsApp; o canal permanece oculto enquanto não estiver configurado.
- Até seis fotos por produto e capa, com ordenação e seleção da principal.
- Capa com transição suave, pausa e respeito a menos movimento/economia de dados.
- Upload múltiplo JPEG/HEIC/HEIF/PNG/WebP com compressão, hash e reutilização de arquivos.
- Painel protegido por autenticação e permissões RLS no banco.
- Recuperação de senha pelo aplicativo e por links do painel Supabase.
- Navegação por teclado, foco controlado em diálogos e controles anunciados.
- Configuração central da identidade e assistente de personalização.
- Testes de lógica, SQL real embarcado e navegador, com GitHub Actions.

O pedido abre uma conversa para a loja confirmar estoque, entrega e pagamento. A aplicação não processa pagamentos, calcula frete nem reserva estoque.

## Criar seu próximo site

1. Clique em **Use this template → Create a new repository** no GitHub. Assim, cada loja terá um repositório independente.
2. Clone **o novo repositório** e instale as dependências:

   ```bash
   npm ci
   npm run personalize
   npm run dev
   ```

3. Abra `http://localhost:3000`. A prévia local funciona sem backend e começa com catálogo vazio.
4. Ajuste textos, moeda e imagens em [`config/site.json`](config/site.json). O painel permite configurar a identidade e os contatos persistidos no banco.
5. Conecte um novo projeto Supabase seguindo [INSTALACAO.md](docs/INSTALACAO.md).
6. Cadastre produtos pelo painel e publique a cópia em sua hospedagem.

O assistente também aceita argumentos:

```bash
npm run personalize -- --name "Minha Loja" --id minha-loja --primary '#123456'
```

Ele atualiza a identidade, o nome do pacote e a configuração SQL inicial. **Não acessa serviços nem altera registros de uma loja já instalada.** Para uma instalação existente, altere os dados pelo painel.

## Configuração do backend

```bash
cp .env.example .env.local
```

Preencha ambos os campos com os valores do seu próprio projeto:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Execute [`supabase/schema.sql`](supabase/schema.sql) inteiro no SQL Editor. O arquivo instala tabelas, relações, permissões e bucket; cria somente uma configuração genérica de loja. Não importa produtos nem cria usuário/senha padrão.

Crie seu administrador em **Authentication → Users** e atribua o perfil seguindo o guia de instalação. Configure SMTP e URLs de retorno para habilitar recuperação de senha confiável. Nunca coloque chaves secretas ou credenciais SMTP nas variáveis públicas.

As variáveis `NEXT_PUBLIC_*` também precisam estar no ambiente de publicação antes do build. Sem backend configurado, a prévia funciona localmente; um deploy de produção exige configuração válida.

## Verificação

```bash
npm run verify:template
npm run format:check
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

Os testes usam um backend local simulado e não acessam contas reais. Os registros e credenciais fictícios ficam somente em `tests/`. O workflow executa instalação limpa, auditoria de dependências, verificação do modelo e testes em cada branch/PR.

## Documentação

- [Instalação e administrador](docs/INSTALACAO.md)
- [Personalização para novas lojas](docs/PERSONALIZACAO.md)
- [Arquitetura e relações SQL](docs/PROJETO.md)
- [Galerias e acessibilidade](docs/GALERIAS-E-ACESSIBILIDADE.md)
- [Recuperação de senha](docs/RECUPERACAO-DE-SENHA.md)
- [Hospedagem e operação](docs/HOSPEDAGEM.md)
- [Validação e limitações](docs/VALIDACAO.md)
- [Como contribuir](CONTRIBUTING.md)

## Licença

[MIT](LICENSE). A amostra HEIC de terceiro segue a atribuição/licença registrada em [tests/fixtures/README.md](tests/fixtures/README.md). As ilustrações genéricas do modelo e o JPEG sintético foram criados para esta base.
