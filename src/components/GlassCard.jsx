import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = true, onClick, label, ...rest }) {
  const clickable = typeof onClick === 'function'
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : undefined}
      whileTap={clickable ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`glass-card min-w-0 p-5 ${clickable ? 'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/70' : ''} ${className}`}
      {...(clickable && {
        onClick,
        role: 'button',
        tabIndex: 0,
        'aria-label': label,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick(e)
          }
        },
      })}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
