import { useState } from 'react'
import { LayoutDashboard, Building2, Calendar, MessageSquare, Wrench, Package, Archive, ShoppingBag, Users, Star, TrendingUp, BarChart2, Tag, Settings, Bell, ChevronDown, Plus, Check, X } from 'lucide-react'
import { adminStats, todaySchedule, serviceRequests, reviews, inventoryItems, adminOrders, customers, services, products, promotions } from '../data/mock'
import { Btn, Badge, StatusBadge, StarRating, Avatar, Table, TR, TD, StatsGrid, StatCell, PageHeader, AlertRow } from '../components/ui'

type Screen = 'dashboard' | 'business' | 'bookings' | 'requests' | 'services' | 'products' | 'inventory' | 'orders' | 'customers' | 'reviews' | 'revenue' | 'reports' | 'promotions' | 'settings'

const nav: { id: Screen; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'business', label: 'My Business', icon: Building2 },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'requests', label: 'Service Requests', icon: MessageSquare },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Archive },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminWeb() {
  const [screen, setScreen] = useState<Screen>('dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F7]" style={{ fontFamily: "'Manrope', sans-serif", minHeight: 'calc(100vh - 40px)' }}>
      {/* Sidebar */}
      <aside className="w-56 bg-[#0F0F0F] flex flex-col shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            <span className="text-white font-black text-sm tracking-tight">EL7A2NY</span>
          </div>
          <p className="text-[#888] text-xs font-semibold">Admin Portal</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white text-[9px] font-black">AC</div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">AutoCare Garage</p>
              <p className="text-[#888] text-[10px]">Dokki, Cairo</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map(item => {
            const Icon = item.icon
            const active = screen === item.id
            return (
              <button key={item.id} onClick={() => setScreen(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${active ? 'bg-red-600 text-white' : 'text-[#888] hover:text-white hover:bg-white/5'}`}>
                <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                {item.label}
                {item.id === 'requests' && <span className="ml-auto text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full">{adminStats.pendingRequests}</span>}
                {item.id === 'reviews' && <span className="ml-auto text-[9px] font-black bg-[#333] text-white px-1.5 py-0.5 rounded-full">{adminStats.newReviews}</span>}
              </button>
            )
          })}
        </nav>
        <div className="px-4 py-3 border-t border-[#1F1F1F]">
          <div className="flex items-center gap-2">
            <Avatar name="Mohamed Gamal" size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Mohamed Gamal</p>
              <p className="text-[#888] text-[10px]">Business Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E5E5E5] px-6 h-12 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-sm font-bold text-[#0F0F0F] capitalize">{nav.find(n=>n.id===screen)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#999]">Mon, 15 Sep 2024</span>
            <div className="relative">
              <Bell size={16} className="text-[#555]" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">3</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Avatar name="Mohamed Gamal" size="xs" />
              <ChevronDown size={12} className="text-[#999]" />
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main className="flex-1 overflow-y-auto p-6">
          {screen === 'dashboard' && <Dashboard />}
          {screen === 'business' && <BusinessProfile />}
          {screen === 'bookings' && <Bookings />}
          {screen === 'requests' && <Requests />}
          {screen === 'services' && <ServicesScreen />}
          {screen === 'products' && <ProductsScreen />}
          {screen === 'inventory' && <Inventory />}
          {screen === 'orders' && <Orders />}
          {screen === 'customers' && <CustomersScreen />}
          {screen === 'reviews' && <ReviewsScreen />}
          {screen === 'revenue' && <Revenue />}
          {screen === 'reports' && <Reports />}
          {screen === 'promotions' && <Promotions />}
          {screen === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-xl font-black text-[#0F0F0F]">Good morning, AutoCare Garage</h2>
          <p className="text-sm text-[#666] mt-0.5">Monday, 15 September 2024 · Here's how your shop is performing today.</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm">Download Report</Btn>
          <Btn size="sm">+ New Booking</Btn>
        </div>
      </div>

      {/* KPIs */}
      <StatsGrid cols={4}>
        <StatCell label="Today's Bookings" value={adminStats.todayBookings} sub="3 in progress" border />
        <StatCell label="Pending Requests" value={adminStats.pendingRequests} red sub="Need attention" border />
        <StatCell label="Active Services" value={adminStats.activeServices} sub="On the floor now" border />
        <StatCell label="Today's Revenue" value={`${adminStats.todayRevenue.toLocaleString()} EGP`} sub="Services + orders" />
      </StatsGrid>
      <StatsGrid cols={4}>
        <StatCell label="Completed Today" value={adminStats.completedToday} sub="Out of 12 booked" border />
        <StatCell label="Today's Orders" value={adminStats.todayOrders} sub="Parts & products" border />
        <StatCell label="Total Customers" value={adminStats.totalCustomers} sub="All time" border />
        <StatCell label="New Reviews" value={adminStats.newReviews} sub="Average: 4.8★" />
      </StatsGrid>

      {/* Alerts */}
      <div className="mt-5 space-y-2">
        <AlertRow type="warning" message="⚠ Brembo Brake Pads (Front) — only 4 units left in stock. Reorder recommended." />
        <AlertRow type="error" message="✕ Castrol EDGE 5W-40 is out of stock. 2 pending orders cannot be fulfilled." />
      </div>

      <div className="grid grid-cols-3 gap-5 mt-5">
        {/* Today's Schedule */}
        <div className="col-span-2 bg-white border border-[#E5E5E5] rounded-lg">
          <div className="px-5 py-4 border-b border-[#E5E5E5] flex justify-between items-center">
            <h3 className="font-bold text-[#0F0F0F]">Today's Schedule</h3>
            <span className="text-xs text-[#999]">6 appointments</span>
          </div>
          <Table headers={['Time', 'Customer', 'Vehicle', 'Service', 'Technician', 'Status']}>
            {todaySchedule.map((row, i) => (
              <TR key={i}>
                <TD className="font-semibold text-[#0F0F0F] text-xs">{row.time}</TD>
                <TD className="font-semibold text-[#0F0F0F]">{row.customer}</TD>
                <TD className="text-[#555]">{row.vehicle}</TD>
                <TD className="text-[#555]">{row.service}</TD>
                <TD className="text-xs text-[#555]">{row.tech}</TD>
                <TD><StatusBadge status={row.status} /></TD>
              </TR>
            ))}
          </Table>
        </div>

        {/* Pending requests */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg">
          <div className="px-5 py-4 border-b border-[#E5E5E5] flex justify-between items-center">
            <h3 className="font-bold text-[#0F0F0F]">Pending Requests</h3>
            <span className="text-xs text-red-600 font-semibold">{adminStats.pendingRequests} new</span>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {serviceRequests.filter(r => r.status === 'pending' || r.status === 'accepted').slice(0, 4).map(req => (
              <div key={req.id} className="px-5 py-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-[#0F0F0F]">{req.customer}</p>
                  <StatusBadge status={req.priority === 'high' ? 'high' : 'medium'} />
                </div>
                <p className="text-xs text-[#666] mb-0.5">{req.service}</p>
                <p className="text-xs text-[#999]">{req.vehicle}</p>
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Reject</button>
                    <button className="flex-1 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700">Accept</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-5 bg-white border border-[#E5E5E5] rounded-lg">
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex justify-between items-center">
          <h3 className="font-bold text-[#0F0F0F]">Recent Orders</h3>
          <button className="text-xs font-semibold text-red-600">View all</button>
        </div>
        <Table headers={['Order ID', 'Customer', 'Products', 'Qty', 'Total', 'Payment', 'Status', 'Date']}>
          {adminOrders.map(o => (
            <TR key={o.id}>
              <TD className="font-semibold text-[#0F0F0F] text-xs">{o.id}</TD>
              <TD className="font-semibold">{o.customer}</TD>
              <TD className="text-[#555] text-xs">{o.products.join(', ')}</TD>
              <TD>{o.qty}</TD>
              <TD className="font-semibold text-[#0F0F0F]">{o.total} EGP</TD>
              <TD><Badge variant={o.payment === 'paid' ? 'success' : 'warning'}>{o.payment}</Badge></TD>
              <TD><StatusBadge status={o.status} /></TD>
              <TD className="text-xs text-[#999]">{o.date}</TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function BusinessProfile() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div>
      <PageHeader title="My Business" sub="Manage your shop's profile and public information" action={<Btn size="sm">Save Changes</Btn>} />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="font-bold text-[#0F0F0F] mb-4">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-[#999] uppercase tracking-wide mb-1.5">Shop Name</label>
                <input className="w-full border border-[#E5E5E5] rounded-md px-3 py-2.5 text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-red-600" defaultValue="AutoCare Garage" /></div>
              <div><label className="block text-xs font-bold text-[#999] uppercase tracking-wide mb-1.5">Business Type</label>
                <select className="w-full border border-[#E5E5E5] rounded-md px-3 py-2.5 text-sm text-[#0F0F0F] focus:outline-none bg-white">
                  <option>General Auto Service</option><option>Specialized Mechanic</option><option>Body & Paint</option>
                </select></div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#999] uppercase tracking-wide mb-1.5">Description</label>
                <textarea rows={3} className="w-full border border-[#E5E5E5] rounded-md px-3 py-2.5 text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-red-600 resize-none" defaultValue="Premium automotive care with 15+ years experience." />
              </div>
              <div><label className="block text-xs font-bold text-[#999] uppercase tracking-wide mb-1.5">Phone</label>
                <input className="w-full border border-[#E5E5E5] rounded-md px-3 py-2.5 text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-red-600" defaultValue="+20 2 3333-4444" /></div>
              <div><label className="block text-xs font-bold text-[#999] uppercase tracking-wide mb-1.5">Email</label>
                <input className="w-full border border-[#E5E5E5] rounded-md px-3 py-2.5 text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-red-600" defaultValue="autocare@garage.eg" /></div>
              <div className="col-span-2"><label className="block text-xs font-bold text-[#999] uppercase tracking-wide mb-1.5">Address</label>
                <input className="w-full border border-[#E5E5E5] rounded-md px-3 py-2.5 text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-red-600" defaultValue="15 El-Tahrir St, Dokki, Cairo" /></div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="font-bold text-[#0F0F0F] mb-4">Opening Hours</h3>
            <div className="space-y-2">
              {[['Monday – Friday','8:00 AM','8:00 PM'],['Saturday','9:00 AM','5:00 PM'],['Sunday','Closed','']].map(([day,open,close])=>(
                <div key={day} className="flex items-center gap-4 text-sm">
                  <span className="text-[#555] w-28">{day}</span>
                  {open === 'Closed'
                    ? <span className="text-[#999] font-semibold">Closed</span>
                    : <><input className="border border-[#E5E5E5] rounded px-2 py-1.5 text-sm w-24 focus:outline-none" defaultValue={open} />
                        <span className="text-[#999]">to</span>
                        <input className="border border-[#E5E5E5] rounded px-2 py-1.5 text-sm w-24 focus:outline-none" defaultValue={close} /></>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="font-bold text-[#0F0F0F] mb-3">Business Status</h3>
            <div className="space-y-2">
              {[{label:'Open',desc:'Accepting bookings',active:isOpen},{label:'Closed',desc:'Not accepting bookings',active:!isOpen}].map(s=>(
                <button key={s.label} onClick={()=>setIsOpen(s.label==='Open')}
                  className={`w-full text-left p-3 border rounded-md transition-colors ${s.active?'border-red-600 bg-red-50':'border-[#E5E5E5] hover:border-[#AAA]'}`}>
                  <p className="text-sm font-bold text-[#0F0F0F]">{s.label}</p>
                  <p className="text-xs text-[#666]">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="font-bold text-[#0F0F0F] mb-3">Quick Stats</h3>
            <div className="space-y-3">
              {[['Overall Rating','4.8 ★'],['Total Reviews','234'],['Total Customers','248'],['Services Offered','12']].map(([l,v])=>(
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-[#666]">{l}</span>
                  <span className="font-bold text-[#0F0F0F]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Bookings() {
  const [tab, setTab] = useState<'all'|'upcoming'|'active'|'completed'>('all')
  const mockBookings = [
    { id:'BK-2024-0891', customer:'Ahmed Hassan', vehicle:'Toyota Corolla 2022', service:'Oil & Filter Change', date:'20 Sep', time:'10:00 AM', status:'upcoming', price:250 },
    { id:'BK-2024-0890', customer:'Nadia Farouk', vehicle:'Hyundai Elantra 2023', service:'AC Service', date:'15 Sep', time:'10:00 AM', status:'active', price:400 },
    { id:'BK-2024-0889', customer:'Khaled Mahmoud', vehicle:'BMW 320i 2021', service:'Wheel Alignment', date:'15 Sep', time:'11:30 AM', status:'upcoming', price:300 },
    { id:'BK-2024-0888', customer:'Omar Tarek', vehicle:'Mercedes C200 2020', service:'Engine Diagnostics', date:'15 Sep', time:'2:00 PM', status:'upcoming', price:200 },
    { id:'BK-2024-0887', customer:'Mona Ali', vehicle:'Hyundai Elantra 2023', service:'Brake Inspection', date:'14 Sep', time:'9:00 AM', status:'completed', price:0 },
    { id:'BK-2024-0886', customer:'Ahmed Hassan', vehicle:'Toyota Corolla 2022', service:'Tire Replacement', date:'12 Sep', time:'11:00 AM', status:'completed', price:1850 },
  ]
  const filtered = tab === 'all' ? mockBookings : mockBookings.filter(b => b.status === tab)

  return (
    <div>
      <PageHeader title="Bookings" sub="Manage all customer appointments" action={<Btn size="sm"><Plus size={14} />New Booking</Btn>} />
      <div className="flex border-b border-[#E5E5E5] mb-5">
        {(['all','upcoming','active','completed'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${tab===t?'border-red-600 text-red-600':'border-transparent text-[#555] hover:text-[#0F0F0F]'}`}>{t}</button>
        ))}
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Booking ID', 'Customer', 'Vehicle', 'Service', 'Date & Time', 'Price', 'Status', 'Actions']}>
          {filtered.map(b => (
            <TR key={b.id}>
              <TD className="font-semibold text-xs text-[#0F0F0F]">{b.id}</TD>
              <TD className="font-semibold text-[#0F0F0F]">{b.customer}</TD>
              <TD className="text-xs">{b.vehicle}</TD>
              <TD>{b.service}</TD>
              <TD className="text-xs">{b.date} · {b.time}</TD>
              <TD className="font-semibold">{b.price === 0 ? 'Free' : `${b.price} EGP`}</TD>
              <TD><StatusBadge status={b.status} /></TD>
              <TD>
                <div className="flex gap-1.5">
                  {b.status === 'upcoming' && <>
                    <button className="px-2.5 py-1 text-xs font-semibold bg-[#0F0F0F] text-white rounded hover:bg-[#1F1F1F]">Start</button>
                    <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">Edit</button>
                  </>}
                  {b.status === 'active' && <button className="px-2.5 py-1 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700">Complete</button>}
                  {b.status === 'completed' && <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">View</button>}
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function Requests() {
  return (
    <div>
      <PageHeader title="Service Requests" sub="Customer-submitted repair and service requests" />
      <div className="space-y-4">
        {serviceRequests.map(req => (
          <div key={req.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#999]">{req.id}</span>
                  <StatusBadge status={req.priority === 'high' ? 'high' : 'medium'} />
                  <StatusBadge status={req.status} />
                </div>
                <h3 className="text-base font-bold text-[#0F0F0F]">{req.service}</h3>
                <p className="text-sm text-[#666]">{req.customer} · {req.vehicle}</p>
              </div>
              <p className="text-xs text-[#999]">{req.date}</p>
            </div>
            <p className="text-sm text-[#555] leading-relaxed mb-4 p-3 bg-[#F7F7F7] rounded-md">{req.description}</p>
            {req.status === 'pending' && (
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm"><X size={13} />Reject</Btn>
                <Btn size="sm"><Check size={13} />Accept Request</Btn>
                <Btn variant="ghost" size="sm">Request More Info</Btn>
              </div>
            )}
            {req.status === 'accepted' && (
              <div className="flex gap-2">
                <Btn size="sm">Schedule Appointment</Btn>
                <Btn variant="secondary" size="sm">Contact Customer</Btn>
              </div>
            )}
            {req.status === 'scheduled' && (
              <div className="flex gap-2">
                <Btn size="sm">Mark as In Progress</Btn>
                <Btn variant="secondary" size="sm">Update Customer</Btn>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ServicesScreen() {
  return (
    <div>
      <PageHeader title="Services" sub="Manage the services your shop offers" action={<Btn size="sm"><Plus size={14} />Add Service</Btn>} />
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Service', 'Category', 'Price', 'Duration', 'Availability', 'Status', 'Actions']}>
          {services.map(s => (
            <TR key={s.id}>
              <TD className="font-semibold text-[#0F0F0F]">{s.name}</TD>
              <TD><Badge>{s.category}</Badge></TD>
              <TD className="font-semibold">{s.price === 0 ? 'Free' : `${s.price} EGP`}</TD>
              <TD className="text-[#555]">{s.duration}</TD>
              <TD className="text-xs text-[#555]">{s.compatible}</TD>
              <TD><StatusBadge status={s.available ? 'active' : 'inactive'} /></TD>
              <TD>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">Edit</button>
                  <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">{s.available ? 'Disable' : 'Enable'}</button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function ProductsScreen() {
  return (
    <div>
      <PageHeader title="Products" sub="Automotive parts and products sold by your shop" action={<Btn size="sm"><Plus size={14} />Add Product</Btn>} />
      <div className="grid grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
            <img src={p.image} alt={p.name} className="w-full h-36 object-cover bg-[#F5F5F5]" />
            <div className="p-3">
              <p className="text-[10px] font-bold text-[#999] uppercase tracking-wide">{p.brand}</p>
              <h3 className="text-sm font-bold text-[#0F0F0F] leading-snug mb-1">{p.name}</h3>
              <p className="text-xs text-[#999] mb-2">SKU: {p.sku}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-black text-[#0F0F0F]">{p.price} EGP</span>
                <StatusBadge status={p.stock === 0 ? 'out' : p.stock < 10 ? 'low' : 'ok'} />
              </div>
              <p className="text-xs text-[#999]">Stock: {p.stock} units</p>
              <div className="flex gap-1.5 mt-3">
                <button className="flex-1 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded hover:bg-[#F5F5F5]">Edit</button>
                <button className="flex-1 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded hover:bg-red-50">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Inventory() {
  return (
    <div>
      <PageHeader title="Inventory" sub="Track and manage your parts and product stock" action={<Btn variant="secondary" size="sm">Adjust Stock</Btn>} />
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[['In Stock','5 products','success'],['Low Stock','3 products','warning'],['Out of Stock','1 product','error']].map(([l,v,type])=>(
          <div key={l} className={`border rounded-lg p-4 ${type==='success'?'bg-green-50 border-green-200':type==='warning'?'bg-amber-50 border-amber-200':'bg-red-50 border-red-200'}`}>
            <p className={`text-2xl font-black ${type==='success'?'text-green-700':type==='warning'?'text-amber-700':'text-red-700'}`}>{v.split(' ')[0]}</p>
            <p className={`text-sm font-semibold ${type==='success'?'text-green-700':type==='warning'?'text-amber-700':'text-red-700'}`}>{l}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['SKU', 'Product', 'Category', 'Stock', 'Min. Stock', 'Status', 'Cost', 'Sale Price', 'Actions']}>
          {inventoryItems.map(item => (
            <TR key={item.id}>
              <TD className="text-xs font-mono text-[#555]">{item.sku}</TD>
              <TD className="font-semibold text-[#0F0F0F]">{item.name}</TD>
              <TD><Badge>{item.category}</Badge></TD>
              <TD className={`font-bold ${item.stock === 0 ? 'text-red-600' : item.stock < item.minStock ? 'text-amber-600' : 'text-green-600'}`}>{item.stock}</TD>
              <TD className="text-[#555]">{item.minStock}</TD>
              <TD><StatusBadge status={item.status} /></TD>
              <TD className="text-[#555]">{item.costPrice} EGP</TD>
              <TD className="font-semibold text-[#0F0F0F]">{item.salePrice} EGP</TD>
              <TD>
                <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">Adjust</button>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function Orders() {
  return (
    <div>
      <PageHeader title="Orders" sub="Customer orders for parts and products" />
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Order ID', 'Customer', 'Products', 'Total', 'Payment', 'Status', 'Date', 'Actions']}>
          {adminOrders.map(o => (
            <TR key={o.id}>
              <TD className="font-semibold text-xs text-[#0F0F0F]">{o.id}</TD>
              <TD className="font-semibold">{o.customer}</TD>
              <TD className="text-xs text-[#555]">{o.products.join(', ')}</TD>
              <TD className="font-semibold text-[#0F0F0F]">{o.total} EGP</TD>
              <TD><Badge variant={o.payment==='paid'?'success':'warning'}>{o.payment}</Badge></TD>
              <TD><StatusBadge status={o.status} /></TD>
              <TD className="text-xs text-[#999]">{o.date}</TD>
              <TD>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">View</button>
                  {o.status==='preparing' && <button className="px-2.5 py-1 text-xs font-bold bg-[#0F0F0F] text-white rounded">Ship</button>}
                  {o.status==='confirmed' && <button className="px-2.5 py-1 text-xs font-bold bg-[#0F0F0F] text-white rounded">Prepare</button>}
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function CustomersScreen() {
  return (
    <div>
      <PageHeader title="Customers" sub="Customers who have visited or ordered from AutoCare Garage" />
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Customer', 'Contact', 'Vehicles', 'Bookings', 'Orders', 'Last Visit', 'Status', 'Actions']}>
          {customers.map(c => (
            <TR key={c.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <Avatar name={c.name} size="xs" />
                  <span className="font-semibold text-[#0F0F0F]">{c.name}</span>
                </div>
              </TD>
              <TD className="text-xs"><p>{c.phone}</p><p className="text-[#999]">{c.email}</p></TD>
              <TD className="font-semibold text-center">{c.vehicles}</TD>
              <TD className="font-semibold text-center">{c.bookings}</TD>
              <TD className="font-semibold text-center">{c.orders}</TD>
              <TD className="text-xs text-[#555]">{c.lastVisit}</TD>
              <TD><StatusBadge status={c.status} /></TD>
              <TD><button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">View</button></TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function ReviewsScreen() {
  return (
    <div>
      <PageHeader title="Reviews" sub="Customer reviews and ratings for AutoCare Garage" />
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['4.8','Average Rating'],['234','Total Reviews'],['89%','5-star Rate'],['3','New This Week']].map(([v,l])=>(
          <div key={l} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <p className="text-2xl font-black text-[#0F0F0F]">{v}</p>
            <p className="text-sm text-[#666] mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={r.customer} size="sm" />
                <div>
                  <p className="font-bold text-[#0F0F0F]">{r.customer}</p>
                  <p className="text-xs text-[#999]">{r.service} · {r.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                <span className="text-xs text-[#999]">({r.rating}/5)</span>
              </div>
            </div>
            <p className="text-sm text-[#555] leading-relaxed mb-3">{r.comment}</p>
            {r.replied && (
              <div className="bg-[#F7F7F7] rounded-md p-3 border-l-2 border-red-600">
                <p className="text-xs font-bold text-red-600 mb-1">AutoCare Garage replied:</p>
                <p className="text-xs text-[#555]">{r.reply}</p>
              </div>
            )}
            {!r.replied && (
              <div>
                <textarea rows={2} placeholder="Write a reply to this review..." className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none" />
                <Btn size="sm" className="mt-2">Post Reply</Btn>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Revenue() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
  const data = [32000,38000,45000,41000,52000,49000,61000,58000,42500]
  const max = Math.max(...data)

  return (
    <div>
      <PageHeader title="Revenue" sub="AutoCare Garage financial performance" action={
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none"><option>Last 9 months</option><option>This year</option></select>
          <Btn variant="secondary" size="sm">Export</Btn>
        </div>
      } />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['4,250 EGP',"Today's Revenue",'Services + Orders'],['58,000 EGP','This Month','Sep 1–15'],['419,500 EGP','This Year','Jan–Sep 2024'],['1,740 EGP','Avg. Order Value','All time']].map(([v,l,s])=>(
          <div key={l} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <p className="text-2xl font-black text-[#0F0F0F]">{v}</p>
            <p className="text-sm font-semibold text-[#0F0F0F] mt-1">{l}</p>
            <p className="text-xs text-[#999] mt-0.5">{s}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-lg p-5 mb-5">
        <h3 className="font-bold text-[#0F0F0F] mb-4">Monthly Revenue — 2024</h3>
        <div className="flex items-end gap-3 h-40">
          {data.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold text-[#999]">{(v/1000).toFixed(0)}k</p>
              <div className="w-full rounded-t" style={{ height: `${(v/max)*100}%`, background: i === data.length-1 ? '#dc2626' : '#0F0F0F', opacity: i === data.length-1 ? 1 : 0.7 }} />
              <p className="text-[10px] text-[#999]">{months[i]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <div className="px-5 py-4 border-b border-[#E5E5E5]"><h3 className="font-bold text-[#0F0F0F]">Revenue Breakdown</h3></div>
        <Table headers={['Category', 'This Month', 'This Year', 'Change']}>
          {[['Services Revenue','42,000 EGP','350,000 EGP','+12%'],['Parts & Products','16,000 EGP','69,500 EGP','+8%'],['Oil Changes','9,750 EGP','78,500 EGP','+5%'],['Brake Services','12,600 EGP','89,200 EGP','+18%']].map(([c,m,y,ch])=>(
            <TR key={c}>
              <TD className="font-semibold text-[#0F0F0F]">{c}</TD>
              <TD className="font-semibold">{m}</TD>
              <TD>{y}</TD>
              <TD><span className="text-green-600 font-semibold text-xs">{ch}</span></TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function Reports() {
  return (
    <div>
      <PageHeader title="Reports" sub="Business intelligence and performance reports" />
      <div className="grid grid-cols-3 gap-4">
        {[
          { title:'Revenue Report', desc:'Monthly and annual revenue breakdown by service and product category.', updated:'15 Sep 2024' },
          { title:'Booking Report', desc:'Booking trends, peak hours, cancellation rates, and technician performance.', updated:'15 Sep 2024' },
          { title:'Customer Report', desc:'New vs returning customers, retention rates, and customer lifetime value.', updated:'14 Sep 2024' },
          { title:'Service Report', desc:'Most requested services, completion times, and quality ratings.', updated:'14 Sep 2024' },
          { title:'Inventory Report', desc:'Stock levels, turnover rates, low-stock alerts, and reorder suggestions.', updated:'13 Sep 2024' },
          { title:'Promotions Report', desc:'Promotion usage, redemption rates, and revenue impact analysis.', updated:'10 Sep 2024' },
        ].map(r => (
          <div key={r.title} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="font-bold text-[#0F0F0F] mb-1">{r.title}</h3>
            <p className="text-sm text-[#666] mb-4 leading-relaxed">{r.desc}</p>
            <p className="text-xs text-[#999] mb-4">Last updated: {r.updated}</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">View</button>
              <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Export PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Promotions() {
  return (
    <div>
      <PageHeader title="Promotions" sub="Manage discounts and promotional offers" action={<Btn size="sm"><Plus size={14} />Create Promotion</Btn>} />
      <div className="space-y-4">
        {promotions.map(p => (
          <div key={p.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#0F0F0F]">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-[#666]">{p.applies}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-red-600">{p.discount}</p>
                <p className="text-xs text-[#999]">{p.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm border-t border-[#F0F0F0] pt-3">
              {[['Start Date',p.start],['End Date',p.end],['Used',`${p.used} / ${p.limit}`],['Type',p.type]].map(([l,v])=>(
                <div key={l}><span className="text-xs text-[#999] block">{l}</span><span className="font-semibold text-[#0F0F0F]">{v}</span></div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Edit</button>
              {p.status==='active' && <button className="px-4 py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-md hover:bg-red-50">Deactivate</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsScreen() {
  return (
    <div>
      <PageHeader title="Settings" sub="Manage your business account and preferences" />
      <div className="grid grid-cols-2 gap-5">
        {[
          { title:'Account Security', items:['Change Password','Two-Factor Authentication','Login Sessions','Email Notifications'] },
          { title:'Notification Preferences', items:['New Booking Alerts','Service Request Alerts','Low Stock Alerts','Review Notifications'] },
          { title:'Payment Settings', items:['Bank Account Details','Payout Schedule','Invoice Settings','Tax Information'] },
          { title:'Business Rules', items:['Booking Cancellation Policy','Refund Policy','Service Terms','Operating Hours'] },
        ].map(section => (
          <div key={section.title} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="font-bold text-[#0F0F0F] mb-3">{section.title}</h3>
            <div className="divide-y divide-[#F0F0F0]">
              {section.items.map(item => (
                <button key={item} className="w-full flex justify-between items-center py-3 text-sm text-[#555] hover:text-[#0F0F0F] text-left">
                  {item}
                  <ChevronDown size={14} className="text-[#CCC] -rotate-90" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
