# Contribuir

Use uma branch para a alteração e descreva o comportamento final no Pull Request.
Configure seu próprio backend local/de teste; não use dados de clientes.

Execute `npm ci`, `npm run verify:template`, `npm run format:check`, `npm run lint`,
`npm run typecheck` e os testes pertinentes. Alterações em SQL ou autenticação
precisam verificar permissões de visitante e administrador. Alterações em mídia
precisam preservar cache e limitar transferências repetidas.

Mantenha o catálogo inicial vazio. Registros fictícios pertencem a `tests/`.
Ao adicionar uma integração, documente suas variáveis e não publique segredos.
Comentários de decisões relevantes devem registrar problema, data e autoria.
