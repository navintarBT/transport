import { useEffect, useState } from 'react'
import { IonIcon } from '@ionic/react'
import {
  cubeOutline,
  checkmarkCircleOutline,
  walletOutline,
  warningOutline,
  archiveOutline,
  pricetagOutline,
  constructOutline,
  trendingUpOutline,
  documentTextOutline,
} from 'ionicons/icons'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { STATUS_COLOR, STATUS_LABEL, formatKip, type Parcel } from '../lib/types'
import { Card, EmptyState, PageHeader, StatusBadge } from '../components/ui'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default function Dashboard() {
  const [receivedToday, setReceivedToday] = useState<number | null>(null)
  const [pickedUpToday, setPickedUpToday] = useState<number | null>(null)
  const [collectedToday, setCollectedToday] = useState<number | null>(null)
  const [damagedCount, setDamagedCount] = useState<number | null>(null)

  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [pendingValue, setPendingValue] = useState<number | null>(null)
  const [pendingCost, setPendingCost] = useState<number | null>(null)
  const [pendingProfit, setPendingProfit] = useState<number | null>(null)

  const [recent, setRecent] = useState<Parcel[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const since = startOfToday()

      const [receivedRes, pickedUpRes, damagedRes, pendingRes, recentRes] = await Promise.all([
        supabase.from('parcels').select('id', { count: 'exact', head: true }).gte('created_at', since),
        supabase
          .from('parcels')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'picked_up')
          .gte('picked_up_at', since),
        supabase.from('parcels').select('id', { count: 'exact', head: true }).eq('is_damaged', true),
        supabase.from('parcels').select('cost_amount, cod_amount').eq('status', 'pending_pickup'),
        supabase
          .from('parcels')
          .select('*, branches(name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const firstError =
        receivedRes.error || pickedUpRes.error || damagedRes.error || pendingRes.error || recentRes.error
      if (firstError) {
        setError(firstError.message)
        return
      }

      setReceivedToday(receivedRes.count ?? 0)
      setPickedUpToday(pickedUpRes.count ?? 0)
      setDamagedCount(damagedRes.count ?? 0)
      setRecent((recentRes.data as Parcel[]) ?? [])

      const pending = pendingRes.data ?? []
      setPendingCount(pending.length)
      const value = pending.reduce((s, p) => s + Number(p.cod_amount ?? 0), 0)
      const cost = pending.reduce((s, p) => s + Number(p.cost_amount ?? 0), 0)
      setPendingValue(value)
      setPendingCost(cost)
      setPendingProfit(value - cost)

      const collectedRes = await supabase
        .from('parcels')
        .select('cod_amount')
        .eq('status', 'picked_up')
        .gte('picked_up_at', since)
      if (!collectedRes.error) {
        setCollectedToday((collectedRes.data ?? []).reduce((s, p) => s + Number(p.cod_amount ?? 0), 0))
      }
    }

    load()
  }, [])

  return (
    <MainLayout title="ໜ້າຫຼັກ">
      <PageHeader title="ພາບລວມມື້ນີ້" />

      {error && (
        <p className="mb-5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: {error} — ກວດສອບວ່າໄດ້ແລ່ນ supabase/schema.sql (ແລະ migrations) ແລ້ວຫຼືບໍ່
        </p>
      )}

      <div className="grid grid-cols-4 gap-5">
        <Kpi label="ຮັບເຂົ້າມື້ນີ້" value={receivedToday} icon={cubeOutline} iconColor="#4F46E5" />
        <Kpi label="ລູກຄ້າຮັບມື້ນີ້" value={pickedUpToday} icon={checkmarkCircleOutline} iconColor="#16A34A" />
        <Kpi label="ຍອດເກັບເງິນມື້ນີ້" value={collectedToday} money icon={walletOutline} iconColor="#0D9488" />
        <Kpi label="ຂອງເສຍຫາຍ" value={damagedCount} danger icon={warningOutline} iconColor="#DC2626" />
      </div>

      <div className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-ink/70">ຂອງຄ້າງ (ລໍຖ້າລູກຄ້າມາຮັບ)</h2>
        <div className="grid grid-cols-4 gap-5">
          <Kpi label="ຈຳນວນຂອງຄ້າງ" value={pendingCount} icon={archiveOutline} iconColor="#D97706" />
          <Kpi label="ມູນຄ່າຂອງຄ້າງ" value={pendingValue} money icon={pricetagOutline} iconColor="#4F46E5" />
          <Kpi label="ຕົ້ນທຶນຂອງຄ້າງ" value={pendingCost} money icon={constructOutline} iconColor="#64748B" />
          <Kpi label="ກຳໄລທີ່ຄ້າງຢູ່" value={pendingProfit} money accent icon={trendingUpOutline} iconColor="#7C3AED" />
        </div>
      </div>

      <Card className="mt-7">
        <div className="border-b border-border/60 px-5 py-4 text-sm font-semibold">ລາຍການພັດສະດຸລ່າສຸດ</div>
        <div className="grid grid-cols-[140px_1fr_110px_160px_120px] px-5 py-2 text-xs font-medium text-muted">
          <span>ເລກພັດສະດຸ</span>
          <span>ຜູ້ຮັບ</span>
          <span>ສາຂາ</span>
          <span>ສະຖານະ</span>
          <span className="text-right">ຍອດເກັບເງິນ</span>
        </div>
        {recent.length === 0 && <EmptyState icon={<IonIcon icon={documentTextOutline} className="text-3xl" />} message="ຍັງບໍ່ມີລາຍການພັດສະດຸ" />}
        {recent.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[140px_1fr_110px_160px_120px] items-center border-t border-border/60 px-5 py-3 text-sm transition-colors hover:bg-bg/60"
          >
            <span className="tabular font-medium">{p.tracking_no}</span>
            <span>
              {p.receiver_name}
              {p.is_damaged && <span className="ml-1.5 text-xs font-semibold text-danger">(ເສຍຫາຍ)</span>}
            </span>
            <span className="text-ink/70">{p.branches?.name ?? '-'}</span>
            <span>
              <StatusBadge color={STATUS_COLOR[p.status]} label={STATUS_LABEL[p.status]} />
            </span>
            <span className="tabular text-right font-semibold">
              {p.cod_amount > 0 ? formatKip(p.cod_amount) : '-'}
            </span>
          </div>
        ))}
      </Card>
    </MainLayout>
  )
}

function Kpi({
  label,
  value,
  money,
  danger,
  accent,
  icon,
  iconColor,
}: {
  label: string
  value: number | null
  money?: boolean
  danger?: boolean
  accent?: boolean
  icon: string
  iconColor: string
}) {
  return (
    <Card className={danger ? 'border-danger/30 bg-danger/5 p-5' : 'p-5'}>
      <div className="mb-3 flex items-center justify-between">
        <p className={'text-xs font-medium ' + (danger ? 'text-danger' : 'text-muted')}>{label}</p>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${iconColor}1A`, color: iconColor }}
        >
          <IonIcon icon={icon} className="text-base" />
        </span>
      </div>
      <p className={'tabular text-[26px] font-semibold ' + (danger ? 'text-danger' : accent ? 'text-primary' : '')}>
        {value === null ? '—' : money ? formatKip(value) : value.toLocaleString()}
      </p>
    </Card>
  )
}
