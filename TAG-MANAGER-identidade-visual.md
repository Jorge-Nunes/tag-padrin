# IDENTIDADE VISUAL — TAG MANAGER

## Stack Técnica
- Tailwind CSS para toda estilização (NUNCA criar arquivos .css separados)
- shadcn/ui como base de componentes, customizados via className
- Todos os valores visuais definidos como TOKENS SEMÂNTICOS no tailwind.config
- NUNCA usar valores hardcoded no código — sempre tokens semânticos
- NUNCA usar cores/radius/sombras padrão do Tailwind — apenas tokens deste documento
- A IA que implementa é RESPONSÁVEL por criar SVGs originais baseados nas descrições de cena — NÃO use blobs, dot grids ou partículas como substituto de conceito visual
- A paleta usa UMA cor accent forte (ciano técnico) + neutros escuros e claros para cada modo. NÃO crie arco-íris de categorias.

## Setup Necessário

### Libs adicionais
| Lib | Pra quê | Instalação |
|---|---|---|
| `framer-motion` | Micro-interações de pulso nas TAGs ativas e animações de entrada | `npm i framer-motion` |

### Assets externos
Nenhum obrigatório. Todos os conceitos visuais são implementáveis em SVG/CSS puro.

---

## A Alma do App

TAG MANAGER é o centro nervoso de uma frota em movimento. Cada TAG é um ponto vivo no espaço — ela pulsa, se desloca, transmite. A interface não exibe dados: ela *ouve* o sinal. Acolhedora como um painel de bordo bem projetado, técnica como uma torre de controle, criativa o suficiente para transformar coordenadas em narrativa visual.

---

## Referências e Princípios

- **Linear:** Precisão cirúrgica na tipografia e espaçamento. Hierarquia construída sem ruído. Cada pixel tem função. → Princípio: nada é ornamental sem ser conceitual. → Aplicação: layouts com densidade controlada, sem elementos que não contribuam para a leitura de status.

- **Supabase:** Energia tech com UMA cor vibrante sobre fundo escuro. Componentes com conceito visual (o cubo isométrico do Vector, os cursores do Realtime). → Princípio: a cor accent aparece como sinal, não como decoração — é o "ping" do sistema. → Aplicação: o ciano accent marca exclusivamente o que está VIVO, ATIVO ou em TRANSMISSÃO.

- **Identidade própria do contexto:** Rastreamento veicular evoca constelações de pontos em movimento, coordenadas como linguagem, sinais que atravessam o espaço. → Princípio: a interface fala a língua da telemetria — grade de referência, pulsos, rotas tracejadas, sinais que chegam. → Aplicação: textura ambiente é uma grade geodésica fina; conceitos visuais usam linguagem de radar e transmissão.

---

## Decisões de Identidade

### ESTRUTURA

#### Navegação
**O que:** Sidebar estreita (colapsada por padrão) com ícones grandes e tooltips, sem labels visíveis. Expande ao hover com labels deslizando para a direita.  
**Por que:** TAGs e mapas precisam de área de trabalho máxima. A navegação existe mas não compete com o conteúdo operacional.  
**Como:** `w-sidebar-collapsed` (64px) → `w-sidebar-expanded` (220px) com transição `duration-sidebar`. Fundo `surface-sidebar`. Ícones em `text-icon-default`, ativo em `text-accent-primary`.  
**Nunca:** Sidebar larga aberta por padrão. Header horizontal com tabs. Bottom navigation.

#### Layout Principal
**O que:** Divisão assimétrica: painel de lista de TAGs à esquerda (35% da largura) + área de mapa/detalhe à direita (65%). Em mobile, abas deslizantes.  
**Por que:** A operação é: encontrar uma TAG → ver sua posição. O layout reflete esse fluxo direto.  
**Como:** Grid de duas colunas com `gap-panel`. Coluna esquerda usa `surface-panel`. Coluna direita usa `surface-map` (levemente mais escura no dark, mais clara no light).  
**Nunca:** Grid de cards igual a um dashboard de analytics. Layout de tabela como tela principal.

