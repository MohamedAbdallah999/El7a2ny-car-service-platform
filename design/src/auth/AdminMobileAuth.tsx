import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react'

type Screen = 'login' | 'forgot' | 'otp' | 'reset'

interface Props { onAuth: () => void }

export default function AdminMobileAuth({ onAuth }: Props) {
  const [screen, setScreen] = useState<Screen>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  if (screen === 'login') return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="relative bg-[#0F0F0F] flex-1">
        <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=900&fit=crop&auto=format" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative flex flex-col justify-end h-full p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
            <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
            <span className="text-[#555] text-xs font-semibold">Business</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-2">Manage your<br />shop anywhere.</h1>
          <p className="text-[#888] text-sm mb-8">Bookings, inventory, and customers — all in your pocket.</p>
        </div>
      </div>
      <div className="bg-white px-6 pt-6 pb-6 shrink-0">
        <div className="space-y-3 mb-4">
          <MobileField label="Business Email" placeholder="info@autocare.eg" type="email" />
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
        <div className="flex justify-end mb-4">
          <button onClick={() => setScreen('forgot')} className="text-sm text-red-600 font-semibold">Forgot password?</button>
        </div>
        <button onClick={onAuth} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2">
          Sign In <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )

  if (screen === 'forgot') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => setScreen('login')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          <span className="text-white font-black text-base tracking-tight">EL7A2NY</span>
        </div>
        <h1 className="text-2xl font-black text-white">Reset password</h1>
        <p className="text-[#888] text-sm mt-1">Enter your business email</p>
      </div>
      <div className="flex-1 px-6 pt-6">
        <MobileField label="Business Email" placeholder="info@autocare.eg" type="email" />
        <button onClick={() => setScreen('otp')} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm mt-5 hover:bg-red-700 flex items-center justify-center gap-2">
          Send Code <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )

  if (screen === 'otp') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => setScreen('forgot')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-black text-white">Verify your email</h1>
        <p className="text-[#888] text-sm mt-1">Code sent to <span className="text-white font-semibold">info@autocare.eg</span></p>
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
        <p className="text-xs text-center text-[#999] mb-6">Expires in <span className="font-bold text-[#0F0F0F]">4:32</span></p>
        <button onClick={() => setScreen('reset')} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2">
          Verify <ArrowRight size={15} />
        </button>
        <button className="w-full py-3 text-sm text-[#999] mt-2">
          Didn't receive it? <span className="text-red-600 font-semibold">Resend</span>
        </button>
      </div>
    </div>
  )

  if (screen === 'reset') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => setScreen('otp')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-black text-white">New password</h1>
        <p className="text-[#888] text-sm mt-1">Min. 8 characters</p>
      </div>
      <div className="flex-1 px-6 pt-6 space-y-4">
        <MobileField label="New Password" placeholder="••••••••" type="password" />
        <MobileField label="Confirm Password" placeholder="••••••••" type="password" />
        <button onClick={() => setScreen('login')} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm mt-2 hover:bg-red-700 flex items-center justify-center gap-2">
          Reset Password <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )

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
