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
} from 'ionicons/icons'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'ໜ້າຫຼັກ', icon: homeOutline },
  { path: '/parcels/new', label: 'ຮັບພັດສະດຸ', icon: cubeOutline },
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
    <div className="flex h-screen w-screen bg-bg text-ink">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col gap-5 border-r border-border bg-surface p-3">
        <div className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-tint">
            <IonIcon icon={cubeOutline} className="text-lg text-primary" />
          </span>
          <span className="font-semibold">ClearWay</span>
        </div>

        <div className="flex h-9 items-center rounded-md border border-border px-3 text-sm text-ink">
          <span>{branchName ?? 'ບໍ່ໄດ້ຕັ້ງສາຂາ'}</span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={
                  'flex h-10 items-center gap-2.5 rounded-md px-4 text-sm ' +
                  (active
                    ? 'border-l-[3px] border-primary bg-primary-tint pl-[13px] font-semibold text-primary'
                    : 'text-ink/70 hover:bg-bg')
                }
              >
                <IonIcon icon={item.icon} className="text-lg" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-8">
          <span className="text-sm text-muted">{title}</span>
          <div className="mx-8 flex h-9 max-w-md flex-1 items-center gap-2 rounded-lg border border-border px-3">
            <IonIcon icon={searchOutline} className="text-muted" />
            <span className="text-sm text-muted">ຄົ້ນຫາເລກພັດສະດຸ, ຊື່ລູກຄ້າ, ເບີໂທ</span>
          </div>
          <div className="flex items-center gap-4">
            <IonIcon icon={notificationsOutline} className="text-xl text-ink/70" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  )
}
