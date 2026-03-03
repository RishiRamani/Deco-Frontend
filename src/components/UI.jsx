export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <div className={`${s} border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin`} />
  )
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-white/5 text-white border-white/10',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    green: 'bg-green-500/15 text-green-400 border-green-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    blue: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  }
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }
  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      <span>{icons[type]}</span>
      <div>{children}</div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    UPCOMING: { label: 'Upcoming', variant: 'blue' },
    ACTIVE: { label: 'Live', variant: 'green' },
    COMPLETED: { label: 'Completed', variant: 'default' },
  }
  const { label, variant } = map[status] || { label: status, variant: 'default' }
  return (
    <Badge variant={variant}>
      {status === 'ACTIVE' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
      {label}
    </Badge>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled, loading, size = 'md', className = '' }) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-400 text-black font-bold disabled:opacity-40',
    secondary: 'bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-40',
    danger: 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 disabled:opacity-40',
    ghost: 'hover:bg-white/5 text-[#6b6b7a] hover:text-white disabled:opacity-40',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading && <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs text-[#6b6b7a] mb-1.5 font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#111115] border border-[#222228] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4b4b58] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
      />
    </div>
  )
}

export function Textarea({ label, value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs text-[#6b6b7a] mb-1.5 font-medium">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#111115] border border-[#222228] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4b4b58] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none"
      />
    </div>
  )
}
