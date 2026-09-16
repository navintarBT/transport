import { useEffect, useState } from 'react'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'
import { STATUS_COLOR, STATUS_LABEL, type Branch, type Parcel } from '../lib/types'

export default function BranchStatus() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('branches')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) return setError(error.message)
        setBranches(data ?? [])
        if (data && data.length > 0) setSelected(data[0].id)
      })
  }, [])

  useEffect(() => {
    if (!selected) return
    supabase
      .from('parcels')
      .select('*')
      .eq('branch_id', selected)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setParcels((data as Parcel[]) ?? [])
      })
  }, [selected])

  const counts = {
    total: parcels.length,
    inTransit: parcels.filter((p) => p.status === 'in_transit').length,
    delivered: parcels.filter((p) => p.status === 'delivered').length,
    returned: parcels.filter((p) => p.status === 'returned').length,
  }

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-5">
        <span className="text-base font-semibold">ສະຖານະພັດສະດຸ</span>

        <div className="flex gap-2 overflow-x-auto">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelected(b.id)}
              className={
                'shrink-0 rounded-full px-4 py-1.5 text-xs ' +
                (selected === b.id ? 'bg-primary font-semibold text-white' : 'border border-border text-muted')
              }
            >
              {b.name}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="ຮັບເຂົ້າ" value={counts.total} />
          <StatCard label="ກຳລັງນຳສົ່ງ" value={counts.inTransit} color="#D97706" />
          <StatCard label="ນຳສົ່ງສຳເລັດ" value={counts.delivered} color="#16A34A" />
          <StatCard label="ຕີກັບ/ມີບັນຫາ" value={counts.returned} color="#DC2626" danger />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="mb-1.5 text-sm font-semibold text-ink/80">ລາຍການພັດສະດຸ</span>
          {parcels.length === 0 && <p className="text-sm text-muted">ຍັງບໍ່ມີພັດສະດຸໃນສາຂານີ້</p>}
          {parcels.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 border-b border-border/60 py-2.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[p.status] }} />
              <div className="min-w-0 flex-1">
                <p className="tabular text-sm font-semibold">{p.tracking_no}</p>
                <p className="truncate text-[11px] text-muted">
                  {p.receiver_name} &middot; {STATUS_LABEL[p.status]}
                </p>
              </div>
              <span className="tabular text-[11px] text-muted">
                {new Date(p.created_at).toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}

function StatCard({ label, value, color, danger }: { label: string; value: number; color?: string; danger?: boolean }) {
  return (
    <div className={'flex flex-col items-center gap-1 rounded-2xl border p-4 ' + (danger ? 'border-danger/30 bg-danger/5' : 'border-border bg-surface')}>
      <span className="tabular text-[22px] font-bold" style={{ color }}>
        {value}
      </span>
      <span className={'text-[11px] ' + (danger ? 'text-danger' : 'text-muted')}>{label}</span>
    </div>
  )
}
