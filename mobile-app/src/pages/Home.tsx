import { useEffect, useState } from 'react'
import { IonIcon } from '@ionic/react'
import { businessOutline } from 'ionicons/icons'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'
import { formatKip, type Branch, type Parcel } from '../lib/types'
import { Card, EmptyState } from '../components/ui'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

type BranchStat = {
  branch: Branch
  pendingCount: number
  pendingValue: number
}

export default function Home() {
  const [collectedToday, setCollectedToday] = useState(0)
  const [pendingProfitTotal, setPendingProfitTotal] = useState(0)
  const [branchStats, setBranchStats] = useState<BranchStat[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const since = startOfToday()

      const [branchesRes, collectedRes, pendingRes] = await Promise.all([
        supabase.from('branches').select('*').order('name'),
        supabase.from('parcels').select('cod_amount').eq('status', 'picked_up').gte('picked_up_at', since),
        supabase.from('parcels').select('*').eq('status', 'pending_pickup'),
      ])

      if (branchesRes.error || collectedRes.error || pendingRes.error) {
        setError((branchesRes.error ?? collectedRes.error ?? pendingRes.error)!.message)
        return
      }

      const branches = branchesRes.data as Branch[]
      const pending = pendingRes.data as Parcel[]

      setCollectedToday((collectedRes.data ?? []).reduce((s, p) => s + Number(p.cod_amount ?? 0), 0))
      setPendingProfitTotal(pending.reduce((s, p) => s + (Number(p.cod_amount ?? 0) - Number(p.cost_amount ?? 0)), 0))

      setBranchStats(
        branches.map((branch) => {
          const branchPending = pending.filter((p) => p.branch_id === branch.id)
          return {
            branch,
            pendingCount: branchPending.length,
            pendingValue: branchPending.reduce((s, p) => s + Number(p.cod_amount ?? 0), 0),
          }
        }),
      )
    }

    load()
  }, [])

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold">ສະບາຍດີ</p>
            <p className="text-xs text-muted">{new Date().toLocaleDateString('lo-LA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: {error}
          </p>
        )}

        <div className="relative overflow-hidden rounded-[22px] p-5 text-white shadow-[0_8px_24px_rgba(79,70,229,0.18)]" style={{ background: 'linear-gradient(135deg,#4F46E5,#3730A3)' }}>
          <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-2">
            <span className="text-xs text-white/70">ຍອດເກັບເງິນມື້ນີ້ທຸກສາຂາ</span>
            <span className="tabular text-[38px] font-extrabold leading-none">{formatKip(collectedToday)}</span>
            <span className="text-xs text-white/70">
              ກຳໄລທີ່ຄ້າງຢູ່ກັບຂອງຄ້າງ: <span className="tabular font-semibold text-white">{formatKip(pendingProfitTotal)}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-ink/80">ຂອງຄ້າງແຍກຕາມສາຂາ</span>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {branchStats.map((s) => (
              <Card key={s.branch.id} className="w-[140px] shrink-0 p-3.5">
                <div className="mb-2 flex items-center gap-1.5">
                  <IonIcon icon={businessOutline} className="text-sm text-primary" />
                  <span className="truncate text-sm font-semibold">{s.branch.name}</span>
                </div>
                <p className="tabular text-center text-lg font-bold">{s.pendingCount.toLocaleString()}</p>
                <p className="text-center text-[10px] text-muted">ລາຍການຄ້າງ</p>
                <p className="tabular mt-1 text-center text-[11px] text-muted">{formatKip(s.pendingValue)}</p>
              </Card>
            ))}
            {branchStats.length === 0 && <EmptyState message="ຍັງບໍ່ມີຂໍ້ມູນສາຂາ" />}
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
