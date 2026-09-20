import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, ChevronLeft, Check, ShieldCheck } from 'lucide-react'

type Screen = 'login' | 'otp' | 'verified'

interface Props { onAuth: () => void }

export default function SuperAdminMobileAuth({ onAuth }: Props) {
  const [screen, setScreen] = useState<Screen>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  if (screen === 'login') return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="relative bg-[#0F0F0F] flex-1">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=900&fit=crop&auto=format" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="relative flex flex-col justify-end h-full p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
            <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 rounded mb-4 w-fit">
            <ShieldCheck size={11} className="text-red-400" />
            <span className="text-[10px] font-bold text-[#666] tracking-widest uppercase">Platform Administration</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight mb-2">Super Admin<br />Mobile Access</h1>
          <p className="text-[#888] text-xs mb-8">Authorized administrators only. All actions are logged.</p>
        </div>
      </div>
      <div className="bg-white px-6 pt-5 pb-6 shrink-0">
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1.5 uppercase tracking-wide">Admin Email</label>
            <input type="email" placeholder="superadmin@el7a2ny.com"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F0F0F]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0F0F0F] mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} placeholder="Admin password"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F0F0F] pr-11" />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <button onClick={() => setScreen('otp')} className="w-full py-3.5 bg-[#0F0F0F] text-white font-bold rounded-xl text-sm hover:bg-[#222] flex items-center justify-center gap-2">
          Continue to MFA <ArrowRight size={15} />
        </button>
        <p className="text-center text-[10px] text-[#999] mt-3">Session is monitored and audited</p>
      </div>
    </div>
  )

  if (screen === 'otp') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <button onClick={() => setScreen('login')} className="flex items-center gap-1 text-[#888] text-sm mb-5">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="inline-flex items-center gap-1.5 bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded mb-3 w-fit">
          <span className="text-[9px] font-bold text-[#666] tracking-widest uppercase">Step 2 · MFA</span>
        </div>
        <h1 className="text-2xl font-black text-white">Authentication<br />Code</h1>
        <p className="text-[#888] text-sm mt-1">From your authenticator app</p>
      </div>
      <div className="flex-1 px-6 pt-8">
        <div className="flex gap-2 mb-4">
          {otp.map((v, i) => (
            <input key={i} maxLength={1} value={v}
              onChange={e => { const n = [...otp]; n[i] = e.target.value; setOtp(n) }}
              className="flex-1 aspect-square text-center text-xl font-black border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#0F0F0F] text-[#0F0F0F]"
            />
          ))}
        </div>
        <p className="text-xs text-center text-[#999] mb-6">Refreshes every <span className="font-bold text-[#0F0F0F]">30s</span></p>
        <button onClick={() => setScreen('verified')} className="w-full py-3.5 bg-[#0F0F0F] text-white font-bold rounded-xl text-sm hover:bg-[#222] flex items-center justify-center gap-2">
          Verify <ArrowRight size={15} />
        </button>
        <button className="w-full py-3 text-sm text-[#999] mt-2">
          Lost device? <span className="text-red-600 font-semibold">Use backup code</span>
        </button>
      </div>
    </div>
  )

  if (screen === 'verified') return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-[#0F0F0F] px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          <span className="text-white font-black text-base tracking-tight">EL7A2NY</span>
        </div>
        <h1 className="text-2xl font-black text-white">Identity verified</h1>
      </div>
      <div className="flex-1 px-6 pt-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mb-5">
          <Check size={32} className="text-green-600" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-black text-[#0F0F0F] mb-2">Welcome, Karim</h2>
        <p className="text-sm text-[#666] mb-8">You now have full platform access. This session has been logged.</p>
        <div className="border border-[#E5E5E5] rounded-xl w-full p-4 text-left space-y-2.5 mb-6">
          {[['Role','Super Administrator'],['Access','Full Platform'],['Session','Logged · Audited'],['Status','Active']].map(([k,v])=>(
            <div key={k} className="flex justify-between"><span className="text-xs text-[#999]">{k}</span><span className="text-xs font-bold text-[#0F0F0F]">{v}</span></div>
          ))}
        </div>
        <button onClick={onAuth} className="w-full py-3.5 bg-[#0F0F0F] text-white font-bold rounded-xl text-sm hover:bg-[#222] flex items-center justify-center gap-2">
          Enter Platform <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )

  return null
}
