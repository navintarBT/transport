import { useMemo, useState } from 'react'
import MobileLayout from '../layouts/MobileLayout'
import { formatKip } from '../lib/types'
import {
  DEFAULT_RATE_PER_KG,
  DEFAULT_RATE_PER_M3,
  DEFAULT_TIERS,
  calculatePrice,
  type PriceTier,
} from '../lib/pricing'
import { Card } from '../components/ui'

function newTierId() {
  return `t${Math.random().toString(36).slice(2, 8)}`
}

export default function Calculator() {
  const [ratePerKg, setRatePerKg] = useState(DEFAULT_RATE_PER_KG)
  const [ratePerM3, setRatePerM3] = useState(DEFAULT_RATE_PER_M3)
  const [tiers, setTiers] = useState<PriceTier[]>(DEFAULT_TIERS)

  const [weightKg, setWeightKg] = useState('')
  const [lengthCm, setLengthCm] = useState('')
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')

  const result = useMemo(
    () =>
      calculatePrice({
        weightKg: Number(weightKg) || 0,
        lengthCm: Number(lengthCm) || 0,
        widthCm: Number(widthCm) || 0,
        heightCm: Number(heightCm) || 0,
        ratePerKg,
        ratePerM3,
        tiers,
      }),
    [weightKg, lengthCm, widthCm, heightCm, ratePerKg, ratePerM3, tiers],
  )

  function updateTier(id: string, patch: Partial<PriceTier>) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function removeTier(id: string) {
    setTiers((prev) => prev.filter((t) => t.id !== id))
  }

  function addTier() {
    setTiers((prev) => [...prev, { id: newTierId(), minKg: 0, maxKg: 0, mode: 'flat', value: 0 }])
  }

  function resetDefaults() {
    setRatePerKg(DEFAULT_RATE_PER_KG)
    setRatePerM3(DEFAULT_RATE_PER_M3)
    setTiers(DEFAULT_TIERS)
  }

  return (
    <MobileLayout
      title="ຄິດໄລ່ລາຄາ"
      action={
        <button onClick={resetDefaults} className="text-xs font-medium text-primary">
          ຣີເຊັດຄ່າເລີ່ມຕົ້ນ
        </button>
      }
    >
      <div className="flex flex-col gap-4 p-5">
        {/* weight + dimensions */}
        <Card className="flex flex-col gap-3 p-4">
          <NumField label="ນ້ຳໜັກ (ກກ.)" value={weightKg} onChange={setWeightKg} />
          <p className="text-[11px] text-muted">ຂະໜາດກ່ອງ (ບໍ່ໃສ່ = ຄິດຕາມຕາຕະລາງລາຄາສິ້ນນ້ອຍ)</p>
          <div className="grid grid-cols-3 gap-2">
            <NumField label="ຍາວ (ຊມ.)" value={lengthCm} onChange={setLengthCm} compact />
            <NumField label="ກວ້າງ (ຊມ.)" value={widthCm} onChange={setWidthCm} compact />
            <NumField label="ສູງ (ຊມ.)" value={heightCm} onChange={setHeightCm} compact />
          </div>
        </Card>

        {/* result */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white shadow-[0_8px_24px_rgba(79,70,229,0.18)]"
          style={{ background: 'linear-gradient(135deg,#4F46E5,#3730A3)' }}
        >
          <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          {result.mode === 'empty' && <p className="text-sm text-white/70">ໃສ່ນ້ຳໜັກເພື່ອຄິດໄລ່ລາຄາ</p>}

          {result.mode === 'box' && (
            <div className="flex flex-col gap-2">
              <Row label="ລາຄາຕາມນ້ຳໜັກ" value={formatKip(result.weightPrice)} />
              <Row label={`ລາຄາຕາມປະລິມາດ (${result.volumeM3.toFixed(3)} ມ.³)`} value={formatKip(result.volumePrice)} />
              <div className="mt-1 border-t border-white/20 pt-2">
                <p className="text-xs text-white/70">ລາຄາທີ່ຕ້ອງຈ່າຍ</p>
                <p className="tabular text-3xl font-extrabold">{formatKip(result.finalPrice)}</p>
              </div>
            </div>
          )}

          {result.mode === 'tier' && (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-white/70">
                ຄິດຕາມຕາຕະລາງລາຄາສິ້ນນ້ອຍ ({result.tier.minKg}–{result.tier.maxKg} ກກ.)
              </p>
              <p className="tabular text-3xl font-extrabold">{formatKip(result.finalPrice)}</p>
            </div>
          )}

          {result.mode === 'weight_only' && (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-white/70">ບໍ່ຢູ່ໃນຕາຕະລາງລາຄາສິ້ນນ້ອຍ — ຄິດຕາມນ້ຳໜັກລ້ວນໆ</p>
              <p className="tabular text-3xl font-extrabold">{formatKip(result.finalPrice)}</p>
            </div>
          )}
        </div>

        {/* rate settings */}
        <Card className="flex flex-col gap-3 p-4">
          <span className="text-sm font-semibold text-ink/80">ອັດຕາຄ່າສົ່ງ</span>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="ລາຄາຕໍ່ກິໂລ (ກີບ)" value={String(ratePerKg)} onChange={(v) => setRatePerKg(Number(v) || 0)} compact />
            <NumField label="ລາຄາຕໍ່ແມັດກ້ອນ (ກີບ)" value={String(ratePerM3)} onChange={(v) => setRatePerM3(Number(v) || 0)} compact />
          </div>
        </Card>

        {/* tier table */}
        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink/80">ຕາຕະລາງລາຄາສິ້ນນ້ອຍ</span>
            <button onClick={addTier} className="text-xs font-semibold text-primary">
              + ເພີ່ມຂັ້ນລາຄາ
            </button>
          </div>

          {tiers.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 rounded-xl border border-border/70 p-3">
              <div className="grid grid-cols-2 gap-2">
                <NumField label="ຕັ້ງແຕ່ (ກກ.)" value={String(t.minKg)} onChange={(v) => updateTier(t.id, { minKg: Number(v) || 0 })} compact />
                <NumField label="ຮອດ (ກກ.)" value={String(t.maxKg)} onChange={(v) => updateTier(t.id, { maxKg: Number(v) || 0 })} compact />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={t.mode}
                  onChange={(e) => updateTier(t.id, { mode: e.target.value as PriceTier['mode'] })}
                  className="h-9 flex-1 rounded-md border border-border px-2 text-xs outline-none"
                >
                  <option value="flat">ລາຄາຄົງທີ່ (ກີບ)</option>
                  <option value="round_up">ປັດເປັນ (ກກ.)</option>
                </select>
                <input
                  type="number"
                  value={t.value}
                  onChange={(e) => updateTier(t.id, { value: Number(e.target.value) || 0 })}
                  className="tabular h-9 w-24 rounded-md border border-border px-2 text-xs outline-none"
                />
                <button onClick={() => removeTier(t.id)} className="text-xs font-medium text-danger">
                  ລຶບ
                </button>
              </div>
            </div>
          ))}
          {tiers.length === 0 && <p className="text-xs text-muted">ບໍ່ມີຂັ້ນລາຄາ — ຈະຄິດຕາມນ້ຳໜັກລ້ວນໆ</p>}
        </Card>
      </div>
    </MobileLayout>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className="tabular font-semibold">{value}</span>
    </div>
  )
}

function NumField({
  label,
  value,
  onChange,
  compact,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  compact?: boolean
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-ink/70">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={'tabular rounded-md border border-border px-2.5 outline-none focus:border-primary ' + (compact ? 'h-9 text-sm' : 'h-11 text-base')}
      />
    </label>
  )
}
