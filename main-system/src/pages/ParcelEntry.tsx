import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { IonIcon } from '@ionic/react'
import { checkmarkCircle, printOutline } from 'ionicons/icons'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { DEFAULT_RATE_PER_KG, DEFAULT_RATE_PER_M3, DEFAULT_TIERS, calculatePrice } from '../lib/pricing'
import { Button, PageHeader } from '../components/ui'
import { Barcode } from '../components/Barcode'
import { formatKip, type Parcel } from '../lib/types'

function generateTrackingNo() {
  const n = Math.floor(10000 + Math.random() * 89999)
  return `PCL-${n}`
}

export default function ParcelEntry() {
  const { session } = useAuth()
  const [branchId, setBranchId] = useState<string | null>(null)
  const [savedToday, setSavedToday] = useState(0)

  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [lengthCm, setLengthCm] = useState('')
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [parcelType, setParcelType] = useState<'document' | 'general' | 'cold'>('general')
  const [costAmount, setCostAmount] = useState('')
  const [codAmount, setCodAmount] = useState('')

  const [ratePerKg, setRatePerKg] = useState(DEFAULT_RATE_PER_KG)
  const [ratePerM3, setRatePerM3] = useState(DEFAULT_RATE_PER_M3)
  const [priceMode, setPriceMode] = useState<'weight' | 'volume' | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [savedParcel, setSavedParcel] = useState<Parcel | null>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('branch_id')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setBranchId(data?.branch_id ?? null))
  }, [session])

  const calc = useMemo(
    () =>
      calculatePrice({
        weightKg: Number(weightKg) || 0,
        lengthCm: Number(lengthCm) || 0,
        widthCm: Number(widthCm) || 0,
        heightCm: Number(heightCm) || 0,
        ratePerKg,
        ratePerM3,
        tiers: DEFAULT_TIERS,
      }),
    [weightKg, lengthCm, widthCm, heightCm, ratePerKg, ratePerM3],
  )

  // auto-fill the sale price from the calculator; staff can still type over it by hand
  useEffect(() => {
    if (calc.mode === 'box') {
      const useVolume = priceMode ? priceMode === 'volume' : calc.volumePrice > calc.weightPrice
      setCodAmount(String(Math.round(useVolume ? calc.volumePrice : calc.weightPrice)))
    } else if (calc.mode === 'tier' || calc.mode === 'weight_only') {
      setCodAmount(String(Math.round(calc.finalPrice)))
    }
  }, [calc, priceMode])

  function handleDimensionChange(setter: (v: string) => void) {
    return (v: string) => {
      setPriceMode(null)
      setter(v)
    }
  }

  function resetForm() {
    setSenderName('')
    setSenderPhone('')
    setReceiverName('')
    setReceiverPhone('')
    setReceiverAddress('')
    setWeightKg('')
    setLengthCm('')
    setWidthCm('')
    setHeightCm('')
    setParcelType('general')
    setPriceMode(null)
    setCostAmount('')
    setCodAmount('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!branchId) {
      setError('ບໍ່ພົບສາຂາຂອງຜູ້ໃຊ້ນີ້ — ກະລຸນາຕັ້ງຄ່າ branch_id ໃນຕາຕະລາງ profiles')
      return
    }

    setSaving(true)
    const trackingNo = generateTrackingNo()
    const cod = Number(codAmount) || 0

    const { data: parcel, error: insertError } = await supabase
      .from('parcels')
      .insert({
        tracking_no: trackingNo,
        branch_id: branchId,
        sender_name: senderName,
        sender_phone: senderPhone,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_address: receiverAddress,
        weight_kg: weightKg ? Number(weightKg) : null,
        parcel_type: parcelType,
        cost_amount: Number(costAmount) || 0,
        cod_amount: cod,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    if (cod > 0 && parcel) {
      await supabase.from('transactions').insert({
        parcel_id: parcel.id,
        branch_id: branchId,
        type: 'cod',
        amount: cod,
        payment_status: 'pending',
      })
    }

    setSaving(false)
    setSavedToday((n) => n + 1)
    setLastSaved(trackingNo)
    setSavedParcel(parcel as Parcel)
    resetForm()
  }

  function handlePrintLabel() {
    window.print()
  }

  return (
    <MainLayout title="ຮັບພັດສະດຸໃໝ່">
      <div className="print:hidden">
      <PageHeader
        title="ຮັບພັດສະດຸໃໝ່"
        action={
          <span className="text-sm text-muted">
            ບັນທຶກແລ້ວມື້ນີ້ <span className="tabular font-semibold text-ink">{savedToday}</span> ລາຍການ
          </span>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="flex max-w-3xl flex-col gap-5 rounded-xl border border-border bg-surface p-8 shadow-sm"
      >
        {lastSaved && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
            <span>ບັນທຶກພັດສະດຸ {lastSaved} ສຳເລັດແລ້ວ</span>
            <Button type="button" variant="secondary" onClick={handlePrintLabel} className="h-8 shrink-0 px-3 text-xs">
              <IonIcon icon={printOutline} className="text-sm" />
              ພິມສະຫຼາກບາໂຄດ
            </Button>
          </div>
        )}
        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <Section title="ຂໍ້ມູນຜູ້ສົ່ງ">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ຊື່ຜູ້ສົ່ງ">
              <input required value={senderName} onChange={(e) => setSenderName(e.target.value)} className="input" />
            </Field>
            <Field label="ເບີໂທຜູ້ສົ່ງ">
              <input required value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="input tabular" />
            </Field>
          </div>
        </Section>

        <Section title="ຂໍ້ມູນຜູ້ຮັບ">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ຊື່ຜູ້ຮັບ">
              <input required value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="input" />
            </Field>
            <Field label="ເບີໂທຜູ້ຮັບ">
              <input required value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className="input tabular" />
            </Field>
          </div>
          <Field label="ທີ່ຢູ່ຜູ້ຮັບ">
            <input required value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} className="input" />
          </Field>
        </Section>

        <Section title="ລາຍລະອຽດພັດສະດຸ / ຄິດໄລ່ລາຄາ">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ນ້ຳໜັກ (ກກ.)">
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => handleDimensionChange(setWeightKg)(e.target.value)}
                className="input tabular"
              />
            </Field>
            <Field label="ປະເພດພັດສະດຸ">
              <div className="flex gap-2">
                {(['document', 'general', 'cold'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setParcelType(t)}
                    className={
                      'h-11 rounded-full border px-4 text-sm font-medium transition-all duration-150 active:scale-[0.98] ' +
                      (parcelType === t
                        ? 'border-primary bg-primary-tint font-semibold text-primary shadow-sm'
                        : 'border-border bg-surface text-muted shadow-sm hover:-translate-y-0.5 hover:border-ink/15 hover:text-ink hover:shadow-md')
                    }
                  >
                    {t === 'document' ? 'ເອກກະສານ' : t === 'general' ? 'ພັດສະດຸທົ່ວໄປ' : 'ແຊ່ເຢັນ'}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-ink/70">ຂະໜາດກ່ອງ (ບໍ່ບັງຄັບ — ບໍ່ໃສ່ = ຄິດຕາມຕາຕະລາງລາຄາສິ້ນນ້ອຍ)</p>
            <div className="grid grid-cols-3 gap-4">
              <input type="number" placeholder="ຍາວ (ຊມ.)" value={lengthCm} onChange={(e) => handleDimensionChange(setLengthCm)(e.target.value)} className="input tabular" />
              <input type="number" placeholder="ກວ້າງ (ຊມ.)" value={widthCm} onChange={(e) => handleDimensionChange(setWidthCm)(e.target.value)} className="input tabular" />
              <input type="number" placeholder="ສູງ (ຊມ.)" value={heightCm} onChange={(e) => handleDimensionChange(setHeightCm)(e.target.value)} className="input tabular" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="ລາຄາຕໍ່ກິໂລ (ກີບ)">
              <input
                type="number"
                value={ratePerKg}
                onChange={(e) => setRatePerKg(Number(e.target.value) || 0)}
                className="input tabular text-sm"
              />
            </Field>
            <Field label="ລາຄາຕໍ່ແມັດກ້ອນ (ກີບ)">
              <input
                type="number"
                value={ratePerM3}
                onChange={(e) => setRatePerM3(Number(e.target.value) || 0)}
                className="input tabular text-sm"
              />
            </Field>
          </div>

          {calc.mode === 'box' && (
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const selected = priceMode ?? (calc.volumePrice > calc.weightPrice ? 'volume' : 'weight')
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setPriceMode('weight')}
                      className={
                        'relative rounded-xl border p-3 text-left shadow-sm transition-all duration-150 active:scale-[0.98] ' +
                        (selected === 'weight'
                          ? 'border-primary bg-primary-tint'
                          : 'border-border bg-surface hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-md')
                      }
                    >
                      {selected === 'weight' && <IonIcon icon={checkmarkCircle} className="absolute right-2.5 top-2.5 text-primary" />}
                      <p className="text-xs text-muted">ລາຄາຕາມນ້ຳໜັກ</p>
                      <p className="tabular text-lg font-semibold">{Math.round(calc.weightPrice).toLocaleString()} ກີບ</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceMode('volume')}
                      className={
                        'relative rounded-xl border p-3 text-left shadow-sm transition-all duration-150 active:scale-[0.98] ' +
                        (selected === 'volume'
                          ? 'border-primary bg-primary-tint'
                          : 'border-border bg-surface hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-md')
                      }
                    >
                      {selected === 'volume' && <IonIcon icon={checkmarkCircle} className="absolute right-2.5 top-2.5 text-primary" />}
                      <p className="text-xs text-muted">ລາຄາຕາມປະລິມາດ ({calc.volumeM3.toFixed(3)} ມ.³)</p>
                      <p className="tabular text-lg font-semibold">{Math.round(calc.volumePrice).toLocaleString()} ກີບ</p>
                    </button>
                  </>
                )
              })()}
            </div>
          )}
          {calc.mode === 'tier' && (
            <p className="text-xs text-muted">
              ຄິດຕາມຕາຕະລາງລາຄາສິ້ນນ້ອຍ ({calc.tier.minKg}–{calc.tier.maxKg} ກກ.) — ໃສ່ຂະໜາດກ່ອງຖ້າຢາກໃຫ້ຄິດແບບກ່ອງແທນ
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="ຕົ້ນທຶນ (ກີບ)">
              <input
                type="number"
                step="1"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                className="input tabular"
              />
            </Field>
            <Field label="ລາຄາຂາຍ / ຍອດເກັບເງິນລູກຄ້າ (ກີບ)">
              <input
                type="number"
                step="1"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
                className="input tabular text-lg font-semibold"
              />
            </Field>
          </div>
          {(costAmount || codAmount) && (
            <p className="text-sm text-muted">
              ກຳໄລໂດຍປະມານ:{' '}
              <span className="tabular font-semibold text-primary">
                {((Number(codAmount) || 0) - (Number(costAmount) || 0)).toLocaleString()} ກີບ
              </span>
            </p>
          )}
        </Section>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={resetForm} className="h-11 px-6">
            ລ້າງຟອມ
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="h-11 px-7">
            {saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກພັດສະດຸ'}
          </Button>
        </div>
      </form>
      </div>

      {savedParcel && (
        <div className="mx-auto hidden w-[340px] flex-col items-center gap-3 border-2 border-dashed border-ink p-6 text-ink print:flex">
          <span className="text-lg font-bold tracking-tight">ClearWay</span>
          <Barcode value={savedParcel.tracking_no} />
          <div className="w-full border-t border-ink/30 pt-3 text-sm">
            <p>
              <span className="text-ink/60">ຜູ້ສົ່ງ:</span> {savedParcel.sender_name} &middot; {savedParcel.sender_phone}
            </p>
            <p className="mt-1">
              <span className="text-ink/60">ຜູ້ຮັບ:</span> {savedParcel.receiver_name} &middot; {savedParcel.receiver_phone}
            </p>
            <p className="mt-1">{savedParcel.receiver_address}</p>
            {savedParcel.cod_amount > 0 && (
              <p className="tabular mt-2 text-base font-bold">ຍອດເກັບເງິນ: {formatKip(savedParcel.cod_amount)}</p>
            )}
          </div>
        </div>
      )}

      <style>{`.input { height: 44px; border: 1px solid var(--color-border); border-radius: 6px; padding: 0 14px; font-size: 15px; outline: none; } .input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-tint); }`}</style>
    </MainLayout>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5 border-b border-border/60 pb-5 last:border-b-0 last:pb-0">
      <span className="text-sm font-semibold text-muted">{title}</span>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink/80">{label}</span>
      {children}
    </label>
  )
}
