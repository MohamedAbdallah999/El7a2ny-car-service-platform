import { useState } from 'react'
import { Bell, Search, MapPin, Clock, ChevronRight, ShoppingBag, Home, Settings, Package, User } from 'lucide-react'
import { shops, services, vehicles, bookings, orders, products } from '../data/mock'
import { StatusBadge, StarRating, Avatar } from '../components/ui'

type Screen = 'home' | 'services' | 'shop-detail' | 'booking' | 'parts' | 'orders' | 'profile' | 'cars'

export default function CustomerMobile() {
  const [screen, setScreen] = useState<Screen>('home')
  const [bookingStep, setBookingStep] = useState(1)
  const [activeTab, setActiveTab] = useState('home')

  const go = (s: Screen) => { setScreen(s); setBookingStep(1) }
  const goTab = (t: string) => { setActiveTab(t); go(t as Screen) }

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'parts', label: 'Parts', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", height: 844, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Status bar */}
      <div className="bg-white px-5 pt-3 pb-1 flex justify-between items-center shrink-0">
        <span className="text-xs font-black text-[#0F0F0F]">9:41</span>
        <span className="text-xs text-[#0F0F0F]">●●● 🔋</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {screen === 'home' && <MobileHome go={go} />}
        {screen === 'services' && <MobileServices go={go} />}
        {screen === 'shop-detail' && <MobileShopDetail go={go} />}
        {screen === 'booking' && <MobileBooking step={bookingStep} setStep={setBookingStep} go={go} />}
        {screen === 'parts' && <MobileParts />}
        {screen === 'orders' && <MobileOrders />}
        {screen === 'cars' && <MobileCars go={go} />}
        {screen === 'profile' && <MobileProfile go={go} />}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-[#E5E5E5] shrink-0">
        <div className="grid grid-cols-5">
          {tabs.map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button key={t.id} onClick={() => goTab(t.id)}
                className={`flex flex-col items-center py-2.5 gap-0.5 ${active ? 'text-red-600' : 'text-[#AAA]'}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[9px] font-bold">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MobileHome({ go }: { go: (s: Screen) => void }) {
  const quickActions = [
    { label: 'Find Services', color: 'bg-[#0F0F0F]', action: () => go('services') },
    { label: 'Book Service', color: 'bg-red-600', action: () => go('booking') },
    { label: 'Buy Parts', color: 'bg-[#0F0F0F]', action: () => go('parts') },
    { label: 'My Cars', color: 'bg-[#0F0F0F]', action: () => go('cars') },
  ]

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-[#0F0F0F] px-5 pt-3 pb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#888] text-xs">Good morning 👋</p>
            <h2 className="text-white font-black text-base">Ahmed Hassan</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center text-[#888]">
              <Bell size={14} />
            </button>
            <Avatar name="Ahmed Hassan" size="sm" />
          </div>
        </div>

        {/* Vehicle card */}
        <div className="bg-[#1A1A1A] rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[#888] text-xs mb-0.5">My Vehicle</p>
              <p className="text-white font-black">{vehicles[0].brand} {vehicles[0].model}</p>
              <p className="text-[#888] text-xs">{vehicles[0].year} · {vehicles[0].plate}</p>
            </div>
            <button onClick={() => go('cars')} className="text-[10px] font-semibold text-[#888] flex items-center gap-0.5">
              Switch <ChevronRight size={10} />
            </button>
          </div>
          <div className="flex gap-4 text-xs">
            <div><p className="text-[#888]">Mileage</p><p className="text-white font-bold">{vehicles[0].mileage.toLocaleString()} km</p></div>
            <div><p className="text-[#888]">Last Service</p><p className="text-white font-bold">2 months ago</p></div>
            <div><p className="text-[#888]">Next Service</p><p className="text-amber-400 font-bold">Due soon</p></div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map(a => (
            <button key={a.label} onClick={a.action}
              className={`${a.color} text-white rounded-xl py-4 text-sm font-bold text-center hover:opacity-90 transition-opacity`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active booking */}
      {bookings.find(b => b.status === 'upcoming') && (
        <div className="px-5 mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">Upcoming Appointment</p>
          <div className="border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-[#0F0F0F]">{bookings[0].service}</p>
                <p className="text-xs text-[#666] mt-0.5">{bookings[0].shop}</p>
                <p className="text-xs text-[#999] mt-1 flex items-center gap-1"><Clock size={10} />{bookings[0].date} · {bookings[0].time}</p>
              </div>
              <StatusBadge status={bookings[0].status} />
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0F0F0]">
              <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-lg hover:bg-[#F5F5F5]">Directions</button>
              <button className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">View Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Nearby shops */}
      <div className="mt-5">
        <div className="flex justify-between items-center px-5 mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999]">Shops Near You</p>
          <button onClick={() => go('services')} className="text-xs font-semibold text-red-600">View all</button>
        </div>
        <div className="flex gap-3 px-5 overflow-x-auto pb-1">
          {shops.slice(0, 4).map(shop => (
            <button key={shop.id} onClick={() => go('shop-detail')}
              className="text-left shrink-0 w-44 border border-[#E5E5E5] rounded-xl overflow-hidden hover:border-[#AAA] transition-colors">
              <img src={shop.image} alt={shop.name} className="w-full h-24 object-cover bg-[#F5F5F5]" />
              <div className="p-3">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="text-xs font-bold text-[#0F0F0F] leading-tight">{shop.name}</h3>
                  <StatusBadge status={shop.status} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs font-semibold text-[#0F0F0F]">{shop.rating}</span>
                </div>
                <p className="text-[10px] text-[#999] mt-0.5">{shop.distance}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended services */}
      <div className="mt-5 px-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">Popular Services</p>
        <div className="space-y-2">
          {services.slice(0, 4).map(s => (
            <button key={s.id} onClick={() => go('booking')}
              className="w-full flex justify-between items-center p-4 border border-[#E5E5E5] rounded-xl hover:border-[#AAA] transition-colors">
              <div className="text-left">
                <p className="text-sm font-bold text-[#0F0F0F]">{s.name}</p>
                <p className="text-xs text-[#999] mt-0.5">{s.category} · {s.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#0F0F0F]">{s.price === 0 ? 'Free' : `${s.price} EGP`}</p>
                <ChevronRight size={14} className="text-[#CCC] ml-auto mt-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileServices({ go }: { go: (s: Screen) => void }) {
  const [cat, setCat] = useState('All')
  const cats = ['All', 'Maintenance', 'Mechanical', 'AC', 'Tires', 'Electrical', 'Diagnostics']

  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F] mb-4">Find Services</h1>
        <div className="flex items-center border border-[#E5E5E5] rounded-xl px-3 gap-2 bg-[#F7F7F7]">
          <Search size={14} className="text-[#999]" />
          <input placeholder="Search services..." className="flex-1 py-2.5 text-sm focus:outline-none bg-transparent text-[#0F0F0F]" />
        </div>
      </div>

      <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-[#F0F0F0]">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${cat === c ? 'bg-red-600 text-white' : 'bg-[#F5F5F5] text-[#555]'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4 space-y-3">
        {services.map(s => (
          <button key={s.id} onClick={() => go('booking')}
            className="w-full text-left border border-[#E5E5E5] rounded-xl p-4 hover:border-[#AAA] transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-600 mb-0.5">{s.category}</p>
                <p className="text-sm font-bold text-[#0F0F0F]">{s.name}</p>
                <p className="text-xs text-[#666] mt-1 leading-relaxed">{s.description.substring(0, 70)}...</p>
                <p className="text-xs text-[#999] mt-1 flex items-center gap-1"><Clock size={10} />{s.duration}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-black text-[#0F0F0F]">{s.price === 0 ? 'Free' : `${s.price} EGP`}</p>
                <button className="mt-2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">Book</button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MobileShopDetail({ go }: { go: (s: Screen) => void }) {
  const shop = shops[0]
  const [tab, setTab] = useState<'services' | 'reviews'>('services')

  return (
    <div className="pb-20">
      <div className="relative h-48 bg-[#F5F5F5]">
        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button onClick={() => go('services')} className="absolute top-3 left-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-[#0F0F0F] font-bold text-sm">
          ←
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={shop.status} />
            <span className="text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded">✓ Verified</span>
          </div>
          <h1 className="text-white font-black text-xl">{shop.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={shop.rating} reviews={shop.reviews} />
            <span className="text-white/60 text-xs">{shop.distance}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex gap-2 mb-4">
          <button onClick={() => go('booking')} className="flex-1 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700">Book Service</button>
          <button className="flex-1 py-3 border border-[#E5E5E5] text-sm font-semibold rounded-xl hover:bg-[#F5F5F5] flex items-center justify-center gap-1.5">
            <MapPin size={13} />Directions
          </button>
        </div>

        <div className="flex border-b border-[#E5E5E5] mb-4">
          {(['services', 'reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-red-600 text-red-600' : 'border-transparent text-[#555]'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'services' && (
          <div className="space-y-2">
            {services.slice(0, 6).map(s => (
              <div key={s.id} className="flex justify-between items-center p-4 border border-[#E5E5E5] rounded-xl">
                <div>
                  <p className="text-sm font-bold text-[#0F0F0F]">{s.name}</p>
                  <p className="text-xs text-[#999]">{s.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#0F0F0F]">{s.price === 0 ? 'Free' : `${s.price} EGP`}</p>
                  <button onClick={() => go('booking')} className="text-xs text-red-600 font-semibold mt-0.5">Book →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#F7F7F7] rounded-xl">
              <div className="text-center">
                <p className="text-3xl font-black text-[#0F0F0F]">{shop.rating}</p>
                <p className="text-amber-400">★★★★★</p>
                <p className="text-xs text-[#999]">{shop.reviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(n=>(
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-[10px] text-[#999] w-3">{n}</span>
                    <div className="flex-1 h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{width:`${n===5?70:n===4?20:n===3?7:n===2?2:1}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {[
              { name: "Ahmed H.", rating: 5, date: "10 Sep", comment: "Excellent service! Quick and professional." },
              { name: "Mona A.", rating: 4, date: "8 Sep", comment: "Good overall. AC working great now." },
              { name: "Khaled M.", rating: 5, date: "5 Sep", comment: "Very professional team." },
            ].map((r, i) => (
              <div key={i} className="border-b border-[#F0F0F0] pb-3">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.name} size="xs" />
                    <span className="text-sm font-bold text-[#0F0F0F]">{r.name}</span>
                  </div>
                  <span className="text-amber-400 text-xs">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="text-xs text-[#555] leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-5 py-3 bg-white border-t border-[#E5E5E5]">
        <button onClick={() => go('booking')} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">
          Book a Service — from {shop.startingPrice} EGP
        </button>
      </div>
    </div>
  )
}

function MobileBooking({ step, setStep, go }: { step: number; setStep: (n: number) => void; go: (s: Screen) => void }) {
  if (step === 6) return (
    <div className="px-5 py-8 text-center">
      <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
        <span className="text-green-600 text-2xl font-black">✓</span>
      </div>
      <h2 className="text-xl font-black text-[#0F0F0F] mb-2">Booking Confirmed!</h2>
      <p className="text-sm text-[#666] mb-6">AutoCare Garage will confirm your appointment.</p>
      <div className="border border-[#E5E5E5] rounded-xl overflow-hidden text-left mb-6">
        {[['ID','BK-2024-0892'],['Service','Oil & Filter Change'],['Shop','AutoCare Garage'],['Date','20 Sep 2024'],['Time','10:00 AM'],['Price','250 EGP']].map(([l,v],i,arr)=>(
          <div key={l} className={`flex justify-between p-3.5 text-sm ${i<arr.length-1?'border-b border-[#F0F0F0]':''}`}>
            <span className="text-[#999]">{l}</span>
            <span className="font-semibold text-[#0F0F0F]">{v}</span>
          </div>
        ))}
      </div>
      <button onClick={() => go('home')} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Back to Home</button>
    </div>
  )

  const stepTitles = ['Select Service', 'Choose Shop', 'Your Vehicle', 'Pick a Date', 'Pick a Time']

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step > 1 ? setStep(step-1) : go('services')} className="w-8 h-8 border border-[#E5E5E5] rounded-full flex items-center justify-center text-sm font-bold">←</button>
          <div className="flex-1">
            <p className="text-xs text-[#999]">Step {step} of 5</p>
            <h2 className="text-base font-black text-[#0F0F0F]">{stepTitles[step-1]}</h2>
          </div>
        </div>
        <div className="h-1 bg-[#E5E5E5] rounded-full">
          <div className="h-full bg-red-600 rounded-full transition-all" style={{width:`${(step/5)*100}%`}} />
        </div>
      </div>

      <div className="px-5 pt-5">
        {step === 1 && (
          <div className="space-y-2.5">
            {services.map((s, i) => (
              <label key={s.id} className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer ${i===0?'border-red-600 bg-red-50':'border-[#E5E5E5]'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="svc" defaultChecked={i===0} className="accent-red-600" />
                  <div>
                    <p className="text-sm font-bold text-[#0F0F0F]">{s.name}</p>
                    <p className="text-xs text-[#999]">{s.duration}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-[#0F0F0F]">{s.price===0?'Free':`${s.price}`}</span>
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {shops.filter(s=>s.status==='open').map((shop, i) => (
              <label key={shop.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${i===0?'border-red-600 bg-red-50':'border-[#E5E5E5]'}`}>
                <input type="radio" name="shop" defaultChecked={i===0} className="accent-red-600" />
                <img src={shop.image} alt={shop.name} className="w-12 h-12 object-cover rounded-lg bg-[#F5F5F5]" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0F0F0F]">{shop.name}</p>
                  <p className="text-xs text-[#999]">{shop.distance} · 250 EGP</p>
                  <StarRating rating={shop.rating} reviews={shop.reviews} />
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            {vehicles.map((v, i) => (
              <label key={v.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${i===0?'border-red-600 bg-red-50':'border-[#E5E5E5]'}`}>
                <input type="radio" name="veh" defaultChecked={i===0} className="accent-red-600" />
                <img src={v.image} alt={v.brand} className="w-14 h-10 object-cover rounded-lg bg-[#F5F5F5]" />
                <div>
                  <p className="text-sm font-bold text-[#0F0F0F]">{v.brand} {v.model} {v.year}</p>
                  <p className="text-xs text-[#999]">{v.plate}</p>
                </div>
              </label>
            ))}
            <button className="w-full p-4 border-2 border-dashed border-[#E5E5E5] rounded-xl text-sm font-semibold text-[#666]">+ Add New Vehicle</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-xs text-[#999] mb-3">September 2024 · AutoCare Garage</p>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['M','T','W','T','F','S','S'].map((d,i)=><div key={i} className="text-center text-xs font-bold text-[#999] py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length:30},(_,i)=>i+1).map(d=>(
                <button key={d} disabled={d<16}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg font-semibold transition-colors ${d===20?'bg-red-600 text-white':d<16?'text-[#CCC] cursor-not-allowed':'hover:bg-[#F5F5F5] text-[#0F0F0F]'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="text-xs text-[#999] mb-4">Saturday, 20 September 2024</p>
            <div className="grid grid-cols-3 gap-2">
              {['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'].map((t,i)=>(
                <button key={t} disabled={[1,4].includes(i)}
                  className={`py-3 text-xs rounded-xl font-semibold border transition-colors ${i===2?'border-red-600 bg-red-600 text-white':[1,4].includes(i)?'border-[#E5E5E5] text-[#CCC] cursor-not-allowed bg-[#F9F9F9]':'border-[#E5E5E5] text-[#0F0F0F] hover:border-red-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-16 left-0 right-0 px-5 py-3 bg-white border-t border-[#E5E5E5]">
        <button onClick={() => setStep(step === 5 ? 6 : step+1)}
          className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">
          {step === 5 ? 'Confirm Booking' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

function MobileParts() {
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F] mb-3">Parts & Products</h1>
        <div className="flex items-center border border-[#E5E5E5] rounded-xl px-3 gap-2 bg-[#F7F7F7]">
          <Search size={14} className="text-[#999]" />
          <input placeholder="Search parts..." className="flex-1 py-2.5 text-sm focus:outline-none bg-transparent" />
        </div>
        <div className="flex items-center gap-2 mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-600 text-xs font-bold">✓</span>
          <p className="text-xs text-green-700">Showing parts for <strong>Toyota Corolla 2022</strong></p>
        </div>
      </div>
      <div className="px-5 pt-4 grid grid-cols-2 gap-3">
        {products.map(p => (
          <div key={p.id} className="border border-[#E5E5E5] rounded-xl overflow-hidden">
            <div className="relative">
              <img src={p.image} alt={p.name} className="w-full h-32 object-cover bg-[#F5F5F5]" />
              {p.originalPrice && <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">SALE</div>}
              <div className={`absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.compatible?'bg-green-50 border-green-200 text-green-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>
                {p.compatible?'✓ Fits':'Check fit'}
              </div>
            </div>
            <div className="p-3">
              <p className="text-[10px] text-[#999] font-semibold">{p.brand}</p>
              <h3 className="text-xs font-bold text-[#0F0F0F] leading-snug mb-2">{p.name}</h3>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-[#0F0F0F]">{p.price}</span>
                  <span className="text-xs text-[#999]"> EGP</span>
                </div>
                {p.stock > 0
                  ? <button className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg">Add</button>
                  : <span className="text-[10px] text-[#999]">Out</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileOrders() {
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
        <h1 className="text-xl font-black text-[#0F0F0F]">My Orders</h1>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {orders.map(o => (
          <div key={o.id} className="border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-[#999] mb-0.5">{o.id}</p>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-base font-black text-[#0F0F0F]">{o.total} EGP</p>
            </div>
            <p className="text-sm font-semibold text-[#0F0F0F] mb-0.5">{o.products.join(', ')}</p>
            <p className="text-xs text-[#999]">{o.shop} · {o.date}</p>
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0F0F0]">
              <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-lg">Track</button>
              <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-lg">Invoice</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileCars({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5] flex justify-between items-center">
        <h1 className="text-xl font-black text-[#0F0F0F]">My Cars</h1>
        <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">+ Add</button>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {vehicles.map(v => (
          <div key={v.id} className="border border-[#E5E5E5] rounded-xl overflow-hidden">
            <img src={v.image} alt={v.brand} className="w-full h-36 object-cover bg-[#F5F5F5]" />
            <div className="p-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-[#0F0F0F]">{v.brand} {v.model}</h3>
                <span className="text-xs text-[#999]">{v.year}</span>
              </div>
              <p className="text-xs text-[#999] mb-3">{v.plate} · {v.mileage.toLocaleString()} km</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-[#E5E5E5] text-xs font-semibold rounded-lg">Edit</button>
                <button onClick={() => go('booking')} className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-lg">Book Service</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileProfile({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="pb-4">
      <div className="bg-[#0F0F0F] px-5 pt-5 pb-6">
        <div className="flex items-center gap-4">
          <Avatar name="Ahmed Hassan" size="lg" />
          <div>
            <h2 className="text-white font-black text-lg">Ahmed Hassan</h2>
            <p className="text-[#888] text-sm">ahmed.hassan@gmail.com</p>
            <p className="text-[#888] text-xs mt-0.5">Member since Jan 2024</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[['3','Vehicles'],['4','Bookings'],['3','Orders']].map(([n,l])=>(
            <div key={l} className="bg-[#1A1A1A] rounded-xl py-3 text-center">
              <p className="text-white font-black text-xl">{n}</p>
              <p className="text-[#888] text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 divide-y divide-[#F0F0F0]">
        {[
          { label: 'Personal Information', desc: 'Name, phone, email' },
          { label: 'My Vehicles', desc: '3 vehicles added' },
          { label: 'Saved Addresses', desc: '2 addresses' },
          { label: 'Payment Methods', desc: 'Visa ****4521' },
          { label: 'Notifications', desc: 'All enabled' },
          { label: 'Security', desc: 'Password & 2FA' },
        ].map(s => (
          <button key={s.label} className="w-full flex justify-between items-center py-4 text-left">
            <div>
              <p className="text-sm font-semibold text-[#0F0F0F]">{s.label}</p>
              <p className="text-xs text-[#999] mt-0.5">{s.desc}</p>
            </div>
            <ChevronRight size={15} className="text-[#CCC]" />
          </button>
        ))}
        <button className="w-full flex items-center py-4 text-sm font-semibold text-red-600">Sign Out</button>
      </div>
    </div>
  )
}
