import GlassCard from './GlassCard'

/**
 * columns: [{ key, header, render?(row), className?, hideOnMobile? }]
 * rows:    array of objects, each with a unique `id`
 */
export default function DataTable({ title, subtitle, columns, rows, action, className = '', onRowClick }) {
  return (
    <GlassCard hover={false} className={`!p-0 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="thin-scrollbar mt-3 overflow-x-auto px-1.5 pb-3 md:px-2">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-2 py-2 text-xs font-medium uppercase md:px-3 tracking-wide text-white/55 ${
                    c.hideOnMobile ? 'hidden md:table-cell' : ''
                  } ${c.className ?? ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRowClick(row)) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={`transition-colors hover:bg-white/[0.06] ${onRowClick ? 'cursor-pointer outline-none focus-visible:bg-white/10' : ''}`}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`border-t border-white/10 px-2 py-3 md:px-3 align-middle ${
                      c.hideOnMobile ? 'hidden md:table-cell' : ''
                    } ${c.className ?? ''}`}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
