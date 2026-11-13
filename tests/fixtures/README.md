# Arquivos sintéticos e amostras de teste

`product.jpg` é uma ilustração geométrica gerada por `node scripts/generate-fixtures.mjs`.
Não é uma foto de loja, produto real ou cliente. O arquivo não contém EXIF.

`iphone.heic` é a amostra pública `examples/example.heic` do projeto libheif,
obtida em 2026-11-12. Não é uma fotografia de cliente nem uma foto enviada por iPhone.
Fonte: https://github.com/strukturag/libheif/blob/master/examples/example.heic.
Origem e licenças: https://github.com/strukturag/libheif/blob/master/COPYING.

`catalog.ts` e `schema-v1.sql` contêm registros fictícios para testes de leitura,
migração, relações e cache. Eles não são importados pelo catálogo público nem
executados durante a instalação normal. Execute somente `supabase/schema.sql`
para instalar a aplicação sem produtos ou categorias.
