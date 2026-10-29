import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Mesma porta da API (PORT no .env, padrão 3000)
  const portaApi = loadEnv(mode, process.cwd(), '').PORT || '3000'

  return {
    plugins: [react(), tailwindcss()],
    // Não apaga o terminal ao subir: no npm run dev as mensagens da API
    // aparecem no mesmo terminal e precisam continuar visíveis
    clearScreen: false,
    server: {
      // Aceita conexões de outros aparelhos da rede (ex.: o celular que lê o
      // QR Code de pagamento). O endereço aparece como "Network" ao rodar.
      host: true,
      // Em desenvolvimento, /api vai para o backend (npm run dev:api).
      // Assim front e API ficam na mesma origem e não precisa de CORS.
      proxy: {
        '/api': `http://127.0.0.1:${portaApi}`,
      },
    },
  }
})
