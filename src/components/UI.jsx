export function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  }

  return <div className={`${sizes[size]} animate-spin rounded-full border-2 border-white/20 border-t-[#2DFF9A]`} />
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'border-[#2DFF9A]/25 bg-[#2DFF9A]/10 text-[#2DFF9A]',
    success: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    warning: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
    error: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
  }

  return <div className={`rounded-3xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'border-white/10 bg-white/5 text-white',
    green: 'border-[#2DFF9A]/25 bg-[#2DFF9A]/10 text-[#2DFF9A]',
    red: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
    yellow: 'border-[#FEBF3C]/25 bg-[#FEBF3C]/10 text-[#FEBF3C]',
    blue: 'border-[#2DFF9A]/25 bg-[#2DFF9A]/10 text-[#2DFF9A]/80',
    gray: 'border-white/10 bg-white/5 text-slate-300',
  }

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${variants[variant] || variants.default}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const lookup = {
    ACTIVE: 'green',
    UPCOMING: 'blue',
    COMPLETED: 'gray',
  }

  return <Badge variant={lookup[status] || 'default'}>{status}</Badge>
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
}) {
  const variants = {
    primary: 'bg-[#0B1F18] text-[#2DFF9A] border-2 border-[#2DFF9A] shadow-[40px_41px_57px_rgba(255,0,0,0.44)] hover:bg-[#0f2e23] [text-shadow:0px_4px_20px_rgba(45,255,154,0.8),0px_0px_40px_rgba(45,255,154,0.4)]',
    secondary: 'bg-white/8 text-[#2DFF9A] border border-[#2DFF9A]/30 hover:bg-[#2DFF9A]/10 hover:border-[#2DFF9A]/50',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/8 hover:text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

export function Input({ value, onChange, placeholder, className = '', ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#2DFF9A]/40 focus:bg-white/10 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ value, onChange, placeholder, className = '', rows = 4, ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#2DFF9A]/40 focus:bg-white/10 ${className}`}
      {...props}
    />
  )
}

export function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-[2rem] border border-[#2DFF9A]/10 bg-[#0B1F18]/55 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur ${className}`}>
      {children}
    </div>
  )
}
