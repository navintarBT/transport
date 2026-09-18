import { useEffect, useState, type FormEvent } from 'react'
import { IonIcon } from '@ionic/react'
import { businessOutline } from 'ionicons/icons'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import type { Branch } from '../lib/types'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const { data, error } = await supabase.from('branches').select('*').order('name')
    if (error) setError(error.message)
    else setBranches(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!name) return
    const { error } = await supabase.from('branches').insert({ name })
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    load()
  }

  return (
    <MainLayout title="ສາຂາ">
      <PageHeader title="ສາຂາ" />

      <form
        onSubmit={handleAdd}
        className="flex items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/80">ຊື່ສາຂາໃໝ່</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-56 rounded-md border border-border px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-tint" />
        </label>
        <Button type="submit" variant="secondary" className="h-10 px-5">
          ເພີ່ມສາຂາ
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-danger">{error} (ສະເພາະຜູ້ບໍລິຫານລະບົບເທົ່ານັ້ນທີ່ເພີ່ມສາຂາໄດ້)</p>}

      <div className="mt-5 grid grid-cols-4 gap-4">
        {branches.map((b) => (
          <Card key={b.id} className="flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-tint text-primary">
              <IonIcon icon={businessOutline} className="text-base" />
            </span>
            <span className="font-medium">{b.name}</span>
          </Card>
        ))}
        {branches.length === 0 && (
          <div className="col-span-4">
            <EmptyState icon={<IonIcon icon={businessOutline} className="text-3xl" />} message="ຍັງບໍ່ມີສາຂາ" />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
