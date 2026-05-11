import React from 'react'
import * as Icons from 'lucide-react'

interface IconProps {
  name: keyof typeof Icons
  size?: number
  color?: string
  className?: string
  title?: string
}

export default function Icon({
  name,
  size = 20,
  color,
  className = '',
  title
}: IconProps) {
  const LucideIcon = Icons[name] as any

  if (!LucideIcon) {
    return null
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      className={className}
      title={title}
      strokeWidth={1.5}
    />
  )
}