#### Hierarquia de Dados
**O que:** Status da TAG é o protagonista visual. Nome/ID vem em segundo lugar. Coordenadas e timestamp ficam em terceiro — visíveis, mas em `text-muted`.  
**Por que:** O operador precisa saber PRIMEIRO se a TAG está ativa ou perdida, DEPOIS onde ela está.  
**Como:** Status usa um indicador de pulso visual (ver conceito visual da TAG Card). Tamanho de fonte: status em `text-tag-status`, nome em `text-tag-label`, coordenadas em `text-tag-coords`.  
**Nunca:** Coordenadas em destaque maior que o status. Tabela com todas as colunas com peso visual igual.

---

### LINGUAGEM

#### Tipografia
**O que:** Fonte principal — **IBM Plex Mono** para dados (coordenadas, IDs, timestamps, valores numéricos). Fonte de interface — **DM Sans** para labels, títulos de seção, navegação e textos de apoio.  
**Por que:** IBM Plex Mono carrega o DNA técnico de telemetria — dados lidos como coordenadas de cockpit. DM Sans oferece o contraponto acolhedor e humano. A combinação evita tanto o frio corporativo puro quanto o casual genérico.  
**Como:** Dados em `font-mono`, interface em `font-sans`. Nunca misturar dentro do mesmo contexto semântico.  
**Nunca:** Inter ou Geist (genérico demais). Fonte serifada (errada para o contexto). Fonte mono para tudo (cansa).

#### Cores
Uma cor accent. Apenas uma. **Ciano elétrico** — a cor de um sinal de radar, de um cursor piscando em tela de sistema embarcado, do ponto vivo no mapa.

No modo light: base clara com o ciano aparecendo como "luz ativa" sobre o neutro.  
No modo dark: base muito escura (quase preta azulada) com o ciano aparecendo como sinal luminoso.

A transição entre modos mantém a mesma lógica: o ciano sempre é o pulso, o resto adapta a base.

**Nunca:** verde para "ativo" e vermelho para "inativo" como *identidade* (cores de status têm seu lugar funcional, mas não definem a marca). Azul + roxo + laranja para diferentes "tipos de TAG" — tudo usa a cor accent única.

#### Geometria
**O que:** Bordas levemente arredondadas mas não excessivamente. Cards com `radius-card` (8px). Botões com `radius-button` (6px). Badges de status com `radius-pill` (999px — pílula).  
**Por que:** Cantos retos demais remetem a planilha. Cantos muito arredondados parecem app de consumidor. 8px é o equilíbrio técnico-acolhedor.  
**Como:** Tokens de radius definidos acima. Aplicados via className nos overrides do shadcn.  
**Nunca:** rounded-full em cards. Cantos completamente retos em qualquer elemento interativo.

#### Profundidade
**O que:** Sombras usadas apenas em elementos flutuantes (modais, tooltips, dropdowns). Cards no painel principal não têm sombra — usam borda sutil (`border-default`). O mapa não tem sombra.  
**Por que:** Imita a linguagem de sistemas embarcados: interfaces de controle real não usam sombras decorativas. A profundidade vem da hierarquia de cores de superfície.  
**Como:** `shadow-float` apenas em z-index elevado. Cards usam `border-default` sem sombra.  
**Nunca:** shadow-md em cards padrão. Glow colorido em hover de items da lista.

#### Iconografia
**O que:** Ícones Lucide com stroke fino (`strokeWidth={1.5}`), tamanho padrão 18px. Ícones ativos recebem `text-accent-primary`. Ícones de status de TAG são customizados (ver conceito visual).  
**Por que:** Stroke fino combina com a precisão técnica do IBM Plex Mono. 18px garante leitura sem dominar.  
**Como:** Todos os ícones via `lucide-react`. Cor sempre via token, nunca hardcoded.  
**Nunca:** Ícones filled. Ícones muito grandes (24px+) em listas densas. Emojis.

---

### RIQUEZA VISUAL

