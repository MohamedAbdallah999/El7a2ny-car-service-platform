import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Check, ChevronLeft } from 'lucide-react'

type Screen = 'splash' | 'welcome' | 'login' | 'register' | 'forgot' | 'otp' | 'reset' | 'onboarding'

interface Props { onAuth: () => void }

export default function CustomerMobileAuth({ onAuth }: Props) {
  const [screen, setScreen] = useState<Screen>('splash')
  const [obStep, setObStep] = useState(1)
  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const go = (s: Screen) => { setScreen(s); setObStep(1) }

  // Auto-advance splash
  if (screen === 'splash') {
    setTimeout(() => go('welcome'), 1800)
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0F0F0F]" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div className="animate-pulse">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-white font-black text-3xl tracking-tight">EL7A2NY</span>
          </div>
          <p className="text-[#888] text-xs text-center tracking-widest uppercase">Automotive Platform</p>
        </div>
      </div>
    )
  }

  // WELCOME
  if (screen === 'welcome') return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="relative flex-1 bg-[#0F0F0F]">
        <img
          src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600&h=900&fit=crop&auto=format"
          alt="Automotive workshop"
          className="w-full h-full object-cover opacity-25 bg-[#0F0F0F]"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
            <span className="text-white font-black text-2xl tracking-tight">EL7A2NY</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-3">
            Your car<br />deserves the<br />best care.
          </h1>
          <p className="text-[#888] text-sm leading-relaxed mb-8">
            Book services, request repairs, and find genuine parts from top shops near you.
          </p>
          <div className="flex gap-1 mb-8">
            {[0,1,2].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i===0?'bg-red-600':'bg-[#333]'}`} />)}
          </div>
        </div>
      </div>
      <div className="bg-white px-6 py-6 space-y-3 shrink-0">
        <button onClick={() => go('register')} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700">
          Create Account
        </button>
        <button onClick={() => go('login')} className="w-full py-3.5 border border-[#E5E5E5] text-[#0F0F0F] font-bold rounded-xl text-sm hover:bg-[#F5F5F5]">
          Sign In
        </button>
        <p className="text-center text-[10px] text-[#999]">
          By continuing you agree to our <span className="text-red-600 font-semibold">Terms of Service</span>
        </p>
      </div>
    </div>
  )

  // LOGIN
  if (screen === 'login') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => go('welcome')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          <span className="text-white font-black text-base tracking-tight">EL7A2NY</span>
        </div>
        <h1 className="text-2xl font-black text-white">Welcome back</h1>
        <p className="text-[#888] text-sm mt-1">Sign in to your account</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        <div className="space-y-4 mb-5">
          <MobileField label="Phone or Email" placeholder="+20 100 234 5678" type="text" />
          <div>
            <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} placeholder="Your password"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-11" />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-6">
          <button onClick={() => go('forgot')} className="text-sm text-red-600 font-semibold">Forgot password?</button>
        </div>
        <button onClick={onAuth} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2">
          Sign In <ArrowRight size={15} />
        </button>
        <div className="relative my-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E5E5E5]" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#999]">or</span></div></div>
        <button className="w-full py-3.5 border border-[#E5E5E5] rounded-xl text-sm font-semibold text-[#555] hover:bg-[#F5F5F5] flex items-center justify-center gap-2">
          <span className="font-black">G</span> Continue with Google
        </button>
        <p className="text-center text-sm text-[#666] mt-5">
          Don't have an account?{' '}
          <button onClick={() => go('register')} className="text-red-600 font-bold">Create one</button>
        </p>
      </div>
    </div>
  )

  // REGISTER
  if (screen === 'register') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => go('welcome')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          <span className="text-white font-black text-base tracking-tight">EL7A2NY</span>
        </div>
        <h1 className="text-2xl font-black text-white">Create account</h1>
        <p className="text-[#888] text-sm mt-1">Join 15,000+ customers</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MobileField label="First Name" placeholder="Ahmed" />
          <MobileField label="Last Name" placeholder="Hassan" />
        </div>
        <div className="space-y-4">
          <MobileField label="Phone Number" placeholder="+20 100 234 5678" type="tel" />
          <MobileField label="Email (optional)" placeholder="ahmed@email.com" type="email" />
          <div>
            <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-11" />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">City</label>
            <select className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-[#555]">
              <option>Cairo</option><option>Giza</option><option>Alexandria</option><option>Mansoura</option>
            </select>
          </div>
        </div>
        <label className="flex items-start gap-2 mt-4 mb-5 cursor-pointer">
          <input type="checkbox" className="mt-0.5 accent-red-600" defaultChecked />
          <span className="text-xs text-[#666]">I agree to the <span className="text-red-600 font-semibold">Terms</span> and <span className="text-red-600 font-semibold">Privacy Policy</span></span>
        </label>
        <button onClick={() => go('otp')} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2">
          Create Account <ArrowRight size={15} />
        </button>
        <p className="text-center text-sm text-[#666] mt-4">
          Already have an account? <button onClick={() => go('login')} className="text-red-600 font-bold">Sign in</button>
        </p>
      </div>
    </div>
  )

  // FORGOT
  if (screen === 'forgot') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => go('login')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-black text-white">Forgot password?</h1>
        <p className="text-[#888] text-sm mt-1">Enter your phone to receive a code</p>
      </div>
      <div className="flex-1 px-6 pt-6">
        <MobileField label="Phone or Email" placeholder="+20 100 234 5678" />
        <button onClick={() => go('otp')} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm mt-5 hover:bg-red-700 flex items-center justify-center gap-2">
          Send Code <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )

  // OTP
  if (screen === 'otp') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => go('register')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-black text-white">Enter the code</h1>
        <p className="text-[#888] text-sm mt-1">Sent to <span className="text-white font-semibold">+20 100 234 5678</span></p>
      </div>
      <div className="flex-1 px-6 pt-8">
        <div className="flex gap-2 mb-6">
          {otp.map((v, i) => (
            <input key={i} maxLength={1} value={v}
              onChange={e => { const n = [...otp]; n[i] = e.target.value; setOtp(n) }}
              className="flex-1 aspect-square text-center text-xl font-black border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:border-red-600 text-[#0F0F0F]"
            />
          ))}
        </div>
        <p className="text-xs text-center text-[#999] mb-6">Code expires in <span className="font-bold text-[#0F0F0F]">4:32</span></p>
        <button onClick={() => go('onboarding')} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2">
          Verify <ArrowRight size={15} />
        </button>
        <button className="w-full py-3 text-sm text-[#999] mt-2">
          Didn't receive it? <span className="text-red-600 font-semibold">Resend</span>
        </button>
      </div>
    </div>
  )

  // ONBOARDING
  if (screen === 'onboarding') {
    const steps = ['Welcome', 'Your Car', 'Ready']
    return (
      <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div className="bg-[#0F0F0F] px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="text-white font-black text-base tracking-tight">EL7A2NY</span>
          </div>
          <div className="flex gap-2 mt-2">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < obStep ? 'bg-red-600' : 'bg-[#333]'}`} />
            ))}
          </div>
          <p className="text-[#888] text-xs mt-2">{steps[obStep - 1]} · Step {obStep} of 3</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          {obStep === 1 && (
            <div>
              <h2 className="text-xl font-black text-[#0F0F0F] mb-1">Welcome, Ahmed! 👋</h2>
              <p className="text-sm text-[#666] mb-6">Tell us a bit about yourself so we can personalize your experience.</p>
              <div className="space-y-4">
                <MobileField label="Full Name" placeholder="Ahmed Hassan" />
                <MobileField label="Email (optional)" placeholder="ahmed@email.com" type="email" />
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Your City</label>
                  <select className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none bg-white text-[#555]">
                    <option>Cairo</option><option>Giza</option><option>Alexandria</option><option>Other</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setObStep(2)} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm mt-6 hover:bg-red-700 flex items-center justify-center gap-2">
                Continue <ArrowRight size={15} />
              </button>
            </div>
          )}

          {obStep === 2 && (
            <div>
              <h2 className="text-xl font-black text-[#0F0F0F] mb-1">Add your vehicle</h2>
              <p className="text-sm text-[#666] mb-6">We'll show compatible services and parts for your car.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Brand</label>
                  <select className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none bg-white text-[#555]">
                    <option>Toyota</option><option>BMW</option><option>Hyundai</option><option>Mercedes-Benz</option><option>Kia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Model</label>
                  <select className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none bg-white text-[#555]">
                    <option>Corolla</option><option>Camry</option><option>Yaris</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Year</label>
                    <select className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none bg-white text-[#555]">
                      {[2024,2023,2022,2021,2020,2019,2018].map(y=><option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <MobileField label="Mileage (km)" placeholder="45000" type="number" />
                </div>
                <MobileField label="License Plate" placeholder="Cairo A 12345" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setObStep(3)} className="flex-1 py-3 bg-[#F5F5F5] text-[#555] font-semibold rounded-xl text-sm">Skip</button>
                <button onClick={() => setObStep(3)} className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                  Save <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {obStep === 3 && (
            <div className="text-center pt-4">
              <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-green-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-[#0F0F0F] mb-2">All done!</h2>
              <p className="text-sm text-[#666] mb-8">Your El7a2ny account is ready. Start taking care of your car.</p>
              <div className="grid grid-cols-2 gap-3 text-left mb-6">
                {[['Find Services','Book in seconds'],['Buy Parts','Compatible parts'],['Track Bookings','Stay updated'],['Manage Cars','All your vehicles']].map(([t,d])=>(
                  <div key={t} className="border border-[#E5E5E5] rounded-xl p-3">
                    <p className="text-sm font-bold text-[#0F0F0F]">{t}</p>
                    <p className="text-xs text-[#999] mt-0.5">{d}</p>
                  </div>
                ))}
              </div>
              <button onClick={onAuth} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                Go to Home <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

function MobileField({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] placeholder:text-[#AAA] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
    </div>
  )
}
