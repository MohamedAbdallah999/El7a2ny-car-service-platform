import { useState } from 'react'
import CustomerWeb from './apps/CustomerWeb'
import CustomerMobile from './apps/CustomerMobile'
import AdminWeb from './apps/AdminWeb'
import AdminMobile from './apps/AdminMobile'
import SuperAdminWeb from './apps/SuperAdminWeb'
import SuperAdminMobile from './apps/SuperAdminMobile'
import CustomerWebAuth from './auth/CustomerWebAuth'
import CustomerMobileAuth from './auth/CustomerMobileAuth'
import AdminWebAuth from './auth/AdminWebAuth'
import AdminMobileAuth from './auth/AdminMobileAuth'
import SuperAdminWebAuth from './auth/SuperAdminWebAuth'
import SuperAdminMobileAuth from './auth/SuperAdminMobileAuth'

type AppView = 'customer-web' | 'customer-mobile' | 'admin-web' | 'admin-mobile' | 'super-admin-web' | 'super-admin-mobile'

const apps = [
  { id: 'customer-web', label: 'Customer Web', role: 'Customer' },
  { id: 'customer-mobile', label: 'Customer Mobile', role: 'Customer' },
  { id: 'admin-web', label: 'Admin Web', role: 'Admin' },
  { id: 'admin-mobile', label: 'Admin Mobile', role: 'Admin' },
  { id: 'super-admin-web', label: 'Super Admin Web', role: 'Super Admin' },
  { id: 'super-admin-mobile', label: 'Super Admin Mobile', role: 'Super Admin' },
] as const

const isMobileApp = (id: AppView) => id.endsWith('-mobile')

type AuthState = Record<AppView, boolean>

const initialAuth: AuthState = {
  'customer-web': false,
  'customer-mobile': false,
  'admin-web': false,
  'admin-mobile': false,
  'super-admin-web': false,
  'super-admin-mobile': false,
}

export default function App() {
  const [activeApp, setActiveApp] = useState<AppView>('customer-web')
  const [authed, setAuthed] = useState<AuthState>(initialAuth)

  const handleAuth = (app: AppView) => setAuthed(prev => ({ ...prev, [app]: true }))
  const handleSignOut = (app: AppView) => setAuthed(prev => ({ ...prev, [app]: false }))

  const isAuthed = authed[activeApp]

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Platform switcher bar */}
      <div className="bg-[#0A0A0A] text-white sticky top-0 z-50 border-b border-[#1F1F1F]">
        <div className="flex items-center">
          {/* Brand */}
          <div className="flex items-center gap-2 px-5 py-3 border-r border-[#1F1F1F] min-w-max">
            <span className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="font-black text-base tracking-tight">EL7A2NY</span>
            <span className="text-[#555] text-xs ml-1 font-semibold">Platform Preview</span>
          </div>

          {/* App tabs */}
          <div className="flex items-center overflow-x-auto">
            {apps.map((app, i) => {
              const active = activeApp === app.id
              const prevRole = i > 0 ? apps[i - 1].role : null
              const showDivider = prevRole && prevRole !== app.role
              const appAuthed = authed[app.id as AppView]

              return (
                <div key={app.id} className="flex items-center">
                  {showDivider && <div className="w-px h-8 bg-[#1F1F1F] mx-1" />}
                  <button
                    onClick={() => setActiveApp(app.id as AppView)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-r border-[#1F1F1F] ${
                      active
                        ? 'bg-red-600 text-white'
                        : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'
                    }`}>
                    {app.label}
                    {isMobileApp(app.id as AppView) && (
                      <span className={`text-[9px] px-1 py-0.5 rounded ${active ? 'bg-red-700 text-red-200' : 'bg-[#222] text-[#666]'}`}>MOB</span>
                    )}
                    {appAuthed && (
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Role indicator + sign out */}
          <div className="ml-auto px-5 py-3 shrink-0 flex items-center gap-3">
            {(() => {
              const current = apps.find(a => a.id === activeApp)
              const roleColors: Record<string, string> = { Customer: 'text-blue-400', Admin: 'text-amber-400', 'Super Admin': 'text-red-400' }
              return <span className={`text-xs font-bold ${roleColors[current?.role || '']}`}>{current?.role} View</span>
            })()}
            {isAuthed && (
              <button
                onClick={() => handleSignOut(activeApp)}
                className="text-[9px] font-bold text-[#555] hover:text-white border border-[#2A2A2A] px-2 py-1 rounded uppercase tracking-widest transition-colors">
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* App content */}
      <div className="flex-1">
        {/* Web apps */}
        {!isMobileApp(activeApp) && (
          <>
            {activeApp === 'customer-web' && (
              isAuthed
                ? <CustomerWeb />
                : <CustomerWebAuth onAuth={() => handleAuth('customer-web')} />
            )}
            {activeApp === 'admin-web' && (
              isAuthed
                ? <AdminWeb />
                : <AdminWebAuth onAuth={() => handleAuth('admin-web')} />
            )}
            {activeApp === 'super-admin-web' && (
              isAuthed
                ? <SuperAdminWeb />
                : <SuperAdminWebAuth onAuth={() => handleAuth('super-admin-web')} />
            )}
          </>
        )}

        {/* Mobile apps in phone frame */}
        {isMobileApp(activeApp) && (
          <div className="min-h-screen bg-[#EBEBEB] flex items-start justify-center py-10">
            <div className="relative">
              <div style={{
                width: 390,
                height: 844,
                background: '#1A1A1A',
                borderRadius: 54,
                padding: 10,
                boxShadow: '0 80px 160px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 44,
                  overflow: 'hidden',
                  background: '#fff',
                  position: 'relative',
                }}>
                  {activeApp === 'customer-mobile' && (
                    isAuthed
                      ? <CustomerMobile />
                      : <CustomerMobileAuth onAuth={() => handleAuth('customer-mobile')} />
                  )}
                  {activeApp === 'admin-mobile' && (
                    isAuthed
                      ? <AdminMobile />
                      : <AdminMobileAuth onAuth={() => handleAuth('admin-mobile')} />
                  )}
                  {activeApp === 'super-admin-mobile' && (
                    isAuthed
                      ? <SuperAdminMobile />
                      : <SuperAdminMobileAuth onAuth={() => handleAuth('super-admin-mobile')} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
