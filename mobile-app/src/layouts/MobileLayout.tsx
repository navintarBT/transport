import type { ReactNode } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { homeOutline, businessOutline, walletOutline, calculatorOutline, personOutline } from 'ionicons/icons'

const TABS = [
  { path: '/home', label: 'ສະຫຼຸບ', icon: homeOutline },
  { path: '/branches', label: 'ສາຂາ', icon: businessOutline },
  { path: '/calculator', label: 'ຄິດໄລ່', icon: calculatorOutline },
  { path: '/finance', label: 'ການເງິນ', icon: walletOutline },
  { path: '/profile', label: 'ໂປຣໄຟລ໌', icon: personOutline },
]

export default function MobileLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const history = useHistory()

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <div className="pb-28">{children}</div>

      <nav
        className="fixed inset-x-5 bottom-4 flex h-[64px] items-center justify-around rounded-full border border-border/60 bg-surface/95 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-sm"
        style={{ maxWidth: 480, margin: '0 auto', left: '1.25rem', right: '1.25rem' }}
      >
        {TABS.map((tab) => {
          const active = location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => history.push(tab.path)}
              className="flex flex-1 flex-col items-center gap-1 py-2 transition-transform active:scale-95"
            >
              <span
                className={
                  'flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150 ' +
                  (active ? 'bg-primary-tint' : '')
                }
              >
                <IonIcon icon={tab.icon} className={active ? 'text-[18px] text-primary' : 'text-[18px] text-muted'} />
              </span>
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
