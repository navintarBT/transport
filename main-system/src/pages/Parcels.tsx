import { useEffect, useState } from 'react'
import { IonIcon } from '@ionic/react'
import { searchOutline, cubeOutline } from 'ionicons/icons'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { STATUS_COLOR, STATUS_LABEL, formatKip, type Parcel, type ParcelStatus } from '../lib/types'
import { Button, Card, EmptyState, PageHeader, StatusBadge } from '../components/ui'

const FILTERS: { value: ParcelStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ທັງໝົດ' },
  { value: 'pending_pickup', label: 'ຂອງຄ້າງ' },
  { value: 'picked_up', label: 'ລູກຄ້າຮັບແລ້ວ' },
  { value: 'returned', label: 'ສົ່ງກັບຄືນ' },
]

export default function Parcels() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ParcelStatus | 'all'>('all')
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    let query = supabase
      .from('parcels')
      .select('*, branches(name)')
      .order('created_at', { ascending: false })
      .limit(200)

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) {
      query = query.or(
        `tracking_no.ilike.%${search}%,receiver_name.ilike.%${search}%,receiver_phone.ilike.%${search}%,sender_name.ilike.%${search}%`,
      )
    }

    const { data, error } = await query
    if (error) setError(error.message)
    else setParcels((data as Parcel[]) ?? [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search])

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

    await supabase.from('transactions').update({ payment_status: 'paid' }).eq('parcel_id', parcel.id).eq('type', 'cod')

    setParcels((prev) =>
      prev.map((p) => (p.id === parcel.id ? { ...p, status: 'picked_up', picked_up_at: new Date().toISOString() } : p)),
    )
    setBusyId(null)
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

  return (
    <MainLayout title="ລາຍການພັດສະດຸ">
      <PageHeader
        title="ລາຍການພັດສະດຸ"
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

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={
              'rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ' +
              (statusFilter === f.value
                ? 'bg-gradient-to-b from-[#635BFF] to-[#4338CA] text-white shadow-md shadow-primary/25'
                : 'border border-border bg-surface text-muted shadow-sm hover:-translate-y-0.5 hover:border-ink/15 hover:text-ink hover:shadow-md')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <Card className="mt-4">
        <div className="grid grid-cols-[120px_1fr_1fr_100px_110px_110px_110px_150px_170px] border-b border-border/60 px-5 py-2 text-xs font-medium text-muted">
          <span>ເລກພັດສະດຸ</span>
          <span>ຜູ້ສົ່ງ</span>
          <span>ຜູ້ຮັບ</span>
          <span>ສາຂາ</span>
          <span className="text-right">ຕົ້ນທຶນ</span>
          <span className="text-right">ລາຄາຂາຍ</span>
          <span className="text-right">ກຳໄລ</span>
          <span>ສະຖານະ</span>
          <span></span>
        </div>

        {parcels.length === 0 && <EmptyState icon={<IonIcon icon={cubeOutline} className="text-3xl" />} message="ບໍ່ພົບພັດສະດຸ" />}

        {parcels.map((p) => {
          const profit = Number(p.cod_amount ?? 0) - Number(p.cost_amount ?? 0)
          return (
            <div
              key={p.id}
              className="grid grid-cols-[120px_1fr_1fr_100px_110px_110px_110px_150px_170px] items-center border-t border-border/60 px-5 py-3 text-sm transition-colors hover:bg-bg/60"
            >
              <span className="tabular font-medium">{p.tracking_no}</span>
              <span className="truncate">{p.sender_name}</span>
              <div className="flex flex-col">
                <span className="truncate">
                  {p.receiver_name}
                  {p.is_damaged && <span className="ml-1.5 text-xs font-semibold text-danger">ເສຍຫາຍ</span>}
                </span>
                <span className="tabular text-xs text-muted">{p.receiver_phone}</span>
              </div>
              <span className="text-ink/70">{p.branches?.name ?? '-'}</span>
              <span className="tabular text-right">{formatKip(p.cost_amount ?? 0)}</span>
              <span className="tabular text-right font-semibold">{formatKip(p.cod_amount ?? 0)}</span>
              <span className="tabular text-right font-semibold text-primary">{formatKip(profit)}</span>
              <span>
                <StatusBadge color={STATUS_COLOR[p.status]} label={STATUS_LABEL[p.status]} />
              </span>
              <div className="flex justify-end gap-2">
                <Button
                  variant={p.is_damaged ? 'danger' : 'secondary'}
                  onClick={() => toggleDamaged(p)}
                  disabled={busyId === p.id}
                  className="h-8 px-2.5 text-xs"
                >
                  {p.is_damaged ? 'ຍົກເລີກເສຍຫາຍ' : 'ເສຍຫາຍ'}
                </Button>
                {p.status === 'pending_pickup' && (
                  <Button variant="primary" onClick={() => markPickedUp(p)} disabled={busyId === p.id} className="h-8 px-3 text-xs">
                    ຮັບແລ້ວ
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </Card>
    </MainLayout>
  )
}
