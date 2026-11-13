# Personalizar e reutilizar

Data: 2026-11-13. @author Carla Evelyn.

No GitHub, use **Use this template** para criar um repositório independente.
O histórico anterior e os dados de outra loja não são necessários.

## Assistente

Execute `npm run personalize` em um terminal. O assistente solicita nome,
identificador, frase e cores. Também aceita argumentos:

```bash
npm run personalize -- --name "Minha Loja" --id minha-loja --tagline "Escolhas para o seu dia" --primary '#123456' --accent '#a94326'
```

O identificador deve usar letras minúsculas, números e hífens. Ele identifica o
pacote e separa a chave local do carrinho. O assistente valida entradas antes de
escrever em `config/site.json`, `package.json`, `package-lock.json` e no bloco de
configuração inicial de `supabase/schema.sql`. Nomes com apóstrofo são escapados
no SQL. Não há acesso externo nem alteração em banco já instalado.

## Arquivo central

`config/site.json` define a identidade estática: nome/descrição para metadados e
login, textos da capa, título do catálogo, rodapé, moeda, idioma e imagens locais.
O frontend usa BRL/pt-BR por padrão. Alterações nesse arquivo exigem novo build.
Moeda é formato de exibição; não converte preços existentes.

O painel controla a identidade persistida no backend, categorias, produtos,
preços e contatos. Dados já salvos não são sobrescritos pelo assistente. Configure
ambas as identidades de forma coerente: o arquivo define metadados/login; o banco
define as informações visíveis do catálogo conectado.

## Identidade visual

Substitua as ilustrações neutras em `public/brand/` por imagens próprias e ajuste
os caminhos no arquivo central. Arquivos locais de marca usam `/brand/...`.
As galerias reais são enviadas pelo painel para o bucket `catalog`.

Depois de editar manualmente nome/cores no JSON antes da instalação, execute
`npm run personalize -- --name "Minha Loja"` para sincronizar o bloco inicial SQL.
O assistente mantém os demais campos já definidos no JSON.

## Produtos genéricos

A interface fala em **opções**, que podem representar tamanho, cor ou outra
escolha única do produto. Por compatibilidade, o campo interno se chama `flavors`.
Esta base não oferece combinação de múltiplas variantes, preço/estoque por opção
nem estoque transacional. A loja confirma disponibilidade pelo atendimento.

O schema de produção e a prévia começam sem produtos. Os dados sintéticos em
`tests/fixtures/` servem somente para testes e não devem ser executados como seed.
