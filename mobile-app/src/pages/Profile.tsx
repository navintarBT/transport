import { useHistory } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { logOutOutline } from 'ionicons/icons'
import MobileLayout from '../layouts/MobileLayout'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui'

export default function Profile() {
  const history = useHistory()

  async function handleSignOut() {
    await supabase.auth.signOut()
    history.push('/login')
  }

  return (
    <MobileLayout title="ໂປຣໄຟລ໌">
      <div className="flex flex-col gap-4 p-5">
        <Card className="p-2">
          <button
            onClick={handleSignOut}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-danger transition-colors active:bg-danger/5"
          >
            <IonIcon icon={logOutOutline} className="text-base" />
            ອອກຈາກລະບົບ
          </button>
        </Card>
      </div>
    </MobileLayout>
  )
}
