console.log('Script starting...');

// PDF.js setup
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

// PDF state
let currentPdf = null;
let currentPage = 1;
let currentScale = 1.2;
let isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');

// PWA Installation
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');

if (installPrompt && installBtn) {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installPrompt.style.display = 'block';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installPrompt.style.display = 'none';
        }
    });
}

// PDF Management with mobile support
function openPDF(filename, title) {
    console.log('openPDF called with:', filename, title);
    
    const homeView = document.getElementById('homeView');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfTitle = document.getElementById('pdfTitle');
    const pdfFrame = document.getElementById('pdfFrame');
    const pdfCanvasContainer = document.getElementById('pdfCanvasContainer');
    const loadingMessage = document.getElementById('loadingMessage');
    
    if (!homeView || !pdfViewer || !pdfTitle) {
        console.error('Missing required elements');
        return;
    }
    
    // Show PDF viewer
    homeView.style.display = 'none';
    pdfViewer.classList.add('active');
    pdfTitle.textContent = title;
    
    const pdfPath = 'pdfs/' + filename;
    console.log('Loading PDF from:', pdfPath);
    
    // Hide all viewers initially
    if (pdfFrame) pdfFrame.style.display = 'none';
    if (pdfCanvasContainer) pdfCanvasContainer.style.display = 'none';
    if (loadingMessage) loadingMessage.style.display = 'block';
    
    if (isMobile && typeof pdfjsLib !== 'undefined') {
        // Use PDF.js for mobile
        console.log('Using PDF.js for mobile');
        loadPDFWithJS(pdfPath);
    } else {
        // Use iframe for desktop
        console.log('Using iframe for desktop');
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (pdfFrame) {
            pdfFrame.style.display = 'block';
            pdfFrame.src = pdfPath;
        }
    }
}

function loadPDFWithJS(pdfPath) {
    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js not loaded');
        fallbackToDownload(pdfPath);
        return;
    }
    
    pdfjsLib.getDocument(pdfPath).promise.then(function(pdf) {
        console.log('PDF loaded successfully with PDF.js');
        currentPdf = pdf;
        currentPage = 1;
        
        const loadingMessage = document.getElementById('loadingMessage');
        const pdfCanvasContainer = document.getElementById('pdfCanvasContainer');
        
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (pdfCanvasContainer) pdfCanvasContainer.style.display = 'block';
        
        renderPage(currentPage);
        updateControls();
        
    }).catch(function(error) {
        console.error('Error loading PDF with PDF.js:', error);
        fallbackToDownload(pdfPath);
    });
}

function renderPage(pageNumber) {
    if (!currentPdf) return;
    
    currentPdf.getPage(pageNumber).then(function(page) {
        const canvas = document.getElementById('pdfCanvas');
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({scale: currentScale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        page.render(renderContext);
    });
}

function updateControls() {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const zoomLevel = document.getElementById('zoomLevel');
    
    if (pageInfo && currentPdf) {
        pageInfo.textContent = `Page ${currentPage} of ${currentPdf.numPages}`;
    }
    
    if (prevBtn) prevBtn.disabled = (currentPage <= 1);
    if (nextBtn && currentPdf) nextBtn.disabled = (currentPage >= currentPdf.numPages);
    if (zoomLevel) zoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
}

function previousPage() {
    if (currentPage <= 1) return;
    currentPage--;
    renderPage(currentPage);
    updateControls();
}

function nextPage() {
    if (!currentPdf || currentPage >= currentPdf.numPages) return;
    currentPage++;
    renderPage(currentPage);
    updateControls();
}

function zoomIn() {
    currentScale += 0.2;
    renderPage(currentPage);
    updateControls();
}

function zoomOut() {
    if (currentScale > 0.4) {
        currentScale -= 0.2;
        renderPage(currentPage);
        updateControls();
    }
}

function fallbackToDownload(pdfPath) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.innerHTML = `
            <h3>PDF Viewer</h3>
            <p>Click below to open the PDF:</p>
            <a href="${pdfPath}" target="_blank" style="
                display: inline-block;
                background: #2196F3;
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                margin-top: 15px;
                font-weight: 600;
            ">📄 Open PDF</a>
        `;
        loadingMessage.style.display = 'block';
    }
}

function closePDF() {
    const homeView = document.getElementById('homeView');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');
    
    if (homeView) homeView.style.display = 'block';
    if (pdfViewer) pdfViewer.classList.remove('active');
    if (pdfFrame) pdfFrame.src = '';
    
    // Reset PDF.js state
    currentPdf = null;
    currentPage = 1;
    currentScale = 1.2;
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((registrationError) => {
                console.log('Service Worker registration failed:', registrationError);
            });
    });
}

console.log('Script loaded successfully');
