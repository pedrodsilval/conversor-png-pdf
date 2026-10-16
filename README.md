# 📱 Conversor de Fotos para PDF (Especial para Celular e Idosos)

Aplicativo mobile-first, acessível e sem perda de qualidade, desenvolvido sob medida para facilitar o uso no dia a dia.

---

## 🌟 O que foi implementado:

1. **Qualidade Máxima 1:1 (Lossless)**:
   - A imagem PNG é embutida diretamente na sua resolução nativa original, sem compressão destrutiva.

2. **Zero Margens e Sem Rebarbas Brancas**:
   - Cada folha do PDF é recortada **exatamente nas dimensões de largura e altura da imagem correspondente**. Acabou o problema de páginas A4 com bordas brancas enormes.

3. **Modo Duplo para Múltiplas Fotos**:
   - 📑 **Juntar tudo em 1 único PDF**: Cria um só arquivo PDF contendo todas as fotos em sequência (uma por página).
   - 📄 **Criar 1 PDF separado para cada foto**: Gera arquivos individuais, com opção de baixar todos de uma vez com 1 toque em **.ZIP** ou baixar cada um individualmente.

4. **Interface Amigável e Acessível para Idosos**:
   - Botão **"Letras Maiores"** no topo para aumentar fontes e botões.
   - Textos simples, calorosos e sem jargões técnicos.
   - Botões grandes e confortáveis ao toque (mais de 58px de altura).
   - Feedback visual passo a passo (1: Escolher fotos -> 2: Como quer salvar -> 3: Baixar PDF).
   - Suporte a vibração leve (haptic feedback) ao tocar nos botões no celular.

5. **100% Seguro e Offline (Privacidade Total)**:
   - As fotos não são enviadas para nenhum servidor. Toda a conversão ocorre localmente no navegador do celular.

---

## 📁 Arquivos Criados:

- **[index.html](file:///C:/Users/Pedro/.gemini/antigravity-ide/scratch/conversor-png-pdf/index.html)**: Estrutura da aplicação web moderna e acessível.
- **[styles.css](file:///C:/Users/Pedro/.gemini/antigravity-ide/scratch/conversor-png-pdf/styles.css)**: Estilos responsivos, cores contrastantes e modo letras grandes.
- **[app.js](file:///C:/Users/Pedro/.gemini/antigravity-ide/scratch/conversor-png-pdf/app.js)**: Motor de geração de PDF com resolução nativa, sem margens e suporte a ZIP.
- **[sw.js](file:///C:/Users/Pedro/.gemini/antigravity-ide/scratch/conversor-png-pdf/sw.js)** e **[manifest.json](file:///C:/Users/Pedro/.gemini/antigravity-ide/scratch/conversor-png-pdf/manifest.json)**: Suporte a PWA para instalar como app no celular e funcionar offline.
- **[conversor-portatil.html](file:///C:/Users/Pedro/.gemini/antigravity-ide/scratch/conversor-png-pdf/conversor-portatil.html)**: Versão independente em arquivo único (single-file), pronta para abrir em qualquer celular sem servidor.

---

## 🚀 Como testar e colocar no celular da sua mãe:

### Opção A (Recomendada - Como Site / PWA na Tela Inicial):
1. No computador, você pode rodar localmente para testar:
   ```bash
   npx serve .
   # ou
   python -m http.server 8080
   ```
2. Para colocar na internet gratuitamente com 1 clique (para sua mãe acessar de qualquer lugar):
   - Você pode arrastar a pasta `conversor-png-pdf` para o [Netlify Drop](https://app.netlify.com/drop) ou [Vercel](https://vercel.com).
   - O link gerado (ex: `fotos-pdf.vercel.app`) pode ser enviado para ela no WhatsApp.
3. **No celular dela**:
   - **Android (Chrome)**: Toque nos 3 pontinhos no canto superior -> **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
   - **iPhone (Safari)**: Toque no botão de Compartilhar (quadrado com setinha para cima ⬆️) -> **"Adicionar à Tela de Início"**.
   - Pronto! O aplicativo ganha um ícone na tela inicial do celular dela e abre em tela cheia como um app nativo, sem barra de navegador.

### Opção B (Arquivo Local no Celular):
- Envie o arquivo **`conversor-portatil.html`** pelo WhatsApp para ela ou copie para o celular via cabo USB.
- Toque no arquivo para abrir no Google Chrome do celular. Ele funciona 100% offline, sem gastar dados nem precisar de internet.
