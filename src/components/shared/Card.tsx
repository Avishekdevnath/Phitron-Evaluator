import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
