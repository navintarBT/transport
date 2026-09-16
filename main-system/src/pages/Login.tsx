import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { cubeOutline } from 'ionicons/icons'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
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
    navigate('/dashboard')
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg text-ink">
      <form
        onSubmit={handleSubmit}
        className="flex w-[400px] flex-col gap-6 rounded-[10px] border border-border bg-surface p-10"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-tint">
            <IonIcon icon={cubeOutline} className="text-lg text-primary" />
          </span>
          <span className="font-semibold">ClearWay</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">ເຂົ້າສູ່ລະບົບ</h1>
          <p className="text-sm text-muted">ລະບົບຄຸ້ມຄອງພັດສະດຸ ແລະ ການເງິນ</p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink/80">ຊື່ຜູ້ໃຊ້ / ອີເມວ</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ເຊັ່ນ kitti@clearway.la"
              className="h-11 rounded-md border border-border px-3.5 text-[15px] outline-none focus:border-primary focus:ring-3 focus:ring-primary-tint"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink/80">ລະຫັດຜ່ານ</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-md border border-border px-3.5 text-[15px] outline-none focus:border-primary focus:ring-3 focus:ring-primary-tint"
            />
          </label>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-md bg-primary font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
        </button>
      </form>
    </div>
  )
}