#### Textura Ambiente
**O que:** Uma grade geodésica — linhas horizontais e verticais finas formando células de tamanho fixo, como as linhas de referência de um sistema de coordenadas cartesianas. Algumas interseções da grade possuem um ponto minúsculo, evocando coordenadas no plano.  
**Temática:** Rastreamento veicular é, fundamentalmente, trabalhar com coordenadas num espaço cartesiano. A grade *é* a linguagem do app — latitude, longitude, posição no espaço.  
**Tratamento:** Opacity de 4% sobre o fundo da página. Tamanho da célula: ~40px. Monocromática — usa apenas a cor de texto primário em opacidade muito baixa (nunca o ciano — esse fica reservado para elementos vivos). Fixa (não move com scroll). Presente em ambos os modos, ajustando apenas o valor da cor base.

---

#### Conceitos Visuais por Componente

##### TAG Card (item da lista de TAGs)
**Representa:** Uma TAG é um ser vivo na frota — ela está transmitindo agora, neste segundo. Não é um registro num banco. É um sinal que pulsa.  
**Metáfora visual:** Um ponto de radar com anel de pulso. Como a representação de sonar/radar onde um sinal é detectado e ondas se expandem a partir dele.  
**Cena detalhada:** No canto esquerdo do card, antes do nome da TAG, existe um indicador de status composto por: um círculo sólido central de 8px de diâmetro na cor `accent-primary` (quando ativa) ou `text-muted` com opacity 40% (quando inativa). Em volta do círculo central, um anel com borda de 1px na mesma cor, com diâmetro de 16px, opacity de 40%, animado em loop: ele expande de 16px para 28px enquanto vai de opacity 40% para 0% num ciclo de 1.8 segundos (easing ease-out). Esse anel existe apenas quando a TAG está com status ativo — quando inativa, apenas o ponto central sem animação. O card em si é retangular com `radius-card`, fundo `surface-card`, borda `border-subtle`. Na linha do nome, a fonte é DM Sans medium. Na linha de coordenadas abaixo, IBM Plex Mono em `text-muted` com tamanho reduzido.  
**Viabilidade:** CÓDIGO PURO (CSS animation + div aninhados)  
**Alternativa simplificada:** Se a animação de pulso não for viável, apenas o ponto central muda de tamanho: 8px quando ativo (solid accent), 6px quando inativo (muted).

---

##### Painel de Detalhe da TAG (tela de detalhes ao selecionar uma TAG)
**Representa:** A TAG selecionada é o sujeito em observação. Você está olhando para ela — sua posição precisa, seu histórico recente, seu estado de transmissão. É como uma ficha de missão.  
**Metáfora visual:** Uma "lupa" de radar sobre o ponto — o sistema fez zoom nessa TAG específica. No topo do painel, uma miniatura da posição da TAG representada como um ponto no centro de dois eixos cruzados (como mira de câmera ou reticulo de coordenadas), com as coordenadas precisas exibidas nos eixos.  
**Cena detalhada:** No cabeçalho do painel de detalhe, ocupando a faixa superior de ~120px de altura: um campo visual com fundo `surface-elevated`. No centro dessa faixa, dois eixos — uma linha horizontal e uma vertical — se cruzam no meio exato, formando quatro quadrantes. As linhas têm 1px de espessura e cor `accent-primary` em opacity 20%. No ponto de cruzamento, o ícone de pulso da TAG (círculo + anel animado, como descrito no TAG Card, mas maior: círculo de 12px, anel de 20px). À direita do eixo vertical, em IBM Plex Mono: o valor de longitude com label "LON" acima em `text-muted`. Abaixo do eixo horizontal, o valor de latitude com label "LAT" à esquerda em `text-muted`. Nos quatro cantos do retângulo, pequenas marcas de canto (como cantos de uma moldura de câmera fotográfica) — linhas de 8px em L, cor `border-default`.  
**Viabilidade:** CÓDIGO PURO (SVG inline + posicionamento absoluto)

---

##### Histórico de Transmissões (lista de posições recentes da TAG)
**Representa:** A TAG deixou rastros — uma trilha de onde esteve. Cada transmissão é um momento no tempo e no espaço. É um registro de movimento.  
**Metáfora visual:** Uma trilha vertical com nós — como um diagrama de timeline de rota, onde cada ponto é uma parada no tempo. Similar à representação de um trace de telemetria.  
**Cena detalhada:** À esquerda de cada item da lista de histórico, uma linha vertical conecta todos os itens de cima a baixo. A linha é `border-subtle` com 1px de largura, centralizada no eixo X do container da lista. Em cada item, na interseção com a linha vertical, existe um nó: um círculo de 6px preenchido com `surface-page` e borda de 1.5px em `border-default`. O nó mais recente (topo) tem borda em `accent-primary` — os demais em `border-default`. À direita do nó: timestamp em IBM Plex Mono na linha superior, coordenadas em IBM Plex Mono `text-muted` na linha inferior. A linha vertical *não* aparece acima do primeiro nó nem abaixo do último — ela conecta apenas os nós existentes, como uma corrente de eventos.  
**Viabilidade:** CÓDIGO PURO (div com border-left + nós posicionados relativamente)

