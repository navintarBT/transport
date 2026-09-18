import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { IonIcon } from '@ionic/react'
import { searchOutline, archiveOutline, cashOutline, trendingUpOutline, scanOutline } from 'ionicons/icons'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { formatKip, type Parcel } from '../lib/types'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'

function daysWaiting(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export default function PendingPickup() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [scanValue, setScanValue] = useState('')
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data, error } = await supabase
      .from('parcels')
      .select('*, branches(name)')
      .eq('status', 'pending_pickup')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setParcels((data as Parcel[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function markPickedUp(parcel: Parcel) {
    setBusyId(parcel.id)
    const { error } = await supabase
      .from('parcels')
      .update({ status: 'picked_up', picked_up_at: new Date().toISOString() })
      .eq('id', parcel.id)

    if (error) {
      setError(error.message)
      setBusyId(null)
      return
    }

    await supabase
      .from('transactions')
      .update({ payment_status: 'paid' })
      .eq('parcel_id', parcel.id)
      .eq('type', 'cod')

    setParcels((prev) => prev.filter((p) => p.id !== parcel.id))
    setBusyId(null)
  }

  function handleScanKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const code = scanValue.trim()
    setScanValue('')
    if (!code) return

    const match = parcels.find((p) => p.tracking_no.toLowerCase() === code.toLowerCase())
    if (!match) {
      setScanMessage({ type: 'error', text: `ບໍ່ພົບ "${code}" ໃນລາຍການຂອງຄ້າງ` })
      return
    }

    setScanMessage({ type: 'success', text: `ຮັບ ${match.tracking_no} (${match.receiver_name}) ໃຫ້ລູກຄ້າແລ້ວ` })
    markPickedUp(match)
  }

  async function toggleDamaged(parcel: Parcel) {
    const nextDamaged = !parcel.is_damaged
    let note = parcel.damage_note
    if (nextDamaged) {
      note = window.prompt('ບັນທຶກລາຍລະອຽດຄວາມເສຍຫາຍ (ບໍ່ບັງຄັບ):', parcel.damage_note ?? '') ?? parcel.damage_note
    }

    setBusyId(parcel.id)
    const { error } = await supabase
      .from('parcels')
      .update({ is_damaged: nextDamaged, damage_note: nextDamaged ? note : null })
      .eq('id', parcel.id)

    if (error) {
      setError(error.message)
    } else {
      setParcels((prev) =>
        prev.map((p) => (p.id === parcel.id ? { ...p, is_damaged: nextDamaged, damage_note: nextDamaged ? note ?? null : null } : p)),
      )
    }
    setBusyId(null)
  }

  const filtered = search
    ? parcels.filter(
        (p) =>
          p.tracking_no.toLowerCase().includes(search.toLowerCase()) ||
          p.receiver_name.toLowerCase().includes(search.toLowerCase()) ||
          p.receiver_phone.includes(search),
      )
    : parcels

  const totalValue = filtered.reduce((s, p) => s + Number(p.cod_amount ?? 0), 0)
  const totalCost = filtered.reduce((s, p) => s + Number(p.cost_amount ?? 0), 0)

  return (
    <MainLayout title="ຂອງຄ້າງ">
      <PageHeader
        title="ຂອງຄ້າງ (ລໍຖ້າລູກຄ້າມາຮັບ)"
        action={
          <div className="flex h-9 w-72 items-center gap-2 rounded-full border border-border bg-surface px-4 transition-shadow focus-within:border-primary focus-within:ring-3 focus-within:ring-primary-tint">
            <IonIcon icon={searchOutline} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ຄົ້ນຫາເລກພັດສະດຸ / ຊື່ / ເບີໂທ"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
        }
      />

      <Card className="mb-5 flex items-center gap-3 border-primary/30 bg-primary-tint/40 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <IonIcon icon={scanOutline} className="text-lg" />
        </span>
        <div className="flex-1">
          <input
            ref={scanRef}
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={handleScanKeyDown}
            autoFocus
            placeholder="ສະແກນບາໂຄດເລກພັດສະດຸ ຫຼື ພິມແລ້ວກົດ Enter ເພື່ອຮັບຂອງໃຫ້ລູກຄ້າ"
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {scanMessage && (
            <p className={'mt-0.5 text-xs font-medium ' + (scanMessage.type === 'success' ? 'text-success' : 'text-danger')}>
              {scanMessage.text}
            </p>
          )}
        </div>
      </Card>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-3 gap-5">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">ຈຳນວນຂອງຄ້າງ</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <IonIcon icon={archiveOutline} className="text-base" />
            </span>
          </div>
          <p className="tabular text-[26px] font-semibold">{filtered.length.toLocaleString()}</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">ມູນຄ່າຂອງຄ້າງ</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-tint text-primary">
              <IonIcon icon={cashOutline} className="text-base" />
            </span>
          </div>
          <p className="tabular text-[26px] font-semibold">{formatKip(totalValue)}</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">ກຳໄລທີ່ຄ້າງຢູ່</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <IonIcon icon={trendingUpOutline} className="text-base" />
            </span>
          </div>
          <p className="tabular text-[26px] font-semibold text-primary">{formatKip(totalValue - totalCost)}</p>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="grid grid-cols-[130px_1fr_100px_90px_120px_120px_130px_150px] border-b border-border/60 px-5 py-2 text-xs font-medium text-muted">
          <span>ເລກພັດສະດຸ</span>
          <span>ຜູ້ຮັບ</span>
          <span>ສາຂາ</span>
          <span>ລໍຖ້າ (ວັນ)</span>
          <span className="text-right">ຕົ້ນທຶນ</span>
          <span className="text-right">ລາຄາຂາຍ</span>
          <span className="text-right">ກຳໄລ</span>
          <span></span>
        </div>

        {filtered.length === 0 && <EmptyState icon={<IonIcon icon={archiveOutline} className="text-3xl" />} message="ບໍ່ມີຂອງຄ້າງ" />}

        {filtered.map((p) => {
          const waiting = daysWaiting(p.created_at)
          const profit = Number(p.cod_amount ?? 0) - Number(p.cost_amount ?? 0)
          return (
            <div
              key={p.id}
              className="grid grid-cols-[130px_1fr_100px_90px_120px_120px_130px_150px] items-center border-t border-border/60 px-5 py-3 text-sm transition-colors hover:bg-bg/60"
            >
              <span className="tabular font-medium">{p.tracking_no}</span>
              <div className="flex flex-col">
                <span>
                  {p.receiver_name}
                  {p.is_damaged && <span className="ml-1.5 text-xs font-semibold text-danger">ເສຍຫາຍ</span>}
                </span>
                <span className="tabular text-xs text-muted">{p.receiver_phone}</span>
              </div>
              <span className="text-ink/70">{p.branches?.name ?? '-'}</span>
              <span className={'tabular ' + (waiting >= 7 ? 'font-semibold text-warning' : '')}>{waiting}</span>
              <span className="tabular text-right">{formatKip(p.cost_amount ?? 0)}</span>
              <span className="tabular text-right font-semibold">{formatKip(p.cod_amount ?? 0)}</span>
              <span className="tabular text-right font-semibold text-primary">{formatKip(profit)}</span>
              <div className="flex justify-end gap-2">
                <Button
                  variant={p.is_damaged ? 'danger' : 'secondary'}
                  onClick={() => toggleDamaged(p)}
                  disabled={busyId === p.id}
                  className="h-8 px-2.5 text-xs"
                >
                  {p.is_damaged ? 'ຍົກເລີກເສຍຫາຍ' : 'ເສຍຫາຍ'}
                </Button>
                <Button variant="primary" onClick={() => markPickedUp(p)} disabled={busyId === p.id} className="h-8 px-3 text-xs">
                  ລູກຄ້າຮັບແລ້ວ
                </Button>
              </div>
            </div>
          )
        })}
      </Card>
    </MainLayout>
  )
}
