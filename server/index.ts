// Prazos como "até 10/10" são contados no horário de Belém, não no do servidor
process.env.TZ = "America/Belem"

const { app } = await import("./app.ts")
const { pool } = await import("./db.ts")

const porta = Number(process.env.PORT ?? 3000)
app.listen(porta, (erro) => {
  if (erro) {
    // Porta ocupada é o erro mais comum: outro projeto rodando na 3000
    if ((erro as NodeJS.ErrnoException).code === "EADDRINUSE") {
      console.error(`✗ A porta ${porta} já está em uso por outro programa.`)
      console.error(`  Feche esse programa ou coloque PORT=${porta + 1} no .env e rode de novo.`)
    } else {
      console.error(erro)
    }
    process.exit(1)
  }
  console.info(`API rodando em http://localhost:${porta}/api`)
})

// Testa o banco ao subir, para o problema aparecer aqui e não só no login
pool.query("select 1 from usuarios limit 1").then(
  () => console.info("✓ Banco conectado"),
  (erro: Error) => console.error(`✗ Não foi possível usar o banco: ${erro.message}\n  Rode npm run diagnostico para ver o que falta.`)
)
