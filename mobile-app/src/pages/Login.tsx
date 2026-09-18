import { useState, type FormEvent } from 'react'
import { useHistory } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui'
import logo from '../assets/brand-logo.jpg'

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
      className="flex h-full min-h-screen items-center justify-center overflow-y-auto p-6 text-ink"
      style={{
        background: 'radial-gradient(circle at 30% 15%, #EEF2FF 0%, #F8FAFC 50%)',
        paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
      }}
    >
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-border bg-surface p-8 shadow-xl shadow-primary/5">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={logo} alt="ບຸນມີໄຊ" className="h-24 w-24 rounded-full object-cover shadow-md" />
          <span className="text-lg font-bold tracking-tight">ບຸນມີໄຊ ຂົນສົ່ງດ່ວນລາວຈີນ</span>
        </div>

        <div className="text-center">
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
