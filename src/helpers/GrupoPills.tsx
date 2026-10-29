interface GrupoPillsProps<T extends string> {
  legenda: string
  nome: string
  opcoes: { valor: T; label: string }[]
  valor: T | null
  onChange: (valor: T) => void
  required?: boolean
}

// Radios com cara de pílula (Categoria, Sim/Não). Continuam sendo radios
// de verdade por baixo, então setas do teclado e leitores de tela funcionam.
export function GrupoPills<T extends string>({ legenda, nome, opcoes, valor, onChange, required }: GrupoPillsProps<T>) {
  return (
    <fieldset>
      <legend className="font-sora text-xs font-bold text-eco-blue">
        {legenda}
        {required && " *"}
      </legend>
      <div className="mt-2 flex flex-wrap gap-3">
        {opcoes.map((o) => {
          const ativo = valor === o.valor
          return (
            <label
              key={o.valor}
              className={`flex min-w-28 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-eco-blue px-5 py-2.5 font-sora text-sm font-bold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-eco-green sm:max-w-44 ${
                ativo ? "bg-eco-blue text-white" : "bg-white text-eco-blue hover:bg-eco-blue/5"
              }`}
            >
              <input
                type="radio"
                name={nome}
                value={o.valor}
                checked={ativo}
                required={required}
                onChange={() => onChange(o.valor)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] ${
                  ativo ? "border-white" : "border-eco-blue"
                }`}
              >
                {ativo && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              {o.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
