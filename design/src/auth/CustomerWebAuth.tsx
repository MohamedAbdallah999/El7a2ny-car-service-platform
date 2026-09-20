import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Check, ChevronLeft } from 'lucide-react'

type Screen = 'login' | 'register' | 'forgot' | 'otp' | 'reset' | 'onboarding'

interface Props { onAuth: () => void }

export default function CustomerWebAuth({ onAuth }: Props) {
  const [screen, setScreen] = useState<Screen>('login')
  const [step, setStep] = useState(1)
  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const go = (s: Screen) => { setScreen(s); setStep(1) }

  const leftPanel = (
    <div className="relative w-[42%] shrink-0 bg-[#0F0F0F] overflow-hidden flex flex-col">
      <img
        src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=1200&fit=crop&auto=format"
        alt="AutoCare workshop"
        className="absolute inset-0 w-full h-full object-cover opacity-30 bg-[#0F0F0F]"
      />
      <div className="relative flex-1 flex flex-col p-10">
        <div className="flex items-center gap-2 mb-auto">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
        </div>
        <div className="mb-12">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Egypt's #1 Automotive Platform</p>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your car<br />deserves the<br />best care.
          </h2>
          <p className="text-[#888] text-sm leading-relaxed">
            Book services, request repairs, and find genuine parts from top automotive shops near you.
          </p>
          <div className="mt-8 space-y-3">
            {['15,000+ registered customers', '200+ verified automotive shops', 'Trusted service since 2022'].map(t => (
              <div key={t} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-[#AAA] text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // LOGIN
  if (screen === 'login') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {leftPanel}
      <div className="flex-1 flex items-center justify-center bg-white px-12">
        <div className="w-full max-w-md">
          <div className="flex border-b border-[#E5E5E5] mb-8">
            <button className="flex-1 py-3 text-sm font-bold border-b-2 border-red-600 text-red-600 -mb-px">Sign In</button>
            <button onClick={() => go('register')} className="flex-1 py-3 text-sm font-semibold text-[#999] hover:text-[#555]">Create Account</button>
          </div>
          <h1 className="text-2xl font-black text-[#0F0F0F] mb-1">Welcome back</h1>
          <p className="text-sm text-[#666] mb-7">Sign in to your El7a2ny account</p>
          <div className="space-y-4">
            <Field label="Phone or Email" placeholder="e.g. +20 100 234 5678 or email" type="text" />
            <div>
              <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Your password"
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10" />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555]">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-2 mb-6">
            <button onClick={() => go('forgot')} className="text-xs text-red-600 font-semibold hover:text-red-700">Forgot password?</button>
          </div>
          <button onClick={onAuth} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm flex items-center justify-center gap-2">
            Sign In <ArrowRight size={15} />
          </button>
          <p className="text-center text-xs text-[#999] mt-4">
            Don't have an account? <button onClick={() => go('register')} className="text-red-600 font-semibold hover:text-red-700">Create one</button>
          </p>
          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E5E5E5]" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#999]">or continue with</span></div></div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 border border-[#E5E5E5] rounded-md text-sm font-semibold hover:bg-[#F5F5F5] text-[#555]">
              <span className="font-black text-base">G</span> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-[#E5E5E5] rounded-md text-sm font-semibold hover:bg-[#F5F5F5] text-[#555]">
              <span className="font-black text-base">📱</span> Phone OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // REGISTER
  if (screen === 'register') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {leftPanel}
      <div className="flex-1 flex items-center justify-center bg-white px-12 py-10">
        <div className="w-full max-w-md">
          <div className="flex border-b border-[#E5E5E5] mb-8">
            <button onClick={() => go('login')} className="flex-1 py-3 text-sm font-semibold text-[#999] hover:text-[#555]">Sign In</button>
            <button className="flex-1 py-3 text-sm font-bold border-b-2 border-red-600 text-red-600 -mb-px">Create Account</button>
          </div>
          <h1 className="text-2xl font-black text-[#0F0F0F] mb-1">Create your account</h1>
          <p className="text-sm text-[#666] mb-7">Join 15,000+ customers on El7a2ny</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="First Name" placeholder="Ahmed" />
            <Field label="Last Name" placeholder="Hassan" />
          </div>
          <div className="space-y-4">
            <Field label="Phone Number" placeholder="+20 100 234 5678" type="tel" />
            <Field label="Email Address" placeholder="ahmed@email.com" type="email" />
            <div>
              <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10" />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <Field label="City" placeholder="Cairo, Giza, Alexandria..." />
          </div>
          <label className="flex items-start gap-2 mt-4 mb-6 cursor-pointer">
            <input type="checkbox" className="mt-0.5 accent-red-600" defaultChecked />
            <span className="text-xs text-[#666]">I agree to the <span className="text-red-600 font-semibold">Terms of Service</span> and <span className="text-red-600 font-semibold">Privacy Policy</span></span>
          </label>
          <button onClick={() => go('otp')} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm flex items-center justify-center gap-2">
            Create Account <ArrowRight size={15} />
          </button>
          <p className="text-center text-xs text-[#999] mt-4">
            Already have an account? <button onClick={() => go('login')} className="text-red-600 font-semibold">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )

  // FORGOT PASSWORD
  if (screen === 'forgot') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {leftPanel}
      <div className="flex-1 flex items-center justify-center bg-white px-12">
        <div className="w-full max-w-md">
          <button onClick={() => go('login')} className="flex items-center gap-1.5 text-sm text-[#999] font-semibold mb-8 hover:text-[#555]">
            <ChevronLeft size={15} /> Back to Sign In
          </button>
          <h1 className="text-2xl font-black text-[#0F0F0F] mb-1">Forgot your password?</h1>
          <p className="text-sm text-[#666] mb-7">Enter your phone or email and we'll send you a verification code.</p>
          <Field label="Phone or Email" placeholder="+20 100 234 5678 or email" />
          <button onClick={() => go('otp')} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm mt-6 flex items-center justify-center gap-2">
            Send Verification Code <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  // OTP
  if (screen === 'otp') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {leftPanel}
      <div className="flex-1 flex items-center justify-center bg-white px-12">
        <div className="w-full max-w-md">
          <button onClick={() => go('login')} className="flex items-center gap-1.5 text-sm text-[#999] font-semibold mb-8 hover:text-[#555]">
            <ChevronLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-black text-[#0F0F0F] mb-1">Verify your phone</h1>
          <p className="text-sm text-[#666] mb-2">We sent a 6-digit code to</p>
          <p className="text-sm font-bold text-[#0F0F0F] mb-8">+20 100 234 5678</p>
          <div className="flex gap-3 mb-6">
            {otp.map((val, i) => (
              <input key={i} maxLength={1} value={val}
                onChange={e => { const next = [...otp]; next[i] = e.target.value; setOtp(next) }}
                className="flex-1 aspect-square text-center text-xl font-black border-2 border-[#E5E5E5] rounded-lg focus:outline-none focus:border-red-600 focus:ring-0 text-[#0F0F0F]"
              />
            ))}
          </div>
          <button onClick={() => { screen === 'otp' && step === 1 ? go('onboarding') : go('reset') }} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm flex items-center justify-center gap-2">
            Verify Code <ArrowRight size={15} />
          </button>
          <button className="w-full py-3 text-sm text-[#999] mt-2 hover:text-[#555]">
            Didn't receive a code? <span className="text-red-600 font-semibold">Resend</span>
          </button>
          <p className="text-xs text-center text-[#999] mt-2">Code expires in <span className="font-bold text-[#0F0F0F]">4:32</span></p>
        </div>
      </div>
    </div>
  )

  // RESET PASSWORD
  if (screen === 'reset') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {leftPanel}
      <div className="flex-1 flex items-center justify-center bg-white px-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-black text-[#0F0F0F] mb-1">Set new password</h1>
          <p className="text-sm text-[#666] mb-7">Choose a strong password for your account.</p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10" />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <Field label="Confirm New Password" placeholder="Repeat new password" type="password" />
          </div>
          <button onClick={onAuth} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm flex items-center justify-center gap-2">
            Update Password <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  // ONBOARDING (after register, OTP verified)
  if (screen === 'onboarding') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {leftPanel}
      <div className="flex-1 flex items-center justify-center bg-white px-12">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"><Check size={14} className="text-white" strokeWidth={3} /></div>
              <span className="text-sm font-bold text-green-600">Phone verified successfully</span>
            </div>
            <div className="h-1.5 bg-[#E5E5E5] rounded-full mb-2">
              <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-[#999]">
              <span className={step >= 1 ? 'text-[#0F0F0F] font-semibold' : ''}>Welcome</span>
              <span className={step >= 2 ? 'text-[#0F0F0F] font-semibold' : ''}>Add Vehicle</span>
              <span className={step >= 3 ? 'text-[#0F0F0F] font-semibold' : ''}>Location</span>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-black text-[#0F0F0F] mb-1">Welcome to El7a2ny, Ahmed!</h1>
              <p className="text-sm text-[#666] mb-7">Let's set up your account in a few quick steps. First, tell us about yourself.</p>
              <div className="space-y-4">
                <Field label="Full Name" placeholder="Ahmed Hassan" />
                <Field label="Email Address (optional)" placeholder="ahmed@email.com" type="email" />
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">City</label>
                  <select className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-[#555]">
                    <option>Cairo</option><option>Giza</option><option>Alexandria</option><option>Mansoura</option><option>Other</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm mt-6 flex items-center justify-center gap-2">
                Continue <ArrowRight size={15} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-black text-[#0F0F0F] mb-1">Add your vehicle</h1>
              <p className="text-sm text-[#666] mb-7">Add your car so we can show you compatible services and parts.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Brand</label>
                  <select className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-[#555]">
                    <option>Toyota</option><option>BMW</option><option>Mercedes-Benz</option><option>Hyundai</option><option>Kia</option><option>Chevrolet</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Model</label>
                  <select className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-[#555]">
                    <option>Corolla</option><option>Camry</option><option>Yaris</option><option>Land Cruiser</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Year</label>
                  <select className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-[#555]">
                    {[2024,2023,2022,2021,2020,2019,2018,2017,2016].map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Engine</label>
                  <select className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-[#555]">
                    <option>1.6L 4-cylinder</option><option>1.8L 4-cylinder</option><option>2.0L 4-cylinder</option><option>2.5L 4-cylinder</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="License Plate" placeholder="Cairo A 12345" />
                <Field label="Current Mileage (km)" placeholder="e.g. 45000" type="number" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#F5F5F5] text-[#555] font-semibold rounded-md text-sm hover:bg-[#E5E5E5]">Skip for now</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm flex items-center justify-center gap-2">
                  Save Vehicle <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={28} className="text-green-600" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-[#0F0F0F] mb-1 text-center">You're all set!</h1>
              <p className="text-sm text-[#666] text-center mb-8">Your El7a2ny account is ready. Start finding services near you.</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label:'Find Services', desc:'Book maintenance & repairs' },
                  { label:'Browse Parts', desc:'Genuine & aftermarket parts' },
                  { label:'Track Bookings', desc:'All your appointments' },
                  { label:'Manage Cars', desc:'Your vehicle profiles' },
                ].map(c=>(
                  <div key={c.label} className="border border-[#E5E5E5] rounded-lg p-4">
                    <p className="font-bold text-[#0F0F0F] text-sm mb-0.5">{c.label}</p>
                    <p className="text-xs text-[#999]">{c.desc}</p>
                  </div>
                ))}
              </div>
              <button onClick={onAuth} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-sm flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return null
}

function Field({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm text-[#0F0F0F] placeholder:text-[#AAA] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
    </div>
  )
}
