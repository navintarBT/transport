import { useEffect, useState } from 'react'
import { IonIcon } from '@ionic/react'
import { walletOutline, cashOutline, checkmarkDoneOutline, alertCircleOutline, receiptOutline } from 'ionicons/icons'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { formatKip, type Transaction } from '../lib/types'
import { Card, EmptyState, PageHeader } from '../components/ui'

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
      <PageHeader title="ລາຍງານການເງິນ" />

      {error && (
        <p className="mb-5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: {error} — ກວດສອບວ່າໄດ້ແລ່ນ supabase/schema.sql ແລ້ວຫຼືບໍ່
        </p>
      )}

      <div className="grid grid-cols-4 gap-5">
        <SummaryCard label="ລາຍຮັບລວມ" value={sum(revenue)} icon={walletOutline} iconColor="#4F46E5" />
        <SummaryCard label="ຄ່າຄອມມິຊັນ" value={sum(commission)} icon={receiptOutline} iconColor="#64748B" />
        <SummaryCard label="ຍອດ COD ເກັບແລ້ວ" value={sum(codPaid)} icon={checkmarkDoneOutline} iconColor="#16A34A" />
        <SummaryCard label="ຍອດຄ້າງເກັບ" value={sum(codPending)} icon={alertCircleOutline} warning />
      </div>

      <Card className="mt-5">
        <div className="border-b border-border/60 px-5 py-4 text-sm font-semibold">ລາຍການທຸລະກຳ</div>
        <div className="grid grid-cols-[130px_100px_140px_1fr_120px] px-5 py-2 text-xs font-medium text-muted">
          <span>ວັນທີ</span>
          <span>ສາຂາ</span>
          <span>ປະເພດ</span>
          <span className="text-right">ຈຳນວນເງິນ</span>
          <span className="text-right">ສະຖານະຊຳລະ</span>
        </div>
        {rows.length === 0 && <EmptyState icon={<IonIcon icon={cashOutline} className="text-3xl" />} message="ຍັງບໍ່ມີລາຍການທຸລະກຳ" />}
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[130px_100px_140px_1fr_120px] items-center border-t border-border/60 px-5 py-3 text-sm transition-colors hover:bg-bg/60">
            <span className="tabular text-muted">{new Date(r.created_at).toLocaleDateString('lo-LA')}</span>
            <span className="text-ink/70">{r.branches?.name ?? '-'}</span>
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
      </Card>
    </MainLayout>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  iconColor,
  warning,
}: {
  label: string
  value: number
  icon: string
  iconColor?: string
  warning?: boolean
}) {
  return (
    <Card className={warning ? 'border-warning/30 bg-warning/5 p-5' : 'p-5'}>
      <div className="mb-3 flex items-center justify-between">
        <p className={'text-xs font-medium ' + (warning ? 'text-warning' : 'text-muted')}>{label}</p>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: warning ? 'rgba(217,119,6,0.1)' : `${iconColor}1A`, color: warning ? '#D97706' : iconColor }}
        >
          <IonIcon icon={icon} className="text-base" />
        </span>
      </div>
      <p className={'tabular text-[26px] font-semibold ' + (warning ? 'text-warning' : '')}>{formatKip(value)}</p>
    </Card>
  )
}
