import { useEffect, useState, type FormEvent } from 'react'
import MainLayout from '../layouts/MainLayout'
import { supabase } from '../lib/supabase'
import type { Customer } from '../lib/types'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const query = supabase.from('customers').select('*').order('created_at', { ascending: false })
    const { data, error } = search
      ? await query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      : await query
    if (error) setError(error.message)
    else setCustomers(data ?? [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!name || !phone) return
    const { error } = await supabase.from('customers').insert({ name, phone })
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    setPhone('')
    load()
  }

  return (
    <MainLayout title="ລູກຄ້າ">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">ລູກຄ້າ</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ຄົ້ນຫາຊື່ / ເບີໂທ"
          className="h-9 w-72 rounded-full border border-border px-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <form onSubmit={handleAdd} className="mt-4 flex items-end gap-3 rounded-lg border border-border bg-surface p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/80">ຊື່ລູກຄ້າໃໝ່</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-56 rounded-md border border-border px-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/80">ເບີໂທ</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="tabular h-10 w-44 rounded-md border border-border px-3 text-sm outline-none focus:border-primary" />
        </label>
        <button type="submit" className="h-10 rounded-md border border-border px-5 text-sm font-semibold text-ink/80">
          ເພີ່ມລູກຄ້າໃໝ່
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <div className="mt-5 rounded-lg border border-border bg-surface">
        <div className="grid grid-cols-[1fr_160px_160px] border-b border-border/60 px-5 py-2 text-xs font-medium text-muted">
          <span>ຊື່ລູກຄ້າ</span>
          <span>ເບີໂທ</span>
          <span>ວັນທີ່ເພີ່ມ</span>
        </div>
        {customers.length === 0 && <p className="px-5 py-6 text-sm text-muted">ບໍ່ພົບລູກຄ້າ</p>}
        {customers.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_160px_160px] items-center border-t border-border/60 px-5 py-3 text-sm">
            <span>{c.name}</span>
            <span className="tabular text-muted">{c.phone}</span>
            <span className="tabular text-muted">{new Date(c.created_at).toLocaleDateString('lo-LA')}</span>
          </div>
        ))}
      </div>
    </MainLayout>
  )
}
