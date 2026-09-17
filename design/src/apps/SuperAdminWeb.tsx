import { useState } from 'react'
import { LayoutDashboard, Building2, Users, Shield, Tag, Package, ShoppingBag, Calendar, CreditCard, AlertTriangle, BarChart2, FileText, Settings, Bell, ChevronDown, Check, X, Search } from 'lucide-react'
import { superAdminStats, businesses, customers, auditLogs, disputes, payments, services as allServices } from '../data/mock'
import { Btn, Badge, StatusBadge, Avatar, Table, TR, TD, StatsGrid, StatCell, PageHeader, AlertRow } from '../components/ui'

type Screen = 'dashboard' | 'businesses' | 'customers' | 'admins' | 'categories' | 'products' | 'orders' | 'bookings' | 'payments' | 'disputes' | 'reports' | 'audit-logs' | 'settings'

const nav: { id: Screen; label: string; icon: any; badge?: number }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'businesses', label: 'Businesses', icon: Building2, badge: 12 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'admins', label: 'Admins', icon: Shield },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'disputes', label: 'Disputes', icon: AlertTriangle, badge: 7 },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function SuperAdminWeb() {
  const [screen, setScreen] = useState<Screen>('dashboard')

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif", minHeight: 'calc(100vh - 40px)', background: '#F7F7F7' }}>
      <aside className="w-56 bg-[#0F0F0F] flex flex-col shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            <span className="text-white font-black text-sm tracking-tight">EL7A2NY</span>
          </div>
          <p className="text-[#888] text-xs font-semibold">Platform Administration</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white text-[9px] font-black">SA</div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">Super Admin</p>
              <p className="text-[#888] text-[10px]">Platform Owner</p>
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
                {item.badge && !active && <span className="ml-auto text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
              </button>
            )
          })}
        </nav>
        <div className="px-4 py-3 border-t border-[#1F1F1F]">
          <div className="flex items-center gap-2">
            <Avatar name="Super Admin" size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Super Admin</p>
              <p className="text-[#888] text-[10px]">Platform Owner</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#E5E5E5] px-6 h-12 flex items-center justify-between shrink-0">
          <h1 className="text-sm font-bold text-[#0F0F0F]">{nav.find(n => n.id === screen)?.label}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#999]">Mon, 15 Sep 2024</span>
            <div className="relative">
              <Bell size={16} className="text-[#555]" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">8</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Avatar name="Super Admin" size="xs" />
              <ChevronDown size={12} className="text-[#999]" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {screen === 'dashboard' && <SADashboard />}
          {screen === 'businesses' && <SABusinesses />}
          {screen === 'customers' && <SACustomers />}
          {screen === 'admins' && <SAAdmins />}
          {screen === 'categories' && <SACategories />}
          {screen === 'products' && <SAProducts />}
          {screen === 'payments' && <SAPayments />}
          {screen === 'disputes' && <SADisputes />}
          {screen === 'reports' && <SAReports />}
          {screen === 'audit-logs' && <SAAuditLogs />}
          {screen === 'settings' && <SASettings />}
          {(screen === 'orders' || screen === 'bookings') && (
            <div className="text-center py-16 text-[#999]">
              <p className="text-lg font-bold text-[#0F0F0F] mb-1">{screen === 'orders' ? 'Platform Orders' : 'Platform Bookings'}</p>
              <p className="text-sm">All {screen} across the El7a2ny platform</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SADashboard() {
  return (
    <div>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-xl font-black text-[#0F0F0F]">Platform Overview</h2>
          <p className="text-sm text-[#666] mt-0.5">Monday, 15 September 2024 · El7a2ny platform status</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm">Export Report</Btn>
        </div>
      </div>

      <StatsGrid cols={3}>
        <StatCell label="Total Customers" value={superAdminStats.totalCustomers} sub="Registered accounts" border />
        <StatCell label="Total Businesses" value={superAdminStats.totalBusinesses} sub={`${superAdminStats.activeBusinesses} active`} border />
        <StatCell label="Platform Revenue" value={`${(superAdminStats.platformRevenue / 1000).toFixed(0)}K EGP`} sub="All time total" />
      </StatsGrid>
      <StatsGrid cols={3}>
        <StatCell label="Pending Approvals" value={superAdminStats.pendingApprovals} red sub="Businesses awaiting review" border />
        <StatCell label="Open Disputes" value={superAdminStats.openDisputes} red sub="Need resolution" border />
        <StatCell label="Active Requests" value={superAdminStats.activeRequests} sub="Across all businesses" />
      </StatsGrid>
      <StatsGrid cols={3}>
        <StatCell label="Total Bookings" value={superAdminStats.totalBookings} sub="All time" border />
        <StatCell label="Total Orders" value={superAdminStats.totalOrders} sub="Parts & products" border />
        <StatCell label="Active Businesses" value={superAdminStats.activeBusinesses} sub={`of ${superAdminStats.totalBusinesses} registered`} />
      </StatsGrid>

      <div className="mt-5 space-y-2">
        <AlertRow type="error" message="🔴 7 open disputes require resolution — including DSP-2024-047 flagged for escalation." />
        <AlertRow type="warning" message="⚠ 12 businesses are pending approval. FastFix Auto Shop submitted 14 Sep 2024." />
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5">
        {/* Pending approvals */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg">
          <div className="px-5 py-4 border-b border-[#E5E5E5] flex justify-between items-center">
            <h3 className="font-bold text-[#0F0F0F]">Pending Business Approvals</h3>
            <span className="text-xs text-red-600 font-semibold">{superAdminStats.pendingApprovals} waiting</span>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {businesses.filter(b => b.status === 'pending').concat(businesses.filter(b => b.status !== 'pending').slice(0, 2)).slice(0, 4).map(b => (
              <div key={b.id} className="px-5 py-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-sm font-bold text-[#0F0F0F]">{b.name}</p>
                    <p className="text-xs text-[#666]">{b.owner} · {b.location}</p>
                    <p className="text-xs text-[#999]">Applied: {b.joinDate}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                {b.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 py-1.5 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Review</button>
                    <button className="flex-1 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-md hover:bg-red-50">Reject</button>
                    <button className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-700">Approve</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg">
          <div className="px-5 py-4 border-b border-[#E5E5E5]">
            <h3 className="font-bold text-[#0F0F0F]">Recent Platform Activity</h3>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {auditLogs.slice(0, 6).map(log => (
              <div key={log.id} className="px-5 py-3">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="text-sm text-[#0F0F0F] font-medium"><span className="font-bold">{log.user}</span> {log.action.toLowerCase()}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.result==='success'?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>{log.result}</span>
                </div>
                <p className="text-xs text-[#666]">{log.resource}</p>
                <p className="text-[10px] text-[#999] mt-0.5">{log.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SABusinesses() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? businesses : businesses.filter(b => b.status === filter)

  return (
    <div>
      <PageHeader title="Businesses" sub="All automotive businesses registered on El7a2ny" action={<Btn size="sm">Export</Btn>} />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center border border-[#E5E5E5] bg-white rounded-md px-3 gap-2">
          <Search size={14} className="text-[#999]" />
          <input placeholder="Search businesses..." className="flex-1 py-2 text-sm focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {['all','active','pending','suspended'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-3.5 py-2 text-xs font-semibold rounded-md capitalize transition-colors ${filter===f?'bg-red-600 text-white':'border border-[#E5E5E5] bg-white text-[#555] hover:border-[#AAA]'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Business', 'Owner', 'Location', 'Services', 'Rating', 'Revenue', 'Status', 'Verified', 'Actions']}>
          {filtered.map(b => (
            <TR key={b.id}>
              <TD className="font-bold text-[#0F0F0F]">{b.name}</TD>
              <TD className="font-semibold">{b.owner}</TD>
              <TD className="text-xs text-[#555]">{b.location}</TD>
              <TD className="text-center font-semibold">{b.services}</TD>
              <TD>{b.rating > 0 ? <span className="flex items-center gap-1"><span className="text-amber-400">★</span><span className="font-semibold text-sm">{b.rating}</span></span> : <span className="text-[#CCC] text-xs">N/A</span>}</TD>
              <TD className="font-semibold">{b.revenue > 0 ? `${b.revenue.toLocaleString()} EGP` : '—'}</TD>
              <TD><StatusBadge status={b.status} /></TD>
              <TD>
                {b.verified
                  ? <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Check size={11} />Verified</span>
                  : <span className="text-[#999] text-xs">Pending</span>}
              </TD>
              <TD>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">View</button>
                  {b.status === 'pending' && <button className="px-2.5 py-1 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700">Approve</button>}
                  {b.status === 'active' && <button className="px-2.5 py-1 text-xs font-semibold border border-red-200 text-red-600 rounded hover:bg-red-50">Suspend</button>}
                  {b.status === 'suspended' && <button className="px-2.5 py-1 text-xs font-bold bg-[#0F0F0F] text-white rounded">Reactivate</button>}
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function SACustomers() {
  return (
    <div>
      <PageHeader title="Customers" sub={`${superAdminStats.totalCustomers.toLocaleString()} registered customers on El7a2ny`} />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center border border-[#E5E5E5] bg-white rounded-md px-3 gap-2">
          <Search size={14} className="text-[#999]" />
          <input placeholder="Search by name, email, or phone..." className="flex-1 py-2 text-sm focus:outline-none" />
        </div>
        <select className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none">
          <option>All Status</option><option>Active</option><option>Inactive</option><option>Suspended</option>
        </select>
        <Btn variant="secondary" size="sm">Export</Btn>
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Customer', 'Contact', 'Vehicles', 'Bookings', 'Orders', 'Member Since', 'Status', 'Actions']}>
          {customers.map(c => (
            <TR key={c.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <Avatar name={c.name} size="xs" />
                  <span className="font-semibold text-[#0F0F0F]">{c.name}</span>
                </div>
              </TD>
              <TD className="text-xs"><p>{c.phone}</p><p className="text-[#999]">{c.email}</p></TD>
              <TD className="text-center font-semibold">{c.vehicles}</TD>
              <TD className="text-center font-semibold">{c.bookings}</TD>
              <TD className="text-center font-semibold">{c.orders}</TD>
              <TD className="text-xs text-[#555]">{c.joinDate}</TD>
              <TD><StatusBadge status={c.status} /></TD>
              <TD>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">View</button>
                  <button className="px-2.5 py-1 text-xs font-semibold border border-red-200 text-red-600 rounded hover:bg-red-50">Suspend</button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function SAAdmins() {
  return (
    <div>
      <PageHeader title="Admins" sub="Business owners and administrators on El7a2ny" />
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Admin', 'Business', 'Location', 'Status', 'Verified', 'Join Date', 'Actions']}>
          {businesses.map(b => (
            <TR key={b.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <Avatar name={b.owner} size="xs" />
                  <div>
                    <p className="font-semibold text-[#0F0F0F]">{b.owner}</p>
                    <p className="text-xs text-[#999]">{b.email}</p>
                  </div>
                </div>
              </TD>
              <TD className="font-semibold">{b.name}</TD>
              <TD className="text-xs text-[#555]">{b.location}</TD>
              <TD><StatusBadge status={b.status} /></TD>
              <TD>{b.verified ? <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Check size={11} />Yes</span> : <span className="text-[#999] text-xs">No</span>}</TD>
              <TD className="text-xs text-[#555]">{b.joinDate}</TD>
              <TD>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">View</button>
                  {b.status === 'active' && <button className="px-2.5 py-1 text-xs font-semibold border border-red-200 text-red-600 rounded hover:bg-red-50">Suspend</button>}
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function SACategories() {
  const cats = [
    { name:'Maintenance', services:['Oil Change','Fluid Check','Filter Replacement'], count:245 },
    { name:'Mechanical', services:['Brakes','Suspension','Transmission'], count:312 },
    { name:'Electrical', services:['Battery','Alternator','Starter Motor'], count:178 },
    { name:'AC Service', services:['AC Recharge','Compressor','Cabin Filter'], count:134 },
    { name:'Tires', services:['Replacement','Alignment','Balancing'], count:289 },
    { name:'Diagnostics', services:['OBD2 Scan','Engine Check','Electronic'], count:156 },
    { name:'Body & Paint', services:['Dent Repair','Painting','Polish'], count:98 },
    { name:'Emergency', services:['Towing','Jump Start','Lockout'], count:67 },
  ]
  return (
    <div>
      <PageHeader title="Categories" sub="Platform-wide service and product categories" action={<Btn size="sm">+ Add Category</Btn>} />
      <div className="grid grid-cols-4 gap-4">
        {cats.map(c => (
          <div key={c.name} className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[#0F0F0F]">{c.name}</h3>
              <button className="text-xs text-[#999] hover:text-[#0F0F0F]">Edit</button>
            </div>
            <p className="text-xs text-[#999] mb-3">{c.services.join(', ')}</p>
            <div className="flex justify-between items-center">
              <p className="text-2xl font-black text-[#0F0F0F]">{c.count}</p>
              <p className="text-xs text-[#999]">services</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SAProducts() {
  return (
    <div>
      <PageHeader title="Products" sub="All products listed across El7a2ny businesses" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['1,245','Total Products'],['892','In Stock'],['47','Out of Stock']].map(([v,l])=>(
          <div key={l} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <p className="text-2xl font-black text-[#0F0F0F]">{v}</p>
            <p className="text-sm text-[#666] mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <p className="text-sm text-[#999]">Showing platform-wide product catalog across all businesses</p>
        </div>
        <Table headers={['Product', 'Brand', 'Category', 'Listed By', 'Price', 'Stock', 'Actions']}>
          {[
            { name:'Bosch Premium Oil Filter', brand:'Bosch', cat:'Filters', shop:'AutoCare Garage', price:85, stock:45 },
            { name:'Brembo Brake Pads (Front)', brand:'Brembo', cat:'Brakes', shop:'Elite Auto Service', price:650, stock:12 },
            { name:'Castrol EDGE 5W-40 4L', brand:'Castrol', cat:'Fluids', shop:'MotorWorks', price:380, stock:78 },
            { name:'Michelin Pilot Sport 4', brand:'Michelin', cat:'Tires', shop:'DrivePro Service', price:1850, stock:8 },
            { name:'NGK Iridium Spark Plugs', brand:'NGK', cat:'Engine', shop:'AutoCare Garage', price:220, stock:34 },
          ].map((p,i)=>(
            <TR key={i}>
              <TD className="font-semibold text-[#0F0F0F]">{p.name}</TD>
              <TD>{p.brand}</TD>
              <TD><Badge>{p.cat}</Badge></TD>
              <TD className="text-xs text-[#555]">{p.shop}</TD>
              <TD className="font-semibold">{p.price} EGP</TD>
              <TD className={`font-semibold ${p.stock<10?'text-amber-600':'text-green-600'}`}>{p.stock}</TD>
              <TD><button className="px-2.5 py-1 text-xs font-semibold border border-[#E5E5E5] rounded hover:bg-[#F5F5F5]">View</button></TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function SAPayments() {
  return (
    <div>
      <PageHeader title="Payments" sub="Platform-wide payment monitoring" action={<Btn variant="secondary" size="sm">Export Transactions</Btn>} />
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['1,250,000 EGP','Platform Revenue'],['12,345','Transactions'],['98.2%','Success Rate'],['7','Failed Today']].map(([v,l])=>(
          <div key={l} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <p className="text-2xl font-black text-[#0F0F0F]">{v}</p>
            <p className="text-sm text-[#666] mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['Transaction ID', 'Customer', 'Business', 'Type', 'Amount', 'Method', 'Status', 'Date']}>
          {payments.map(p => (
            <TR key={p.id}>
              <TD className="font-mono text-xs text-[#555]">{p.id}</TD>
              <TD className="font-semibold">{p.customer}</TD>
              <TD className="text-xs text-[#555]">{p.business}</TD>
              <TD className="text-xs">{p.type}</TD>
              <TD className="font-semibold text-[#0F0F0F]">{p.amount} EGP</TD>
              <TD className="text-xs text-[#555]">{p.method}</TD>
              <TD><StatusBadge status={p.status} /></TD>
              <TD className="text-xs text-[#999]">{p.date}</TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function SADisputes() {
  return (
    <div>
      <PageHeader title="Disputes" sub="Customer and business dispute resolution" />
      <div className="space-y-4">
        {disputes.map(d => (
          <div key={d.id} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#999]">{d.id}</span>
                  <StatusBadge status={d.status === 'open' ? 'open_dispute' : d.status} />
                  <Badge variant="default">{d.type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-xs text-[#999]">Customer</span><br /><span className="font-semibold text-[#0F0F0F]">{d.customer}</span></div>
                  <div><span className="text-xs text-[#999]">Business</span><br /><span className="font-semibold text-[#0F0F0F]">{d.business}</span></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#0F0F0F]">{d.amount} EGP</p>
                <p className="text-xs text-[#999]">Disputed amount</p>
                <p className="text-xs text-[#999] mt-0.5">{d.date}</p>
              </div>
            </div>
            <p className="text-sm text-[#555] leading-relaxed mb-4 p-3 bg-[#F7F7F7] rounded-md">{d.description}</p>
            {d.status !== 'resolved' && (
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm">View Evidence</Btn>
                <Btn variant="secondary" size="sm">Contact Parties</Btn>
                {d.status === 'open' && <Btn size="sm">Start Investigation</Btn>}
                {d.status === 'investigating' && <Btn size="sm" variant="dark">Resolve Dispute</Btn>}
              </div>
            )}
            {d.status === 'resolved' && <p className="text-xs text-green-600 font-semibold">✓ {d.description.split('.')[d.description.split('.').length - 1]}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function SAReports() {
  return (
    <div>
      <PageHeader title="Reports" sub="Platform-level analytics and intelligence" action={<select className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none"><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select>} />

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Growth chart */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
          <h3 className="font-bold text-[#0F0F0F] mb-4">Customer Growth — 2024</h3>
          <div className="flex items-end gap-2 h-32">
            {[850,1200,1450,1800,2100,1950,2400,2800,2200].map((v,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t" style={{ height: `${(v/2800)*100}%`, background: i===8?'#dc2626':'#0F0F0F', opacity: i===8?1:0.6 }} />
                <p className="text-[9px] text-[#999]">{'JFMAMJJAS'[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue split */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
          <h3 className="font-bold text-[#0F0F0F] mb-4">Platform Revenue Breakdown</h3>
          <div className="space-y-3">
            {[['Service Bookings','68%','850,000 EGP'],['Parts & Products','24%','300,000 EGP'],['Platform Fees','8%','100,000 EGP']].map(([l,pct,v])=>(
              <div key={l}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-[#0F0F0F]">{l}</span>
                  <span className="text-[#555]">{v}</span>
                </div>
                <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{width:pct}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { title:'Revenue Report', desc:'Platform-wide revenue by business, service, and product category.' },
          { title:'Growth Report', desc:'Customer acquisition, retention, and business onboarding trends.' },
          { title:'Business Performance', desc:'Top performing shops, ratings, and customer satisfaction scores.' },
          { title:'Category Analytics', desc:'Most popular service categories and demand forecasting.' },
          { title:'Dispute Analysis', desc:'Dispute rates, resolution times, and patterns by business.' },
          { title:'Financial Report', desc:'Payment success rates, refunds, and platform fee collection.' },
        ].map(r=>(
          <div key={r.title} className="bg-white border border-[#E5E5E5] rounded-lg p-4">
            <h3 className="font-bold text-[#0F0F0F] mb-1">{r.title}</h3>
            <p className="text-xs text-[#666] mb-4 leading-relaxed">{r.desc}</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">View</button>
              <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Export</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SAAuditLogs() {
  return (
    <div>
      <PageHeader title="Audit Logs" sub="Complete record of all platform actions and changes" action={<Btn variant="secondary" size="sm">Export Logs</Btn>} />
      <div className="bg-white border border-[#E5E5E5] rounded-lg">
        <Table headers={['User', 'Role', 'Action', 'Resource', 'Timestamp', 'Result']}>
          {auditLogs.map(log => (
            <TR key={log.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <Avatar name={log.user} size="xs" />
                  <span className="font-semibold text-[#0F0F0F]">{log.user}</span>
                </div>
              </TD>
              <TD><Badge variant={log.role==='super_admin'?'dark':'default'}>{log.role.replace('_',' ')}</Badge></TD>
              <TD className="font-semibold text-[#0F0F0F]">{log.action}</TD>
              <TD className="text-sm text-[#555]">{log.resource}</TD>
              <TD className="text-xs text-[#999]">{log.timestamp}</TD>
              <TD><Badge variant={log.result==='success'?'success':'error'}>{log.result}</Badge></TD>
            </TR>
          ))}
        </Table>
      </div>
    </div>
  )
}

function SASettings() {
  return (
    <div>
      <PageHeader title="Platform Settings" sub="Configure El7a2ny platform-wide settings and rules" />
      <div className="grid grid-cols-2 gap-5">
        {[
          { title:'Business Rules', items:['Business Approval Requirements','Service Category Rules','Pricing Guidelines','Quality Standards'] },
          { title:'Payment Settings', items:['Payment Gateway Configuration','Platform Fee Structure','Refund Policy','Payout Schedule'] },
          { title:'Notification Settings', items:['Email Templates','SMS Notifications','Push Notification Rules','Digest Emails'] },
          { title:'Security & Permissions', items:['Role Permissions','IP Whitelist','Rate Limiting','API Access Controls'] },
          { title:'Platform Content', items:['Terms of Service','Privacy Policy','FAQ Content','Help Center'] },
          { title:'System Configuration', items:['Maintenance Mode','API Settings','Cache Configuration','Backup Schedule'] },
        ].map(section=>(
          <div key={section.title} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="font-bold text-[#0F0F0F] mb-3">{section.title}</h3>
            <div className="divide-y divide-[#F0F0F0]">
              {section.items.map(item=>(
                <button key={item} className="w-full flex justify-between items-center py-3 text-sm text-[#555] hover:text-[#0F0F0F] text-left">
                  {item}<ChevronDown size={13} className="text-[#CCC] -rotate-90" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
