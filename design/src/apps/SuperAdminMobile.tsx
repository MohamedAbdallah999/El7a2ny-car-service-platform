import { useState } from 'react'
import { LayoutDashboard, Building2, Users, Activity, MoreHorizontal, ChevronRight, Bell, Check, X } from 'lucide-react'
import { superAdminStats, businesses, customers, auditLogs } from '../data/mock'
import { StatusBadge, Avatar, Badge } from '../components/ui'

type Screen = 'dashboard' | 'businesses' | 'users' | 'activity' | 'more'

export default function SuperAdminMobile() {
  const [screen, setScreen] = useState<Screen>('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ]

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", height: 844, display: 'flex', flexDirection: 'column', background: '#f7f7f7' }}>
      {/* Status bar */}
      <div className="bg-[#0F0F0F] px-5 pt-3 pb-1 flex justify-between items-center shrink-0">
        <span className="text-xs font-black text-white">9:41</span>
        <span className="text-xs text-white">●●● 🔋</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {screen === 'dashboard' && <SAMDashboard setScreen={setScreen} />}
        {screen === 'businesses' && <SAMBusinesses />}
        {screen === 'users' && <SAMUsers />}
        {screen === 'activity' && <SAMActivity />}
        {screen === 'more' && <SAMMore />}
      </div>

      <div className="bg-white border-t border-[#E5E5E5] shrink-0">
        <div className="grid grid-cols-5">
          {tabs.map(t => {
            const Icon = t.icon
            const active = screen === t.id
            return (
              <button key={t.id} onClick={() => setScreen(t.id as Screen)}
                className={`flex flex-col items-center py-2.5 gap-0.5 relative ${active ? 'text-red-600' : 'text-[#AAA]'}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[9px] font-bold">{t.label}</span>
                {t.id === 'businesses' && (
                  <span className="absolute top-1.5 right-5 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">12</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SAMDashboard({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-[#0F0F0F] px-5 pt-3 pb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              <span className="text-white font-black text-sm tracking-tight">EL7A2NY</span>
            </div>
            <p className="text-white font-black text-base">Platform Dashboard</p>
            <p className="text-[#888] text-xs">Mon, 15 Sep 2024</p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 border border-[#333] rounded-full flex items-center justify-center cursor-pointer">
              <Bell size={14} className="text-[#888]" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">8</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Total Customers', value: superAdminStats.totalCustomers.toLocaleString(), accent: false },
            { label: 'Active Businesses', value: superAdminStats.activeBusinesses, accent: false },
            { label: 'Pending Approvals', value: superAdminStats.pendingApprovals, accent: true },
            { label: 'Open Disputes', value: superAdminStats.openDisputes, accent: true },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1A1A1A] rounded-xl p-3">
              <p className={`text-2xl font-black ${stat.accent ? 'text-red-500' : 'text-white'}`}>{stat.value}</p>
              <p className="text-[#888] text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* More KPIs */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { label: 'Revenue', value: '1.25M EGP' },
            { label: 'Bookings', value: superAdminStats.totalBookings.toLocaleString() },
            { label: 'Orders', value: superAdminStats.totalOrders.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="bg-[#1A1A1A] rounded-xl p-3">
              <p className="text-white font-black text-base">{s.value}</p>
              <p className="text-[#888] text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="px-5 pt-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold mb-2">
          🔴 7 open disputes require resolution
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
          ⚠ 12 businesses pending approval
        </div>
      </div>

      {/* Pending approvals */}
      <div className="px-5 mt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999]">Pending Approvals</p>
          <button onClick={() => setScreen('businesses')} className="text-xs font-semibold text-red-600">View all</button>
        </div>
        <div className="space-y-2">
          {businesses.filter(b => b.status === 'pending').map(b => (
            <div key={b.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="text-sm font-bold text-[#0F0F0F]">{b.name}</p>
                  <p className="text-xs text-[#666]">{b.owner} · {b.location}</p>
                  <p className="text-xs text-[#999]">Applied: {b.joinDate}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-lg">Review</button>
                <button className="flex-1 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"><X size={10} />Reject</button>
                <button className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"><Check size={10} />Approve</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999]">Recent Activity</p>
          <button onClick={() => setScreen('activity')} className="text-xs font-semibold text-red-600">View all</button>
        </div>
        <div className="space-y-2">
          {auditLogs.slice(0, 3).map(log => (
            <div key={log.id} className="bg-white border border-[#E5E5E5] rounded-xl p-3">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-xs font-bold text-[#0F0F0F]">{log.action}</p>
                <Badge variant={log.result==='success'?'success':'error'}>{log.result}</Badge>
              </div>
              <p className="text-xs text-[#666]">{log.resource}</p>
              <p className="text-[10px] text-[#999] mt-0.5">{log.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SAMBusinesses() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? businesses : businesses.filter(b => b.status === filter)

  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F] mb-3">Businesses</h1>
        <div className="flex gap-2 overflow-x-auto">
          {['all','active','pending','suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap ${filter===f?'bg-red-600 text-white':'bg-[#F5F5F5] text-[#555]'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F0F0F] flex items-center justify-center text-white text-[10px] font-black">
                  {b.name.split(' ').map(w=>w[0]).join('').substring(0,2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F0F0F]">{b.name}</p>
                  <p className="text-xs text-[#666]">{b.owner}</p>
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <p className="text-xs text-[#999] mb-2">{b.location} · Joined {b.joinDate}</p>
            <div className="flex gap-3 text-xs mb-3">
              {b.rating > 0 && <span><span className="text-amber-400">★</span> <span className="font-semibold">{b.rating}</span></span>}
              {b.services > 0 && <span className="text-[#555]">{b.services} services</span>}
              {b.revenue > 0 && <span className="text-[#555]">{b.revenue.toLocaleString()} EGP</span>}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-lg">View Details</button>
              {b.status==='pending' && <button className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg">Approve</button>}
              {b.status==='active' && <button className="flex-1 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">Suspend</button>}
              {b.status==='suspended' && <button className="flex-1 py-1.5 bg-[#0F0F0F] text-white text-xs font-bold rounded-lg">Reactivate</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SAMUsers() {
  const [tab, setTab] = useState<'customers'|'admins'>('customers')
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F] mb-3">Users</h1>
        <div className="flex gap-2">
          {(['customers','admins'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize ${tab===t?'bg-red-600 text-white':'bg-[#F5F5F5] text-[#555]'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 space-y-2">
        {tab === 'customers' ? customers.map(c => (
          <div key={c.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-center gap-3">
            <Avatar name={c.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0F0F0F]">{c.name}</p>
              <p className="text-xs text-[#666] truncate">{c.email}</p>
              <p className="text-xs text-[#999]">{c.vehicles} vehicles · {c.bookings} bookings</p>
            </div>
            <div className="text-right">
              <StatusBadge status={c.status} />
              <p className="text-xs text-[#999] mt-1">{c.joinDate}</p>
            </div>
          </div>
        )) : businesses.map(b => (
          <div key={b.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F0F0F] flex items-center justify-center text-white text-xs font-black shrink-0">
              {b.owner.split(' ').map(w=>w[0]).join('').substring(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0F0F0F]">{b.owner}</p>
              <p className="text-xs text-[#666] truncate">{b.name}</p>
              <p className="text-xs text-[#999]">{b.location}</p>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SAMActivity() {
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F]">Audit Logs</h1>
        <p className="text-xs text-[#999] mt-0.5">All platform actions and changes</p>
      </div>
      <div className="px-5 pt-4 space-y-2">
        {auditLogs.map(log => (
          <div key={log.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <Avatar name={log.user} size="xs" />
                <span className="text-sm font-bold text-[#0F0F0F]">{log.user}</span>
              </div>
              <Badge variant={log.result==='success'?'success':'error'}>{log.result}</Badge>
            </div>
            <p className="text-xs font-semibold text-[#0F0F0F] mt-1">{log.action}</p>
            <p className="text-xs text-[#666]">{log.resource}</p>
            <div className="flex justify-between items-center mt-2">
              <Badge variant="muted">{log.role.replace('_',' ')}</Badge>
              <p className="text-[10px] text-[#999]">{log.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SAMMore() {
  const sections = [
    { label: 'Platform Management', items: ['Categories', 'Products', 'Platform Settings'] },
    { label: 'Financial', items: ['Payments', 'Revenue Reports', 'Refunds'] },
    { label: 'Operations', items: ['Orders', 'Bookings', 'Disputes', 'Reports'] },
    { label: 'System', items: ['System Settings', 'Permissions', 'Security', 'Sign Out'] },
  ]
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">SA</div>
          <div>
            <p className="font-black text-[#0F0F0F]">Super Admin</p>
            <p className="text-xs text-[#999]">Platform Owner · Full Access</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[['15.4K','Customers'],['234','Businesses'],['1.25M EGP','Revenue']].map(([v,l])=>(
            <div key={l} className="bg-[#F5F5F5] rounded-xl py-3 text-center">
              <p className="font-black text-[#0F0F0F] text-sm">{v}</p>
              <p className="text-[#999] text-[10px]">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 space-y-4">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-2">{section.label}</p>
            <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden divide-y divide-[#F0F0F0]">
              {section.items.map(item => (
                <button key={item} className={`w-full flex justify-between items-center px-4 py-3.5 text-sm text-left transition-colors ${item==='Sign Out'?'text-red-600 hover:bg-red-50':'text-[#0F0F0F] hover:bg-[#F9F9F9]'}`}>
                  <span className="font-semibold">{item}</span>
                  {item !== 'Sign Out' && <ChevronRight size={15} className="text-[#CCC]" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