---

##### Card de Resumo da Frota (dashboard overview)
**Representa:** A frota inteira como organismo. Quantas TAGs estão vivas agora, quantas silenciosas, qual a cobertura do sistema. É o pulso do sistema como um todo.  
**Metáfora visual:** Uma constelação — pontos distribuídos num espaço, alguns brilhando, outros apagados, conectados por linhas finas. Como um mapa de satélites em órbita visto de cima.  
**Cena detalhada:** Dentro do card, ocupando a metade direita da área (a metade esquerda tem os números de resumo), existe uma composição SVG de ~120x80px. Nela: 12 a 16 círculos distribuídos de forma orgânica mas equilibrada (não aleatória demais, não em grade perfeita). Os círculos ativos têm raio de 3px, preenchidos com `accent-primary`, opacity 90%. Os círculos inativos têm raio de 2px, preenchidos com `text-muted`, opacity 40%. Alguns círculos ativos estão conectados por linhas finas (1px, `accent-primary` em opacity 15%) — não todos, apenas 4-5 pares que formam um padrão de rede parcial. A proporção de círculos ativos vs inativos reflete dinamicamente os dados reais (via JavaScript que manipula as opacidades e raios). No canto superior direito da composição SVG, um texto em IBM Plex Mono pequeno mostrando "N/TOTAL" (ex: "8/14") em `accent-primary`.  
**Viabilidade:** CÓDIGO PURO (SVG inline com elementos dinâmicos via JS/React state)

---

##### Empty State (nenhuma TAG cadastrada ou filtro sem resultado)
**Representa:** O sistema está pronto mas em silêncio. Como uma antena aguardando o primeiro sinal. Não é erro — é um estado de expectativa.  
**Metáfora visual:** Uma antena de transmissão no centro, com ondas de sinal se expandindo — mas as ondas estão incompletas, como se o sinal ainda não chegou. Transmitindo, mas sem resposta.  
**Cena detalhada:** Centralizado na área vazia, um ícone SVG composto: uma antena estilizada geométrica — um triângulo invertido sobre uma linha vertical, simples, como um símbolo de torre de transmissão (não figurativo, geométrico). Abaixo da antena, três arcos concêntricos expandindo para cima (como ícone de WiFi, mas voltado para cima, como broadcast). Os arcos têm traço pontilhado (`stroke-dasharray="4 4"`), cor `text-muted`, opacity 30%. O conjunto ocupa ~80x80px. Abaixo do ícone, título em DM Sans "Nenhuma TAG encontrada" em `text-secondary`, e subtexto em DM Sans `text-muted`. Um botão de ação primário com `accent-primary`. O estado de vazio NÃO usa ilustração de pessoa, mascote ou imagem — apenas formas geométricas temáticas.  
**Viabilidade:** CÓDIGO PURO (SVG inline com path e arcos)

---

##### Card de Última Transmissão (widget de status em tempo real)
**Representa:** O sinal mais recente que chegou — o último "vivo" do sistema. É o batimento cardíaco do serviço.  
**Metáfora visual:** Um sinal de áudio/rádio chegando — como uma forma de onda de transmissão capturada no momento.  
**Cena detalhada:** No topo do card, uma barra horizontal de ~100% largura e ~32px de altura funciona como "osciloscópio" simplificado. Dentro dela: uma linha horizontal central (baseline) de 1px em `border-subtle`. Sobre essa baseline, uma forma de onda composta por 20-30 segmentos verticais de largura 2px com `gap` de 2px entre eles — cada segmento tem altura variada formando uma curva gaussiana: os segmentos no centro são mais altos (até 20px acima/abaixo da baseline), os das extremidades são quase na baseline (2-4px). A forma de onda usa `accent-primary` em opacity 70%. O segmento mais recente (extremidade direita) é o único completamente opaco (100%) e levemente maior — indica que "acaba de chegar". Os demais segmentos têm opacity decrescente da direita para a esquerda (mais antigos ficam mais apagados). Abaixo da forma de onda, em IBM Plex Mono: o timestamp exato da última transmissão e o ID da TAG que transmitiu.  
**Viabilidade:** CÓDIGO PURO (SVG com rects de altura calculada)

