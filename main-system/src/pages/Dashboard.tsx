import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { STATUS_COLOR, STATUS_LABEL, formatKip, type Parcel } from '../lib/types'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default function Dashboard() {
  const [receivedToday, setReceivedToday] = useState<number | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [deliveredToday, setDeliveredToday] = useState<number | null>(null)
  const [codToday, setCodToday] = useState<number | null>(null)
  const [recent, setRecent] = useState<Parcel[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const since = startOfToday()

      const [receivedRes, pendingRes, deliveredRes, recentRes] = await Promise.all([
        supabase.from('parcels').select('id', { count: 'exact', head: true }).gte('created_at', since),
        supabase.from('parcels').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase
          .from('parcels')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'delivered')
          .gte('created_at', since),
        supabase
          .from('parcels')
          .select('*, branches(name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const firstError =
        receivedRes.error || pendingRes.error || deliveredRes.error || recentRes.error
      if (firstError) {
        setError(firstError.message)
        return
      }

      setReceivedToday(receivedRes.count ?? 0)
      setPending(pendingRes.count ?? 0)
      setDeliveredToday(deliveredRes.count ?? 0)
      setRecent((recentRes.data as Parcel[]) ?? [])

      const codRes = await supabase.from('parcels').select('cod_amount').gte('created_at', since)
      if (!codRes.error) {
        setCodToday((codRes.data ?? []).reduce((sum, p) => sum + Number(p.cod_amount ?? 0), 0))
      }
    }

    load()
  }, [])

  return (
    <MainLayout title="ໜ້າຫຼັກ">
      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: {error} — ກວດສອບວ່າໄດ້ແລ່ນ supabase/schema.sql ແລ້ວຫຼືບໍ່
        </p>
      )}

      <div className="grid grid-cols-4 gap-5">
        <Kpi label="ພັດສະດຸຮັບເຂົ້າມື້ນີ້" value={receivedToday} />
        <Kpi label="ລໍຖ້ານຳສົ່ງ" value={pending} />
        <Kpi label="ນຳສົ່ງສຳເລັດມື້ນີ້" value={deliveredToday} />
        <Kpi label="ຍອດເກັບ COD ມື້ນີ້" value={codToday} money />
      </div>

      <div className="mt-5 rounded-lg border border-border bg-surface">
        <div className="border-b border-border/60 px-5 py-4 text-sm font-semibold">
          ລາຍການພັດສະດຸລ່າສຸດ
        </div>
        <div className="grid grid-cols-[140px_1fr_110px_140px_120px] px-5 py-2 text-xs font-medium text-muted">
          <span>ເລກພັດສະດຸ</span>
          <span>ຜູ້ຮັບ</span>
          <span>ສາຂາ</span>
          <span>ສະຖານະ</span>
          <span className="text-right">ຍອດເກັບເງິນ</span>
        </div>
        {recent.length === 0 && (
          <p className="px-5 py-6 text-sm text-muted">ຍັງບໍ່ມີລາຍການພັດສະດຸ</p>
        )}
        {recent.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[140px_1fr_110px_140px_120px] items-center border-t border-border/60 px-5 py-2.5 text-sm"
            style={{ borderLeft: `3px solid ${STATUS_COLOR[p.status]}` }}
          >
            <span className="tabular">{p.tracking_no}</span>
            <span>{p.receiver_name}</span>
            <span>{p.branches?.name ?? '-'}</span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: STATUS_COLOR[p.status] }}
              />
              {STATUS_LABEL[p.status]}
            </span>
            <span className="tabular text-right font-semibold">
              {p.cod_amount > 0 ? formatKip(p.cod_amount) : '-'}
            </span>
          </div>
        ))}
      </div>
    </MainLayout>
  )
}

function Kpi({ label, value, money }: { label: string; value: number | null; money?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="mb-2 text-xs font-medium text-muted">{label}</p>
      <p className="tabular text-[28px] font-semibold">
        {value === null ? '—' : money ? formatKip(value) : value.toLocaleString()}
      </p>
    </div>
  )
}
