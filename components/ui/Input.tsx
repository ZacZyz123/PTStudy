'use client'

import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', id, ...props },
  ref
) {
  const inputId = id ?? props.name

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`glass-input w-full px-4 py-3 text-text-primary placeholder:text-text-tertiary ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-accent-red">{error}</p>}
    </div>
  )
})

export default Input
