/**
 * Conversor PNG para PDF - Lógica da Aplicação
 * Desenvolvido com foco em acessibilidade para idosos, zero perda de qualidade
 * e recorte perfeito sem bordas brancas.
 */

(function () {
  'use strict';

  // --- Elementos da Interface ---
  const fileInput = document.getElementById('fileInput');
  const addMoreInput = document.getElementById('addMoreInput');
  const dropzone = document.getElementById('dropzone');
  
  const step1Section = document.getElementById('step1Section');
  const step2Section = document.getElementById('step2Section');
  const step3Section = document.getElementById('step3Section');

  const imagesCountText = document.getElementById('imagesCountText');
  const imagesPreviewList = document.getElementById('imagesPreviewList');
  const modeSelectionContainer = document.getElementById('modeSelectionContainer');
  const singleImageNotice = document.getElementById('singleImageNotice');
  const modeCardMerged = document.getElementById('modeCardMerged');
  const modeCardSeparate = document.getElementById('modeCardSeparate');
  const modeMerged = document.getElementById('modeMerged');
  const modeSeparate = document.getElementById('modeSeparate');

  const convertBtn = document.getElementById('convertBtn');
  const convertBtnText = document.getElementById('convertBtnText');

  const conversionLoading = document.getElementById('conversionLoading');
  const conversionSuccess = document.getElementById('conversionSuccess');
  const loadingTitle = document.getElementById('loadingTitle');
  const loadingSubtitle = document.getElementById('loadingSubtitle');
  const progressBarFill = document.getElementById('progressBarFill');
  const successHeading = document.getElementById('successHeading');
  const successSubtitle = document.getElementById('successSubtitle');
  const downloadButtonsArea = document.getElementById('downloadButtonsArea');
  const startOverBtn = document.getElementById('startOverBtn');

  const toggleTextSizeBtn = document.getElementById('toggleTextSizeBtn');
  const toggleTextSizeLabel = document.getElementById('toggleTextSizeLabel');

  const installBanner = document.getElementById('installBanner');
  const installAppBtn = document.getElementById('installAppBtn');
  const dismissInstallBtn = document.getElementById('dismissInstallBtn');

  // --- Estado da Aplicação ---
  let selectedFiles = []; // Array com objetos { id, file, name, size, type, previewUrl, width, height, arrayBuffer }
  let deferredInstallPrompt = null;

  // --- 1. Inicialização e Acessibilidade ---
  function initAccessibility() {
    const isLarge = localStorage.getItem('png2pdf_large_text') === 'true';
    if (isLarge) {
      document.body.classList.add('large-text');
      toggleTextSizeLabel.textContent = 'Letras Normais';
    } else {
      toggleTextSizeLabel.textContent = 'Letras Maiores';
    }

    toggleTextSizeBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('large-text');
      localStorage.setItem('png2pdf_large_text', active);
      toggleTextSizeLabel.textContent = active ? 'Letras Normais' : 'Letras Maiores';
      vibrate(30);
    });
  }

  function vibrate(ms = 40) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  // --- 2. PWA e Instalação ---
  function initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('Falha ao registrar Service Worker:', err);
        });
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      installBanner.classList.remove('hidden');
    });

    if (installAppBtn) {
      installAppBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          installBanner.classList.add('hidden');
        }
        deferredInstallPrompt = null;
      });
    }

    if (dismissInstallBtn) {
      dismissInstallBtn.addEventListener('click', () => {
        installBanner.classList.add('hidden');
      });
    }
  }

  // --- 3. Manipulação de Arquivos e Leitura ---
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async function processFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      alert('Por favor, selecione arquivos de imagem válidos (como PNG ou JPG).');
      return;
    }

    vibrate(40);

    for (const file of files) {
      const id = 'img_' + Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      
      // Carregar dimensões exatas da imagem
      const dims = await getImageDimensions(previewUrl);
      const arrayBuffer = await file.arrayBuffer();

      selectedFiles.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        width: dims.width,
        height: dims.height,
        arrayBuffer
      });
    }

    updateUI();
  }

  function getImageDimensions(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width || 800,
          height: img.naturalHeight || img.height || 600
        });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600 });
      };
      img.src = url;
    });
  }

  // Helper para fallback seguro se algum PNG tiver chunks não suportados pelo pdf-lib:
  function imageToLosslessPngBytes(imgUrl, width, height) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Erro ao converter imagem via canvas'));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = imgUrl;
    });
  }

  // --- 4. Renderização e Atualização da UI ---
  function updateUI() {
    if (selectedFiles.length === 0) {
      step1Section.classList.remove('hidden');
      step2Section.classList.add('hidden');
      step3Section.classList.add('hidden');
      fileInput.value = '';
      if (addMoreInput) addMoreInput.value = '';
      return;
    }

    // Passou para o Passo 2
    step1Section.classList.add('hidden');
    step2Section.classList.remove('hidden');
    step3Section.classList.add('hidden');

    // Contador
    const count = selectedFiles.length;
    imagesCountText.textContent = count === 1 ? '1 foto selecionada' : `${count} fotos selecionadas`;
    convertBtnText.textContent = count === 1 ? 'CRIAR MEU PDF AGORA' : `CRIAR MEUS ${count} PDFs AGORA`;

    // Renderizar lista de pré-visualização
    imagesPreviewList.innerHTML = '';
    selectedFiles.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'image-item-card';
      card.setAttribute('role', 'listitem');

      card.innerHTML = `
        <img class="image-item-thumb" src="${item.previewUrl}" alt="Foto ${index + 1}">
        <div class="image-item-meta">
          <span class="image-item-num">Foto ${index + 1}</span>
          <span class="image-item-name" title="${item.name}">${item.name}</span>
          <span class="image-item-details">${item.width} × ${item.height} pixels • ${formatBytes(item.size)}</span>
        </div>
        <div class="image-item-actions">
          <button type="button" class="btn-remove-photo" data-id="${item.id}" aria-label="Remover Foto ${index + 1}">
            <span>🗑️ Remover</span>
          </button>
        </div>
      `;

      imagesPreviewList.appendChild(card);
    });

    // Eventos de remover foto
    imagesPreviewList.querySelectorAll('.btn-remove-photo').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        removePhoto(id);
      });
    });

    // Condicional de modo (1 foto vs múltiplas)
    if (count === 1) {
      modeSelectionContainer.classList.add('hidden');
      singleImageNotice.classList.remove('hidden');
      convertBtnText.textContent = 'CRIAR MEU PDF AGORA';
    } else {
      modeSelectionContainer.classList.remove('hidden');
      singleImageNotice.classList.add('hidden');
      updateModeCardSelection();
    }
  }

  function removePhoto(id) {
    const idx = selectedFiles.findIndex((f) => f.id === id);
    if (idx !== -1) {
      URL.revokeObjectURL(selectedFiles[idx].previewUrl);
      selectedFiles.splice(idx, 1);
      vibrate(20);
      updateUI();
    }
  }

  function updateModeCardSelection() {
    const isMerged = modeMerged.checked;
    if (isMerged) {
      modeCardMerged.classList.add('selected');
      modeCardSeparate.classList.remove('selected');
      convertBtnText.textContent = `JUNTAR AS ${selectedFiles.length} FOTOS EM 1 PDF`;
    } else {
      modeCardMerged.classList.remove('selected');
      modeCardSeparate.classList.add('selected');
      convertBtnText.textContent = `GERAR ${selectedFiles.length} PDFs SEPARADOS`;
    }
  }

  // --- 5. Lógica de Conversão Sem Bordas e Sem Perda ---

  async function convertSingleImage(pdfDoc, imgItem) {
    let embeddedImg;
    const isPng = imgItem.type === 'image/png' || imgItem.name.toLowerCase().endsWith('.png');
    const isJpg = imgItem.type === 'image/jpeg' || imgItem.type === 'image/jpg' ||
                  imgItem.name.toLowerCase().endsWith('.jpg') || imgItem.name.toLowerCase().endsWith('.jpeg');

    try {
      if (isPng) {
        embeddedImg = await pdfDoc.embedPng(imgItem.arrayBuffer);
      } else if (isJpg) {
        embeddedImg = await pdfDoc.embedJpg(imgItem.arrayBuffer);
      } else {
        throw new Error('Formato requer conversão sem perda');
      }
    } catch (err) {
      // Fallback robusto sem perda: desenha no canvas na resolução original 1:1 e extrai PNG
      const pngBuffer = await imageToLosslessPngBytes(imgItem.previewUrl, imgItem.width, imgItem.height);
      embeddedImg = await pdfDoc.embedPng(pngBuffer);
    }

    // Tamanho exato em pontos (1 ponto = 1 pixel original):
    // Zero margem, zero rebarba branca!
    const imgW = embeddedImg.width;
    const imgH = embeddedImg.height;

    const page = pdfDoc.addPage([imgW, imgH]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: imgW,
      height: imgH
    });

    return { width: imgW, height: imgH };
  }

  async function startConversion() {
    if (!selectedFiles.length) return;

    vibrate(50);
    // Transicionar para o Passo 3 (Carregando)
    step2Section.classList.add('hidden');
    step3Section.classList.remove('hidden');
    conversionLoading.classList.remove('hidden');
    conversionSuccess.classList.add('hidden');
    downloadButtonsArea.innerHTML = '';

    const isMerged = selectedFiles.length === 1 || modeMerged.checked;
    const total = selectedFiles.length;

    try {
      if (isMerged) {
        // --- Modo 1: Juntar em um único PDF ---
        loadingTitle.textContent = 'Criando seu PDF único...';
        loadingSubtitle.textContent = 'Juntando as fotos com tamanho certinho e sem sobras.';
        progressBarFill.style.width = '20%';

        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let i = 0; i < total; i++) {
          const item = selectedFiles[i];
          loadingSubtitle.textContent = `Ajustando foto ${i + 1} de ${total}: "${item.name}"...`;
          progressBarFill.style.width = `${Math.round(20 + ((i + 1) / total) * 60)}%`;
          await convertSingleImage(pdfDoc, item);
        }

        loadingSubtitle.textContent = 'Finalizando arquivo PDF...';
        progressBarFill.style.width = '90%';

        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Nome do arquivo de saída
        const baseFileName = total === 1 
          ? selectedFiles[0].name.replace(/\.[^/.]+$/, '') + '.pdf'
          : 'fotos_reunidas.pdf';

        progressBarFill.style.width = '100%';

        setTimeout(() => {
          showSuccessSingle({
            name: baseFileName,
            url: pdfUrl,
            size: pdfBytes.length,
            totalPages: total
          });
        }, 400);

      } else {
        // --- Modo 2: Criar PDFs Separados ---
        loadingTitle.textContent = `Criando ${total} arquivos PDF separados...`;
        progressBarFill.style.width = '15%';

        const generatedPdfs = [];
        const zip = new JSZip();

        for (let i = 0; i < total; i++) {
          const item = selectedFiles[i];
          loadingSubtitle.textContent = `Criando PDF da foto ${i + 1} de ${total}: "${item.name}"...`;
          progressBarFill.style.width = `${Math.round(15 + ((i + 1) / total) * 60)}%`;

          const pdfDoc = await PDFLib.PDFDocument.create();
          await convertSingleImage(pdfDoc, item);

          const pdfBytes = await pdfDoc.save();
          const cleanName = item.name.replace(/\.[^/.]+$/, '') + '.pdf';
          const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);

          generatedPdfs.push({
            name: cleanName,
            url: pdfUrl,
            size: pdfBytes.length
          });

          // Adicionar ao ZIP
          zip.file(cleanName, pdfBytes);
        }

        loadingSubtitle.textContent = 'Preparando pacote com todos os PDFs...';
        progressBarFill.style.width = '90%';

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);

        progressBarFill.style.width = '100%';

        setTimeout(() => {
          showSuccessMultiple({
            pdfs: generatedPdfs,
            zipUrl,
            zipSize: zipBlob.size
          });
        }, 400);
      }
    } catch (err) {
      console.error('Erro na conversão:', err);
      alert('Ocorreu um problema ao converter as fotos. Por favor, tente novamente.');
      step2Section.classList.remove('hidden');
      step3Section.classList.add('hidden');
    }
  }

  // --- 6. Telas de Sucesso e Download ---
  function showSuccessSingle(pdfInfo) {
    conversionLoading.classList.add('hidden');
    conversionSuccess.classList.remove('hidden');
    vibrate(60);

    successHeading.textContent = '🎉 Prontinho! Seu PDF está pronto!';
    successSubtitle.textContent = `Arquivo criado com ${pdfInfo.totalPages} página(s) e tamanho exato de cada foto.`;

    downloadButtonsArea.innerHTML = `
      <div class="download-item-card">
        <div class="download-item-header">
          <span class="download-item-title">📄 ${pdfInfo.name}</span>
          <span class="download-item-size">${formatBytes(pdfInfo.size)}</span>
        </div>
        <div class="btn-download-row">
          <a href="${pdfInfo.url}" download="${pdfInfo.name}" class="btn btn-success btn-lg" id="mainDownloadBtn">
            <span>📥 BAIXAR MEU PDF</span>
          </a>
          <a href="${pdfInfo.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-lg">
            <span>👁️ Ver PDF</span>
          </a>
        </div>
      </div>
    `;

    // Rolagem suave até a área de resultado
    step3Section.scrollIntoView({ behavior: 'smooth' });
  }

  function showSuccessMultiple({ pdfs, zipUrl, zipSize }) {
    conversionLoading.classList.add('hidden');
    conversionSuccess.classList.remove('hidden');
    vibrate(60);

    successHeading.textContent = `🎉 Prontinho! Seus ${pdfs.length} PDFs estão prontos!`;
    successSubtitle.textContent = 'Cada foto virou um PDF recortado certinho. Você pode baixar todos juntos ou um por um:';

    let html = `
      <!-- Botão para Baixar Todos em 1 Toque -->
      <div class="download-item-card" style="border-color: #6ee7b7; background: #ecfdf5;">
        <div class="download-item-header">
          <span class="download-item-title" style="color: #065f46;">📦 Pacote com Todos os PDFs (${pdfs.length} arquivos)</span>
          <span class="download-item-size">${formatBytes(zipSize)}</span>
        </div>
        <a href="${zipUrl}" download="fotos_convertidas_em_pdf.zip" class="btn btn-success btn-lg">
          <span>📥 BAIXAR TODOS JUNTOS (.ZIP)</span>
        </a>
      </div>

      <div style="margin-top: 14px; margin-bottom: 6px; font-weight: 700; color: #475569;">
        Ou baixe cada PDF individualmente:
      </div>
    `;

    // Botões individuais
    pdfs.forEach((pdf, idx) => {
      html += `
        <div class="download-item-card">
          <div class="download-item-header">
            <span class="download-item-title">📄 Foto ${idx + 1}: ${pdf.name}</span>
            <span class="download-item-size">${formatBytes(pdf.size)}</span>
          </div>
          <div class="btn-download-row">
            <a href="${pdf.url}" download="${pdf.name}" class="btn btn-primary">
              <span>📥 Baixar Foto ${idx + 1}</span>
            </a>
            <a href="${pdf.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
              <span>👁️ Ver</span>
            </a>
          </div>
        </div>
      `;
    });

    downloadButtonsArea.innerHTML = html;
    step3Section.scrollIntoView({ behavior: 'smooth' });
  }

  function resetAll() {
    vibrate(30);
    // Revogar URLs de Blob anteriores para liberar memória no celular
    selectedFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    selectedFiles = [];
    updateUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 7. Listeners e Eventos ---
  function initEventListeners() {
    // Inputs de arquivo
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        processFiles(e.target.files);
      }
    });

    if (addMoreInput) {
      addMoreInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
          processFiles(e.target.files);
        }
      });
    }

    // Drag and Drop (computador ou tablets)
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) {
        processFiles(dt.files);
      }
    });

    // Seletor de Modo
    modeMerged.addEventListener('change', updateModeCardSelection);
    modeSeparate.addEventListener('change', updateModeCardSelection);

    // Botão de Converter
    convertBtn.addEventListener('click', startConversion);

    // Botão de Recomeçar
    startOverBtn.addEventListener('click', resetAll);
  }

  // Inicializar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    initAccessibility();
    initPWA();
    initEventListeners();
  });

})();
