        console.log('Script starting...');
        
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

        // PDF Management - COMPLETELY CLEAN VERSION
        function openPDF(filename, title) {
            console.log('openPDF called with:', filename, title);
            
            // Get all elements
            const homeView = document.getElementById('homeView');
            const pdfViewer = document.getElementById('pdfViewer');
            const pdfTitle = document.getElementById('pdfTitle');
            const pdfFrame = document.getElementById('pdfFrame');
            
            console.log('Elements check:', {
                homeView: homeView ? 'found' : 'NOT FOUND',
                pdfViewer: pdfViewer ? 'found' : 'NOT FOUND',
                pdfTitle: pdfTitle ? 'found' : 'NOT FOUND',
                pdfFrame: pdfFrame ? 'found' : 'NOT FOUND'
            });
            
            // Verify all elements exist
            if (!homeView || !pdfViewer || !pdfTitle || !pdfFrame) {
                console.error('ERROR: Missing required elements!');
                alert('Error: Page elements not found. Please refresh the page.');
                return;
            }
            
            // Hide home view and show PDF viewer
            homeView.style.display = 'none';
            pdfViewer.classList.add('active');
            pdfTitle.textContent = title;
            
            // Set PDF path
            const pdfPath = 'pdfs/' + filename;
            console.log('Loading PDF from:', pdfPath);
            
            // Load PDF in iframe
            pdfFrame.src = pdfPath;
            
            console.log('PDF should be loading now...');
        }

        function closePDF() {
            console.log('closePDF called');
            
            const homeView = document.getElementById('homeView');
            const pdfViewer = document.getElementById('pdfViewer');
            const pdfFrame = document.getElementById('pdfFrame');
            
            if (homeView) homeView.style.display = 'block';
            if (pdfViewer) pdfViewer.classList.remove('active');
            if (pdfFrame) pdfFrame.src = '';
            
            console.log('Closed PDF viewer');
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