# Galerias e acessibilidade

Data: 2026-11-13. @author Carla Evelyn.

## Fotos opcionais

No produto, use **Fotos do produto**. Na área **Aparência e loja**, use **Fotos da
capa**. É possível selecionar várias fotos, reordenar com setas, escolher a
principal com a estrela e remover da seleção. Salve o formulário para publicar.
O limite é seis fotos por produto e seis na capa. Uma foto única continua válida.

JPEG, HEIC, HEIF, PNG e WebP são aceitos até 20 MB/60 megapixels por entrada. O
painel processa uma foto por vez, gera WebP de até 1200 px e 350.000 bytes e remove
EXIF/GPS. O nome SHA-256 evita cópias do mesmo conteúdo. Uma foto já presente na
galeria não é enviada novamente; falhas no lote preservam as fotos válidas.

Remover uma foto da seleção não apaga seu objeto no Storage, pois ele pode estar
compartilhado. Limpeza de objetos sem referência exige revisão separada.

## Navegação e consumo

Produtos com mais de uma foto mostram a quantidade sobre a imagem. A galeria
abre sob demanda e carrega somente a foto escolhida; os seletores são numerados
para evitar transferências antecipadas de todas as miniaturas. Card, galeria e
carrinho usam a mesma URL canônica.

A capa avança a cada 6,5 segundos de apresentação visível, com troca suave. Aguarda
a próxima foto carregar e permite pausar. Foco/navegação manual interrompem o
avanço até a pessoa pedir reprodução. Hover pausa temporariamente. Aba oculta,
capa fora da tela, diálogo ativo, menos movimento ou economia de dados interrompem
a troca automática. Navegação manual continua disponível.

Cada foto diferente ainda pode gerar uma transferência inicial. Cache reduz
repetições, sem prometer banda zero. A rota de mídia limita origem e tamanho,
converte fotos antigas e reutiliza WebP novo adequado. Os arquivos com hash usam
cache longo/immutable; não sobrescreva objetos com o mesmo nome.

## IHC e acessibilidade

| Princípio             | Aplicação                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Estado visível        | Progresso por lote, erros, resultados da busca e posição da foto                                         |
| Controle              | Pausa, ordem, principal, remoção e fechamento por Escape                                                 |
| Prevenção/recuperação | Limite de fotos, repetidas removidas, salvar bloqueado durante envio e preservação de resultados válidos |
| Consistência          | Mesma foto principal e URL no catálogo, galeria e carrinho                                               |
| Teclado               | Atalho para produtos, Tab contido no diálogo, setas e Home/End                                           |
| Leitores de tela      | Nome nos controles, filtros com aria-pressed e posições/resultados anunciados                            |
| Preferências          | Menos movimento, economia de dados e foco visível                                                        |
| Toque                 | Botões de navegação com 44 px e alternativa ao gesto horizontal                                          |

Diálogos isolam o fundo com `inert` e devolvem o foco à origem. As fotos da capa
são decorativas: informações comerciais importantes também devem existir em
texto acessível. As melhorias não constituem certificação integral WCAG. Testes
móveis em Chromium não substituem Safari/iPhone físico ou leitores de tela reais.
