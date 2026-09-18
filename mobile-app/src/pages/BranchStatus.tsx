import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { cubeOutline, scanOutline } from 'ionicons/icons'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'
import { STATUS_COLOR, STATUS_LABEL, type Branch, type Parcel } from '../lib/types'
import { Card, EmptyState } from '../components/ui'

export default function BranchStatus() {
  const history = useHistory()
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
    pending: parcels.filter((p) => p.status === 'pending_pickup').length,
    pickedUp: parcels.filter((p) => p.status === 'picked_up').length,
    damaged: parcels.filter((p) => p.is_damaged).length,
  }

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">ສະຖານະພັດສະດຸ</span>
          <button
            onClick={() => history.push('/scan')}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#635BFF] to-[#4338CA] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-primary/25 transition-all active:scale-95"
          >
            <IonIcon icon={scanOutline} className="text-sm" />
            ສະແກນຮັບເຄື່ອງ
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelected(b.id)}
              className={
                'shrink-0 rounded-full px-4 py-1.5 text-xs transition-all duration-150 active:scale-95 ' +
                (selected === b.id
                  ? 'bg-gradient-to-b from-[#635BFF] to-[#4338CA] font-semibold text-white shadow-md shadow-primary/25'
                  : 'border border-border bg-surface text-muted shadow-sm')
              }
            >
              {b.name}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="ຮັບເຂົ້າ" value={counts.total} />
          <StatCard label="ຂອງຄ້າງ" value={counts.pending} color="#D97706" />
          <StatCard label="ລູກຄ້າຮັບແລ້ວ" value={counts.pickedUp} color="#16A34A" />
          <StatCard label="ເສຍຫາຍ" value={counts.damaged} color="#DC2626" danger />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="mb-1.5 text-sm font-semibold text-ink/80">ລາຍການພັດສະດຸ</span>
          {parcels.length === 0 && <EmptyState icon={<IonIcon icon={cubeOutline} className="text-3xl" />} message="ຍັງບໍ່ມີພັດສະດຸໃນສາຂານີ້" />}
          {parcels.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 border-b border-border/60 py-2.5 transition-colors active:bg-bg/60">
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
    <Card className={'flex flex-col items-center gap-1 p-4 ' + (danger ? 'border-danger/30 bg-danger/5' : '')}>
      <span className="tabular text-[22px] font-bold" style={{ color }}>
        {value}
      </span>
      <span className={'text-[11px] ' + (danger ? 'text-danger' : 'text-muted')}>{label}</span>
    </Card>
  )
}
