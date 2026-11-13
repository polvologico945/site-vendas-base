# Instalação

Data: 2026-11-13. @author Carla Evelyn.

## Prévia local

Use Node.js 24 e npm. Execute `npm ci`, opcionalmente `npm run personalize`, e
`npm run dev`. Abra `http://localhost:3000`. Sem variáveis, a aplicação mostra a
identidade genérica e nenhum produto. O painel administrativo requer backend.

## Projeto independente

Crie um projeto Supabase para a nova loja. Evite compartilhar tabelas/usuários
com outra loja: esta base tem uma única configuração de loja, não é uma plataforma
multitenant. Consulte limites e preços do provedor antes de criar vários projetos.

1. Copie `.env.example` para `.env.local`.
2. Preencha URL e chave **pública/publicável**, ambas do novo projeto.
3. No Supabase, abra **SQL Editor → New query**.
4. Cole **o arquivo inteiro `supabase/schema.sql` desta cópia**, e execute.
5. Confirme sucesso. O schema é transacional e reexecutável; não exige apagar
   políticas existentes. Uma instalação nova não insere produtos/categorias.
6. Reinicie `npm run dev` depois de preencher as variáveis.

A linha de configuração inicial é necessária para o catálogo. Valores de nome,
frase e cores acompanham o assistente de personalização executado antes da
instalação. Reexecutar o SQL preserva uma configuração já salva.

## Administrador

Em **Authentication → Users**, crie o usuário da loja com e-mail e senha próprios.
No SQL Editor, adapte o endereço abaixo para esse usuário existente:

```sql
insert into public.profiles (id, role)
select id, 'admin' from auth.users where email = 'admin@loja.example'
on conflict (id) do update set role = 'admin';
```

O endereço acima é ilustrativo. Nenhum e-mail é enviado por esse SQL. Confira se
uma linha foi afetada. Ter uma conta no Auth não concede administração sem perfil.

Abra `/admin/login`, entre e cadastre categorias, tipos, marcas e produtos. Em
**Aparência e loja**, ajuste nome, cores, fotos e contatos. WhatsApp é opcional;
quando informado, inclua DDI e DDD. O envio do pedido permanece indisponível até
haver um telefone válido.

## Recuperação de acesso

Configure **Authentication → URL Configuration** e SMTP. Use a rota
`/redefinir-senha` nos retornos permitidos, conforme `RECUPERACAO-DE-SENHA.md`.
Não existem conta ou senha administrativas padrão nesta base.

## Publicação

Execute `npm run build` e `npm run start` no runtime de produção. Na hospedagem,
configure as mesmas variáveis públicas antes do build. Mantenha HTTPS, regras
RLS e proteção do painel. Use um ambiente de teste próprio para Preview.

Um novo domínio exige atualizar a URL principal/retornos do Auth. O aplicativo
não cria recursos de cloud, altera DNS ou migra bases de outra loja automaticamente.
