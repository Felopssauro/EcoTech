import { useId, type SelectHTMLAttributes } from "react"
import { estiloInput } from "./estilos"

interface SelecaoProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  opcoes: { valor: string; label: string }[]
}

export function Selecao({ label, opcoes, required, className = "", ...props }: SelecaoProps) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-sora text-xs font-bold text-eco-blue">
        {label}
        {required && " *"}
      </label>
      <select id={id} required={required} className={estiloInput} {...props}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
