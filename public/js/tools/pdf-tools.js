// PDF Tools Logic
window.PDFTools = {
    // Helper to show progress
    showProgress: (percent) => {
        const container = document.querySelector('.progress-container');
        const fill = document.querySelector('.progress-fill');
        if (container && fill) {
            container.style.display = 'block';
            fill.style.width = `${percent}%`;
        }
    },

    hideProgress: () => {
        const container = document.querySelector('.progress-container');
        if (container) container.style.display = 'none';
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

    // 1. Merge PDF
    renderMergePDF: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="pdf-dropzone">
                <p>Drag & drop PDF files here or click to select</p>
                <input type="file" id="pdf-input" accept=".pdf" multiple style="display:none">
            </div>
            <div class="file-list" id="pdf-file-list"></div>
            <div class="progress-container">
                <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
            <div style="margin-top:24px; text-align:center">
                <button class="btn btn-primary" id="merge-btn" disabled>Merge All PDFs</button>
            </div>
        `;

        const dropzone = container.querySelector('#pdf-dropzone');
        const input = container.querySelector('#pdf-input');
        const fileList = container.querySelector('#pdf-file-list');
        const mergeBtn = container.querySelector('#merge-btn');
        let files = [];

        dropzone.onclick = () => input.click();
        input.onchange = (e) => handleFiles(e.target.files);

        function handleFiles(newFiles) {
            for (let file of newFiles) {
                files.push(file);
                const item = document.createElement('div');
                item.className = 'file-item';
                item.innerHTML = `
                    <span>${file.name}</span>
                    <button class="btn btn-outline btn-sm remove-file" style="padding:4px 8px">✕</button>
                `;
                item.querySelector('.remove-file').onclick = () => {
                    files = files.filter(f => f !== file);
                    item.remove();
                    mergeBtn.disabled = files.length < 2;
                };
                fileList.appendChild(item);
            }
            mergeBtn.disabled = files.length < 2;
        }

        mergeBtn.onclick = async () => {
            try {
                mergeBtn.disabled = true;
                PDFTools.showProgress(10);
                const mergedPdf = await PDFLib.PDFDocument.create();
                
                for (let i = 0; i < files.length; i++) {
                    const fileData = await files[i].arrayBuffer();
                    const pdf = await PDFLib.PDFDocument.load(fileData);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                    PDFTools.showProgress(10 + (i + 1) / files.length * 80);
                }

                const pdfBytes = await mergedPdf.save();
                PDFTools.downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'merged.pdf');
                PDFTools.showProgress(100);
                setTimeout(PDFTools.hideProgress, 2000);
            } catch (err) {
                alert('Error merging PDFs: ' + err.message);
            } finally {
                mergeBtn.disabled = false;
            }
        };
    },

    // 2. Split PDF
    renderSplitPDF: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="pdf-dropzone">
                <p>Select a PDF to split</p>
                <input type="file" id="pdf-input" accept=".pdf" style="display:none">
            </div>
            <div id="split-options" style="display:none; margin-top:24px">
                <p id="page-info" style="margin-bottom:16px"></p>
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
                PDFTools.showProgress(20);
                const data = await selectedFile.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(data);
                const pageCount = pdf.getPageCount();

                if (modeSelect.value === 'all') {
                    const zip = new JSZip();
                    for (let i = 0; i < pageCount; i++) {
                        const newPdf = await PDFLib.PDFDocument.create();
                        const [page] = await newPdf.copyPages(pdf, [i]);
                        newPdf.addPage(page);
                        const bytes = await newPdf.save();
                        zip.file(`page_${i + 1}.pdf`, bytes);
                        PDFTools.showProgress(20 + (i / pageCount) * 70);
                    }
                    const content = await zip.generateAsync({ type: "blob" });
                    PDFTools.downloadBlob(content, "split_pages.zip");
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

                    if (indices.length === 0) return alert('Please enter a valid page range');

                    const newPdf = await PDFLib.PDFDocument.create();
                    const copiedPages = await newPdf.copyPages(pdf, indices);
                    copiedPages.forEach(p => newPdf.addPage(p));
                    const bytes = await newPdf.save();
                    PDFTools.downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'extracted_pages.pdf');
                }
                PDFTools.showProgress(100);
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                splitBtn.disabled = false;
            }
        };
    },

    // 3. Compress PDF
    renderCompressPDF: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="pdf-dropzone">
                <p>Select PDF to compress</p>
                <input type="file" id="pdf-input" accept=".pdf" style="display:none">
            </div>
            <div id="compress-ui" style="display:none; margin-top:24px">
                <p id="size-info" style="margin-bottom:16px; font-weight:600"></p>
                <div class="form-group">
                    <label>Compression Level</label>
                    <input type="range" class="form-control" min="1" max="3" value="2" id="level">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px">
                        <span>Low</span><span>Medium</span><span>High</span>
                    </div>
                </div>
                <button class="btn btn-primary" id="compress-btn" style="width:100%">Compress Now</button>
            </div>
            <div class="progress-container">
                <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
        `;

        const input = container.querySelector('#pdf-input');
        const ui = container.querySelector('#compress-ui');
        const dropzone = container.querySelector('#pdf-dropzone');
        const sizeInfo = container.querySelector('#size-info');
        const compressBtn = container.querySelector('#compress-btn');
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
                PDFTools.showProgress(30);
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                
                // Simple compression by re-saving with optimization
                const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                
                PDFTools.showProgress(100);
                PDFTools.downloadBlob(blob, 'compressed.pdf');
                alert(`Compression complete! New size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                compressBtn.disabled = false;
                setTimeout(PDFTools.hideProgress, 2000);
            }
        };
    },

    // 5. Reorder Pages
    renderReorderPDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">📑</div>
                <p>Select PDF to reorder pages</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="form-group">
                    <label>New Page Order (comma separated, e.g. 3,1,2)</label>
                    <input type="text" class="form-control" id="order" placeholder="e.g. 3,1,2">
                    <small id="page-count-info"></small>
                </div>
                <button class="btn btn-primary" id="reorder-btn" style="width:100%">Reorder & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const orderInput = container.querySelector('#order');
        const info = container.querySelector('#page-count-info');
        let pdfFile = null;
        let pageCount = 0;

        input.onchange = async (e) => {
            pdfFile = e.target.files[0];
            if (pdfFile) {
                const data = await pdfFile.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(data);
                pageCount = pdf.getPageCount();
                info.innerText = `Total pages: ${pageCount}. Enter indices from 1 to ${pageCount}.`;
                area.style.display = 'block';
                container.querySelector('#drop-zone').style.display = 'none';
            }
        };

        container.querySelector('#reorder-btn').onclick = async () => {
            const order = orderInput.value.split(',').map(s => parseInt(s.trim()) - 1);
            if (order.some(n => isNaN(n) || n < 0 || n >= pageCount)) {
                return alert('Invalid page order. Please use numbers within range.');
            }

            const data = await pdfFile.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(data);
            const newPdf = await PDFLib.PDFDocument.create();
            const pages = await newPdf.copyPages(pdf, order);
            pages.forEach(p => newPdf.addPage(p));
            
            const bytes = await newPdf.save();
            PDFTools.downloadBlob(new Blob([bytes]), 'reordered.pdf');
        };
    },

    // 6. Rotate PDF
    renderRotatePDF: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🔄</div>
                <p>Drag & drop PDF to rotate pages</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="form-group">
                    <label>Rotation Angle</label>
                    <select class="form-control" id="angle">
                        <option value="90">90° Clockwise</option>
                        <option value="180">180°</option>
                        <option value="270">90° Counter-Clockwise</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="rotate-btn" style="width:100%">Rotate & Download</button>
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
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🔢</div>
                <p>Select PDF to add page numbers</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="form-group">
                    <label>Position</label>
                    <select class="form-control" id="pos">
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="top-center">Top Center</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="process-btn" style="width:100%">Add Numbers & Download</button>
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
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🏷️</div>
                <p>Select PDF to add watermark</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="form-group">
                    <label>Watermark Text</label>
                    <input type="text" class="form-control" id="text" value="CONFIDENTIAL">
                </div>
                <button class="btn btn-primary" id="process-btn" style="width:100%">Add Watermark & Download</button>
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
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🔓</div>
                <p>Select protected PDF to unlock</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" class="form-control" id="pass" placeholder="Enter PDF password">
                </div>
                <button class="btn btn-primary" id="process-btn" style="width:100%">Unlock & Download</button>
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
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">ℹ️</div>
                <p>Select PDF to view info</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="info-grid" style="display:grid; gap:12px; background:var(--bg); padding:20px; border-radius:8px">
                    <div id="info-content"></div>
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
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🔒</div>
                <p>Drag & drop PDF to add password</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="form-group">
                    <label>Set Password</label>
                    <input type="password" class="form-control" id="pass" placeholder="Enter password">
                </div>
                <button class="btn btn-primary" id="protect-btn" style="width:100%">Protect & Download</button>
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
                <p>Select PDF to convert to images</p>
                <input type="file" id="pdf-input" accept=".pdf" style="display:none">
            </div>
            <div id="pdf-to-img-ui" style="display:none; margin-top:24px">
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
                <p>Select images to convert to PDF</p>
                <input type="file" id="img-input" accept="image/*" multiple style="display:none">
            </div>
            <div class="file-list" id="img-list"></div>
            <button class="btn btn-primary" id="convert-btn" disabled style="margin-top:24px">Create PDF</button>
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
            <div class="upload-area" id="drop-zone" style="border: 2px dashed var(--border); padding: 40px; text-align: center; border-radius: 12px; cursor: pointer;">
                <div style="font-size: 3rem; margin-bottom: 16px;">📄</div>
                <p>Select PDF to extract text</p>
                <input type="file" id="file-input" accept=".pdf" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PDF</button>
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <button class="btn btn-primary" id="extract-btn" style="width:100%">Extract Text</button>
                <textarea class="form-control" id="output" rows="10" style="margin-top:16px" readonly></textarea>
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
