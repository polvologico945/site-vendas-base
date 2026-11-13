# Segurança

Não publique senhas, tokens, links de recuperação ou dados de clientes em Issues.
Para reportar uma vulnerabilidade, use a área **Security → Report a vulnerability**
do GitHub quando habilitada; na ausência desse recurso, comunique-se por um canal
privado com o responsável pela sua cópia antes de divulgar detalhes exploráveis.

Esta base não cria usuário administrativo nem senha padrão. RLS e políticas do
Storage devem permanecer ativas. Credenciais de servidor nunca pertencem a
`NEXT_PUBLIC_*`. Ative backups, mantenha dependências atualizadas e verifique a
restauração do banco e dos arquivos antes de colocar uma loja em produção.
