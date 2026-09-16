import { useEffect, useState } from 'react'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'
import { formatKip } from '../lib/types'

type Row = {
  id: string
  type: 'shipping_fee' | 'cod' | 'commission'
  amount: number
  payment_status: 'paid' | 'pending'
}

export default function Finance() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('transactions')
      .select('id, type, amount, payment_status')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRows((data as Row[]) ?? [])
      })
  }, [])

  const sum = (pred: (r: Row) => boolean) => rows.filter(pred).reduce((s, r) => s + Number(r.amount), 0)

  const revenue = sum((r) => r.payment_status === 'paid' && r.type !== 'commission')
  const codPaid = sum((r) => r.type === 'cod' && r.payment_status === 'paid')
  const codPending = sum((r) => r.type === 'cod' && r.payment_status === 'pending')
  const commission = sum((r) => r.type === 'commission')

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-5">
        <span className="text-base font-semibold">ສະຫຼຸບການເງິນ</span>

        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>
        )}

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-1 text-xs text-muted">ລາຍຮັບລວມ</p>
          <p className="tabular text-[32px] font-semibold">{formatKip(revenue)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <SmallCard label="ຄ່າຄອມມິຊັນ" value={commission} />
          <SmallCard label="COD ເກັບແລ້ວ" value={codPaid} />
          <SmallCard label="ຍອດຄ້າງເກັບ" value={codPending} warning />
        </div>
      </div>
    </MobileLayout>
  )
}

function SmallCard({ label, value, warning }: { label: string; value: number; warning?: boolean }) {
  return (
    <div className={'rounded-2xl border p-4 ' + (warning ? 'border-warning/40 bg-warning/5' : 'border-border bg-surface')}>
      <p className={'mb-1 text-[11px] ' + (warning ? 'text-warning' : 'text-muted')}>{label}</p>
      <p className={'tabular text-lg font-semibold ' + (warning ? 'text-warning' : '')}>{formatKip(value)}</p>
    </div>
  )
}
