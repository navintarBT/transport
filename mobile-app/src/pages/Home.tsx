import { useEffect, useState } from 'react'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'
import { formatKip, type Branch, type Parcel } from '../lib/types'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

type BranchStat = {
  branch: Branch
  total: number
  delivered: number
  cod: number
}

export default function Home() {
  const [totalCod, setTotalCod] = useState(0)
  const [totalParcels, setTotalParcels] = useState(0)
  const [branchStats, setBranchStats] = useState<BranchStat[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const since = startOfToday()

      const [branchesRes, parcelsRes] = await Promise.all([
        supabase.from('branches').select('*').order('name'),
        supabase.from('parcels').select('*').gte('created_at', since),
      ])

      if (branchesRes.error || parcelsRes.error) {
        setError((branchesRes.error ?? parcelsRes.error)!.message)
        return
      }

      const branches = branchesRes.data as Branch[]
      const parcels = parcelsRes.data as Parcel[]

      setTotalParcels(parcels.length)
      setTotalCod(parcels.reduce((s, p) => s + Number(p.cod_amount ?? 0), 0))

      setBranchStats(
        branches.map((branch) => {
          const branchParcels = parcels.filter((p) => p.branch_id === branch.id)
          return {
            branch,
            total: branchParcels.length,
            delivered: branchParcels.filter((p) => p.status === 'delivered').length,
            cod: branchParcels.reduce((s, p) => s + Number(p.cod_amount ?? 0), 0),
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
            <span className="text-xs text-white/70">ຍອດຂາຍມື້ນີ້ທຸກສາຂາ</span>
            <span className="tabular text-[38px] font-extrabold leading-none">{formatKip(totalCod)}</span>
            <span className="text-xs text-white/70">ພັດສະດຸລວມມື້ນີ້ {totalParcels.toLocaleString()} ລາຍການ</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-ink/80">ພາບລວມແຍກຕາມສາຂາ</span>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {branchStats.map((s) => {
              const pct = s.total > 0 ? Math.round((s.delivered / s.total) * 100) : 0
              return (
                <div key={s.branch.id} className="w-[132px] shrink-0 rounded-2xl border border-border bg-surface p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">{s.branch.name}</span>
                  </div>
                  <p className="tabular text-center text-sm font-semibold">{pct}%</p>
                  <p className="tabular mt-1 text-center text-[11px] text-muted">{formatKip(s.cod)}</p>
                </div>
              )
            })}
            {branchStats.length === 0 && <p className="text-sm text-muted">ຍັງບໍ່ມີຂໍ້ມູນສາຂາ</p>}
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
