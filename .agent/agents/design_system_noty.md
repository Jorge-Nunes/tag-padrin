# Design System - NCTY Sistema de Cobrança Automatizada

## Visão Geral

Sistema B2B para gestão de cobranças, pagamentos e relacionamento com clientes via WhatsApp. Interface profissional com foco em dashboards analíticos e visualização de dados financeiros.

**Personalidade da marca:**
- Profissional e confiável
- Dados claros e objetivos
- Interface moderna mas não excessivamente colorida
- Foco em produtividade e eficiência

---

## Paleta de Cores

### Mapeamento: Valores → Tokens

#### Texto
- **text-primary**: `#1F2937` (gray-800) - Títulos, labels, texto principal
- **text-secondary**: `#6B7280` (gray-500) - Subtextos, descrições
- **text-muted**: `#9CA3AF` (gray-400) - Placeholders, hints, disabled
- **text-on-dark**: `#FFFFFF` - Texto sobre sidebar escura
- **text-on-brand**: `#FFFFFF` - Texto sobre botões coloridos

#### Superfícies
- **surface-page**: `#F3F4F6` (gray-100) - Fundo principal
- **surface-section**: `#FFFFFF` - Fundo de seções/cards brancos
- **surface-card**: `#FFFFFF` - Cards (mesmo que section neste caso)
- **surface-subtle**: `#F9FAFB` (gray-50) - Fundos sutis, hover states
- **surface-elevated**: `#FFFFFF` + shadow-md - Modais, dropdowns

#### Ações
- **action-primary**: `#3B82F6` (blue-500) - Botões primários, links
- **action-primary-hover**: `#2563EB` (blue-600)
- **action-primary-active**: `#1D4ED8` (blue-700)
- **action-secondary**: `#FFFFFF` com border-default - Botões secundários
- **action-strong**: `#1F2937` (gray-800) - CTAs importantes (ex: "Sincronizar")
- **action-strong-hover**: `#111827` (gray-900)

#### Bordas
- **border-default**: `#E5E7EB` (gray-200) - Bordas padrão
- **border-subtle**: `#F3F4F6` (gray-100) - Bordas muito sutis
- **border-focus**: `#3B82F6` (blue-500) - Focus ring

#### Status (cores dos cards de métricas)
- **status-success**: `#10B981` (green-500) - Pagos, sucesso
- **status-warning**: `#F59E0B` (amber-500) - Alertas
- **status-error**: `#EF4444` (red-500) - Atrasados, erros
- **status-info**: `#3B82F6` (blue-500) - Informações gerais
- **status-info-alt**: `#06B6D4` (cyan-500) - Taxa recuperação
- **status-accent**: `#8B5CF6` (purple-500) - ROI, valores estimados

---

## Componentes

### 1. Sidebar de Navegação

**Estrutura:**
```
Background: #1F2937 (gray-800)
Width: 240px (desktop), full-width (mobile)
Padding: space-4 vertical, space-3 horizontal

Logo:
- Padding: space-6 vertical
- Background: rgba(255,255,255,0.05) ao hover

Item de Menu:
- Padding: space-3 vertical, space-4 horizontal
- Text: text-on-dark, text-sm, font-medium
- Radius: radius-md
- Hover: rgba(255,255,255,0.1)
- Active: action-primary + text-on-brand
- Icon: space-3 de gap do texto
```

**Estados:**
- Default: text-on-dark com opacity 80%
- Hover: background sutil + opacity 100%
- Active: background action-primary
- Focus: border-focus ring

---

### 2. Card de Métrica (Dashboard)

**Estrutura:**
```
Background: Cor do status (veja mapeamento abaixo)
Border-radius: radius-xl
Padding: space-6
Shadow: shadow-card
Min-height: 120px

Título:
- Text: text-on-brand, text-sm, font-medium
- Opacity: 90%

Valor Principal:
- Text: text-on-brand, text-4xl, font-bold
- Margin-top: space-2

Subtexto:
- Text: text-on-brand, text-xs, font-normal
- Opacity: 80%
- Margin-top: space-1

Ícone decorativo:
- Position: absolute, top-right
- Opacity: 15-20%
- Size: 48-64px
```

**Mapeamento de cores por tipo:**
- Total Clientes: status-info (azul)
- Pagos: status-success (verde)
- Taxa Recuperação: status-info-alt (cyan)
- Atrasados: status-error (vermelho)
- ROI Estimado: status-accent (roxo)