---

## Tokens de Design

### Cores — Fundos (Light Mode)
| Token | Valor | Uso |
|---|---|---|
| `surface-page` | `#F4F5F7` | Fundo principal da página |
| `surface-panel` | `#FFFFFF` | Painel lateral esquerdo, painel de detalhe |
| `surface-card` | `#FFFFFF` | Cards e itens de lista |
| `surface-elevated` | `#ECEEF1` | Fundo do cabeçalho de detalhe, áreas elevadas |
| `surface-sidebar` | `#1C1F26` | Sidebar de navegação (mesma no light e dark) |
| `surface-map` | `#E8ECF0` | Área do mapa |

### Cores — Fundos (Dark Mode)
| Token | Valor | Uso |
|---|---|---|
| `surface-page` | `#0D0F14` | Fundo principal — quase preto com leve azul |
| `surface-panel` | `#141720` | Painel lateral e de detalhe |
| `surface-card` | `#1A1E2B` | Cards e itens de lista |
| `surface-elevated` | `#1F2436` | Cabeçalho de detalhe, áreas elevadas |
| `surface-sidebar` | `#1C1F26` | Sidebar de navegação (mesma no light e dark) |
| `surface-map` | `#111420` | Área do mapa |

### Cores — Texto
| Token | Valor Light | Valor Dark | Uso |
|---|---|---|---|
| `text-primary` | `#0D0F14` | `#E8ECF5` | Títulos, labels principais |
| `text-secondary` | `#4A5168` | `#8B92A8` | Labels de apoio, nomes de seção |
| `text-muted` | `#8B92A8` | `#4A5168` | Hints, timestamps, coordenadas |
| `text-icon-default` | `#6B7280` | `#6B7280` | Ícones de navegação inativos |

### Cores — Accent (UMA COR APENAS — Ciano Técnico)
| Token | Valor | Uso |
|---|---|---|
| `accent-primary` | `#00D4D4` | Cor da marca — botões primários, nó ativo de histórico, ponto de radar ativo, ícone de nav ativo, badges |
| `accent-hover` | `#00BABA` | Hover state do accent |
| `accent-subtle` | `rgba(0, 212, 212, 0.10)` | Fundo translúcido do accent (badge background, hover tint de item de lista ativo) |
| `accent-glow` | `rgba(0, 212, 212, 0.15)` | Glow sutil apenas no indicador de pulso da TAG ativa — NOT em outros elementos |

### Cores — Status (APENAS para feedback funcional)
| Token | Valor | Uso |
|---|---|---|
| `status-success` | `#22C55E` | TAG com sinal confirmado, transmissão OK — APENAS quando comunicando resultado positivo |
| `status-error` | `#EF4444` | TAG sem sinal, falha de transmissão — APENAS quando comunicando problema |
| `status-warning` | `#F59E0B` | TAG com sinal intermitente, delay alto — APENAS quando comunicando alerta |

### Bordas
| Token | Valor Light | Valor Dark | Uso |
|---|---|---|---|
| `border-default` | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.08)` | Contornos padrão de cards e painéis |
| `border-subtle` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.04)` | Contornos de itens de lista, divisores |

### Geometria
| Token | Valor | Uso |
|---|---|---|
| `radius-card` | `8px` | Cards, painéis, itens de lista |
| `radius-button` | `6px` | Botões de ação |
| `radius-input` | `6px` | Inputs e selects |
| `radius-pill` | `999px` | Badges de status |
| `radius-tooltip` | `4px` | Tooltips |

