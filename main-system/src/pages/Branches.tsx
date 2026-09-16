import { useEffect, useState, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import type { Branch } from '../lib/types'

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
      <h1 className="text-lg font-semibold">ສາຂາ</h1>

      <form onSubmit={handleAdd} className="mt-4 flex items-end gap-3 rounded-lg border border-border bg-surface p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/80">ຊື່ສາຂາໃໝ່</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-56 rounded-md border border-border px-3 text-sm outline-none focus:border-primary" />
        </label>
        <button type="submit" className="h-10 rounded-md border border-border px-5 text-sm font-semibold text-ink/80">
          ເພີ່ມສາຂາ
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-danger">{error} (ສະເພາະຜູ້ບໍລິຫານລະບົບເທົ່ານັ້ນທີ່ເພີ່ມສາຂາໄດ້)</p>}

      <div className="mt-5 grid grid-cols-4 gap-4">
        {branches.map((b) => (
          <div key={b.id} className="rounded-lg border border-border bg-surface p-4">
            <span className="font-medium">{b.name}</span>
          </div>
        ))}
        {branches.length === 0 && <p className="text-sm text-muted">ຍັງບໍ່ມີສາຂາ</p>}
      </div>
    </MainLayout>
  )
}
