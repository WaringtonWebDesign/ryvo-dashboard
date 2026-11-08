import { Image } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import { useDetail } from '../components/DetailSheet'
import StatusPill from '../components/StatusPill'
import { productStats, products, recentOrders } from '../data/mockData'

const gbp = (n) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })

export default function Products() {
  const { openDetail } = useDetail()
  return (
    <>
      <PageHeader title="Products" subtitle="3D-printed shop · this month." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {productStats.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <GlassCard key={p.id} className="!p-3" onClick={() => openDetail('product', p.id)} label={`${p.name}: open details`}>
            <div className={`grid aspect-[16/10] place-items-center rounded-xl bg-gradient-to-br ${p.hue}`}>
              <Image size={30} className="text-white/60" />
            </div>
            <div className="px-2 pb-1 pt-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate font-semibold">{p.name}</h3>
                <StatusPill status={p.status} />
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-2xl font-bold">{gbp(p.price)}</p>
                <p className="text-sm text-white/60">
                  {p.stock > 0 ? `${p.stock} in stock` : 'No stock'}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-4">
        <DataTable
          title="Recent orders"
          rows={recentOrders}
          onRowClick={(r) => { const p = products.find((x) => r.items.startsWith(x.name)); if (p) openDetail('product', p.id) }}
          columns={[
            { key: 'id', header: 'Order', className: 'whitespace-nowrap font-medium' },
            { key: 'customer', header: 'Customer', hideOnMobile: true, className: 'whitespace-nowrap' },
            { key: 'items', header: 'Items', className: 'text-white/80' },
            { key: 'total', header: 'Total', hideOnMobile: true, className: 'whitespace-nowrap font-semibold' },
            { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]}
        />
      </div>
    </>
  )
}
