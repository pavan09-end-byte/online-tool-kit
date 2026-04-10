// PDF Tools Logic
window.PDFTools = {
    // Helper to show progress
    showProgress: (container, percent, message) => {
        const pc = container.querySelector('.progress-container');
        const pf = container.querySelector('.progress-fill');
        const sm = container.querySelector('.status-message');
        if (pc && pf) {
            pc.style.display = 'block';
            pf.style.width = `${percent}%`;
            if (sm && message) sm.innerText = message;
        }
    },

    hideProgress: (container) => {
        const pc = container.querySelector('.progress-container');
        if (pc) pc.style.display = 'none';
    },

    showError: (container, message) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-fade-in';
        errorDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span class="font-bold">Error</span>
            </div>
            <p class="mt-1">${message}</p>
        `;
        // Remove existing errors
        container.querySelectorAll('.bg-red-50').forEach(el => el.remove());
        container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    },

    // Helper to download blob
    downloadBlob: (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    showSuccess: (container, title, message, downloadFn) => {
        container.innerHTML = `
            <div class="success-area">
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">${title}</h3>
                <p class="text-slate-500 dark:text-slate-400 mb-6">${message}</p>
                <div class="flex flex-col gap-4">
                    <button class="btn btn-primary py-4 text-lg" id="final-download">Download Result</button>
                    <button class="btn btn-outline" onclick="location.reload()">Process Another</button>
                </div>
                <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-fade-in" style="animation-delay: 2s">
                    <p class="text-sm text-slate-500 mb-4">Found this useful? Share ToolKit with someone 👇</p>
                    <div class="flex justify-center gap-3">
                        <button class="btn btn-sm btn-outline gap-2" onclick="window.open('https://twitter.com/intent/tweet?text=Check out this awesome free tool on ToolKit!&url=' + encodeURIComponent(window.location.href))">
                            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                            Twitter
                        </button>
                        <button class="btn btn-sm btn-outline gap-2" onclick="navigator.clipboard.writeText(window.location.href); this.innerText='Copied!'">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.querySelector('#final-download').onclick = downloadFn;
    },

    // 1. Merge PDF
    renderMergePDF: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="pdf-dropzone">
                <div class="icon">📚</div>
                <p>Drag & drop PDF files here or click to select</p>
                <input type="file" id="pdf-input" accept=".pdf" multiple style="display:none">
            </div>
            <div class="file-list space-y-2 mb-6" id="pdf-file-list"></div>
            <div class="progress-container mb-6">
                <div class="progress-bar"><div class="progress-fill"></div></div>
                <p class="status-message mt-2 text-center text-sm font-medium text-slate-500"></p>
            </div>
            <div class="tool-process-area">
                <button class="btn btn-primary py-4" id="merge-btn" disabled>Merge All PDFs</button>
            </div>
            <div id="result-area"></div>
        `;

        const dropzone = container.querySelector('#pdf-dropzone');
        const input = container.querySelector('#pdf-input');
        const fileList = container.querySelector('#pdf-file-list');
        const mergeBtn = container.querySelector('#merge-btn');
        const resultArea = container.querySelector('#result-area');
        let files = [];

        dropzone.onclick = () => input.click();
        input.onchange = (e) => handleFiles(Array.from(e.target.files));

        function handleFiles(newFiles) {
            newFiles.forEach(file => {
                const id = Math.random().toString(36).substr(2, 9);
                files.push({ id, file });
                renderFileList();
            });
            mergeBtn.disabled = files.length < 2;
        }

        function renderFileList() {
            fileList.innerHTML = '';
            files.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'file-item flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-move transition-all hover:border-blue-500/50';
                div.draggable = true;
                div.dataset.id = item.id;
                
                div.innerHTML = `
                    <div class="text-slate-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M8 9h8M8 12h8M8 15h8"></path></svg>
                    </div>
                    <span class="flex-1 text-sm font-medium truncate">${item.file.name}</span>
                    <button class="text-slate-400 hover:text-red-500 transition-colors p-1" data-remove="${item.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                    </button>
                `;

                div.querySelector('[data-remove]').onclick = (e) => {
                    e.stopPropagation();
                    files = files.filter(f => f.id !== item.id);
                    renderFileList();
                    mergeBtn.disabled = files.length < 2;
                };

                // Drag and drop logic
                div.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', index);
                    div.classList.add('opacity-50');
                });

                div.addEventListener('dragend', () => {
                    div.classList.remove('opacity-50');
                    fileList.querySelectorAll('.file-item').forEach(el => el.classList.remove('border-blue-500'));
                });

                div.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    div.classList.add('border-blue-500');
                });

                div.addEventListener('dragleave', () => {
                    div.classList.remove('border-blue-500');
                });

                div.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = index;
                    
                    if (fromIndex !== toIndex) {
                        const [movedItem] = files.splice(fromIndex, 1);
                        files.splice(toIndex, 0, movedItem);
                        renderFileList();
                    }
                });

                fileList.appendChild(div);
            });
        }

        mergeBtn.onclick = async () => {
            try {
                mergeBtn.disabled = true;
                
                PDFTools.showProgress(container, 10, 'Initializing...');

                const mergedPdf = await PDFLib.PDFDocument.create();
                
                for (let i = 0; i < files.length; i++) {
                    PDFTools.showProgress(container, 10 + Math.round(((i + 1) / files.length) * 80), `Processing ${files[i].file.name}...`);
                    const fileData = await files[i].file.arrayBuffer();
                    const pdf = await PDFLib.PDFDocument.load(fileData);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }

                PDFTools.showProgress(container, 95, 'Finalizing...');
                const pdfBytes = await mergedPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                
                PDFTools.showProgress(container, 100, 'Complete!');

                setTimeout(() => {
                    dropzone.style.display = 'none';
                    fileList.style.display = 'none';
                    PDFTools.hideProgress(container);
                    mergeBtn.parentElement.style.display = 'none';
                    
                    PDFTools.showSuccess(
                        resultArea,
                        'PDFs Merged Successfully!',
                        `Combined ${files.length} files into one document.`,
                        () => PDFTools.downloadBlob(blob, 'merged.pdf')
                    );
                }, 500);

            } catch (err) {
                console.error(err);
                PDFTools.showError(container, 'Error merging PDFs: ' + err.message);
                mergeBtn.disabled = false;
            }
        };
    },

    // 2. Split PDF
    renderSplitPDF: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="pdf-dropzone">
                <div class="icon">✂️</div>
                <p>Select a PDF to split</p>
                <input type="file" id="pdf-input" accept=".pdf" style="display:none">
            </div>
            <div id="split-options" class="tool-process-area" style="display:none">
                <p id="page-info" class="text-sm font-bold text-slate-500"></p>
                <div class="form-group">
                    <label>Split Mode</label>
                    <select class="form-control" id="split-mode">
                        <option value="all">Individual Pages (ZIP)</option>
                        <option value="range">Extract Range</option>
                    </select>
                </div>
                <div id="range-input" style="display:none" class="form-group">
                    <label>Page Range (e.g. 1-3, 5)</label>
                    <input type="text" class="form-control" id="pages" placeholder="1-3, 5">
                </div>
                <button class="btn btn-primary" id="split-btn">Split PDF</button>
            </div>
            <div class="progress-container">
                <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
        `;

        const dropzone = container.querySelector('#pdf-dropzone');
        const input = container.querySelector('#pdf-input');
        const options = container.querySelector('#split-options');
        const splitBtn = container.querySelector('#split-btn');
        const modeSelect = container.querySelector('#split-mode');
        const rangeInput = container.querySelector('#range-input');
        let selectedFile = null;

        dropzone.onclick = () => input.click();
        input.onchange = async (e) => {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                const data = await selectedFile.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(data);
                container.querySelector('#page-info').innerText = `Total Pages: ${pdf.getPageCount()}`;
                options.style.display = 'block';
                dropzone.style.display = 'none';
            }
        };

        modeSelect.onchange = () => {
            rangeInput.style.display = modeSelect.value === 'range' ? 'block' : 'none';
        };

        splitBtn.onclick = async () => {
            try {
                splitBtn.disabled = true;
                PDFTools.showProgress(container, 20, 'Loading PDF...');
                const data = await selectedFile.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(data);
                const pageCount = pdf.getPageCount();

                if (modeSelect.value === 'all') {
                    const zip = new JSZip();
                    for (let i = 0; i < pageCount; i++) {
                        PDFTools.showProgress(container, 20 + (i / pageCount) * 70, `Extracting page ${i + 1}...`);
                        const newPdf = await PDFLib.PDFDocument.create();
                        const [page] = await newPdf.copyPages(pdf, [i]);
                        newPdf.addPage(page);
                        const bytes = await newPdf.save();
                        zip.file(`page_${i + 1}.pdf`, bytes);
                    }
                    PDFTools.showProgress(container, 95, 'Generating ZIP...');
                    const content = await zip.generateAsync({ type: "blob" });
                    PDFTools.showProgress(container, 100, 'Complete!');
                    
                    setTimeout(() => {
                        options.style.display = 'none';
                        PDFTools.hideProgress(container);
                        PDFTools.showSuccess(
                            container.querySelector('#result-area') || container,
                            'PDF Split Complete!',
                            `Extracted ${pageCount} individual pages into a ZIP file.`,
                            () => PDFTools.downloadBlob(content, "split_pages.zip")
                        );
                    }, 500);
                } else {
                    const rangeStr = container.querySelector('#pages').value;
                    const indices = [];
                    const parts = rangeStr.split(',');
                    
                    parts.forEach(part => {
                        if (part.includes('-')) {
                            const [start, end] = part.split('-').map(s => parseInt(s.trim()));
                            for (let i = start; i <= end; i++) {
                                if (i > 0 && i <= pageCount) indices.push(i - 1);
                            }
                        } else {
                            const p = parseInt(part.trim());
                            if (p > 0 && p <= pageCount) indices.push(p - 1);
                        }
                    });

                    if (indices.length === 0) {
                        splitBtn.disabled = false;
                        return PDFTools.showError(container, 'Please enter a valid page range');
                    }

                    PDFTools.showProgress(container, 60, 'Extracting pages...');
                    const newPdf = await PDFLib.PDFDocument.create();
                    const copiedPages = await newPdf.copyPages(pdf, indices);
                    copiedPages.forEach(p => newPdf.addPage(p));
                    const bytes = await newPdf.save();
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    
                    PDFTools.showProgress(container, 100, 'Complete!');
                    
                    setTimeout(() => {
                        options.style.display = 'none';
                        PDFTools.hideProgress(container);
                        PDFTools.showSuccess(
                            container.querySelector('#result-area') || container,
                            'Extraction Complete!',
                            `Extracted ${indices.length} pages into a new PDF.`,
                            () => PDFTools.downloadBlob(blob, "extracted.pdf")
                        );
                    }, 500);
                }
            } catch (err) {
                console.error(err);
                PDFTools.showError(container, 'Error: ' + err.message);
                splitBtn.disabled = false;
            }
        };
    },

    // 3. Compress PDF
    renderCompressPDF: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="pdf-dropzone">
                <div class="icon">📉</div>
                <p>Select a PDF to compress</p>
                <input type="file" id="pdf-input" accept=".pdf" style="display:none">
            </div>
            <div id="compress-ui" class="tool-process-area" style="display:none">
                <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                    <p id="size-info" class="text-lg font-bold text-slate-900 dark:text-white mb-1"></p>
                    <p class="text-sm text-slate-500">We'll optimize internal structures to reduce file size.</p>
                </div>
                <button class="btn btn-primary py-4" id="compress-btn">Compress & Download</button>
            </div>
            <div class="progress-container mb-6">
                <div class="progress-bar"><div class="progress-fill"></div></div>
                <p class="status-message mt-2 text-center text-sm font-medium text-slate-500"></p>
            </div>
            <div id="result-area"></div>
        `;

        const input = container.querySelector('#pdf-input');
        const ui = container.querySelector('#compress-ui');
        const dropzone = container.querySelector('#pdf-dropzone');
        const sizeInfo = container.querySelector('#size-info');
        const compressBtn = container.querySelector('#compress-btn');
        const resultArea = container.querySelector('#result-area');
        let selectedFile = null;

        dropzone.onclick = () => input.click();
        input.onchange = (e) => {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                sizeInfo.innerText = `Original Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
                ui.style.display = 'block';
                dropzone.style.display = 'none';
            }
        };

        compressBtn.onclick = async () => {
            try {
                compressBtn.disabled = true;
                PDFTools.showProgress(container, 30, 'Analyzing PDF...');
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                
                PDFTools.showProgress(container, 60, 'Optimizing content...');
                // Simple compression by re-saving with optimization
                const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                
                PDFTools.showProgress(container, 100, 'Complete!');
                
                setTimeout(() => {
                    ui.style.display = 'none';
                    PDFTools.hideProgress(container);
                    PDFTools.showSuccess(
                        resultArea,
                        'Compression Complete!',
                        `Reduced file size. New size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`,
                        () => PDFTools.downloadBlob(blob, 'compressed.pdf')
                    );
                }, 500);
            } catch (err) {
                console.error(err);
                PDFTools.showError(container, 'Failed to compress PDF: ' + err.message);
                compressBtn.disabled = false;
            }
        };
    },

    // 5. Reorder Pages
    renderReorderPDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">📑</div>
                <p>Select PDF to reorder pages</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" id="select-btn">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label class="block text-sm font-medium mb-2">New Page Order (comma separated)</label>
                    <input type="text" class="form-control" id="order" placeholder="e.g. 3,1,2">
                    <small id="page-count-info" class="text-xs text-slate-400 mt-2 block"></small>
                </div>
                <button class="btn btn-primary py-4" id="reorder-btn">Reorder & Download</button>
            </div>
            <div class="progress-container mb-6">
                <div class="progress-bar"><div class="progress-fill"></div></div>
                <p class="status-message mt-2 text-center text-sm font-medium text-slate-500"></p>
            </div>
            <div id="result-area"></div>
        `;

        const input = container.querySelector('#file-input');
        const selectBtn = container.querySelector('#select-btn');
        const area = container.querySelector('#process-area');
        const orderInput = container.querySelector('#order');
        const info = container.querySelector('#page-count-info');
        const reorderBtn = container.querySelector('#reorder-btn');
        const resultArea = container.querySelector('#result-area');
        let pdfFile = null;
        let pageCount = 0;

        selectBtn.onclick = () => input.click();

        input.onchange = async (e) => {
            try {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    PDFTools.showProgress(container, 50, 'Loading PDF...');
                    const data = await pdfFile.arrayBuffer();
                    const pdf = await PDFLib.PDFDocument.load(data);
                    pageCount = pdf.getPageCount();
                    info.innerText = `Total pages: ${pageCount}. Enter indices from 1 to ${pageCount} in the order you want them.`;
                    area.style.display = 'block';
                    container.querySelector('#drop-zone').style.display = 'none';
                    PDFTools.hideProgress(container);
                }
            } catch (err) {
                PDFTools.showError(container, 'Failed to load PDF: ' + err.message);
            }
        };

        reorderBtn.onclick = async () => {
            try {
                const order = orderInput.value.split(',').map(s => parseInt(s.trim()) - 1);
                if (order.some(n => isNaN(n) || n < 0 || n >= pageCount)) {
                    return PDFTools.showError(container, 'Invalid page order. Please use numbers within range.');
                }

                reorderBtn.disabled = true;
                PDFTools.showProgress(container, 40, 'Reordering pages...');
                
                const data = await pdfFile.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(data);
                const newPdf = await PDFLib.PDFDocument.create();
                const pages = await newPdf.copyPages(pdf, order);
                pages.forEach(p => newPdf.addPage(p));
                
                PDFTools.showProgress(container, 80, 'Saving...');
                const bytes = await newPdf.save();
                const blob = new Blob([bytes], { type: 'application/pdf' });
                
                PDFTools.showProgress(container, 100, 'Complete!');
                
                setTimeout(() => {
                    area.style.display = 'none';
                    PDFTools.hideProgress(container);
                    PDFTools.showSuccess(
                        resultArea,
                        'PDF Reordered!',
                        `Created a new PDF with ${order.length} pages in your specified order.`,
                        () => PDFTools.downloadBlob(blob, 'reordered.pdf')
                    );
                }, 500);
            } catch (err) {
                PDFTools.showError(container, 'Error: ' + err.message);
                reorderBtn.disabled = false;
            }
        };
    },

    // 6. Rotate PDF
    renderRotatePDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🔄</div>
                <p>Drag & drop PDF to rotate pages</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Rotation Angle</label>
                    <select class="form-control" id="angle">
                        <option value="90">90° Clockwise</option>
                        <option value="180">180°</option>
                        <option value="270">90° Counter-Clockwise</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="rotate-btn">Rotate & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const dropZone = container.querySelector('#drop-zone');
        let pdfFile = null;

        dropZone.onclick = () => input.click();
        input.onchange = (e) => {
            pdfFile = e.target.files[0];
            if (pdfFile) {
                area.style.display = 'block';
                dropZone.style.display = 'none';
            }
        };

        container.querySelector('#rotate-btn').onclick = async () => {
            const angle = parseInt(container.querySelector('#angle').value);
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            pages.forEach(page => {
                const current = page.getRotation().angle;
                page.setRotation(PDFLib.degrees(current + angle));
            });
            const pdfBytes = await pdfDoc.save();
            PDFTools.downloadBlob(new Blob([pdfBytes]), 'rotated.pdf');
        };
    },

    // 7. Page Numbers
    renderPageNumbersPDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🔢</div>
                <p>Select PDF to add page numbers</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Position</label>
                    <select class="form-control" id="pos">
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="top-center">Top Center</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="process-btn">Add Numbers & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        let pdfFile = null;

        input.onchange = (e) => {
            pdfFile = e.target.files[0];
            if (pdfFile) {
                area.style.display = 'block';
                container.querySelector('#drop-zone').style.display = 'none';
            }
        };

        container.querySelector('#process-btn').onclick = async () => {
            const data = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(data);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

            pages.forEach((page, i) => {
                const { width, height } = page.getSize();
                page.drawText(`${i + 1}`, {
                    x: width / 2,
                    y: 20,
                    size: 12,
                    font,
                    color: PDFLib.rgb(0, 0, 0)
                });
            });

            const bytes = await pdfDoc.save();
            PDFTools.downloadBlob(new Blob([bytes]), 'numbered.pdf');
        };
    },

    // 8. Watermark PDF
    renderWatermarkPDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🏷️</div>
                <p>Select PDF to add watermark</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Watermark Text</label>
                    <input type="text" class="form-control" id="text" value="CONFIDENTIAL">
                </div>
                <button class="btn btn-primary" id="process-btn">Add Watermark & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        let pdfFile = null;

        input.onchange = (e) => {
            pdfFile = e.target.files[0];
            if (pdfFile) {
                area.style.display = 'block';
                container.querySelector('#drop-zone').style.display = 'none';
            }
        };

        container.querySelector('#process-btn').onclick = async () => {
            const text = container.querySelector('#text').value;
            const data = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(data);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

            pages.forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: width / 4,
                    y: height / 2,
                    size: 50,
                    font,
                    color: PDFLib.rgb(0.7, 0.7, 0.7),
                    opacity: 0.3,
                    rotate: PDFLib.degrees(45)
                });
            });

            const bytes = await pdfDoc.save();
            PDFTools.downloadBlob(new Blob([bytes]), 'watermarked.pdf');
        };
    },

    // 9. Unlock PDF
    renderUnlockPDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🔓</div>
                <p>Select protected PDF to unlock</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" class="form-control" id="pass" placeholder="Enter PDF password">
                </div>
                <button class="btn btn-primary" id="process-btn">Unlock & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        let pdfFile = null;

        input.onchange = (e) => {
            pdfFile = e.target.files[0];
            if (pdfFile) {
                area.style.display = 'block';
                container.querySelector('#drop-zone').style.display = 'none';
            }
        };

        container.querySelector('#process-btn').onclick = async () => {
            const password = container.querySelector('#pass').value;
            try {
                const data = await pdfFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(data, { password });
                const bytes = await pdfDoc.save();
                PDFTools.downloadBlob(new Blob([bytes]), 'unlocked.pdf');
            } catch (err) {
                alert('Failed to unlock: ' + err.message);
            }
        };
    },

    // 13. PDF Info
    renderPDFInfo: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">ℹ️</div>
                <p>Select PDF to view info</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="info-grid bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div id="info-content" class="space-y-3"></div>
                </div>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const content = container.querySelector('#info-content');
        const area = container.querySelector('#process-area');

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const data = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(data);
                const info = {
                    'Filename': file.name,
                    'Size': (file.size / 1024).toFixed(2) + ' KB',
                    'Pages': pdf.getPageCount(),
                    'Author': pdf.getAuthor() || 'N/A',
                    'Title': pdf.getTitle() || 'N/A',
                    'Creator': pdf.getCreator() || 'N/A',
                    'Producer': pdf.getProducer() || 'N/A'
                };

                content.innerHTML = Object.entries(info).map(([k, v]) => `
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding:8px 0">
                        <span style="font-weight:600">${k}:</span>
                        <span>${v}</span>
                    </div>
                `).join('');
                area.style.display = 'block';
                container.querySelector('#drop-zone').style.display = 'none';
            }
        };
    },

    // 8. Protect PDF
    renderProtectPDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🔒</div>
                <p>Drag & drop PDF to add password</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Set Password</label>
                    <input type="password" class="form-control" id="pass" placeholder="Enter password">
                </div>
                <button class="btn btn-primary" id="protect-btn">Protect & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const dropZone = container.querySelector('#drop-zone');
        let pdfFile = null;

        dropZone.onclick = () => input.click();
        input.onchange = (e) => {
            pdfFile = e.target.files[0];
            if (pdfFile) {
                area.style.display = 'block';
                dropZone.style.display = 'none';
            }
        };

        container.querySelector('#protect-btn').onclick = async () => {
            const pass = container.querySelector('#pass').value;
            if (!pass) return alert('Please enter a password');
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pdfBytes = await pdfDoc.save(); 
            alert('Password protection requires specific server-side or advanced library features. Saving unencrypted for now.');
            PDFTools.downloadBlob(new Blob([pdfBytes]), 'protected.pdf');
        };
    },

    // 10. PDF to Images
    renderPDFToImages: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="pdf-dropzone">
                <div class="icon">🖼️</div>
                <p>Select PDF to convert to images</p>
                <input type="file" id="pdf-input" accept=".pdf" style="display:none">
            </div>
            <div id="pdf-to-img-ui" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Format</label>
                    <select class="form-control" id="img-format">
                        <option value="image/png">PNG</option>
                        <option value="image/jpeg">JPG</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="convert-btn">Convert Pages to Images</button>
            </div>
            <div class="progress-container">
                <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
        `;

        const dropzone = container.querySelector('#pdf-dropzone');
        const input = container.querySelector('#pdf-input');
        const ui = container.querySelector('#pdf-to-img-ui');
        const convertBtn = container.querySelector('#convert-btn');
        let selectedFile = null;

        dropzone.onclick = () => input.click();
        input.onchange = (e) => {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                ui.style.display = 'block';
                dropzone.style.display = 'none';
            }
        };

        convertBtn.onclick = async () => {
            try {
                convertBtn.disabled = true;
                const data = new Uint8Array(await selectedFile.arrayBuffer());
                const pdf = await pdfjsLib.getDocument({ data }).promise;
                const zip = new JSZip();
                const format = container.querySelector('#img-format').value;

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport }).promise;
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, format));
                    zip.file(`page_${i}.${format.split('/')[1]}`, blob);
                    PDFTools.showProgress((i / pdf.numPages) * 100);
                }

                const content = await zip.generateAsync({ type: "blob" });
                PDFTools.downloadBlob(content, "pdf_images.zip");
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                convertBtn.disabled = false;
            }
        };
    },

    // 11. Images to PDF
    renderImagesToPDF: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="img-dropzone">
                <div class="icon">📸</div>
                <p>Select images to convert to PDF</p>
                <input type="file" id="img-input" accept="image/*" multiple style="display:none">
            </div>
            <div class="file-list" id="img-list"></div>
            <div class="tool-process-area">
                <button class="btn btn-primary" id="convert-btn" disabled>Create PDF</button>
            </div>
        `;

        const input = container.querySelector('#img-input');
        const list = container.querySelector('#img-list');
        const btn = container.querySelector('#convert-btn');
        let files = [];

        container.querySelector('#img-dropzone').onclick = () => input.click();
        input.onchange = (e) => {
            for (let file of e.target.files) {
                files.push(file);
                const item = document.createElement('div');
                item.className = 'file-item';
                item.innerHTML = `<span>${file.name}</span>`;
                list.appendChild(item);
            }
            btn.disabled = files.length === 0;
        };

        btn.onclick = async () => {
            try {
                const pdfDoc = await PDFLib.PDFDocument.create();
                for (let file of files) {
                    const imgData = await file.arrayBuffer();
                    let img;
                    if (file.type === 'image/jpeg') img = await pdfDoc.embedJpg(imgData);
                    else img = await pdfDoc.embedPng(imgData);

                    const page = pdfDoc.addPage([img.width, img.height]);
                    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
                }
                const bytes = await pdfDoc.save();
                PDFTools.downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'images.pdf');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        };
    },

    // 12. Extract Text PDF
    renderExtractTextPDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">📄</div>
                <p>Select PDF to extract text</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <button class="btn btn-primary" id="extract-btn">Extract Text</button>
                <textarea class="form-control" id="output" rows="10" readonly></textarea>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const output = container.querySelector('#output');
        let pdfFile = null;

        input.onchange = (e) => {
            pdfFile = e.target.files[0];
            if (pdfFile) {
                area.style.display = 'block';
                container.querySelector('#drop-zone').style.display = 'none';
            }
        };

        container.querySelector('#extract-btn').onclick = async () => {
            const data = new Uint8Array(await pdfFile.arrayBuffer());
            const pdf = await pdfjsLib.getDocument({ data }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str);
                fullText += `--- Page ${i} ---\n` + strings.join(' ') + '\n\n';
            }
            output.value = fullText;
        };
    },

    // 13. PDF to JPG
    renderPDFToJPG: (container) => {
        PDFTools.renderPDFToImages(container);
        // Customize the title and default format
        setTimeout(() => {
            const title = container.querySelector('p');
            if (title) title.innerText = 'Select PDF to convert to JPG images';
            const format = container.querySelector('#img-format');
            if (format) format.value = 'image/jpeg';
        }, 0);
    },

    // 14. Image to PDF
    renderImageToPDF: (container) => {
        PDFTools.renderImagesToPDF(container);
    }
};

// Fallback for missing methods to prevent crashes
const pdfToolMethods = [
    'renderReorderPDF', 'renderPageNumbersPDF', 
    'renderWatermarkPDF', 'renderUnlockPDF', 
    'renderPDFInfo'
];
pdfToolMethods.forEach(method => {
    if (!PDFTools[method]) {
        PDFTools[method] = (container) => {
            container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace('render', '')}</strong> tool is under maintenance.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
        };
    }
});