**Estados:**
- Default: estado normal
- Hover: shadow-card-hover + transform: translateY(-2px)
- Active: scale(0.98)

---

### 3. Card de Conteúdo (Gráficos, Listas)

**Estrutura:**
```
Background: surface-card
Border: 1px solid border-default
Border-radius: radius-lg
Padding: space-6
Shadow: shadow-sm

Header do Card:
- Padding-bottom: space-4
- Border-bottom: 1px solid border-subtle
- Title: text-primary, text-lg, font-semibold

Conteúdo:
- Padding-top: space-6
```

**Variações:**
- Sem borda: remover border para visual mais limpo
- Com sombra: usar shadow-md ao invés de shadow-sm

---

### 4. Botões

#### Botão Primário
```
Background: action-primary
Color: text-on-brand
Padding: space-3 vertical, space-6 horizontal
Border-radius: radius-md
Font: text-base, font-semibold
Shadow: shadow-button-primary

Estados:
- Hover: action-primary-hover
- Active: action-primary-active
- Focus: border-focus ring (4px)
- Disabled: opacity 50%, cursor not-allowed
```

#### Botão Strong (CTA - ex: "Sincronizar")
```
Background: action-strong
Color: text-on-brand
Padding: space-3 vertical, space-6 horizontal
Border-radius: radius-md
Font: text-base, font-semibold
Shadow: shadow-lg

Estados:
- Hover: action-strong-hover + shadow-lg maior
- Active: action-strong + scale(0.97)
- Focus: border-focus ring
```

#### Botão Secondary
```
Background: surface-card
Color: text-primary
Border: 1px solid border-default
Padding: space-3 vertical, space-6 horizontal
Border-radius: radius-md
Font: text-base, font-medium

Estados:
- Hover: surface-subtle
- Active: border-default mais escura
- Focus: border-focus ring
```

#### Botão Ghost/Link
```
Background: transparent
Color: action-primary
Padding: space-2 vertical, space-3 horizontal
Font: text-sm, font-medium

Estados:
- Hover: surface-subtle
- Active: action-primary-active no texto
```

---

### 5. Badge de Status

**Estrutura:**
```
Padding: space-1 vertical, space-3 horizontal
Border-radius: radius-full
Font: text-xs, font-medium
Display: inline-flex
Align-items: center
Gap: space-1 (se tiver ícone)
```

**Variações:**
- **Success (Enviado)**: bg status-success com 10% opacity, text status-success
- **Warning (Pendente)**: bg status-warning com 10% opacity, text status-warning
- **Error (Bloqueado)**: bg status-error com 10% opacity, text status-error
- **Info (Ativo)**: bg status-info com 10% opacity, text status-info

---

### 6. Alert/Banner Informativo

```
Background: status-success com 10% opacity
Border-left: 4px solid status-success
Padding: space-4
Border-radius: radius-md
Font: text-sm
Color: text-primary
Icon: status-success
Gap: space-3 entre ícone e texto
```

**Variações por tipo:**
- Success: verde (como mostrado)
- Warning: status-warning
- Error: status-error
- Info: status-info

---

### 7. Lista de Atividades Recentes

**Item:**
```
Padding: space-4
Border-bottom: 1px solid border-subtle
Display: flex
Gap: space-3

Avatar/Ícone:
- Size: 40px
- Border-radius: radius-full
- Background: surface-subtle
- Color: text-secondary

Conteúdo:
- Título: text-sm, font-medium, text-primary
- Subtexto: text-xs, text-secondary
- Margin-top: space-1 entre título e subtexto

Badge de Status:
- Position: à direita
- Vertical align: center

Timestamp:
- Text: text-xs, text-muted
- Position: top-right
```

**Estados:**
- Hover: surface-subtle background
- Active: border-subtle mais escura

---

### 8. Gráfico de Linha (Evolução de Receita)

**Container:**
```
Background: surface-card
Padding: space-6
Border-radius: radius-lg
```

**Elementos:**
- Linha: action-primary com 2px de largura
- Área preenchida: action-primary com 5% opacity
- Grid: border-subtle
- Labels eixos: text-muted, text-xs
- Título: text-primary, text-lg, font-semibold

---

### 9. Gráfico Donut (Status da Frota)

**Estrutura:**
```
Center:
- Valor: text-3xl, font-bold, text-primary
- Label: text-sm, text-secondary

Cores dos segmentos:
- Ativos: status-success
- Bloqueados: status-error

Legendas:
- Gap: space-4 entre items
- Indicador: 12px circle
- Label: text-sm, text-secondary
- Valor: text-sm, font-semibold, text-primary
```

