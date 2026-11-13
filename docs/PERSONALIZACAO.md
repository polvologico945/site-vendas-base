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

As cores escolhidas pelo assistente agora se aplicam ao cabeçalho, à capa,
ao rodapé, aos filtros, ao carrinho, às galerias, ao painel e às telas de acesso.
O tema em `lib/theme.ts` calcula texto claro/escuro por contraste. Se a principal
for muito clara, as ações usam a cor de destaque quando ela tem contraste
suficiente; caso contrário, recebem um tom escuro derivado da paleta. Assim,
principal `#FFFFFF` e destaque `#D01B1B` produzem áreas brancas, texto preto e
botões vermelhos, sem texto branco sobre branco. Estados de sucesso/erro mantêm
cores próprias e rótulos explicativos.

Na prévia sem backend, o JSON é a fonte das cores. Com Supabase configurado,
o catálogo e o painel usam as cores já salvas em `store_settings`. Para mudar
uma loja existente, vá a **Aparência e loja → Cores da loja → Salvar configurações**.
O painel mostra a nova paleta antes de salvar. Metadados/login continuam usando
a identidade estática do JSON; mantenha ambos coerentes.

Substitua as ilustrações neutras em `public/brand/` por imagens próprias e ajuste
os caminhos no arquivo central. Arquivos locais de marca usam `/brand/...`.
As galerias reais são enviadas pelo painel para o bucket `catalog`.
O tema não altera os pixels das fotos ou da sua logomarca. As ilustrações
iniciais são cinzas para não impor uma segunda identidade à paleta escolhida.

Após atualizar esta correção, pare o servidor e execute `git pull --ff-only origin main`
e `npm run dev`. Abra exatamente a URL **Local** impressa no terminal: se a porta
3000 estiver ocupada, o Next.js pode usar 3001. Use `Ctrl+Shift+R` uma vez para
renovar as ilustrações locais em cache. Não é necessário repetir o assistente
nem executar SQL para aplicar a correção visual.

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
