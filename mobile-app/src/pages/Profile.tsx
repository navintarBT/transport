import { useNavigate } from 'react-router-dom'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <MobileLayout>
      <div className="flex flex-col gap-4 p-5">
        <span className="text-base font-semibold">ໂປຣໄຟລ໌</span>
        <button onClick={handleSignOut} className="h-12 rounded-full border border-border text-sm font-semibold text-ink/80">
          ອອກຈາກລະບົບ
        </button>
      </div>
    </MobileLayout>
  )
}