---

### 10. Input/Campo de Formulário

**Estrutura:**
```
Background: surface-card
Border: 1px solid border-default
Border-radius: radius-sm
Padding: space-3 vertical, space-4 horizontal
Font: text-base
Color: text-primary
Width: 100%

Placeholder:
- Color: text-muted
- Font: text-base

Label:
- Text: text-sm, font-medium, text-primary
- Margin-bottom: space-2
```

**Estados:**
- Default: border-default
- Hover: border mais escura
- Focus: border-focus + shadow-sm
- Error: border status-error + shadow vermelha
- Disabled: surface-subtle + text-muted + cursor not-allowed

---

### 11. Dropdown/Select

```
Base: Mesmo que Input
Icon (seta): text-secondary
Padding-right: space-8 (para acomodar ícone)

Menu dropdown:
- Background: surface-elevated
- Border: 1px solid border-default
- Border-radius: radius-md
- Shadow: shadow-lg
- Padding: space-2

Item:
- Padding: space-3 horizontal, space-2 vertical
- Hover: surface-subtle
- Selected: action-primary com 10% opacity
```

---

### 12. Modal/Dialog

**Overlay:**
```
Background: rgba(0,0,0,0.5)
Backdrop-filter: blur(4px)
```

**Container:**
```
Background: surface-elevated
Border-radius: radius-xl
Shadow: shadow-lg
Max-width: 600px
Padding: space-8

Header:
- Text: text-2xl, font-semibold, text-primary
- Padding-bottom: space-6
- Border-bottom: 1px solid border-subtle

Body:
- Padding: space-6 vertical

Footer:
- Padding-top: space-6
- Border-top: 1px solid border-subtle
- Display: flex
- Gap: space-3
- Justify-content: flex-end
```

---

### 13. Table/Tabela

**Estrutura:**
```
Container:
- Background: surface-card
- Border: 1px solid border-default
- Border-radius: radius-lg
- Overflow: hidden

Header:
- Background: surface-subtle
- Padding: space-3 vertical, space-4 horizontal
- Font: text-sm, font-semibold, text-secondary
- Border-bottom: 1px solid border-default

Row:
- Padding: space-4
- Border-bottom: 1px solid border-subtle
- Font: text-sm, text-primary

Hover:
- Background: surface-subtle
```

---

## Espaçamento e Grid

### Layout Principal
```
Container: max-width 1440px
Padding lateral: space-8 (desktop), space-4 (mobile)
Gap entre seções: space-12
```

### Grid de Cards de Métricas
```
Display: grid
Columns: 4 (desktop), 2 (tablet), 1 (mobile)
Gap: space-6
Margin-bottom: space-8
```

### Grid de Conteúdo (gráficos + listas)
```
Display: grid
Columns: 2fr 1fr (desktop), 1fr (mobile)
Gap: space-6
```

---

## Tipografia

### Hierarquia Visual

**Headers:**
- H1 (Título principal): text-4xl, font-bold, text-primary
- H2 (Título de seção): text-3xl, font-semibold, text-primary
- H3 (Título de card): text-xl, font-semibold, text-primary
- H4 (Subtítulo): text-lg, font-medium, text-primary

**Body:**
- Parágrafo: text-base, font-normal, text-primary
- Descrição/Caption: text-sm, font-normal, text-secondary
- Label: text-sm, font-medium, text-primary
- Helper text: text-xs, text-muted

---

## Responsividade Completa

### Breakpoints
```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
Large Desktop: > 1440px
```

### Sistema de Layout Responsivo

#### Container Principal
```css
/* Mobile First */
.container {
  width: 100%;
  padding: var(--space-4);
  max-width: 1440px;
  margin: 0 auto;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}
```

#### Grid System Adaptativo
```css
/* Cards de Métrica */
.metrics-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr; /* Mobile: 1 coluna */
}

@media (min-width: 640px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr); /* Mobile landscape: 2 colunas */
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr); /* Desktop: 4 colunas */
  }
}

@media (min-width: 1440px) {
  .metrics-grid {
    grid-template-columns: repeat(5, 1fr); /* Large: 5 colunas */
  }
}
```

#### Layout de Conteúdo (Gráfico + Sidebar)
```css
.content-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr; /* Mobile: stack vertical */
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 2fr 1fr; /* Desktop: 66% / 33% */
  }
}
```

