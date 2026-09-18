import { useState, type FormEvent } from 'react'
import { useHistory } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { cubeOutline } from 'ionicons/icons'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui'

export default function Login() {
  const history = useHistory()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) {
      setError('ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ')
      return
    }
    history.push('/home')
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6 text-ink"
      style={{ background: 'radial-gradient(circle at 30% 15%, #EEF2FF 0%, #F8FAFC 50%)' }}
    >
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-border bg-surface p-8 shadow-xl shadow-primary/5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#4338CA] shadow-sm">
            <IonIcon icon={cubeOutline} className="text-lg text-white" />
          </span>
          <span className="font-semibold tracking-tight">ClearWay</span>
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">ເຂົ້າສູ່ລະບົບ</h1>
          <p className="text-sm text-muted">ສຳລັບຜູ້ບໍລິຫານ/ຫົວໜ້າສາຂາ</p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink/80">ອີເມວ</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border border-border px-3.5 text-[15px] outline-none focus:border-primary focus:ring-3 focus:ring-primary-tint"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink/80">ລະຫັດຜ່ານ</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl border border-border px-3.5 text-[15px] outline-none focus:border-primary focus:ring-3 focus:ring-primary-tint"
          />
        </label>

        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="h-12 w-full text-[15px]">
          {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
        </Button>
      </form>
    </div>
  )
}
