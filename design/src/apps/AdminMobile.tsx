import { useState } from 'react'
import { Home, Calendar, MessageSquare, ShoppingBag, MoreHorizontal, ChevronRight, Check, X, Bell } from 'lucide-react'
import { adminStats, todaySchedule, serviceRequests, adminOrders, customers } from '../data/mock'
import { StatusBadge, StarRating, Avatar } from '../components/ui'

type Screen = 'home' | 'bookings' | 'requests' | 'orders' | 'more'

export default function AdminMobile() {
  const [screen, setScreen] = useState<Screen>('home')

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ]

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", height: 844, display: 'flex', flexDirection: 'column', background: '#f7f7f7' }}>
      {/* Status bar */}
      <div className="bg-[#0F0F0F] px-5 pt-3 pb-1 flex justify-between items-center shrink-0">
        <span className="text-xs font-black text-white">9:41</span>
        <span className="text-xs text-white">●●● 🔋</span>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7]">
        {screen === 'home' && <AdminHome setScreen={setScreen} />}
        {screen === 'bookings' && <AdminBookings />}
        {screen === 'requests' && <AdminRequests />}
        {screen === 'orders' && <AdminOrders />}
        {screen === 'more' && <AdminMore />}
      </div>

      {/* Bottom nav */}
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
                {t.id === 'requests' && adminStats.pendingRequests > 0 && (
                  <span className="absolute top-1.5 right-6 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">{adminStats.pendingRequests}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AdminHome({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-[#0F0F0F] px-5 pt-3 pb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#888] text-xs">Good morning</p>
            <h2 className="text-white font-black text-base">AutoCare Garage</h2>
            <p className="text-[#888] text-xs">Mon, 15 Sep 2024 · Open</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 border border-[#333] rounded-full flex items-center justify-center">
              <Bell size={14} className="text-[#888]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">3</span>
            </button>
            <Avatar name="Mohamed Gamal" size="sm" />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Today's Bookings", value: adminStats.todayBookings, accent: false },
            { label: 'Pending Requests', value: adminStats.pendingRequests, accent: true },
            { label: "Today's Revenue", value: `${adminStats.todayRevenue.toLocaleString()} EGP`, accent: false },
            { label: 'Active Services', value: adminStats.activeServices, accent: false },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1A1A1A] rounded-xl p-3">
              <p className={`text-2xl font-black ${stat.accent ? 'text-red-500' : 'text-white'}`}>{stat.value}</p>
              <p className="text-[#888] text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="px-5 pt-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold mb-2">
          ⚠ Brembo Brake Pads — Low Stock (4 units)
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold">
          ✕ Castrol 5W-40 — Out of Stock
        </div>
      </div>

      {/* Today's schedule */}
      <div className="px-5 mt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999]">Today's Schedule</p>
          <button onClick={() => setScreen('bookings')} className="text-xs font-semibold text-red-600">View all</button>
        </div>
        <div className="space-y-2">
          {todaySchedule.slice(0, 4).map((item, i) => (
            <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-red-600">{item.time}</p>
                  <p className="text-sm font-bold text-[#0F0F0F] mt-0.5">{item.customer}</p>
                  <p className="text-xs text-[#666]">{item.service}</p>
                  <p className="text-xs text-[#999] mt-0.5">{item.vehicle}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.status === 'upcoming' && (
                <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-[#F0F0F0]">
                  <button className="flex-1 py-1.5 bg-[#0F0F0F] text-white text-xs font-bold rounded-lg">Start Service</button>
                  <button className="flex-1 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-lg">Contact</button>
                </div>
              )}
              {item.status === 'in-progress' && (
                <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-[#F0F0F0]">
                  <button className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg">Mark Complete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending requests quick view */}
      <div className="px-5 mt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999]">Pending Requests</p>
          <button onClick={() => setScreen('requests')} className="text-xs font-semibold text-red-600">{adminStats.pendingRequests} new</button>
        </div>
        <div className="space-y-2">
          {serviceRequests.filter(r => r.status === 'pending').slice(0, 2).map(req => (
            <div key={req.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold text-[#0F0F0F]">{req.customer}</p>
                <StatusBadge status={req.priority === 'high' ? 'high' : 'medium'} />
              </div>
              <p className="text-xs text-[#666] mb-0.5">{req.service}</p>
              <p className="text-xs text-[#999]">{req.vehicle}</p>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-lg flex items-center justify-center gap-1"><X size={10} />Reject</button>
                <button className="flex-1 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"><Check size={10} />Accept</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminBookings() {
  const [tab, setTab] = useState<'today'|'upcoming'|'completed'>('today')
  const bookingList = [
    { time:'8:30 AM', customer:'Ahmed Hassan', service:'Oil & Filter Change', vehicle:'Toyota Corolla', status:'completed', price:250 },
    { time:'10:00 AM', customer:'Nadia Farouk', service:'AC Service', vehicle:'Hyundai Elantra', status:'in-progress', price:400 },
    { time:'11:30 AM', customer:'Khaled Mahmoud', service:'Wheel Alignment', vehicle:'BMW 320i', status:'upcoming', price:300 },
    { time:'2:00 PM', customer:'Omar Tarek', service:'Engine Diagnostics', vehicle:'Mercedes C200', status:'upcoming', price:200 },
    { time:'3:30 PM', customer:'Mona Ali', service:'Brake Inspection', vehicle:'Hyundai Elantra', status:'upcoming', price:0 },
  ]
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F] mb-3">Bookings</h1>
        <div className="flex gap-2">
          {(['today','upcoming','completed'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${tab===t?'bg-red-600 text-white':'bg-[#F5F5F5] text-[#555]'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {bookingList.map((b, i) => (
          <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-xs font-bold text-red-600">{b.time}</p>
                <p className="text-sm font-bold text-[#0F0F0F] mt-0.5">{b.customer}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <p className="text-xs text-[#666]">{b.service}</p>
            <p className="text-xs text-[#999] mt-0.5">{b.vehicle}</p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F0F0F0]">
              <p className="text-sm font-black text-[#0F0F0F]">{b.price === 0 ? 'Free inspection' : `${b.price} EGP`}</p>
              <div className="flex gap-2">
                {b.status === 'upcoming' && <button className="px-3 py-1.5 bg-[#0F0F0F] text-white text-xs font-bold rounded-lg">Start</button>}
                {b.status === 'in-progress' && <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg">Complete</button>}
                {b.status === 'completed' && <button className="px-3 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-lg">Receipt</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminRequests() {
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F]">Service Requests</h1>
        <p className="text-xs text-[#999] mt-0.5">{adminStats.pendingRequests} pending · Requires attention</p>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {serviceRequests.map(req => (
          <div key={req.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={req.priority === 'high' ? 'high' : 'medium'} />
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm font-bold text-[#0F0F0F]">{req.customer}</p>
                <p className="text-xs text-[#666]">{req.vehicle}</p>
              </div>
              <p className="text-xs text-[#999]">{req.date}</p>
            </div>
            <p className="text-sm font-semibold text-[#0F0F0F] mb-1">{req.service}</p>
            <p className="text-xs text-[#555] leading-relaxed mb-3 p-2.5 bg-[#F7F7F7] rounded-lg">{req.description.substring(0, 100)}...</p>
            {req.status === 'pending' && (
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-xl flex items-center justify-center gap-1"><X size={11} />Reject</button>
                <button className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"><Check size={11} />Accept</button>
              </div>
            )}
            {req.status === 'accepted' && (
              <button className="w-full py-2 bg-[#0F0F0F] text-white text-xs font-bold rounded-xl">Schedule Appointment</button>
            )}
            {req.status === 'scheduled' && (
              <button className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-xl">Mark In Progress</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminOrders() {
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F]">Orders</h1>
        <p className="text-xs text-[#999] mt-0.5">{adminStats.todayOrders} orders today</p>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {adminOrders.map(o => (
          <div key={o.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold text-[#999]">{o.id}</p>
                <p className="text-sm font-bold text-[#0F0F0F]">{o.customer}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <p className="text-xs text-[#555] mb-1">{o.products.join(', ')}</p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F0F0F0]">
              <div>
                <p className="text-base font-black text-[#0F0F0F]">{o.total} EGP</p>
                <p className={`text-xs font-semibold ${o.payment==='paid'?'text-green-600':'text-amber-600'}`}>{o.payment}</p>
              </div>
              <div className="flex gap-2">
                {o.status==='preparing' && <button className="px-3 py-1.5 bg-[#0F0F0F] text-white text-xs font-bold rounded-lg">Ship</button>}
                {o.status==='confirmed' && <button className="px-3 py-1.5 bg-[#0F0F0F] text-white text-xs font-bold rounded-lg">Prepare</button>}
                <button className="px-3 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-lg">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminMore() {
  const sections = [
    { label: 'My Business', items: ['Business Profile', 'Opening Hours', 'Gallery'] },
    { label: 'Management', items: ['Services', 'Products', 'Inventory', 'Customers', 'Reviews'] },
    { label: 'Finance', items: ['Revenue', 'Reports', 'Promotions'] },
    { label: 'Account', items: ['Settings', 'Security', 'Notifications', 'Sign Out'] },
  ]
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">AC</div>
          <div>
            <p className="font-black text-[#0F0F0F]">AutoCare Garage</p>
            <p className="text-xs text-[#999]">Mohamed Gamal · Business Owner</p>
          </div>
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
