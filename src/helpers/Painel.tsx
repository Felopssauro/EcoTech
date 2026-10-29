import type { ReactNode } from "react"

// Caixa azul-clara usada para os blocos condicionais do formulário
export function Painel({ titulo, selo, children }: { titulo: string; selo?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-eco-blue/10 bg-eco-blue-soft p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-sora text-sm font-bold text-eco-blue">{titulo}</h3>
        {selo && (
          <span className="rounded-full bg-eco-blue px-2.5 py-0.5 font-sora text-[10px] font-bold text-white">
            {selo}
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}
