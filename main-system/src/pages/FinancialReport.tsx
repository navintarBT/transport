import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { formatKip, type Transaction } from '../lib/types'

const TYPE_LABEL: Record<Transaction['type'], string> = {
  shipping_fee: 'ຄ່າສົ່ງ',
  cod: 'COD',
  commission: 'ຄ່າຄອມມິຊັນ',
}

type Row = Transaction & { branches?: { name: string } | null }

export default function FinancialReport() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('transactions')
      .select('*, branches(name)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRows((data as Row[]) ?? [])
      })
  }, [])

  const codPaid = rows.filter((r) => r.type === 'cod' && r.payment_status === 'paid')
  const codPending = rows.filter((r) => r.type === 'cod' && r.payment_status === 'pending')
  const revenue = rows.filter((r) => r.payment_status === 'paid' && r.type !== 'commission')
  const commission = rows.filter((r) => r.type === 'commission')

  const sum = (list: Row[]) => list.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <MainLayout title="ລາຍງານການເງິນ">
      <h1 className="text-lg font-semibold">ລາຍງານການເງິນ</h1>

      {error && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: {error} — ກວດສອບວ່າໄດ້ແລ່ນ supabase/schema.sql ແລ້ວຫຼືບໍ່
        </p>
      )}

      <div className="mt-4 grid grid-cols-4 gap-5">
        <SummaryCard label="ລາຍຮັບລວມ" value={sum(revenue)} />
        <SummaryCard label="ຄ່າຄອມມິຊັນ" value={sum(commission)} />
        <SummaryCard label="ຍອດ COD ເກັບແລ້ວ" value={sum(codPaid)} />
        <SummaryCard label="ຍອດຄ້າງເກັບ" value={sum(codPending)} warning />
      </div>

      <div className="mt-5 rounded-lg border border-border bg-surface">
        <div className="border-b border-border/60 px-5 py-4 text-sm font-semibold">ລາຍການທຸລະກຳ</div>
        <div className="grid grid-cols-[130px_100px_140px_1fr_120px] px-5 py-2 text-xs font-medium text-muted">
          <span>ວັນທີ</span>
          <span>ສາຂາ</span>
          <span>ປະເພດ</span>
          <span className="text-right">ຈຳນວນເງິນ</span>
          <span className="text-right">ສະຖານະຊຳລະ</span>
        </div>
        {rows.length === 0 && <p className="px-5 py-6 text-sm text-muted">ຍັງບໍ່ມີລາຍການທຸລະກຳ</p>}
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[130px_100px_140px_1fr_120px] items-center border-t border-border/60 px-5 py-2.5 text-sm">
            <span className="tabular text-muted">{new Date(r.created_at).toLocaleDateString('lo-LA')}</span>
            <span>{r.branches?.name ?? '-'}</span>
            <span>{TYPE_LABEL[r.type]}</span>
            <span className={'tabular text-right font-semibold' + (r.type === 'commission' ? ' text-danger' : '')}>
              {r.type === 'commission' ? `(${formatKip(Number(r.amount))})` : formatKip(Number(r.amount))}
            </span>
            <span className="text-right">
              <span className={r.payment_status === 'paid' ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-warning'}>
                {r.payment_status === 'paid' ? 'ຊຳລະແລ້ວ' : 'ຄ້າງຊຳລະ'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </MainLayout>
  )
}

function SummaryCard({ label, value, warning }: { label: string; value: number; warning?: boolean }) {
  return (
    <div
      className={
        'rounded-lg border p-5 ' + (warning ? 'border-warning/40 bg-warning/5' : 'border-border bg-surface')
      }
    >
      <p className={'mb-2 text-xs font-medium ' + (warning ? 'text-warning' : 'text-muted')}>{label}</p>
      <p className={'tabular text-[26px] font-semibold ' + (warning ? 'text-warning' : '')}>
        {formatKip(value)}
      </p>
    </div>
  )
}
