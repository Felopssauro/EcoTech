import type { InputHTMLAttributes, ReactNode } from "react"

interface CaixaSelecaoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode
}

export function CaixaSelecao({ children, className = "", ...props }: CaixaSelecaoProps) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 font-sora text-xs text-eco-blue ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-eco-blue"
        {...props}
      />
      <span>{children}</span>
    </label>
  )
}
