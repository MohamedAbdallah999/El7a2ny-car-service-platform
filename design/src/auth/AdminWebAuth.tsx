import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, ChevronLeft, Check, Upload } from 'lucide-react'

type Screen = 'login' | 'forgot' | 'otp' | 'reset' | 'onboarding'

interface Props { onAuth: () => void }

export default function AdminWebAuth({ onAuth }: Props) {
  const [screen, setScreen] = useState<Screen>('login')
  const [obStep, setObStep] = useState(1)
  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  if (screen === 'login') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Left panel */}
      <div className="w-[42%] bg-[#0F0F0F] flex flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&h=1200&fit=crop&auto=format" alt=""
            className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F]/80 via-transparent to-[#0F0F0F]/80" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-10">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
            <span className="text-[#555] text-xs font-semibold ml-1">Business Portal</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-snug">
            Run your shop<br />like a pro.
          </h1>
          <p className="text-[#888] mt-4 text-sm leading-relaxed max-w-xs">
            Manage bookings, inventory, and revenue — all from one place.
          </p>
        </div>
        <div className="relative space-y-3">
          {[['Zero paperwork', 'Digital service records and invoices'],['Real-time dashboard', 'See bookings and revenue at a glance'],['Customer management', 'Build loyalty with every interaction']].map(([t, d]) => (
            <div key={t} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Check size={10} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">{t}</p>
                <p className="text-[#666] text-xs">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Business Sign In</h2>
            <p className="text-sm text-[#666]">Access your El7a2ny Business Portal</p>
          </div>
          <div className="space-y-4 mb-4">
            <Field label="Business Email" placeholder="info@autocare.eg" type="email" />
            <div>
              <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Your password"
                  className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10" />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mb-5">
            <button onClick={() => setScreen('forgot')} className="text-sm text-red-600 font-semibold">Forgot password?</button>
          </div>
          <button onClick={onAuth} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2">
            Sign In <ArrowRight size={15} />
          </button>
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <p className="text-sm text-center text-[#666] mb-4">Don't have a business account?</p>
            <button onClick={() => setScreen('onboarding')} className="w-full py-3 border border-[#0F0F0F] text-[#0F0F0F] font-bold rounded-lg text-sm hover:bg-[#F5F5F5] flex items-center justify-center gap-2">
              Register Your Business <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (screen === 'forgot') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-[42%] bg-[#0F0F0F] relative overflow-hidden shrink-0">
        <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&h=1200&fit=crop&auto=format" alt=""
          className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <div className="flex items-center gap-2.5 mb-10">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
          </div>
          <h1 className="text-4xl font-black text-white">Reset your<br />password.</h1>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-8">
        <div className="w-full max-w-sm">
          <button onClick={() => setScreen('login')} className="flex items-center gap-1 text-sm text-[#999] mb-8 hover:text-[#555]">
            <ChevronLeft size={16} /> Back to sign in
          </button>
          <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Forgot password?</h2>
          <p className="text-sm text-[#666] mb-6">Enter your business email to receive a reset code</p>
          <Field label="Business Email" placeholder="info@autocare.eg" type="email" />
          <button onClick={() => setScreen('otp')} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm mt-5 hover:bg-red-700 flex items-center justify-center gap-2">
            Send Code <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 'otp') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-[42%] bg-[#0F0F0F] relative overflow-hidden shrink-0">
        <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&h=1200&fit=crop&auto=format" alt=""
          className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <div className="flex items-center gap-2.5 mb-10">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
          </div>
          <h1 className="text-4xl font-black text-white">Check your<br />inbox.</h1>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-8">
        <div className="w-full max-w-sm">
          <button onClick={() => setScreen('forgot')} className="flex items-center gap-1 text-sm text-[#999] mb-8 hover:text-[#555]">
            <ChevronLeft size={16} /> Back
          </button>
          <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Enter verification code</h2>
          <p className="text-sm text-[#666] mb-6">We sent a 6-digit code to <strong>info@autocare.eg</strong></p>
          <div className="flex gap-2 mb-4">
            {otp.map((v, i) => (
              <input key={i} maxLength={1} value={v}
                onChange={e => { const n = [...otp]; n[i] = e.target.value; setOtp(n) }}
                className="flex-1 aspect-square text-center text-xl font-black border-2 border-[#E5E5E5] rounded-lg focus:outline-none focus:border-red-600 text-[#0F0F0F]" />
            ))}
          </div>
          <p className="text-xs text-[#999] mb-5">Code expires in <span className="font-bold text-[#0F0F0F]">4:32</span> · <button className="text-red-600 font-semibold">Resend</button></p>
          <button onClick={() => setScreen('reset')} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2">
            Verify Code <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 'reset') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-[42%] bg-[#0F0F0F] relative overflow-hidden shrink-0">
        <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&h=1200&fit=crop&auto=format" alt=""
          className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <div className="flex items-center gap-2.5 mb-10">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
          </div>
          <h1 className="text-4xl font-black text-white">Set your<br />new password.</h1>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Create new password</h2>
          <p className="text-sm text-[#666] mb-6">Must be at least 8 characters</p>
          <div className="space-y-4 mb-5">
            <Field label="New Password" placeholder="••••••••" type="password" />
            <Field label="Confirm Password" placeholder="••••••••" type="password" />
          </div>
          <button onClick={() => setScreen('login')} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2">
            Reset Password <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  // BUSINESS ONBOARDING
  const steps = ['Business Info', 'Services & Hours', 'Verification', 'Done']
  if (screen === 'onboarding') return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Left panel */}
      <div className="w-[42%] bg-[#0F0F0F] flex flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&h=1200&fit=crop&auto=format" alt=""
            className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-10">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-white font-black text-xl tracking-tight">EL7A2NY</span>
            <span className="text-[#555] text-xs font-semibold ml-1">Business Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-snug mb-3">Register your<br />business.</h1>
          <p className="text-[#888] text-sm">Join 1,200+ shops across Egypt on the El7a2ny platform.</p>
        </div>
        <div className="relative space-y-2">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${i + 1 === obStep ? 'bg-white/10' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i + 1 < obStep ? 'bg-green-500 text-white' : i + 1 === obStep ? 'bg-red-600 text-white' : 'bg-[#222] text-[#555]'}`}>
                {i + 1 < obStep ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-sm font-semibold ${i + 1 === obStep ? 'text-white' : i + 1 < obStep ? 'text-green-400' : 'text-[#555]'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center bg-white py-12 px-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {obStep < 4 && (
            <button onClick={() => obStep > 1 ? setObStep(obStep - 1) : setScreen('login')} className="flex items-center gap-1 text-sm text-[#999] mb-8 hover:text-[#555]">
              <ChevronLeft size={16} /> {obStep > 1 ? 'Back' : 'Back to sign in'}
            </button>
          )}

          {obStep === 1 && (
            <div>
              <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Business Information</h2>
              <p className="text-sm text-[#666] mb-6">Tell us about your automotive business</p>
              <div className="space-y-4">
                <Field label="Business Name" placeholder="AutoCare Garage" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Owner First Name" placeholder="Mohamed" />
                  <Field label="Owner Last Name" placeholder="Salah" />
                </div>
                <Field label="Business Email" placeholder="info@autocare.eg" type="email" />
                <Field label="Phone Number" placeholder="+20 2 1234 5678" type="tel" />
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">City</label>
                  <select className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-[#555]">
                    <option>Cairo</option><option>Giza</option><option>Alexandria</option><option>Mansoura</option><option>Aswan</option>
                  </select>
                </div>
                <Field label="Full Address" placeholder="12 El Mohandiseen St, Giza" />
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                      className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10" />
                    <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => setObStep(2)} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm mt-6 hover:bg-red-700 flex items-center justify-center gap-2">
                Continue <ArrowRight size={15} />
              </button>
            </div>
          )}

          {obStep === 2 && (
            <div>
              <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Services & Hours</h2>
              <p className="text-sm text-[#666] mb-6">What services do you offer and when are you open?</p>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#0F0F0F] mb-2">Services Offered</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Oil Change','Brake Service','AC Repair','Engine Diagnostics','Wheel Alignment','Tire Replacement','Suspension','Battery','Transmission','Bodywork'].map(s => (
                    <label key={s} className="flex items-center gap-2 border border-[#E5E5E5] rounded-lg p-2.5 cursor-pointer hover:bg-[#F9F9F9]">
                      <input type="checkbox" className="accent-red-600" />
                      <span className="text-sm text-[#555]">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#0F0F0F] mb-2">Business Hours</label>
                <div className="space-y-2">
                  {[['Saturday–Thursday','8:00 AM – 8:00 PM'],['Friday','Closed']].map(([day, h]) => (
                    <div key={day} className="flex items-center justify-between border border-[#E5E5E5] rounded-lg px-3 py-2.5">
                      <span className="text-sm text-[#0F0F0F] font-medium">{day}</span>
                      <input defaultValue={h} className="text-sm text-[#555] text-right w-36 focus:outline-none border-b border-[#E5E5E5] focus:border-red-600" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setObStep(3)} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                Continue <ArrowRight size={15} />
              </button>
            </div>
          )}

          {obStep === 3 && (
            <div>
              <h2 className="text-2xl font-black text-[#0F0F0F] mb-1">Verification Documents</h2>
              <p className="text-sm text-[#666] mb-6">We verify all businesses to maintain quality standards</p>
              <div className="space-y-4 mb-6">
                {[['Commercial Registration', 'Business license or commercial registration number'],['National ID / Passport', 'Owner identification document'],['Workshop Photo', 'Clear photo of your workshop exterior']].map(([t, d]) => (
                  <div key={t}>
                    <label className="block text-sm font-semibold text-[#0F0F0F] mb-1">{t}</label>
                    <p className="text-xs text-[#999] mb-1.5">{d}</p>
                    <div className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-5 flex flex-col items-center gap-2 hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors">
                      <Upload size={18} className="text-[#AAA]" />
                      <span className="text-xs text-[#999] font-medium">Click to upload · PNG, JPG, PDF</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <p className="text-xs text-amber-800 font-semibold">Review takes 1–3 business days.</p>
                <p className="text-xs text-amber-700 mt-0.5">You can start setting up your shop while you wait.</p>
              </div>
              <label className="flex items-start gap-2 cursor-pointer mb-5">
                <input type="checkbox" className="mt-0.5 accent-red-600" />
                <span className="text-xs text-[#666]">I confirm all submitted documents are authentic and I agree to the <span className="text-red-600 font-semibold">El7a2ny Business Terms</span></span>
              </label>
              <button onClick={() => setObStep(4)} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                Submit Application <ArrowRight size={15} />
              </button>
            </div>
          )}

          {obStep === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={36} className="text-green-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-[#0F0F0F] mb-2">Application submitted!</h2>
              <p className="text-sm text-[#666] mb-6 max-w-xs mx-auto">Our team will review your documents and notify you within 1–3 business days. You'll get an email at <strong>info@autocare.eg</strong>.</p>
              <div className="border border-[#E5E5E5] rounded-xl p-5 text-left mb-6 space-y-3">
                {[['Business Name','AutoCare Garage'],['Status','Pending Review'],['Submitted','Today, Sep 15, 2026']].map(([k,v])=>(
                  <div key={k} className="flex justify-between"><span className="text-sm text-[#999]">{k}</span><span className="text-sm font-semibold text-[#0F0F0F]">{v}</span></div>
                ))}
              </div>
              <button onClick={onAuth} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight size={15} />
              </button>
              <button onClick={() => setScreen('login')} className="w-full py-3 text-sm text-[#999] mt-2 hover:text-[#555]">
                Back to sign in
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
        className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] placeholder:text-[#AAA] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
    </div>
  )
}