### Adaptações por Componente

#### 1. Sidebar/Navegação
```
Mobile (< 768px):
- Hidden por padrão
- Overlay full-screen quando aberto
- Menu hambúrguer no header
- Z-index: 1000
- Backdrop blur
- Animation: slide-in from left

Tablet/Desktop (≥ 768px):
- Fixed sidebar (240px width)
- Sempre visível
- Content com margin-left: 240px
```

**Código Mobile:**
```css
.sidebar {
  position: fixed;
  top: 0;
  left: -100%;
  width: 280px;
  height: 100vh;
  background: #1F2937;
  transition: left 0.3s ease;
  z-index: 1000;
}

.sidebar.open {
  left: 0;
}

.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
}

.sidebar-backdrop.active {
  display: block;
}

@media (min-width: 768px) {
  .sidebar {
    left: 0;
    width: 240px;
  }
  
  .sidebar-backdrop {
    display: none !important;
  }
  
  .main-content {
    margin-left: 240px;
  }
}
```

#### 2. Header Mobile
```
Mobile:
- Fixed top
- Height: 64px
- Padding: space-4
- Box-shadow: shadow-sm
- Itens:
  - Menu hambúrguer (esquerda)
  - Logo (centro)
  - Avatar/notificações (direita)

Desktop:
- Height: 72px
- Padding: space-6
- Alinhamento diferente
```

#### 3. Cards de Métrica
```
Mobile:
- Full width
- Min-height: 100px
- Padding: space-4
- Font ajustado:
  - Label: text-xs
  - Valor: text-3xl
  - Subtitle: text-xs

Tablet/Desktop:
- Min-height: 120px
- Padding: space-6
- Font original mantido
```

#### 4. Tabelas
```
Mobile (< 768px):
- Converter para cards empilhados
- Cada row vira um card
- Labels inline antes de cada valor
- Scroll horizontal como fallback

Desktop:
- Tabela tradicional
- Sticky header
- Hover states
```

**Exemplo Mobile:**
```css
/* Mobile: Cards */
@media (max-width: 767px) {
  .table-responsive {
    display: block;
  }
  
  .table-responsive thead {
    display: none;
  }
  
  .table-responsive tbody,
  .table-responsive tr {
    display: block;
  }
  
  .table-responsive tr {
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }
  
  .table-responsive td {
    display: flex;
    justify-content: space-between;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--border-subtle);
  }
  
  .table-responsive td::before {
    content: attr(data-label);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
  }
}

/* Desktop: Tabela normal */
@media (min-width: 768px) {
  .table-responsive {
    display: table;
  }
}
```

#### 5. Modais/Dialogs
```
Mobile:
- Full-screen ou bottom-sheet
- Border-radius apenas no topo
- Altura automática (max 90vh)
- Padding: space-4

Desktop:
- Centrado
- Max-width: 600px
- Border-radius: radius-xl
- Padding: space-8
```

#### 6. Formulários
```
Mobile:
- Inputs full-width
- Botões full-width
- Stack vertical
- Font-size: 16px (evita zoom no iOS)

Desktop:
- Inputs com max-width
- Botões inline quando fizer sentido
- Grid 2 colunas para campos relacionados
```

#### 7. Botões
```
Mobile:
- Altura mínima: 44px (touch target)
- Padding vertical: space-3
- Full-width em formulários
- Stack vertical em grupos

Desktop:
- Altura mínima: 40px
- Inline em grupos
- Gap: space-3 entre botões
```

#### 8. Gráficos
```
Mobile:
- Altura fixa menor (240px)
- Font-size reduzido nos labels
- Menos markers no eixo X
- Tooltip otimizado para touch

Desktop:
- Altura automática ou maior (320px)
- Todos os labels visíveis
- Hover states completos
```

### Touch Targets (Mobile)

**Tamanhos mínimos:**
```
Botões: 44px × 44px
Links: 44px height (pode ser width menor)
Checkboxes/Radios: 24px × 24px com padding
Icons clicáveis: 44px × 44px hit area
```

**Implementação:**
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Para elementos menores, aumentar área clicável */
.icon-button {
  padding: var(--space-3);
  min-width: 44px;
  min-height: 44px;
}
```

### Tipografia Responsiva

```css
/* Mobile */
:root {
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 16px; /* Mínimo 16px no mobile para evitar zoom */
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 22px;
  --text-3xl: 26px;
  --text-4xl: 32px;
  --text-5xl: 40px;
}

