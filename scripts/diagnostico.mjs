// Confere se o computador está pronto para rodar o projeto e explica o que falta.
// Uso: npm run diagnostico (o npm run dev também roda isto antes de subir tudo)
// Em JavaScript puro, sem dependências: funciona até antes do npm install.

import { existsSync, readFileSync } from "node:fs"
import { createServer } from "node:net"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const lerJson = (caminho) => JSON.parse(readFileSync(caminho, "utf8"))

export async function diagnosticar() {
  const resultado = { erros: 0, apiRodando: false, usarMock: false }
  const ok = (msg) => console.info(`  ✓ ${msg}`)
  const aviso = (msg, dica) => console.warn(`  ! ${msg}${dica ? `\n      → ${dica}` : ""}`)
  const falha = (msg, dica) => {
    console.error(`  ✗ ${msg}${dica ? `\n      → ${dica}` : ""}`)
    resultado.erros += 1
  }

  console.info("Conferindo o ambiente...")

  // ---------- Node ----------
  // O Vite pede ^20.19.0 || >=22.12.0
  const [maior, menor] = process.versions.node.split(".").map(Number)
  if ((maior === 20 && menor >= 19) || (maior === 22 && menor >= 12) || maior >= 23) {
    ok(`Node ${process.versions.node}`)
  } else {
    falha(`Node ${process.versions.node} é antigo demais`, "Instale o Node 22 LTS ou mais novo (nodejs.org) e abra um terminal novo")
    return resultado
  }

  // ---------- pacotes ----------
  // Pega quem nunca rodou npm install e quem rodou antes de um git pull
  // que trouxe pacotes novos ou versões novas
  const pacote = lerJson(join(raiz, "package.json"))
  const trava = lerJson(join(raiz, "package-lock.json")).packages ?? {}
  const pendentes = Object.keys({ ...pacote.dependencies, ...pacote.devDependencies }).filter((nome) => {
    const instalado = join(raiz, "node_modules", nome, "package.json")
    if (!existsSync(instalado)) return true
    const esperado = trava[`node_modules/${nome}`]?.version
    return esperado && esperado !== lerJson(instalado).version
  })
  if (pendentes.length) {
    const lista = pendentes.slice(0, 4).join(", ") + (pendentes.length > 4 ? ` e mais ${pendentes.length - 4}` : "")
    falha(`Pacotes faltando ou desatualizados: ${lista}`, "Rode npm install")
    return resultado
  }
  ok("Pacotes instalados")

  // ---------- .env ----------
  const arquivoEnv = join(raiz, ".env")
  if (!existsSync(arquivoEnv)) {
    // No Windows o Bloco de Notas costuma salvar como ".env.txt" sem mostrar
    const dica = existsSync(`${arquivoEnv}.txt`)
      ? 'Existe um ".env.txt": renomeie para ".env", sem o .txt'
      : "Copie o .env.example para .env e preencha a DATABASE_URL"
    falha("Arquivo .env não encontrado", dica)
    return resultado
  }
  process.loadEnvFile(arquivoEnv)
  ok("Arquivo .env encontrado")

  if (process.env.VITE_USE_MOCK === "true") {
    resultado.usarMock = true
    aviso(
      "VITE_USE_MOCK=true: o site usa o servidor simulado, sem API nem banco",
      "Só as contas de teste do src/mocks/mock.ts entram. Para usar o banco, troque para false"
    )
    return resultado
  }

  // ---------- banco ----------
  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    falha("DATABASE_URL está vazia no .env", "Cole a URL do Neon (Connect > Pooled connection)")
  } else if (url.includes("USUARIO:SENHA")) {
    falha("DATABASE_URL ainda é o exemplo do .env.example", "Cole a URL do Neon (Connect > Pooled connection)")
  } else {
    await conferirBanco(url, { ok, aviso, falha })
  }

  // ---------- porta da API ----------
  const porta = Number(process.env.PORT ?? 3000)
  const quemResponde = await perguntarSaude(porta)
  if (quemResponde === "api") {
    resultado.apiRodando = true
    ok(`A API já está rodando na porta ${porta}`)
  } else if (quemResponde === "outro" || !(await portaLivre(porta))) {
    falha(
      `A porta ${porta} está ocupada por outro programa (não é a API deste projeto)`,
      `Feche o outro programa ou coloque PORT=${porta + 1} no .env`
    )
  } else {
    ok(`Porta ${porta} livre para a API`)
  }

  return resultado
}

async function conferirBanco(url, { ok, aviso, falha }) {
  const { default: pg } = await import("pg")
  const cliente = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10_000 })
  try {
    await cliente.connect()
    const { rows } = await cliente.query(
      `select count(*) filter (where senha_hash is not null)::int as com_senha,
              count(*) filter (where senha_hash is not null and perfil = 'admin')::int as admins
         from usuarios`
    )
    ok(`Banco conectado (${rows[0].com_senha} contas com senha, ${rows[0].admins} de admin)`)
    if (!rows[0].admins) aviso("Nenhuma conta de admin com senha", "Rode npm run db:admin")
  } catch (erro) {
    if (erro.code === "42P01") {
      falha("O banco conectou, mas as tabelas não existem", "Rode npm run db:setup")
    } else if (erro.code === "28P01") {
      falha("Usuário ou senha da DATABASE_URL estão errados", "Copie a URL de novo no painel do Neon")
    } else {
      falha(
        `Não foi possível conectar ao banco: ${erro.message}`,
        "Confira a internet e a DATABASE_URL (inteira, numa linha só). Redes de faculdade às vezes bloqueiam a porta 5432 do Neon: teste em outra rede ou no 4G do celular"
      )
    }
  } finally {
    await cliente.end().catch(() => {})
  }
}

// "api" = esta API respondeu; "outro" = outro programa respondeu; null = ninguém
async function perguntarSaude(porta) {
  try {
    const resposta = await fetch(`http://127.0.0.1:${porta}/api/saude`, { signal: AbortSignal.timeout(2000) })
    const corpo = await resposta.json().catch(() => null)
    return corpo?.api === "inscricoes" ? "api" : "outro"
  } catch {
    return null
  }
}

function portaLivre(porta) {
  return new Promise((resolver) => {
    const servidor = createServer()
    servidor.once("error", () => resolver(false))
    servidor.listen(porta, () => servidor.close(() => resolver(true)))
  })
}

// Rodando direto (npm run diagnostico), e não importado pelo dev.mjs
if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const { erros } = await diagnosticar()
  console.info(erros ? "\nCorrija os itens marcados com ✗ e rode de novo." : "\nTudo certo! Rode npm run dev.")
  process.exitCode = erros ? 1 : 0
}
