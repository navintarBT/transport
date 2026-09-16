import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <MainLayout title="ຕັ້ງຄ່າ">
      <h1 className="text-lg font-semibold">ຕັ້ງຄ່າ</h1>
      <button
        onClick={handleSignOut}
        className="mt-4 h-11 rounded-md border border-border px-6 text-sm font-semibold text-ink/80"
      >
        ອອກຈາກລະບົບ
      </button>
    </MainLayout>
  )
}