### Sombras
| Token | Valor | Uso |
|---|---|---|
| `shadow-card` | nenhuma — apenas border | Cards padrão não usam sombra |
| `shadow-float` | `0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)` | Dropdowns, modais, tooltips |
| `shadow-panel` | `4px 0 16px rgba(0,0,0,0.06)` | Painéis laterais (light mode apenas) |

### Tipografia
| Token | Valor | Uso |
|---|---|---|
| `font-sans` | `DM Sans` | Labels, títulos de seção, navegação, textos de interface |
| `font-mono` | `IBM Plex Mono` | Coordenadas, IDs de TAG, timestamps, valores numéricos de telemetria |
| `text-tag-status` | `font-mono, 11px, text-muted` | Status textual da TAG (ex: "ATIVO", "SEM SINAL") |
| `text-tag-label` | `font-sans, 14px, font-medium, text-primary` | Nome/ID da TAG na lista |
| `text-tag-coords` | `font-mono, 11px, text-muted` | Coordenadas na linha de detalhe |

### Durations / Animações
| Token | Valor | Uso |
|---|---|---|
| `duration-sidebar` | `200ms` | Expansão da sidebar |
| `duration-pulse` | `1800ms` | Ciclo do anel de pulso da TAG ativa |
| `duration-enter` | `150ms` | Micro-interações de entrada de elementos |

---

## Componentes Shadcn — Overrides

| Componente | Override (usando tokens) |
|---|---|
| `<Card>` | `bg-surface-card border border-border-default rounded-[radius-card] shadow-none` |
| `<Button variant="default">` | `bg-accent-primary text-[#0D0F14] rounded-[radius-button] font-sans font-medium hover:bg-accent-hover` |
| `<Button variant="ghost">` | `hover:bg-accent-subtle text-text-secondary hover:text-text-primary rounded-[radius-button]` |
| `<Badge>` | `bg-accent-subtle text-accent-primary rounded-[radius-pill] font-mono text-[11px] border-0` |
| `<Input>` | `bg-surface-elevated border-border-default rounded-[radius-input] font-mono text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:ring-0` |
| `<Tooltip>` | `bg-surface-elevated border-border-default text-text-primary rounded-[radius-tooltip] shadow-float font-sans text-[12px]` |

---

## Regra de Ouro

Ao criar qualquer tela ou componente do TAG MANAGER:

1. Siga TODAS as decisões de identidade — estrutura assimétrica (35/65), sidebar colapsada, linguagem de telemetria
2. Use shadcn/ui como base, customizado via className com tokens semânticos
3. APENAS tokens semânticos — nunca valores crus como `#00D4D4` direto no JSX
4. UMA cor accent (ciano `#00D4D4`) para tudo que é vivo/ativo — o resto é neutro
5. Componentes importantes DEVEM ter CONCEITO VISUAL — o pulso da TAG, a trilha de histórico, a constelação da frota
6. NÃO substitua conceito por decoração genérica — o ciano não aparece como gradiente de fundo; aparece como ponto vivo, como sinal transmitindo
7. A IA implementadora é RESPONSÁVEL por criar os SVGs das cenas descritas — não terceirize para assets externos sem necessidade
8. **Cada TAG é um sinal vivo — a interface escuta, não apenas exibe.**

---

## Teste Final

Coloque a interface ao lado de um dashboard shadcn padrão. A diferença deve ser óbvia em TRÊS níveis:

- **ESTRUTURA:** Layout assimétrico 35/65 com sidebar colapsada de ícones — não um grid de cards nem uma tabela com header
- **LINGUAGEM:** IBM Plex Mono para dados de telemetria + DM Sans para interface, uma única cor ciano técnico sobre base neutra escura/clara — não Inter, não gradientes, não paleta de categorias
- **RIQUEZA:** Cada TAG card pulsa com anel de radar animado; o painel de detalhe tem reticulo de coordenadas; o histórico tem trilha de nós conectados; o card de frota tem constelação de pontos dinâmica — nenhum desses conceitos visuais poderia estar em "qualquer dashboard"

Se os cards tiverem blobs e dot grids mas NÃO tiverem os conceitos de pulso/trilha/constelação descritos, está INCOMPLETO.  
Se a interface usar cores diferentes para tipos de TAG além do ciano accent + status funcional, está ERRADO.
