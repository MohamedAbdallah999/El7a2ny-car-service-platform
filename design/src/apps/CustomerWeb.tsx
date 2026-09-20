import { useState } from 'react'
import { Bell, Search, ShoppingCart, ChevronRight, MapPin, Clock, Star, Phone, Navigation } from 'lucide-react'
import { shops, services, vehicles, bookings, orders, products } from '../data/mock'
import { Btn, Badge, StatusBadge, StarRating, Avatar, EmptyState, ProfileMenuRow } from '../components/ui'

type Screen = 'home' | 'services' | 'shops' | 'shop-detail' | 'booking' | 'parts' | 'cart' | 'bookings' | 'orders' | 'cars' | 'profile'

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Find Services' },
  { id: 'shops', label: 'Shops' },
  { id: 'parts', label: 'Parts' },
  { id: 'cars', label: 'My Cars' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'orders', label: 'Orders' },
]

export default function CustomerWeb() {
  const [screen, setScreen] = useState<Screen>('home')
  const [step, setStep] = useState(1)
  const [selectedShop, setSelectedShop] = useState(shops[0])
  const cartCount = 2

  const go = (s: Screen) => { setScreen(s); setStep(1) }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <header className="sticky top-[40px] z-40 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          <button onClick={() => go('home')} className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="font-black text-base tracking-tight text-[#0F0F0F]">EL7A2NY</span>
          </button>
          <nav className="flex items-center gap-0.5 flex-1">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => go(l.id as Screen)}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${screen === l.id ? 'text-red-600 bg-red-50' : 'text-[#555] hover:text-[#0F0F0F] hover:bg-[#F5F5F5]'}`}>
                {l.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => go('cart')} className="relative p-2 text-[#555] hover:text-[#0F0F0F] rounded-md hover:bg-[#F5F5F5]">
              <ShoppingCart size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">{cartCount}</span>
            </button>
            <button className="p-2 text-[#555] hover:text-[#0F0F0F] rounded-md hover:bg-[#F5F5F5]">
              <Bell size={18} />
            </button>
            <div className="w-px h-5 bg-[#E5E5E5]" />
            <button onClick={() => go('profile')}>
              <Avatar name="Ahmed Hassan" size="sm" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {screen === 'home' && <Home go={go} />}
        {screen === 'services' && <Services go={go} />}
        {screen === 'shops' && <Shops go={go} setShop={setSelectedShop} />}
        {screen === 'shop-detail' && <ShopDetail shop={selectedShop} go={go} />}
        {screen === 'booking' && <Booking step={step} setStep={setStep} go={go} />}
        {screen === 'parts' && <Parts go={go} />}
        {screen === 'cart' && <Cart go={go} />}
        {screen === 'bookings' && <MyBookings />}
        {screen === 'orders' && <MyOrders />}
        {screen === 'cars' && <MyCars go={go} />}
        {screen === 'profile' && <Profile go={go} />}
      </main>
    </div>
  )
}

function Home({ go }: { go: (s: Screen) => void }) {
  const cats = [
    { name: 'Oil Change', abbr: '🔧' }, { name: 'Brakes', abbr: '⚙' }, { name: 'Tires', abbr: '⬤' },
    { name: 'Battery', abbr: '⚡' }, { name: 'AC Service', abbr: '❄' }, { name: 'Diagnostics', abbr: '🔍' },
    { name: 'Body & Paint', abbr: '◈' }, { name: 'Electrical', abbr: '◉' },
  ]

  return (
    <div>
      <section className="bg-[#0F0F0F] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Egypt's Automotive Services Platform</p>
              <h1 className="text-5xl font-black leading-[1.1] mb-4">Your car deserves<br />the best care.</h1>
              <p className="text-[#888] text-base mb-8 leading-relaxed">Book services, request repairs, and find genuine parts from top automotive shops near you.</p>
              <div className="flex bg-white rounded-lg overflow-hidden max-w-lg">
                <div className="flex items-center pl-4 text-[#999]"><Search size={16} /></div>
                <input placeholder="Search services, shops, or parts..." className="flex-1 px-3 py-3.5 text-sm text-[#0F0F0F] focus:outline-none font-medium" />
                <button onClick={() => go('services')} className="bg-red-600 hover:bg-red-700 text-white px-6 text-sm font-bold whitespace-nowrap">Search</button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600&h=400&fit=crop&auto=format"
                alt="AutoCare Garage workshop"
                className="rounded-lg w-full h-64 object-cover opacity-80 bg-[#1a1a1a]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-8 gap-0">
            {cats.map((c, i) => (
              <button key={i} onClick={() => go('services')}
                className="flex flex-col items-center gap-2 py-3 hover:bg-[#F5F5F5] rounded-lg transition-colors group">
                <span className="text-xl">{c.abbr}</span>
                <span className="text-xs font-semibold text-[#555] group-hover:text-[#0F0F0F]">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">My Vehicle</p>
            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
              <img src={vehicles[0].image} alt={vehicles[0].brand} className="w-full h-36 object-cover bg-[#F5F5F5]" />
              <div className="p-4">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[#0F0F0F]">{vehicles[0].brand} {vehicles[0].model}</h3>
                  <span className="text-xs text-[#999]">{vehicles[0].year}</span>
                </div>
                <p className="text-xs text-[#999] mb-3">{vehicles[0].plate} · {vehicles[0].mileage.toLocaleString()} km</p>
                <div className="flex gap-2">
                  <button onClick={() => go('booking')} className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700">Book Service</button>
                  <button onClick={() => go('cars')} className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">My Cars</button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#999]">Shops Near You</p>
              <button onClick={() => go('shops')} className="text-xs font-semibold text-red-600 hover:text-red-700">View all</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {shops.slice(0, 4).map(shop => (
                <button key={shop.id} onClick={() => { go('shop-detail') }}
                  className="text-left border border-[#E5E5E5] rounded-lg overflow-hidden hover:border-[#AAA] transition-colors">
                  <img src={shop.image} alt={shop.name} className="w-full h-24 object-cover bg-[#F5F5F5]" />
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-[#0F0F0F] leading-tight">{shop.name}</h3>
                      <StatusBadge status={shop.status} />
                    </div>
                    <StarRating rating={shop.rating} reviews={shop.reviews} />
                    <p className="text-xs text-[#999] mt-1 flex items-center gap-1"><MapPin size={10} />{shop.distance}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {bookings[0] && (
          <div className="bg-[#0F0F0F] text-white rounded-lg p-5 flex items-center justify-between mb-10">
            <div>
              <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-1">Upcoming Appointment</p>
              <h3 className="font-bold text-base">{bookings[0].service}</h3>
              <p className="text-[#888] text-sm">{bookings[0].shop} · {bookings[0].date} at {bookings[0].time}</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[#333] text-sm font-semibold rounded-md hover:bg-[#1a1a1a] flex items-center gap-1.5">
                <Navigation size={13} />Directions
              </button>
              <button onClick={() => go('bookings')} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700">View Booking</button>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#999]">Popular Services</p>
            <button onClick={() => go('services')} className="text-xs font-semibold text-red-600">View all</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {services.slice(0, 4).map(s => (
              <button key={s.id} onClick={() => go('booking')}
                className="text-left border border-[#E5E5E5] rounded-lg p-4 hover:border-[#AAA] transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">{s.category}</p>
                <h3 className="text-sm font-bold text-[#0F0F0F] mb-1 leading-snug">{s.name}</h3>
                <p className="text-xs text-[#999] flex items-center gap-1"><Clock size={10} />{s.duration}</p>
                <p className="text-base font-black text-[#0F0F0F] mt-3">{s.price === 0 ? 'Free' : `${s.price} EGP`}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Services({ go }: { go: (s: Screen) => void }) {
  const [cat, setCat] = useState('All')
  const cats = ['All', 'Maintenance', 'Mechanical', 'Electrical', 'Tires', 'Battery', 'AC', 'Diagnostics', 'Body & Paint']
  const filtered = cat === 'All' ? services : services.filter(s => s.category === cat)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0F0F0F]">Find Services</h1>
        <p className="text-sm text-[#666] mt-1">Browse all automotive services available near you</p>
      </div>
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center border border-[#E5E5E5] rounded-md px-3 gap-2">
          <Search size={15} className="text-[#999]" />
          <input placeholder="Search services..." className="flex-1 py-2.5 text-sm focus:outline-none text-[#0F0F0F]" />
        </div>
        <select className="px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none focus:ring-2 focus:ring-red-600">
          <option>Any Distance</option><option>Within 1 km</option><option>Within 5 km</option>
        </select>
        <select className="px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none focus:ring-2 focus:ring-red-600">
          <option>Any Rating</option><option>4+ Stars</option><option>4.5+ Stars</option>
        </select>
        <select className="px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none focus:ring-2 focus:ring-red-600">
          <option>Any Price</option><option>Under 200 EGP</option><option>200–500 EGP</option>
        </select>
      </div>
      <div className="flex gap-2 mb-7 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-colors ${cat === c ? 'bg-red-600 text-white' : 'border border-[#E5E5E5] text-[#555] hover:border-[#999]'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="border border-[#E5E5E5] rounded-lg p-5 hover:border-[#AAA] transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-0.5">{s.category}</p>
                <h3 className="text-base font-bold text-[#0F0F0F]">{s.name}</h3>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-lg font-black text-[#0F0F0F]">{s.price === 0 ? 'Free' : `${s.price} EGP`}</p>
                <p className="text-xs text-[#999]">{s.duration}</p>
              </div>
            </div>
            <p className="text-sm text-[#666] leading-relaxed mb-4">{s.description}</p>
            {!s.available && <p className="text-xs text-amber-600 font-semibold mb-3">Currently unavailable at this shop</p>}
            <button onClick={() => go('booking')} disabled={!s.available}
              className="w-full py-2 bg-[#0F0F0F] text-white text-sm font-bold rounded-md hover:bg-[#1F1F1F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Book This Service
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Shops({ go, setShop }: { go: (s: Screen) => void; setShop: (s: any) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0F0F0F]">Automotive Shops</h1>
        <p className="text-sm text-[#666] mt-1">Find trusted automotive businesses near you</p>
      </div>
      <div className="flex gap-3 mb-7">
        <div className="flex-1 flex items-center border border-[#E5E5E5] rounded-md px-3 gap-2">
          <Search size={15} className="text-[#999]" />
          <input placeholder="Search by name, area, or service..." className="flex-1 py-2.5 text-sm focus:outline-none" />
        </div>
        <select className="px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none">
          <option>All Services</option><option>Oil Change</option><option>Brakes</option><option>AC Service</option>
        </select>
        <select className="px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none">
          <option>Open Now</option><option>All</option>
        </select>
        <select className="px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none">
          <option>Highest Rated</option><option>Nearest</option><option>Lowest Price</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {shops.map(shop => (
          <div key={shop.id} className="border border-[#E5E5E5] rounded-lg overflow-hidden hover:border-[#AAA] transition-colors">
            <div className="relative">
              <img src={shop.image} alt={shop.name} className="w-full h-44 object-cover bg-[#F5F5F5]" />
              <div className="absolute top-3 right-3"><StatusBadge status={shop.status} /></div>
              {shop.verified && (
                <div className="absolute top-3 left-3 bg-white border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">✓ Verified</div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-[#0F0F0F]">{shop.name}</h3>
                <StarRating rating={shop.rating} reviews={shop.reviews} />
              </div>
              <p className="text-sm text-[#666] flex items-center gap-1 mb-0.5"><MapPin size={12} />{shop.address}</p>
              <p className="text-xs text-[#999] mb-3">{shop.distance} away · {shop.hours.weekdays}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {shop.services.map(s => <span key={s} className="px-2 py-0.5 bg-[#F5F5F5] text-xs font-medium text-[#555] rounded">{s}</span>)}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#666]">From <span className="font-bold text-[#0F0F0F]">{shop.startingPrice} EGP</span></p>
                <div className="flex gap-2">
                  <button onClick={() => { setShop(shop); go('shop-detail') }}
                    className="px-4 py-2 border border-[#E5E5E5] text-sm font-semibold rounded-md hover:bg-[#F5F5F5]">View</button>
                  <button onClick={() => go('booking')}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700">Book</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShopDetail({ shop, go }: { shop: typeof shops[0]; go: (s: Screen) => void }) {
  const [tab, setTab] = useState<'services' | 'reviews' | 'info'>('services')
  return (
    <div>
      <div className="relative h-60 bg-[#F5F5F5]">
        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={shop.status} />
                {shop.verified && <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded">✓ Verified</span>}
              </div>
              <h1 className="text-3xl font-black">{shop.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <StarRating rating={shop.rating} reviews={shop.reviews} />
                <span className="text-white/60 text-sm flex items-center gap-1"><MapPin size={11} />{shop.distance} · {shop.address}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-white/30 text-white text-sm font-semibold rounded-md hover:bg-white/10 flex items-center gap-1.5">
                <Phone size={13} />Call
              </button>
              <button className="px-4 py-2 border border-white/30 text-white text-sm font-semibold rounded-md hover:bg-white/10 flex items-center gap-1.5">
                <Navigation size={13} />Directions
              </button>
              <button onClick={() => go('booking')} className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700">Book Service</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex border-b border-[#E5E5E5] mt-5">
          {(['services', 'reviews', 'info'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-red-600 text-red-600' : 'border-transparent text-[#555] hover:text-[#0F0F0F]'}`}>
              {t === 'info' ? 'About & Hours' : t}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'services' && (
            <div className="grid grid-cols-2 gap-4">
              {services.map(s => (
                <div key={s.id} className="border border-[#E5E5E5] rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-red-600">{s.category}</p>
                    <h3 className="text-sm font-bold text-[#0F0F0F] mt-0.5">{s.name}</h3>
                    <p className="text-xs text-[#999] flex items-center gap-1 mt-0.5"><Clock size={10} />{s.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0F0F0F]">{s.price === 0 ? 'Free' : `${s.price} EGP`}</p>
                    <button onClick={() => go('booking')} className="mt-2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">Book</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex gap-8 p-5 bg-[#F7F7F7] rounded-lg items-center">
                <div className="text-center">
                  <div className="text-5xl font-black text-[#0F0F0F]">{shop.rating}</div>
                  <div className="text-amber-400 text-lg mt-1">{'★'.repeat(5)}</div>
                  <div className="text-xs text-[#999] mt-1">{shop.reviews.toLocaleString()} reviews</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(n => (
                    <div key={n} className="flex items-center gap-3">
                      <span className="text-xs text-[#999] w-4">{n}★</span>
                      <div className="flex-1 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${n===5?70:n===4?20:n===3?7:n===2?2:1}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {[
                { name: "Ahmed Hassan", rating: 5, svc: "Oil & Filter Change", date: "10 Sep 2024", comment: "Excellent service! Quick, professional, and the price was fair. Will definitely return." },
                { name: "Mona Ali", rating: 4, svc: "AC Service", date: "8 Sep 2024", comment: "Good service overall. The AC is working great now. Took a bit longer than expected." },
                { name: "Khaled Mahmoud", rating: 5, svc: "Brake Pad Replacement", date: "5 Sep 2024", comment: "Very professional team. Explained everything clearly before starting the work." },
              ].map((r, i) => (
                <div key={i} className="border-b border-[#F0F0F0] pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-[#0F0F0F]">{r.name}</p>
                        <p className="text-xs text-[#999]">{r.svc} · {r.date}</p>
                      </div>
                    </div>
                    <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm text-[#555] leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
          {tab === 'info' && (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-2">About</p>
                <p className="text-sm text-[#555] leading-relaxed mb-6">{shop.about}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-2">Opening Hours</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#666]">Monday – Friday</span><span className="font-semibold text-[#0F0F0F]">{shop.hours.weekdays}</span></div>
                  <div className="flex justify-between"><span className="text-[#666]">Saturday – Sunday</span><span className="font-semibold text-[#0F0F0F]">{shop.hours.weekend}</span></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-2">Contact</p>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3"><Phone size={14} className="text-[#999] mt-0.5" /><span className="text-[#0F0F0F] font-semibold">{shop.phone}</span></div>
                  <div className="flex gap-3"><MapPin size={14} className="text-[#999] mt-0.5" /><span className="text-[#0F0F0F] font-semibold">{shop.address}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Booking({ step, setStep, go }: { step: number; setStep: (n: number) => void; go: (s: Screen) => void }) {
  const stepLabels = ['Service', 'Shop', 'Vehicle', 'Date', 'Time', 'Notes', 'Photos', 'Review', 'Payment']

  if (step === 10) return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-green-600 text-2xl font-black">✓</span>
      </div>
      <h1 className="text-3xl font-black text-[#0F0F0F] mb-2">Booking Confirmed!</h1>
      <p className="text-[#666] text-sm mb-8">Your appointment has been booked. The shop will confirm shortly.</p>
      <div className="border border-[#E5E5E5] rounded-lg text-left mb-8 overflow-hidden">
        <div className="p-4 border-b border-[#E5E5E5] flex justify-between bg-[#F7F7F7]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#999]">Booking Reference</span>
          <span className="text-sm font-black text-[#0F0F0F]">BK-2024-0892</span>
        </div>
        {[['Service','Oil & Filter Change'],['Shop','AutoCare Garage'],['Vehicle','Toyota Corolla 2022'],['Date','Saturday, 20 September 2024'],['Time','10:00 AM'],['Price','250 EGP']].map(([l,v]) => (
          <div key={l} className="flex justify-between p-4 border-b border-[#F0F0F0]">
            <span className="text-sm text-[#666]">{l}</span>
            <span className="text-sm font-semibold text-[#0F0F0F]">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => go('bookings')} className="px-6 py-2.5 border border-[#E5E5E5] text-sm font-semibold rounded-md hover:bg-[#F5F5F5]">View Bookings</button>
        <button onClick={() => go('home')} className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700">Back to Home</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-7">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-black text-[#0F0F0F]">Book a Service</h1>
          <span className="text-sm text-[#999] font-semibold">Step {step} of 9</span>
        </div>
        <div className="h-1 bg-[#E5E5E5] rounded-full mb-2">
          <div className="h-full bg-red-600 rounded-full transition-all duration-300" style={{ width: `${(step / 9) * 100}%` }} />
        </div>
        <div className="flex justify-between">
          {stepLabels.map((l, i) => (
            <span key={l} className={`text-[9px] font-bold ${i+1===step?'text-red-600':i+1<step?'text-[#0F0F0F]':'text-[#CCC]'}`}>{l}</span>
          ))}
        </div>
      </div>

      <div className="border border-[#E5E5E5] rounded-lg p-6 mb-5">
        {step === 1 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Select a Service</h2>
            <p className="text-sm text-[#666] mb-5">Choose the service your vehicle needs</p>
            <div className="space-y-2.5">
              {services.map((s, i) => (
                <label key={s.id} className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer transition-colors ${i===0?'border-red-600 bg-red-50':'border-[#E5E5E5] hover:border-red-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="service" defaultChecked={i===0} className="accent-red-600" />
                    <div>
                      <p className="text-sm font-bold text-[#0F0F0F]">{s.name}</p>
                      <p className="text-xs text-[#999]">{s.category} · {s.duration}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#0F0F0F]">{s.price===0?'Free':`${s.price} EGP`}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Choose a Shop</h2>
            <p className="text-sm text-[#666] mb-5">Shops offering Oil & Filter Change near you</p>
            <div className="space-y-3">
              {shops.filter(s=>s.status==='open').map((shop, i) => (
                <label key={shop.id} className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer transition-colors ${i===0?'border-red-600 bg-red-50':'border-[#E5E5E5] hover:border-red-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shop" defaultChecked={i===0} className="accent-red-600" />
                    <div>
                      <p className="text-sm font-bold text-[#0F0F0F]">{shop.name}</p>
                      <p className="text-xs text-[#999]">{shop.distance} · {shop.address.split(',')[0]}</p>
                      <StarRating rating={shop.rating} reviews={shop.reviews} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F0F0F]">250 EGP</p>
                    <StatusBadge status={shop.status} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Select Your Vehicle</h2>
            <p className="text-sm text-[#666] mb-5">Which vehicle needs the service?</p>
            <div className="space-y-3">
              {vehicles.map((v, i) => (
                <label key={v.id} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${i===0?'border-red-600 bg-red-50':'border-[#E5E5E5] hover:border-red-300'}`}>
                  <input type="radio" name="vehicle" defaultChecked={i===0} className="accent-red-600" />
                  <img src={v.image} alt={v.brand} className="w-16 h-10 object-cover rounded bg-[#F5F5F5]" />
                  <div>
                    <p className="text-sm font-bold text-[#0F0F0F]">{v.brand} {v.model} {v.year}</p>
                    <p className="text-xs text-[#999]">{v.plate} · {v.mileage.toLocaleString()} km</p>
                  </div>
                </label>
              ))}
              <button className="w-full p-4 border-2 border-dashed border-[#E5E5E5] rounded-lg text-sm font-semibold text-[#666] hover:border-[#999] hover:text-[#0F0F0F] transition-colors">
                + Add New Vehicle
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Choose a Date</h2>
            <p className="text-sm text-[#666] mb-5">AutoCare Garage — September 2024</p>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=><div key={d} className="text-center text-xs font-bold text-[#999] py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length:30},(_,i)=>i+1).map(d=>(
                <button key={d} disabled={d<16}
                  className={`py-2 text-sm rounded-md font-semibold transition-colors ${d===20?'bg-red-600 text-white':d<16?'text-[#CCC] cursor-not-allowed':'hover:bg-[#F5F5F5] text-[#0F0F0F]'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Choose a Time</h2>
            <p className="text-sm text-[#666] mb-5">Available slots for Saturday, 20 September 2024</p>
            <div className="grid grid-cols-4 gap-2">
              {['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM'].map((t,i)=>(
                <button key={t} disabled={[1,4,7,9].includes(i)}
                  className={`py-2.5 text-xs rounded-md font-semibold border transition-colors ${i===2?'border-red-600 bg-red-600 text-white':[1,4,7,9].includes(i)?'border-[#E5E5E5] text-[#CCC] cursor-not-allowed bg-[#F9F9F9]':'border-[#E5E5E5] text-[#0F0F0F] hover:border-red-400'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-[#999]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-[#E5E5E5]" />Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600" />Selected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#F0F0F0]" />Unavailable</span>
            </div>
          </div>
        )}
        {step === 6 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Describe the Issue</h2>
            <p className="text-sm text-[#666] mb-5">Help the mechanic understand what you need — optional but helpful</p>
            <textarea rows={5} placeholder="E.g. Engine warning light appeared last week. Car runs fine but I want it checked before a long trip. Last oil change was 6 months ago."
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-[#0F0F0F] placeholder:text-[#AAA]" />
          </div>
        )}
        {step === 7 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Upload Photos</h2>
            <p className="text-sm text-[#666] mb-5">Share photos of your vehicle or the issue (optional)</p>
            <div className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-12 text-center hover:border-[#AAA] transition-colors cursor-pointer">
              <div className="text-3xl mb-3">📷</div>
              <p className="text-sm font-semibold text-[#0F0F0F] mb-1">Drag and drop photos here</p>
              <p className="text-xs text-[#999] mb-4">JPG or PNG · up to 10MB per photo</p>
              <button className="px-4 py-2 border border-[#E5E5E5] text-sm font-semibold rounded-md hover:bg-[#F5F5F5]">Browse Files</button>
            </div>
          </div>
        )}
        {step === 8 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-5">Review Your Booking</h2>
            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
              {[['Service','Oil & Filter Change'],['Shop','AutoCare Garage — Dokki, Cairo'],['Vehicle','Toyota Corolla 2022 · Cairo A 12345'],['Date','Saturday, 20 September 2024'],['Time','10:00 AM'],['Notes','No additional notes'],['Estimated Price','250 EGP']].map(([l,v],i,arr)=>(
                <div key={l} className={`flex justify-between p-4 ${i<arr.length-1?'border-b border-[#F0F0F0]':''}`}>
                  <span className="text-sm text-[#666]">{l}</span>
                  <span className="text-sm font-semibold text-[#0F0F0F]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 9 && (
          <div>
            <h2 className="text-base font-bold text-[#0F0F0F] mb-0.5">Payment</h2>
            <p className="text-sm text-[#666] mb-5">Select your payment method</p>
            <div className="border border-[#E5E5E5] rounded-lg p-4 mb-5">
              <div className="flex justify-between text-sm mb-2"><span className="text-[#666]">Service cost</span><span className="font-semibold">250 EGP</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-[#666]">Platform fee</span><span className="font-semibold text-green-600">0 EGP</span></div>
              <div className="border-t border-[#E5E5E5] my-3" />
              <div className="flex justify-between"><span className="font-bold text-[#0F0F0F]">Total</span><span className="font-black text-xl text-[#0F0F0F]">250 EGP</span></div>
            </div>
            <div className="space-y-3">
              {[{label:'Pay at Shop',desc:'Cash or card on arrival',checked:true},{label:'Pay Online',desc:'Visa, Mastercard, or Vodafone Cash',checked:false}].map(opt=>(
                <label key={opt.label} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${opt.checked?'border-red-600 bg-red-50':'border-[#E5E5E5] hover:border-red-300'}`}>
                  <input type="radio" name="payment" defaultChecked={opt.checked} className="accent-red-600" />
                  <div><p className="text-sm font-bold text-[#0F0F0F]">{opt.label}</p><p className="text-xs text-[#999]">{opt.desc}</p></div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        {step > 1
          ? <button onClick={()=>setStep(step-1)} className="px-5 py-2.5 border border-[#E5E5E5] text-sm font-semibold rounded-md hover:bg-[#F5F5F5]">← Back</button>
          : <button onClick={()=>go('services')} className="px-5 py-2.5 border border-[#E5E5E5] text-sm font-semibold rounded-md hover:bg-[#F5F5F5]">Cancel</button>}
        <button onClick={()=>setStep(step===9?10:step+1)} className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700">
          {step===9?'Confirm Booking':'Continue →'}
        </button>
      </div>
    </div>
  )
}

function Parts({ go }: { go: (s: Screen) => void }) {
  const [cat, setCat] = useState('All')
  const cats = ['All','Engine','Brakes','Filters','Fluids','Electrical','Lighting','Tires','Battery','Accessories']
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[#0F0F0F]">Parts & Products</h1>
        <p className="text-sm text-[#666] mt-1">Genuine and aftermarket parts from trusted suppliers</p>
      </div>
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-5 text-sm">
        <span className="text-green-600 font-bold">✓</span>
        <p className="text-green-700">Showing parts compatible with your <strong>Toyota Corolla 2022</strong></p>
        <button className="ml-auto text-xs text-green-600 font-semibold underline">Change vehicle</button>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center border border-[#E5E5E5] rounded-md px-3 gap-2">
          <Search size={15} className="text-[#999]" />
          <input placeholder="Search parts, brands, or SKU..." className="flex-1 py-2.5 text-sm focus:outline-none" />
        </div>
        <select className="px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm bg-white text-[#555] focus:outline-none">
          <option>Price: Low to High</option><option>Price: High to Low</option><option>Best Rated</option>
        </select>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {cats.map(c=><button key={c} onClick={()=>setCat(c)} className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-colors ${cat===c?'bg-red-600 text-white':'border border-[#E5E5E5] text-[#555] hover:border-[#999]'}`}>{c}</button>)}
      </div>
      <div className="grid grid-cols-4 gap-5">
        {products.map(p=>(
          <div key={p.id} className="border border-[#E5E5E5] rounded-lg overflow-hidden hover:border-[#AAA] transition-colors">
            <div className="relative">
              <img src={p.image} alt={p.name} className="w-full h-40 object-cover bg-[#F5F5F5]" />
              {p.originalPrice && <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">SALE</div>}
              <div className={`absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.compatible?'bg-green-50 border-green-200 text-green-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>
                {p.compatible?'✓ Compatible':'⚠ Check fit'}
              </div>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-bold text-[#999] uppercase tracking-wide">{p.brand}</p>
              <h3 className="text-sm font-bold text-[#0F0F0F] leading-snug mb-1">{p.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-xs font-semibold text-[#0F0F0F]">{p.rating}</span>
                <span className="text-xs text-[#999]">({p.reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-[#0F0F0F]">{p.price} EGP</span>
                  {p.originalPrice && <span className="text-xs text-[#999] line-through ml-1">{p.originalPrice}</span>}
                </div>
                {p.stock===0
                  ? <span className="text-xs text-[#999] font-semibold">Out of stock</span>
                  : <button className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">Add to Cart</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Cart({ go }: { go: (s: Screen) => void }) {
  const items = [products[0], products[2]]
  const subtotal = items.reduce((s,p)=>s+p.price,0)
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-black text-[#0F0F0F] mb-7">Your Cart ({items.length} items)</h1>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 border border-[#E5E5E5] rounded-lg overflow-hidden">
          {items.map((item,i)=>(
            <div key={item.id} className={`flex gap-4 p-5 ${i<items.length-1?'border-b border-[#E5E5E5]':''}`}>
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-[#F5F5F5]" />
              <div className="flex-1">
                <p className="text-xs text-[#999] font-semibold">{item.brand}</p>
                <h3 className="text-sm font-bold text-[#0F0F0F] mb-0.5">{item.name}</h3>
                {item.compatible && <p className="text-xs text-green-600 font-semibold">✓ Compatible with Toyota Corolla 2022</p>}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-[#E5E5E5] rounded overflow-hidden text-sm">
                    <button className="px-2.5 py-1 hover:bg-[#F5F5F5]">−</button>
                    <span className="px-3 py-1 border-x border-[#E5E5E5] font-semibold">1</span>
                    <button className="px-2.5 py-1 hover:bg-[#F5F5F5]">+</button>
                  </div>
                  <button className="text-xs text-[#999] hover:text-red-600 font-semibold">Remove</button>
                </div>
              </div>
              <p className="text-base font-black text-[#0F0F0F]">{item.price} EGP</p>
            </div>
          ))}
        </div>
        <div className="border border-[#E5E5E5] rounded-lg p-5 h-fit">
          <h2 className="font-bold text-[#0F0F0F] mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#666]">Subtotal</span><span className="font-semibold">{subtotal} EGP</span></div>
            <div className="flex justify-between"><span className="text-[#666]">Delivery fee</span><span className="font-semibold">50 EGP</span></div>
            <div className="flex justify-between"><span className="text-[#666]">Discount</span><span className="font-semibold text-green-600">0 EGP</span></div>
          </div>
          <div className="border-t border-[#E5E5E5] my-4" />
          <div className="flex justify-between mb-5">
            <span className="font-bold text-[#0F0F0F]">Total</span>
            <span className="font-black text-xl text-[#0F0F0F]">{subtotal+50} EGP</span>
          </div>
          <Btn full>Proceed to Checkout</Btn>
          <button onClick={()=>go('parts')} className="w-full mt-2 py-2.5 border border-[#E5E5E5] text-sm font-semibold rounded-md hover:bg-[#F5F5F5]">Continue Shopping</button>
        </div>
      </div>
    </div>
  )
}

function MyBookings() {
  const [tab, setTab] = useState<'upcoming'|'active'|'completed'|'cancelled'>('upcoming')
  const filtered = bookings.filter(b=>b.status===tab)
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-black text-[#0F0F0F] mb-5">My Bookings</h1>
      <div className="flex border-b border-[#E5E5E5] mb-6">
        {(['upcoming','active','completed','cancelled'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${tab===t?'border-red-600 text-red-600':'border-transparent text-[#555] hover:text-[#0F0F0F]'}`}>{t}</button>
        ))}
      </div>
      {filtered.length===0
        ? <EmptyState title={`No ${tab} bookings`} desc="When you make a booking it will appear here." />
        : <div className="space-y-4">
            {filtered.map(b=>(
              <div key={b.id} className="border border-[#E5E5E5] rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#999]">{b.id}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <h3 className="text-base font-bold text-[#0F0F0F]">{b.service}</h3>
                    <p className="text-sm text-[#666]">{b.shop}</p>
                  </div>
                  <p className="text-xl font-black text-[#0F0F0F]">{b.price} EGP</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm border-t border-[#F0F0F0] pt-3">
                  {[['Vehicle',b.vehicle],['Date & Time',`${b.date} · ${b.time}`],['Location',b.location.split(',')[0]]].map(([l,v])=>(
                    <div key={l}><span className="text-xs text-[#999]">{l}</span><br /><span className="font-semibold text-[#0F0F0F]">{v}</span></div>
                  ))}
                </div>
                {b.status==='upcoming' && (
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Reschedule</button>
                    <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Contact Shop</button>
                    <button className="px-4 py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-md hover:bg-red-50">Cancel Booking</button>
                  </div>
                )}
                {b.status==='completed' && (
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Leave a Review</button>
                    <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Book Again</button>
                  </div>
                )}
              </div>
            ))}
          </div>}
    </div>
  )
}

function MyOrders() {
  const statuses = { delivered:'Delivered',shipped:'Shipped',preparing:'Preparing' }
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-black text-[#0F0F0F] mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(o=>(
          <div key={o.id} className="border border-[#E5E5E5] rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#999]">{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-sm text-[#0F0F0F] font-semibold">{o.products.join(', ')}</p>
                <p className="text-xs text-[#999] mt-0.5">{o.shop} · Ordered {o.date}</p>
              </div>
              <p className="text-xl font-black text-[#0F0F0F]">{o.total} EGP</p>
            </div>
            <div className="flex gap-2 pt-3 border-t border-[#F0F0F0]">
              <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Track Order</button>
              <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Invoice</button>
              {o.status==='delivered' && <button className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Reorder</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyCars({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-[#0F0F0F]">My Cars</h1>
        <Btn>+ Add Vehicle</Btn>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {vehicles.map(v=>(
          <div key={v.id} className="border border-[#E5E5E5] rounded-lg overflow-hidden">
            <img src={v.image} alt={`${v.brand} ${v.model}`} className="w-full h-44 object-cover bg-[#F5F5F5]" />
            <div className="p-4">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-[#0F0F0F]">{v.brand} {v.model}</h3>
                <span className="text-xs text-[#999]">{v.year}</span>
              </div>
              <p className="text-xs text-[#999] mb-1">{v.engine} · {v.color}</p>
              <p className="text-xs font-semibold text-[#555] mb-3">{v.plate}</p>
              <div className="flex justify-between text-xs mb-4">
                <div><span className="text-[#999]">Mileage</span><br /><span className="font-bold text-[#0F0F0F]">{v.mileage.toLocaleString()} km</span></div>
                <div className="text-right"><span className="text-[#999]">Last Service</span><br /><span className="font-bold text-[#0F0F0F]">2 months ago</span></div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-md hover:bg-[#F5F5F5]">Edit</button>
                <button onClick={()=>go('booking')} className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700">Book Service</button>
              </div>
            </div>
          </div>
        ))}
        <button className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-8 flex flex-col items-center justify-center gap-3 text-[#999] hover:border-[#AAA] hover:text-[#555] transition-colors">
          <span className="text-3xl font-black">+</span>
          <span className="text-sm font-semibold">Add New Vehicle</span>
        </button>
      </div>
    </div>
  )
}

function Profile({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-5 mb-7 pb-7 border-b border-[#E5E5E5]">
        <Avatar name="Ahmed Hassan" size="lg" />
        <div>
          <h1 className="text-xl font-black text-[#0F0F0F]">Ahmed Hassan</h1>
          <p className="text-sm text-[#666]">ahmed.hassan@gmail.com</p>
          <p className="text-xs text-[#999] mt-0.5">+20 100 234 5678 · Member since January 2024</p>
        </div>
        <button className="ml-auto px-4 py-2 border border-[#E5E5E5] text-sm font-semibold rounded-md hover:bg-[#F5F5F5]">Edit Profile</button>
      </div>
      <div className="divide-y divide-[#F0F0F0]">
        {[
          { label:'Personal Information', desc:'Name, phone, email, and location' },
          { label:'My Vehicles', desc:'3 vehicles · Toyota, BMW, Hyundai' },
          { label:'Saved Addresses', desc:'2 addresses saved' },
          { label:'Order History', desc:'3 orders · last on 14 Sep 2024' },
          { label:'Booking History', desc:'4 bookings · last on 10 Sep 2024' },
          { label:'Payment Methods', desc:'1 Visa card saved' },
          { label:'Notifications', desc:'All notifications enabled' },
          { label:'Security', desc:'Password · Two-factor authentication' },
          { label:'Preferences', desc:'Arabic / English · Dark mode off' },
        ].map(s=><ProfileMenuRow key={s.label} label={s.label} desc={s.desc} />)}
        <button className="w-full flex items-center py-4 text-sm font-semibold text-red-600 hover:bg-red-50 px-3 -mx-3 rounded-lg transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  )
}
