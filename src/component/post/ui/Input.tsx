import { InputHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.css'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={clsx(styles.input, className)} {...props} />
  }
)

Input.displayName = 'Input'