/* Desktop */
@media (min-width: 1024px) {
  :root {
    --text-xs: 12px;
    --text-sm: 14px;
    --text-base: 16px;
    --text-lg: 18px;
    --text-xl: 20px;
    --text-2xl: 24px;
    --text-3xl: 30px;
    --text-4xl: 36px;
    --text-5xl: 48px;
  }
}
```

### Espaçamento Responsivo

```css
/* Mobile: espaçamentos menores */
.section-spacing {
  padding: var(--space-8) 0; /* 32px */
}

.card-spacing {
  padding: var(--space-4); /* 16px */
}

/* Desktop: espaçamentos maiores */
@media (min-width: 1024px) {
  .section-spacing {
    padding: var(--space-16) 0; /* 64px */
  }
  
  .card-spacing {
    padding: var(--space-6); /* 24px */
  }
}
```

---

## Acessibilidade

### Contraste Mínimo
- Texto normal: 4.5:1
- Texto grande: 3:1
- Elementos interativos: 3:1

### Focus States
```
Outline: 4px solid border-focus
Outline-offset: 2px
Border-radius: herdar do componente
```

### Estados Disabled
```
Opacity: 50%
Cursor: not-allowed
Remover hover/active states
Adicionar aria-disabled="true"
```

---

## Animações e Transições

### Padrão
```
Transition: all 0.2s ease-in-out
```

### Casos específicos:
- **Hover de cards**: transform + shadow (0.3s)
- **Modais**: fade in (0.2s) + scale (0.2s)
- **Dropdowns**: slide down (0.15s)
- **Loading**: spin infinito (1s linear)

---

## Iconografia

### Tamanhos
- Icon-sm: 16px (inline com texto)
- Icon-base: 20px (botões, inputs)
- Icon-lg: 24px (títulos, navegação)
- Icon-xl: 32px (ícones decorativos)

### Estilo
- Line weight: 2px
- Style: Outlined (não filled)
- Cor: herdar do texto pai

---

## Exemplos de Uso Responsivo

### 1. Dashboard Analytics Card (Responsivo)

**HTML:**
```html
<div class="metric-card metric-card--blue">
  <div class="metric-card__header">
    <span class="metric-card__label">TOTAL CLIENTES</span>
  </div>
  <div class="metric-card__body">
    <h2 class="metric-card__value">1</h2>
    <p class="metric-card__subtitle">1 conectado</p>
  </div>
  <div class="metric-card__icon">
    <svg><!-- ícone decorativo --></svg>
  </div>
</div>
```

**CSS Responsivo:**
```css
.metric-card {
  background: var(--status-info);
  border-radius: var(--radius-xl);
  padding: var(--space-4); /* Mobile: menor */
  box-shadow: var(--shadow-card);
  position: relative;
  transition: all 0.3s ease;
  min-height: 100px;
}

/* Desktop */
@media (min-width: 1024px) {
  .metric-card {
    padding: var(--space-6);
    min-height: 120px;
  }
  
  .metric-card:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-2px);
  }
}

.metric-card__label {
  color: var(--text-on-brand);
  font-size: var(--text-xs); /* Mobile: menor */
  font-weight: var(--font-medium);
  opacity: 0.9;
}

@media (min-width: 1024px) {
  .metric-card__label {
    font-size: var(--text-sm);
  }
}

.metric-card__value {
  color: var(--text-on-brand);
  font-size: var(--text-3xl); /* Mobile */
  font-weight: var(--font-bold);
  margin-top: var(--space-2);
}

@media (min-width: 1024px) {
  .metric-card__value {
    font-size: var(--text-4xl);
  }
}

.metric-card__icon {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  opacity: 0.15;
  width: 40px;
  height: 40px;
}

@media (min-width: 1024px) {
  .metric-card__icon {
    width: 56px;
    height: 56px;
  }
}
```

### 2. Layout Completo Responsivo

**HTML:**
```html
<div class="app-wrapper">
  <!-- Mobile Header -->
  <header class="mobile-header">
    <button class="hamburger-menu">☰</button>
    <img src="logo.svg" class="logo" />
    <button class="avatar-btn">👤</button>
  </header>

  <!-- Sidebar -->
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Dashboard</span>
      </a>
      <!-- mais items -->
    </nav>
  </aside>

  <!-- Backdrop (mobile only) -->
  <div class="sidebar-backdrop"></div>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Grid de métricas -->
      <div class="metrics-grid">
        <div class="metric-card">...</div>
        <div class="metric-card">...</div>
        <div class="metric-card">...</div>
        <div class="metric-card">...</div>
      </div>

      <!-- Grid de conteúdo -->
      <div class="content-grid">
        <div class="chart-card">...</div>
        <div class="activities-card">...</div>
      </div>
    </div>
  </main>
