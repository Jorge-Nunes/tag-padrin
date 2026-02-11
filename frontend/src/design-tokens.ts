/**
 * Design Tokens Centralizados
 * Sistema de design reutilizável para manter consistência visual
 */

// Espaçamentos padronizados
export const spacing = {
  section: 'space-y-8',      // Entre seções principais
  card: 'space-y-6',         // Dentro de cards
  form: 'space-y-4',         // Em formulários
  list: 'space-y-2',         // Em listas
  inline: 'space-x-3',       // Elementos inline
  tight: 'space-y-1',        // Elementos compactos
} as const;

// Touch targets e tamanhos mínimos (WCAG AAA)
export const touchTargets = {
  minimum: 'min-w-[44px] min-h-[44px]',           // Mínimo recomendado
  button: 'min-w-[44px] min-h-[44px] p-3',        // Botões de ação
  iconButton: 'w-[44px] h-[44px] p-3',            // Botões de ícone
  input: 'min-h-[44px] py-3 px-4',                // Inputs de formulário
} as const;

// Animações e transições
export const animations = {
  pageTransition: 'animate-in fade-in duration-700',
  cardHover: 'transition-all duration-300',
  button: 'transition-all duration-200',
  fast: 'transition-all duration-150',
  modal: 'animate-in fade-in zoom-in-95 duration-200',
  drawer: 'transition-transform duration-300',
} as const;

// Cores semânticas (mapeadas para Tailwind)
export const colors = {
  status: {
    active: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    inactive: {
      bg: 'bg-gray-50 dark:bg-gray-800/20',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
  },
} as const;

// Bordas e raios
export const borders = {
  card: 'rounded-xl',
  button: 'rounded-lg',
  input: 'rounded-xl',
  badge: 'rounded-full',
  modal: 'rounded-2xl',
} as const;

// Sombras
export const shadows = {
  card: 'shadow-sm hover:shadow-md',
  button: 'shadow-sm',
  modal: 'shadow-2xl',
  none: 'shadow-none',
} as const;

// Tipografia
export const typography = {
  pageTitle: 'text-4xl font-bold tracking-tight',
  sectionTitle: 'text-2xl font-bold tracking-tight',
  cardTitle: 'text-xl font-bold',
  label: 'text-xs font-bold uppercase tracking-widest',
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
} as const;

// Estados de foco (acessibilidade)
export const focus = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
  visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  within: 'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
} as const;
