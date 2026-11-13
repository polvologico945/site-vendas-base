# Recuperação de senha

Data: 2026-11-13. @author Carla Evelyn.

O login possui **Alterar senha** abaixo do campo de senha. A rota pública
`/redefinir-senha` permite pedir o e-mail e, com autorização válida, cadastrar e
confirmar a nova senha. O aplicativo chama o Supabase Auth; não cria uma tabela
própria de senhas. A nova senha exige pelo menos 12 caracteres e confirmação.

Depois de salvar, a sessão local é encerrada e a tela oferece novo login. Recuperar
a senha não altera a função do perfil nem transforma um usuário em administrador.

## URLs de retorno

Em **Authentication → URL Configuration**, configure:

- Site URL: domínio público da sua cópia, por exemplo `https://sua-loja.example/`.
- Redirect URLs: domínio público seguido de `/redefinir-senha`.
- Desenvolvimento: `http://localhost:3000/redefinir-senha`.
- Preview: URL exata do ambiente seguida de `/redefinir-senha`.

O domínio `.example` acima é ilustrativo. Use seu endereço real e solicite um novo
link após mudar a configuração. O domínio de retorno precisa ter a versão que
contém essa rota publicada.

## Formatos tratados

Links do Dashboard podem chegar à página inicial. Uma ponte reconhece os tokens
de recuperação e encaminha à tela correta. Também são tratados códigos PKCE com
seu identificador de fluxo e templates com TokenHash/type=recovery.

No PKCE, abra o link no mesmo navegador e origem em que pediu o e-mail. A página
valida a autorização no Auth antes de liberar a nova senha. Um cookie antigo não
autoriza um link inválido. Tokens/códigos são removidos da barra de endereço.
A página usa `no-store`, `no-referrer` e indicação de não indexação.

## Envio de e-mail

Configure um SMTP adequado para produção e confirme os limites de envio do
provedor e do Supabase. A mensagem genérica de solicitação não comprova entrega
e evita revelar se um usuário existe. Erro 429 indica bloqueio por limite; use
os logs de Auth para diagnosticar. Falhas SMTP não são resolvidas trocando a URL
de retorno ou executando o schema novamente.

Não existe usuário/senha padrão no modelo. Crie seu próprio administrador e não
publique links de recuperação, tokens ou credenciais em relatórios públicos.

Referências: [senhas](https://supabase.com/docs/guides/auth/passwords),
[URLs de retorno](https://supabase.com/docs/guides/auth/redirect-urls) e
[SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