</div>
```

**CSS Completo:**
```css
/* === LAYOUT BASE === */
.app-wrapper {
  min-height: 100vh;
  background: var(--surface-page);
}

/* === MOBILE HEADER === */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 var(--space-4);
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-default);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

@media (min-width: 768px) {
  .mobile-header {
    display: none; /* Esconde no desktop */
  }
}

.hamburger-menu {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
}

/* === SIDEBAR === */
.sidebar {
  position: fixed;
  top: 0;
  left: -100%;
  width: 280px;
  height: 100vh;
  background: #1F2937;
  transition: left 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding: var(--space-6) 0;
}

.sidebar.open {
  left: 0;
}

@media (min-width: 768px) {
  .sidebar {
    left: 0;
    width: 240px;
    z-index: 50;
  }
}

.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.sidebar-backdrop.active {
  display: block;
}

@media (min-width: 768px) {
  .sidebar-backdrop {
    display: none !important;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  margin: 0 var(--space-3);
  color: var(--text-on-dark);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  opacity: 0.8;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.nav-item.active {
  background: var(--action-primary);
  color: var(--text-on-brand);
  opacity: 1;
}

/* === MAIN CONTENT === */
.main-content {
  padding-top: 64px; /* Mobile: espaço pro header */
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 240px; /* Desktop: espaço pra sidebar */
    padding-top: 0;
  }
}

.container {
  padding: var(--space-4);
  max-width: 1440px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}

/* === GRIDS === */
.metrics-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
  margin-bottom: var(--space-6);
}

@media (min-width: 640px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: var(--space-8);
  }
}

@media (min-width: 1440px) {
  .metrics-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.content-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 2fr 1fr;
  }
}
```

### 3. Tabela Responsiva (Mobile = Cards)

**HTML:**
```html
<div class="table-wrapper">
  <table class="table-responsive">
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Status</th>
        <th>Valor</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Cliente">Jorge Carlos</td>
        <td data-label="Status">
          <span class="badge badge--success">Pago</span>
        </td>
        <td data-label="Valor">R$ 150,00</td>
        <td data-label="Data">24/01/2026</td>
      </tr>
      <!-- mais linhas -->
    </tbody>
  </table>
</div>
```

**CSS:**
```css
/* Mobile: Cards empilhados */
@media (max-width: 767px) {
  .table-responsive {
    display: block;
    border: none;
  }
  
  .table-responsive thead {
    display: none;
  }
  
  .table-responsive tbody,
  .table-responsive tr {
    display: block;
  }
  
  .table-responsive tr {
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }
  
  .table-responsive td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) 0;
    border: none;
    text-align: right;
  }
  
  .table-responsive td:not(:last-child) {
    border-bottom: 1px solid var(--border-subtle);
  }
  
  .table-responsive td::before {
    content: attr(data-label);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    text-align: left;
  }
}

/* Desktop: Tabela normal */
@media (min-width: 768px) {
  .table-responsive {
    width: 100%;
    border-collapse: collapse;
    background: var(--surface-card);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  
  .table-responsive thead {
    background: var(--surface-subtle);
  }
  
  .table-responsive th {
    padding: var(--space-3) var(--space-4);
    text-align: left;
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-default);
  }
  
  .table-responsive td {
    padding: var(--space-4);
    font-size: var(--text-sm);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-subtle);
  }
  
  .table-responsive tr:hover {
    background: var(--surface-subtle);
  }
}
```

### 4. Formulário Responsivo

**HTML:**
```html
<form class="form-responsive">
  <div class="form-row">
    <div class="form-group">
      <label for="nome">Nome do Cliente</label>
      <input type="text" id="nome" placeholder="Digite o nome">
    </div>
    
    <div class="form-group">
      <label for="email">E-mail</label>
      <input type="email" id="email" placeholder="email@exemplo.com">
    </div>
  </div>
  
  <div class="form-group">
    <label for="valor">Valor da Cobrança</label>
    <input type="text" id="valor" placeholder="R$ 0,00">
  </div>
  
  <div class="form-actions">
    <button type="button" class="btn btn--secondary">Cancelar</button>
    <button type="submit" class="btn btn--primary">Criar Cobrança</button>
  </div>
