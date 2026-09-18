import type { ReactNode } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import { homeOutline, businessOutline, walletOutline, calculatorOutline, personOutline } from 'ionicons/icons'
import logo from '../assets/brand-logo.jpg'

const TABS = [
  { path: '/home', label: 'ສະຫຼຸບ', icon: homeOutline },
  { path: '/branches', label: 'ສາຂາ', icon: businessOutline },
  { path: '/calculator', label: 'ຄິດໄລ່', icon: calculatorOutline },
  { path: '/finance', label: 'ການເງິນ', icon: walletOutline },
  { path: '/profile', label: 'ໂປຣໄຟລ໌', icon: personOutline },
]

export default function MobileLayout({
  title,
  action,
  children,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
}) {
  const location = useLocation()
  const history = useHistory()

  return (
    // Ionic gives every route's page a fixed-height `.ion-page` container
    // (it expects <IonContent> to do the scrolling inside it) — since we
    // use plain divs instead, this element has to scroll itself.
    <div className="relative flex h-full flex-col overflow-hidden bg-bg text-ink">
      {title && (
        <header
          className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-surface/95 px-5 backdrop-blur-sm"
          style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2">
            <img src={logo} alt="ບຸນມີໄຊ" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-base font-semibold tracking-tight">{title}</span>
          </div>
          {action}
        </header>
      )}

      <div className="flex-1 overflow-y-auto" style={!title ? { paddingTop: 'env(safe-area-inset-top)' } : undefined}>
        <div className="pb-28">{children}</div>
      </div>

      <nav
        className="fixed inset-x-5 flex h-[64px] items-center justify-around rounded-full border border-border/60 bg-surface/95 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-sm"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          left: '1.25rem',
          right: '1.25rem',
          bottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
        }}
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
