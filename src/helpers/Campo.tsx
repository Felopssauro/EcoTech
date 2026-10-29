import { useId, type InputHTMLAttributes, type ReactNode } from "react"
import { estiloInput } from "./estilos"

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  erro?: string
  ajuda?: ReactNode
}

// Label + input no padrão do Figma. "required" também põe o asterisco.
export function Campo({ label, erro, ajuda, required, className = "", ...props }: CampoProps) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-sora text-xs font-bold text-eco-blue">
        {label}
        {required && " *"}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={`${estiloInput} ${erro ? "border-red-400" : ""}`}
        {...props}
      />
      {ajuda && !erro && <p className="font-sora text-[11px] text-eco-gray">{ajuda}</p>}
      {erro && (
        <p id={`${id}-erro`} className="font-sora text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  )
}
