import { useEffect, useState } from 'react'
import { IonIcon } from '@ionic/react'
import { walletOutline } from 'ionicons/icons'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'
import { formatKip } from '../lib/types'
import { Card } from '../components/ui'

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
          <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>
        )}

        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white shadow-[0_8px_24px_rgba(79,70,229,0.18)]"
          style={{ background: 'linear-gradient(135deg,#4F46E5,#3730A3)' }}
        >
          <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-2">
            <IonIcon icon={walletOutline} className="text-lg text-white/70" />
            <p className="text-xs text-white/70">ລາຍຮັບລວມ</p>
          </div>
          <p className="tabular relative mt-1 text-[32px] font-semibold">{formatKip(revenue)}</p>
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
    <Card className={'p-4 ' + (warning ? 'border-warning/30 bg-warning/5' : '')}>
      <p className={'mb-1 text-[11px] ' + (warning ? 'text-warning' : 'text-muted')}>{label}</p>
      <p className={'tabular text-lg font-semibold ' + (warning ? 'text-warning' : '')}>{formatKip(value)}</p>
    </Card>
  )
}
