import { ButtonHTMLAttributes, forwardRef } from 'react'
import styles from './button.module.css'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <button ref={ref} className={clsx(styles.button, className)} {...props} />
  }
)

Button.displayName = 'Button'