</form>
```

**CSS:**
```css
.form-responsive {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr; /* Mobile: 1 coluna */
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr); /* Desktop: 2 colunas */
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.form-group input {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
  font-size: 16px; /* Importante: 16px evita zoom no iOS */
  color: var(--text-primary);
  transition: all 0.2s;
  min-height: 44px; /* Touch target */
}

.form-group input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  flex-direction: column-reverse; /* Mobile: secundário embaixo */
  gap: var(--space-3);
  margin-top: var(--space-4);
}

@media (min-width: 768px) {
  .form-actions {
    flex-direction: row; /* Desktop: inline */
    justify-content: flex-end;
  }
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px; /* Touch target */
  width: 100%; /* Mobile: full width */
}

@media (min-width: 768px) {
  .btn {
    width: auto; /* Desktop: auto width */
  }
}

.btn--primary {
  background: var(--action-primary);
  color: var(--text-on-brand);
}

.btn--primary:hover {
  background: var(--action-primary-hover);
}

.btn--secondary {
  background: var(--surface-card);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.btn--secondary:hover {
  background: var(--surface-subtle);
}
```

---

## JavaScript para Responsividade

### 1. Toggle da Sidebar (Mobile)

```javascript
// Seleciona elementos
const hamburgerBtn = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');
const backdrop = document.querySelector('.sidebar-backdrop');

// Função para abrir/fechar sidebar
function toggleSidebar() {
  sidebar.classList.toggle('open');
  backdrop.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

// Event listeners
hamburgerBtn?.addEventListener('click', toggleSidebar);
backdrop?.addEventListener('click', toggleSidebar);

// Fecha ao pressionar ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('open')) {
    toggleSidebar();
  }
});

// Fecha ao redimensionar para desktop
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768 && sidebar.classList.contains('open')) {
    toggleSidebar();
  }
});
```

### 2. Detecção de Dispositivo

```javascript
// Utilitário para detectar tipo de dispositivo
const device = {
  isMobile: () => window.innerWidth < 768,
  isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
  isDesktop: () => window.innerWidth >= 1024,
  
  // Detecta touch device
  isTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

// Uso:
if (device.isMobile()) {
  // Código específico mobile
  console.log('Mobile detected');
}
```

### 3. Lazy Loading para Gráficos (Performance)

```javascript
// Só renderiza gráficos quando visíveis (ótimo para mobile)
const observerOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1
};

const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Renderiza o gráfico
      const chartId = entry.target.dataset.chartId;
      renderChart(chartId);
      
      // Para de observar após renderizar
      chartObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observa todos os containers de gráficos
document.querySelectorAll('[data-chart-id]').forEach(chart => {
  chartObserver.observe(chart);
});
```

### 4. Scroll Suave em Navegação

```javascript
// Scroll suave ao clicar em links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      // Fecha sidebar mobile antes de scrollar
      if (device.isMobile() && sidebar.classList.contains('open')) {
        toggleSidebar();
      }
      
      // Scroll suave
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
```

---

## Prompts para IA Implementar Responsividade

### Para Claude/ChatGPT:

**Prompt 1 - Tornar componente responsivo:**
```
Usando o Design System NCTY (tokens semânticos), torne este componente [NOME_COMPONENTE] totalmente responsivo:

Requisitos:
- Mobile-first
- Breakpoints: 768px (tablet) e 1024px (desktop)
- Touch targets mínimos de 44px no mobile
- Use APENAS os tokens do design system (space-*, text-*, etc)
- Adapte layout de grid/flex conforme breakpoint
- Mantenha acessibilidade (focus states, contrast)

[Cole seu código HTML/CSS aqui]
```

**Prompt 2 - Layout completo responsivo:**
```
Crie um layout responsivo completo para a página [NOME_PÁGINA] seguindo o Design System NCTY:

Mobile (< 768px):
- Sidebar em overlay com hamburger menu
- Cards em 1 coluna
- Tabelas como cards empilhados
- Formulários full-width

Desktop (≥ 1024px):
- Sidebar fixa (240px)
- Grid de 4 colunas para métricas
- Tabelas tradicionais
- Formulários em 2 colunas

Use APENAS os tokens semânticos definidos. Inclua HTML, CSS e JavaScript necessário.
```

**Prompt 3 - Adaptar tela existente:**
```
Tenho esta tela [DESCREVA/COLE SCREENSHOT] que precisa funcionar perfeitamente em mobile e desktop.

