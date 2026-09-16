import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { homeOutline, businessOutline, walletOutline, personOutline } from 'ionicons/icons'

const TABS = [
  { path: '/home', label: 'ສະຫຼຸບ', icon: homeOutline },
  { path: '/branches', label: 'ສາຂາ', icon: businessOutline },
  { path: '/finance', label: 'ການເງິນ', icon: walletOutline },
  { path: '/profile', label: 'ໂປຣໄຟລ໌', icon: personOutline },
]

export default function MobileLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <div className="pb-24">{children}</div>

      <nav
        className="fixed inset-x-5 bottom-4 flex h-[60px] items-center justify-around rounded-full bg-surface shadow-[0_8px_20px_rgba(15,23,42,0.10)]"
        style={{ maxWidth: 480, margin: '0 auto', left: '1.25rem', right: '1.25rem' }}
      >
        {TABS.map((tab) => {
          const active = location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5"
            >
              <IonIcon
                icon={tab.icon}
                className={active ? 'text-[19px] text-primary' : 'text-[19px] text-muted'}
              />
              <span className={active ? 'text-[10px] font-semibold text-primary' : 'text-[10px] text-muted'}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
