// Sobe o site e a API juntos, num terminal só. Antes confere o ambiente
// (o mesmo do npm run diagnostico) e para com uma explicação se faltar algo.
// Uso: npm run dev

import { spawn } from "node:child_process"
import { diagnosticar } from "./diagnostico.mjs"

const { erros, apiRodando, usarMock } = await diagnosticar()
if (erros) {
  console.error("\nCorrija os itens marcados com ✗ e rode npm run dev de novo.")
  process.exit(1)
}
console.info("")

// Com o mock não há API; se ela já roda em outro terminal, não sobe outra
const scripts = usarMock || apiRodando ? ["dev:front"] : ["dev:api", "dev:front"]
// shell: true para o "npm" funcionar também no Windows (npm.cmd)
const filhos = scripts.map((script) => spawn("npm", ["run", script], { stdio: "inherit", shell: true }))

// Se um dos dois parar, encerra o outro: meio projeto rodando só confunde
for (const filho of filhos) {
  filho.on("exit", (codigo) => {
    for (const outro of filhos) if (outro !== filho) outro.kill()
    process.exit(codigo ?? 0)
  })
}
