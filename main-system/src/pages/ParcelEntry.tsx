import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

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
  const [parcelType, setParcelType] = useState<'document' | 'general' | 'cold'>('general')
  const [codAmount, setCodAmount] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('branch_id')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setBranchId(data?.branch_id ?? null))
  }, [session])

  function resetForm() {
    setSenderName('')
    setSenderPhone('')
    setReceiverName('')
    setReceiverPhone('')
    setReceiverAddress('')
    setWeightKg('')
    setParcelType('general')
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
    resetForm()
  }

  return (
    <MainLayout title="ຮັບພັດສະດຸໃໝ່">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">ຮັບພັດສະດຸໃໝ່</h1>
        <span className="text-sm text-muted">
          ບັນທຶກແລ້ວມື້ນີ້ <span className="tabular font-semibold text-ink">{savedToday}</span> ລາຍການ
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex max-w-3xl flex-col gap-5 rounded-lg border border-border bg-surface p-8"
      >
        {lastSaved && (
          <p className="rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
            ບັນທຶກພັດສະດຸ {lastSaved} ສຳເລັດແລ້ວ
          </p>
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

        <Section title="ລາຍລະອຽດພັດສະດຸ / ການຊຳລະເງິນ">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ນ້ຳໜັກ (ກກ.)">
              <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="input tabular" />
            </Field>
            <Field label="ປະເພດພັດສະດຸ">
              <div className="flex gap-2">
                {(['document', 'general', 'cold'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setParcelType(t)}
                    className={
                      'h-11 rounded-md border px-3.5 text-sm ' +
                      (parcelType === t
                        ? 'border-primary bg-primary-tint font-semibold text-primary'
                        : 'border-border text-muted')
                    }
                  >
                    {t === 'document' ? 'ເອກກະສານ' : t === 'general' ? 'ພັດສະດຸທົ່ວໄປ' : 'ແຊ່ເຢັນ'}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="ຍອດເກັບເງິນປາຍທາງ COD (ກີບ)">
            <input
              type="number"
              step="1"
              value={codAmount}
              onChange={(e) => setCodAmount(e.target.value)}
              className="input tabular text-lg font-semibold"
            />
          </Field>
        </Section>

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={resetForm} className="h-11 rounded-md border border-border px-6 text-sm font-semibold text-ink/70">
            ລ້າງຟອມ
          </button>
          <button type="submit" disabled={saving} className="h-11 rounded-md bg-primary px-7 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກພັດສະດຸ'}
          </button>
        </div>
      </form>

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
