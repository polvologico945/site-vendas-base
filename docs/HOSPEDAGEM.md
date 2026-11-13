# Hospedagem e operação

Data: 2026-11-13. @author Carla Evelyn.

A base usa Node.js/Next.js e Supabase. Não existe conta, domínio, chave ou serviço
contratado embutido no repositório. Cada cópia deve configurar seu próprio ambiente.

## Plataforma gerenciada

Configure as variáveis públicas antes do build e separe desenvolvimento/Preview
de produção. Confirme preços, uso comercial e limites do plano escolhido. Vercel
e Supabase têm cobranças/franquias diferentes: frontend/CDN e backend/Auth/Storage.

A rota de imagens usa sharp e decodificação HEIC em Node.js. Uma migração para
runtime diferente, como Workers, exige verificar compatibilidade ou adaptar a
entrega para arquivos já otimizados. Não basta trocar o DNS.

## Servidor próprio

Next.js pode executar com `npm run build` e `npm run start`, HTTPS e proxy à frente
do Node. Hospedagem em uma VM, inclusive Oracle Cloud, exige atualizações, firewall,
monitoramento, backups externos e capacidade de restauração. A franquia gratuita
de um provedor não equivale a um serviço gerenciado com disponibilidade garantida.

Supabase pode ser hospedado por conta própria. Isso preserva parte das APIs, mas
requer migrar banco, identidades e arquivos; SMTP e URLs de Auth precisam ser
configurados. Verifique suporte à arquitetura e versões dos containers.

## Cache e imagens

Preserve a URL canônica por objeto e o cache das respostas públicas. O cabeçalho
específico de CDN da Vercel não configura automaticamente um proxy diferente.
Não cacheie administração, Auth, recuperação nem respostas `no-store`.

R2 pode ser adotado para mídia, mas a implementação desta base usa Supabase
Storage. A mudança exige adaptador de upload, autorização, origem permitida,
CSP e migração das URLs. Não é uma opção pronta que se ativa por uma variável.

## Backup e troca de provedor

Exporte o banco e copie os bytes do Storage. Guarde configurações/segredos de
restauração fora do repositório e do servidor original. Valide uma restauração.

Teste a nova origem em paralelo, confirme permissões, imagens, login e pedido,
sincronize alterações administrativas e só então troque o tráfego. Preserve uma
opção de retorno e reconcilie escritas caso precise voltar ao ambiente anterior.

Referências: [Next.js](https://nextjs.org/docs/app/guides/self-hosting),
[Supabase self-hosted](https://supabase.com/docs/guides/self-hosting),
[Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm),
[preços R2](https://developers.cloudflare.com/r2/pricing/) e
[Vercel Hobby](https://vercel.com/docs/plans/hobby).