Analisando o Design System NCTY fornecido:
1. Identifique todos os componentes na tela
2. Mapeie-os para os tokens corretos
3. Crie versões responsivas de cada um
4. Gere o código HTML/CSS completo
5. Adicione JavaScript se necessário (sidebar, modais, etc)

Regras:
- Nunca use valores hardcoded (16px, #333, etc)
- SEMPRE use os tokens (space-4, text-primary, etc)
- Mobile-first approach
- Touch-friendly no mobile (44px min)
```

**Prompt 4 - Debugging responsivo:**
```
Este componente não está funcionando bem no mobile:

[COLE O CÓDIGO]

Problemas identificados:
- [liste os problemas: texto pequeno, botão difícil de clicar, etc]

Usando o Design System NCTY, corrija aplicando:
- Tokens de espaçamento corretos
- Touch targets adequados
- Tipografia responsiva
- Layout adaptativo

Forneça o código corrigido.
```

---

## Checklist Responsividade

### Mobile (< 768px)
- [ ] Sidebar em overlay com backdrop
- [ ] Header fixo com 64px de altura
- [ ] Touch targets mínimos de 44px
- [ ] Font-size base de 16px (evita zoom iOS)
- [ ] Botões full-width em formulários
- [ ] Cards em 1 coluna
- [ ] Tabelas como cards empilhados
- [ ] Modais full-screen ou bottom-sheet
- [ ] Padding reduzido (space-4)
- [ ] Gráficos com altura menor (240px)

### Tablet (768px - 1024px)
- [ ] Sidebar fixa ou colapsável
- [ ] Grid de 2 colunas para cards
- [ ] Tabelas tradicionais começam a aparecer
- [ ] Formulários podem ser 2 colunas
- [ ] Padding intermediário (space-6)

### Desktop (≥ 1024px)
- [ ] Sidebar sempre visível (240px)
- [ ] Grid de 4-5 colunas para métricas
- [ ] Hover states completos
- [ ] Tooltips ao invés de sempre visível
- [ ] Padding completo (space-8)
- [ ] Gráficos altura maior (320px+)

### Geral
- [ ] Testado em Chrome, Safari, Firefox
- [ ] Testado em iOS e Android
- [ ] Performance: lazy loading de gráficos
- [ ] Scroll suave funciona
- [ ] Focus states visíveis (teclado)
- [ ] Contraste WCAG AA (4.5:1)
- [ ] Sem scroll horizontal em nenhuma tela

---

## Ferramentas de Teste

### Testar Responsividade:
1. **Chrome DevTools**: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. **Firefox DevTools**: F12 → Responsive Design Mode (Ctrl+Shift+M)
3. **Dispositivos reais**: Sempre teste em pelo menos 1 iOS e 1 Android

### Breakpoints para Testar:
- 375px × 667px (iPhone SE)
- 390px × 844px (iPhone 12/13/14)
- 360px × 800px (Android padrão)
- 768px × 1024px (iPad)
- 1024px × 768px (iPad landscape)
- 1280px × 720px (Desktop pequeno)
- 1920px × 1080px (Desktop Full HD)

---

## Notas Finais

Este Design System foi criado especificamente para o NCTY Sistema de Cobrança, mantendo:
- ✅ **Consistência visual** com o produto atual
- ✅ **Profissionalismo** para contexto B2B
- ✅ **Responsividade completa** mobile/tablet/desktop
- ✅ **Acessibilidade** como prioridade (WCAG AA)
- ✅ **Performance** otimizada
- ✅ **Flexibilidade** para evolução futura

### Você pode usar este DS para pedir à IA:

1. **"Torne minha tela responsiva"** → Cole o prompt específico acima
2. **"Crie um componente novo"** → IA vai usar os tokens automaticamente
3. **"Adapte para mobile"** → IA sabe exatamente o que fazer
4. **"Corrija acessibilidade"** → IA aplica as regras de contraste e focus

### Como usar na prática:

```
Prompt exemplo:

"Usando o Design System NCTY que forneci, crie uma tela de 
'Lista de Cobranças' totalmente responsiva com:
- Filtros no topo
- Tabela de cobranças (desktop) / Cards (mobile)
- Paginação
- Botão CTA 'Nova Cobrança'

Siga todos os tokens, breakpoints e padrões definidos."
```

A IA vai gerar código 100% consistente com seu design system! 🎯