import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import {
  homeOutline,
  cubeOutline,
  peopleOutline,
  walletOutline,
  businessOutline,
  settingsOutline,
  searchOutline,
  notificationsOutline,
  archiveOutline,
  listOutline,
} from 'ionicons/icons'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import logo from '../assets/brand-logo.jpg'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'ໜ້າຫຼັກ', icon: homeOutline },
  { path: '/receive', label: 'ຮັບພັດສະດຸ', icon: cubeOutline },
  { path: '/parcels', label: 'ລາຍການພັດສະດຸ', icon: listOutline },
  { path: '/pending', label: 'ຂອງຄ້າງ', icon: archiveOutline },
  { path: '/customers', label: 'ລູກຄ້າ', icon: peopleOutline },
  { path: '/finance', label: 'ລາຍງານການເງິນ', icon: walletOutline },
  { path: '/branches', label: 'ສາຂາ', icon: businessOutline },
  { path: '/settings', label: 'ຕັ້ງຄ່າ', icon: settingsOutline },
]

function initialsOf(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

export default function MainLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [branchName, setBranchName] = useState<string | null>(null)
  const [initials, setInitials] = useState('')

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('full_name, branches(name)')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!data) return
        setInitials(initialsOf(data.full_name))
        const branch = Array.isArray(data.branches) ? data.branches[0] : data.branches
        setBranchName(branch?.name ?? null)
      })
  }, [session])

  return (
    <div className="flex h-screen w-screen bg-bg text-ink print:block print:h-auto print:w-auto">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col gap-5 border-r border-border bg-surface p-3 print:hidden">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <img src={logo} alt="ບຸນມີໄຊ" className="h-9 w-9 rounded-full object-cover shadow-sm" />
          <span className="font-semibold tracking-tight">ບຸນມີໄຊ</span>
        </div>

        <div className="flex h-9 items-center rounded-lg border border-border bg-bg/60 px-3 text-sm text-ink">
          <span className="truncate">{branchName ?? 'ບໍ່ໄດ້ຕັ້ງສາຂາ'}</span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={
                  'group flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors duration-150 ' +
                  (active ? 'bg-primary-tint font-semibold text-primary' : 'text-ink/65 hover:bg-bg hover:text-ink')
                }
              >
                <IonIcon
                  icon={item.icon}
                  className={'text-lg transition-colors duration-150 ' + (active ? 'text-primary' : 'text-ink/40 group-hover:text-ink/70')}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/95 px-8 backdrop-blur-sm print:hidden">
          <span className="text-sm font-medium text-ink/70">{title}</span>
          <div className="mx-8 flex h-9 max-w-md flex-1 items-center gap-2 rounded-lg border border-border px-3 transition-shadow focus-within:border-primary focus-within:ring-3 focus-within:ring-primary-tint">
            <IonIcon icon={searchOutline} className="text-muted" />
            <input
              placeholder="ຄົ້ນຫາເລກພັດສະດຸ, ຊື່ລູກຄ້າ, ເບີໂທ"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-bg hover:text-ink">
              <IonIcon icon={notificationsOutline} className="text-xl" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-surface bg-accent" />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#4338CA] text-xs font-semibold text-white shadow-sm ring-2 ring-surface">
              {initials}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 print:overflow-visible print:p-0">{children}</main>
      </div>
    </div>
  )
}
