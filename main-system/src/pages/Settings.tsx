import { useNavigate } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { logOutOutline } from 'ionicons/icons'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import { Button, Card, PageHeader } from '../components/ui'

export default function Settings() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <MainLayout title="ຕັ້ງຄ່າ">
      <PageHeader title="ຕັ້ງຄ່າ" />

      <Card className="max-w-md p-5">
        <Button variant="danger" onClick={handleSignOut} className="h-11 w-full">
          <IonIcon icon={logOutOutline} className="text-base" />
          ອອກຈາກລະບົບ
        </Button>
      </Card>
    </MainLayout>
  )
}
