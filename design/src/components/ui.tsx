import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'dark'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
  full?: boolean
}

export function Btn({ children, variant = 'primary', size = 'md', className = '', onClick, disabled, full }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none gap-2 cursor-pointer'
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    secondary: 'border border-[#E5E5E5] text-[#0F0F0F] bg-white hover:bg-[#F5F5F5] focus:ring-[#E5E5E5]',
    ghost: 'text-[#555] hover:text-[#0F0F0F] hover:bg-[#F5F5F5] focus:ring-[#E5E5E5]',
    destructive: 'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 focus:ring-red-300',
    outline: 'border border-[#0F0F0F] text-[#0F0F0F] hover:bg-[#0F0F0F] hover:text-white focus:ring-[#0F0F0F]',
    dark: 'bg-[#0F0F0F] text-white hover:bg-[#1F1F1F] focus:ring-[#0F0F0F]',
  }
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded',
    sm: 'px-3 py-2 text-xs rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-md',
    lg: 'px-6 py-3 text-sm rounded-md',
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}>
      {children}
    </button>
  )
}

export function Badge({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'dark'; className?: string }) {
  const variants = {
    default: 'bg-[#F0F0F0] text-[#555]',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    muted: 'bg-[#F0F0F0] text-[#888]',
    dark: 'bg-[#0F0F0F] text-white',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'muted' | 'default' }> = {
    open: { label: 'Open', variant: 'success' },
    closed: { label: 'Closed', variant: 'error' },
    upcoming: { label: 'Upcoming', variant: 'info' },
    active: { label: 'Active', variant: 'success' },
    'in-progress': { label: 'In Progress', variant: 'info' },
    completed: { label: 'Completed', variant: 'muted' },
    cancelled: { label: 'Cancelled', variant: 'error' },
    pending: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Accepted', variant: 'success' },
    scheduled: { label: 'Scheduled', variant: 'info' },
    shipped: { label: 'Shipped', variant: 'info' },
    delivered: { label: 'Delivered', variant: 'success' },
    preparing: { label: 'Preparing', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'success' },
    suspended: { label: 'Suspended', variant: 'error' },
    ok: { label: 'In Stock', variant: 'success' },
    low: { label: 'Low Stock', variant: 'warning' },
    out: { label: 'Out of Stock', variant: 'error' },
    investigating: { label: 'Investigating', variant: 'warning' },
    resolved: { label: 'Resolved', variant: 'muted' },
    failed: { label: 'Failed', variant: 'error' },
    refunded: { label: 'Refunded', variant: 'muted' },
    high: { label: 'High', variant: 'error' },
    medium: { label: 'Medium', variant: 'warning' },
    low_priority: { label: 'Low', variant: 'muted' },
    inactive: { label: 'Inactive', variant: 'muted' },
    expired: { label: 'Expired', variant: 'muted' },
    open_dispute: { label: 'Open', variant: 'error' },
  }
  const c = map[status] || { label: status, variant: 'default' as const }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

export function Avatar({ name, size = 'md', className = '' }: { name: string; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  const sizes = { xs: 'w-6 h-6 text-[9px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div className={`${sizes[size]} rounded-full bg-[#0F0F0F] text-white flex items-center justify-center font-bold shrink-0 ${className}`}>
      {initials}
    </div>
  )
}

export function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-amber-400 text-sm">★</span>
      <span className="text-sm font-bold text-[#0F0F0F]">{rating}</span>
    </div>
  )
}

export function StarRating({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-amber-400 text-sm">★</span>
      <span className="text-sm font-semibold text-[#0F0F0F]">{rating}</span>
      {reviews !== undefined && <span className="text-xs text-[#999]">({reviews.toLocaleString()})</span>}
    </div>
  )
}

export function Stat({ label, value, sub, red }: { label: string; value: string | number; sub?: string; red?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-black ${red ? 'text-red-600' : 'text-[#0F0F0F]'}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm font-semibold text-[#0F0F0F] mt-0.5">{label}</div>
      {sub && <div className="text-xs text-[#999] mt-0.5">{sub}</div>}
    </div>
  )
}

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`border-b border-[#E5E5E5] ${className}`} />
}

export function Input({ label, placeholder, type = 'text', value, onChange, className = '' }: { label?: string; placeholder?: string; type?: string; value?: string; onChange?: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm text-[#0F0F0F] placeholder:text-[#AAA] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
    </div>
  )
}

export function Select({ label, options, className = '', value, onChange }: { label?: string; options: string[]; className?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-[#0F0F0F] mb-1.5">{label}</label>}
      <select value={value} onChange={e => onChange?.(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-md text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-[#0F0F0F]">{title}</h1>
        {sub && <p className="text-sm text-[#666] mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">{children}</p>
}

export function EmptyState({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-4">
        <div className="w-5 h-5 rounded-full bg-[#E0E0E0]" />
      </div>
      <h3 className="text-base font-bold text-[#0F0F0F] mb-1">{title}</h3>
      <p className="text-sm text-[#666] max-w-xs">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ProfileMenuRow({ label, desc, onClick }: { label: string; desc?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between py-4 hover:bg-[#F9F9F9] px-3 -mx-3 rounded-lg transition-colors text-left">
      <div>
        <p className="text-sm font-semibold text-[#0F0F0F]">{label}</p>
        {desc && <p className="text-xs text-[#999] mt-0.5">{desc}</p>}
      </div>
      <ChevronRight size={16} className="text-[#CCC]" />
    </button>
  )
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E5E5]">
            {headers.map(h => (
              <th key={h} className="text-left py-3 px-4 text-xs font-bold text-[#999] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TR({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <tr className={`border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors ${className}`}>{children}</tr>
}

export function TD({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`py-3 px-4 text-[#555] ${className}`}>{children}</td>
}

export function StatsGrid({ children, cols = 4 }: { children: ReactNode; cols?: number }) {
  return (
    <div className={`grid gap-0 border border-[#E5E5E5] rounded-lg overflow-hidden`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {children}
    </div>
  )
}

export function StatCell({ label, value, sub, red, border }: { label: string; value: string | number; sub?: string; red?: boolean; border?: boolean }) {
  return (
    <div className={`p-5 ${border ? 'border-r border-[#E5E5E5]' : ''}`}>
      <div className={`text-2xl font-black ${red ? 'text-red-600' : 'text-[#0F0F0F]'}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm font-semibold text-[#0F0F0F] mt-1">{label}</div>
      {sub && <div className="text-xs text-[#999] mt-0.5">{sub}</div>}
    </div>
  )
}

export function AlertRow({ type, message }: { type: 'warning' | 'error' | 'info'; message: string }) {
  const styles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  return (
    <div className={`px-4 py-3 border rounded-md text-sm ${styles[type]}`}>{message}</div>
  )
}
