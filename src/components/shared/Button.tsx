import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClass = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }[size]

  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50',
  }[variant]

  return (
    <button
      className={`${sizeClass} ${variantClass} rounded-lg font-medium transition-colors inline-flex items-center gap-2 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
