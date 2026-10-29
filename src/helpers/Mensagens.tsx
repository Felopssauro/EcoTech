import type { ReactNode } from "react"

export function MensagemErro({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="font-sora rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {children}
    </p>
  )
}

export function MensagemSucesso({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="status" className="font-sora rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
      {children}
    </p>
  )
}
