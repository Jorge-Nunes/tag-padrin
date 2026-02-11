import type { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Tabela responsiva que se adapta a dispositivos móveis
 * Em telas pequenas, adiciona scroll horizontal
 */
export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 dark:border-slate-700 sm:rounded-xl">
          <table className={`min-w-full divide-y divide-gray-200 dark:divide-slate-700 ${className}`}>
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 dark:bg-slate-800/50">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeadCellProps {
  children: ReactNode;
  className?: string;
}

export function TableHeadCell({ children, className = '' }: TableHeadCellProps) {
  return (
    <th
      scope="col"
      className={`px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = '', onClick }: TableRowProps) {
  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
}
