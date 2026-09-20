import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, ChevronLeft, Check } from 'lucide-react'

type Screen = 'login' | 'otp' | 'reset'

interface Props { onAuth: () => void }

export default function SuperAdminWebAuth({ onAuth }: Props) {
  const [screen, setScreen] = useState<Screen>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const LeftPanel = ({ heading }: { heading: string }) => (
    <div className="w-[42%] bg-[#0F0F0F] flex flex-col justify-between p-12 relative overflow-hidden shrink-0">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&auto=format" alt=""
          className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F]/90 via-transparent to-[#0F0F0F]/90" />
      </div>
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-3 h-3 bg-red-600 rounded-full" />
          <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
        </div>
        <div className="inline-block px-2 py-0.5 rounded bg-[#222] text-[10px] font-bold text-[#888] tracking-widest uppercase mb-8">Platform Administration</div>
        <h1 className="text-4xl font-black text-white leading-snug">{heading}</h1>
      </div>
      <div className="relative">
        <div className="border border-[#1F1F1F] rounded-xl p-4 space-y-3">
          {[['1,200+', 'Verified Businesses'],['85,000+', 'Active Customers'],['EGP 4.2M', 'Monthly GMV']].map(([v, l]) => (
            <div key={l} className="flex items-center justify-between">
              <span className="text-xs text-[#666]">{l}</span>
              <span className="text-sm font-black text-white">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-[#666]">All systems operational</span>
        </div>
      </div>
    </div>
  )

  if (screen === 'login') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <LeftPanel heading={"Platform\nCommand\nCenter."} />
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="inline-block px-2 py-0.5 rounded bg-[#F5F5F5] text-[10px] font-bold text-[#999] tracking-widest uppercase mb-4">Restricted Access</div>
            <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Super Admin Login</h2>
            <p className="text-sm text-[#666]">Platform administrators only. This session is monitored.</p>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Admin Email</label>
              <input type="email" placeholder="superadmin@el7a2ny.com"
                className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Admin password"
                  className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10" />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => setScreen('otp')} className="w-full py-3 bg-[#0F0F0F] text-white font-bold rounded-lg text-sm hover:bg-[#222] flex items-center justify-center gap-2 mb-3">
            Continue to MFA <ArrowRight size={15} />
          </button>
          <p className="text-center text-xs text-[#999]">
            Forgot credentials? <span className="text-red-600 font-semibold cursor-pointer">Contact IT Support</span>
          </p>
          <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
            <p className="text-xs text-[#999] text-center">
              This system is for authorized El7a2ny administrators only. All actions are logged and audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  if (screen === 'otp') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <LeftPanel heading={"Two-Factor\nVerification."} />
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-8">
        <div className="w-full max-w-sm">
          <button onClick={() => setScreen('login')} className="flex items-center gap-1 text-sm text-[#999] mb-8 hover:text-[#555]">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="inline-block px-2 py-0.5 rounded bg-[#F5F5F5] text-[10px] font-bold text-[#999] tracking-widest uppercase mb-4">Step 2 of 2 · MFA</div>
          <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Authentication Code</h2>
          <p className="text-sm text-[#666] mb-6">Enter the 6-digit code from your authenticator app</p>
          <div className="flex gap-2 mb-4">
            {otp.map((v, i) => (
              <input key={i} maxLength={1} value={v}
                onChange={e => { const n = [...otp]; n[i] = e.target.value; setOtp(n) }}
                className="flex-1 aspect-square text-center text-xl font-black border-2 border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#0F0F0F] text-[#0F0F0F]" />
            ))}
          </div>
          <p className="text-xs text-[#999] mb-5">Code refreshes every <span className="font-bold text-[#0F0F0F]">30s</span></p>
          <button onClick={() => setScreen('reset')} className="w-full py-3 bg-[#0F0F0F] text-white font-bold rounded-lg text-sm hover:bg-[#222] flex items-center justify-center gap-2">
            Verify Identity <ArrowRight size={15} />
          </button>
          <p className="text-xs text-center text-[#999] mt-4">Lost your device? <span className="text-red-600 font-semibold cursor-pointer">Use backup code</span></p>
        </div>
      </div>
    </div>
  )

  if (screen === 'reset') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <LeftPanel heading={"Identity\nVerified."} />
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-8">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-green-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-[#0F0F0F] mb-2">Identity verified</h2>
          <p className="text-sm text-[#666] mb-6">Welcome, Super Admin. You now have full platform access. This session has been logged.</p>
          <div className="border border-[#E5E5E5] rounded-xl p-4 text-left mb-6 space-y-2.5">
            {[['Admin','Karim El-Badawi'],['Role','Super Administrator'],['Access Level','Full Platform'],['Session','Logged · Audited']].map(([k,v])=>(
              <div key={k} className="flex justify-between"><span className="text-xs text-[#999]">{k}</span><span className="text-xs font-bold text-[#0F0F0F]">{v}</span></div>
            ))}
          </div>
          <button onClick={onAuth} className="w-full py-3 bg-[#0F0F0F] text-white font-bold rounded-lg text-sm hover:bg-[#222] flex items-center justify-center gap-2">
            Enter Platform <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return null
}
