// Image Tools Logic
window.ImageTools = {
    // Helper to load image
    loadImage: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    // Helper to download canvas
    downloadCanvas: (canvas, filename, format = 'image/png', quality = 1.0) => {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }, format, quality);
    },

    // Helper for progress and status
    showProgress: (container, progress, message) => {
        const pc = container.querySelector('.progress-container');
        const pf = container.querySelector('.progress-fill');
        const sm = container.querySelector('.status-message');
        if (pc && pf && sm) {
            pc.style.display = 'block';
            pf.style.width = `${progress}%`;
            sm.innerText = message || `${progress}% Processing...`;
        }
    },

    hideProgress: (container) => {
        const pc = container.querySelector('.progress-container');
        if (pc) pc.style.display = 'none';
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

    renderComparison: (container, originalSrc, resultSrc) => {
        const div = document.createElement('div');
        div.className = 'comparison-container mt-6';
        div.innerHTML = `
            <img src="${originalSrc}" class="comparison-image">
            <div class="comparison-overlay" style="width: 50%">
                <img src="${resultSrc}" class="comparison-image" style="width: auto; height: 100%; max-width: none;">
            </div>
            <div class="comparison-slider" style="left: 50%">
                <div class="comparison-handle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M18 8L22 12L18 16M6 8L2 12L6 16"></path></svg>
                </div>
            </div>
            <div class="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md uppercase tracking-widest font-bold">Result</div>
            <div class="absolute top-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md uppercase tracking-widest font-bold">Original</div>
        `;

        const slider = div.querySelector('.comparison-slider');
        const overlay = div.querySelector('.comparison-overlay');
        const handle = div.querySelector('.comparison-handle');

        let isResizing = false;

        const startResizing = () => isResizing = true;
        const stopResizing = () => isResizing = false;
        const resize = (e) => {
            if (!isResizing) return;
            const rect = div.getBoundingClientRect();
            const x = (e.pageX || e.touches[0].pageX) - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            slider.style.left = `${percent}%`;
            overlay.style.width = `${percent}%`;
        };

        slider.addEventListener('mousedown', startResizing);
        slider.addEventListener('touchstart', startResizing);
        window.addEventListener('mouseup', stopResizing);
        window.addEventListener('touchend', stopResizing);
        window.addEventListener('mousemove', resize);
        window.addEventListener('touchmove', resize);

        container.appendChild(div);
    },

    // 14. JPG to PNG
    renderJPGToPNG: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="img-dropzone">
                <div class="icon">🖼️</div>
                <p>Select JPG image</p>
                <input type="file" id="img-input" accept="image/jpeg" style="display:none">
            </div>
            <div id="preview-area" class="tool-process-area" style="display:none">
                <div class="flex justify-center">
                    <canvas id="preview-canvas" class="max-w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg"></canvas>
                </div>
                <button class="btn btn-primary" id="convert-btn">Convert to PNG</button>
            </div>
        `;

        const dropzone = container.querySelector('#img-dropzone');
        const input = container.querySelector('#img-input');
        const previewArea = container.querySelector('#preview-area');
        const canvas = container.querySelector('#preview-canvas');
        const convertBtn = container.querySelector('#convert-btn');
        let currentImg = null;

        dropzone.onclick = () => input.click();
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                currentImg = await ImageTools.loadImage(file);
                canvas.width = currentImg.width;
                canvas.height = currentImg.height;
                canvas.getContext('2d').drawImage(currentImg, 0, 0);
                previewArea.style.display = 'block';
                dropzone.style.display = 'none';
            }
        };

        convertBtn.onclick = () => {
            ImageTools.downloadCanvas(canvas, 'converted.png', 'image/png');
        };
    },

    // 15. PNG to JPG
    renderPNGToJPG: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🖼️</div>
                <p>Drag & drop PNG images</p>
                <input type="file" id="file-input" accept=".png" multiple hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select PNGs</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Quality (0.1 - 1.0)</label>
                    <input type="range" class="form-control" id="quality" min="0.1" max="1.0" step="0.1" value="0.8">
                </div>
                <button class="btn btn-primary" id="convert-btn">Convert to JPG</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const dropZone = container.querySelector('#drop-zone');
        let files = [];

        dropZone.onclick = () => input.click();
        input.onchange = (e) => {
            files = Array.from(e.target.files);
            if (files.length) {
                area.style.display = 'block';
                dropZone.style.display = 'none';
            }
        };

        container.querySelector('#convert-btn').onclick = async () => {
            const quality = parseFloat(container.querySelector('#quality').value);
            const zip = new JSZip();
            
            for (const file of files) {
                const img = await ImageTools.loadImage(file);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
                zip.file(file.name.replace('.png', '.jpg'), blob);
            }

            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted_images.zip';
            a.click();
        };
    },

    // 16. WebP to JPG
    renderWebPToImage: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🖼️</div>
                <p>Drag & drop WebP images</p>
                <input type="file" id="file-input" accept=".webp" multiple hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select WebPs</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <button class="btn btn-primary" id="convert-btn">Convert to JPG</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const dropZone = container.querySelector('#drop-zone');
        let files = [];

        dropZone.onclick = () => input.click();
        input.onchange = (e) => {
            files = Array.from(e.target.files);
            if (files.length) {
                area.style.display = 'block';
                dropZone.style.display = 'none';
            }
        };

        container.querySelector('#convert-btn').onclick = async () => {
            const zip = new JSZip();
            for (const file of files) {
                const img = await ImageTools.loadImage(file);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
                zip.file(file.name.replace('.webp', '.jpg'), blob);
            }
            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted_images.zip';
            a.click();
        };
    },

    // 17. Image Compressor
    renderCompressImage: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="img-dropzone">
                <div class="icon">📉</div>
                <p>Select image to compress</p>
                <input type="file" id="img-input" accept="image/*" style="display:none">
            </div>
            <div id="compress-ui" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <div class="flex justify-between mb-2">
                        <label>Quality</label>
                        <span id="q-val" class="font-bold text-blue-600">70%</span>
                    </div>
                    <input type="range" class="form-control" id="quality" min="1" max="100" value="70">
                </div>
                <button class="btn btn-primary py-4" id="compress-btn">Compress Image</button>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <p class="status-message">Processing...</p>
                </div>
            </div>
            <div id="result-area"></div>
        `;

        const input = container.querySelector('#img-input');
        const ui = container.querySelector('#compress-ui');
        const qInput = container.querySelector('#quality');
        const qVal = container.querySelector('#q-val');
        const btn = container.querySelector('#compress-btn');
        const resultArea = container.querySelector('#result-area');
        let currentImg = null;
        let originalFile = null;

        container.querySelector('#img-dropzone').onclick = () => input.click();
        input.onchange = async (e) => {
            originalFile = e.target.files[0];
            currentImg = await ImageTools.loadImage(originalFile);
            ui.style.display = 'block';
            container.querySelector('#img-dropzone').style.display = 'none';
        };

        qInput.oninput = () => qVal.innerText = qInput.value + '%';

        btn.onclick = async () => {
            btn.disabled = true;
            btn.innerText = 'Processing...';
            
            // Simulate realistic progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 90) {
                    clearInterval(interval);
                    progress = 90;
                }
                ImageTools.showProgress(ui, Math.floor(progress));
            }, 200);

            const canvas = document.createElement('canvas');
            canvas.width = currentImg.width;
            canvas.height = currentImg.height;
            canvas.getContext('2d').drawImage(currentImg, 0, 0);
            
            const quality = qInput.value / 100;
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
            
            clearInterval(interval);
            ImageTools.showProgress(ui, 100, 'Complete!');
            
            setTimeout(() => {
                ui.style.display = 'none';
                const reduction = Math.round((1 - (blob.size / originalFile.size)) * 100);
                const resultSize = (blob.size / 1024).toFixed(1) + ' KB';
                const originalSize = (originalFile.size / 1024).toFixed(1) + ' KB';
                
                ImageTools.showSuccess(
                    resultArea, 
                    'Compression Complete!', 
                    `Your image was reduced by ${reduction}%. (${originalSize} → ${resultSize})`,
                    () => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'compressed.jpg';
                        a.click();
                    }
                );

                // Add comparison
                const originalUrl = URL.createObjectURL(originalFile);
                const resultUrl = URL.createObjectURL(blob);
                ImageTools.renderComparison(resultArea, originalUrl, resultUrl);
            }, 500);
        };
    },

    // 18. Image Resizer
    renderResizeImage: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="img-dropzone">
                <div class="icon">📏</div>
                <p>Select image to resize</p>
                <input type="file" id="img-input" accept="image/*" style="display:none">
            </div>
            <div id="resize-ui" class="tool-process-area" style="display:none">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>Width (px)</label>
                        <input type="number" class="form-control" id="width">
                    </div>
                    <div class="form-group">
                        <label>Height (px)</label>
                        <input type="number" class="form-control" id="height">
                    </div>
                </div>
                <button class="btn btn-primary" id="resize-btn">Resize & Download</button>
            </div>
        `;

        const input = container.querySelector('#img-input');
        const ui = container.querySelector('#resize-ui');
        const wInput = container.querySelector('#width');
        const hInput = container.querySelector('#height');
        const btn = container.querySelector('#resize-btn');
        let currentImg = null;

        container.querySelector('#img-dropzone').onclick = () => input.click();
        input.onchange = async (e) => {
            currentImg = await ImageTools.loadImage(e.target.files[0]);
            wInput.value = currentImg.width;
            hInput.value = currentImg.height;
            ui.style.display = 'block';
            container.querySelector('#img-dropzone').style.display = 'none';
        };

        btn.onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = wInput.value;
            canvas.height = hInput.value;
            canvas.getContext('2d').drawImage(currentImg, 0, 0, canvas.width, canvas.height);
            ImageTools.downloadCanvas(canvas, 'resized.png');
        };
    },

    // 22. Grayscale Image
    renderGrayscaleImage: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🖼️</div>
                <p>Select image to grayscale</p>
                <input type="file" id="file-input" accept="image/*" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select Image</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="flex justify-center">
                    <canvas id="canvas" class="max-w-full h-auto rounded-xl shadow-lg"></canvas>
                </div>
                <button class="btn btn-primary" id="download-btn">Download Grayscale</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const canvas = container.querySelector('#canvas');
        const ctx = canvas.getContext('2d');

        input.onchange = async (e) => {
            const img = await ImageTools.loadImage(e.target.files[0]);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);
            area.style.display = 'block';
            container.querySelector('#drop-zone').style.display = 'none';
        };

        container.querySelector('#download-btn').onclick = () => {
            ImageTools.downloadCanvas(canvas, 'grayscale.png');
        };
    },

    // 20. Image Cropper
    renderCropImage: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">✂️</div>
                <p>Select image to crop</p>
                <input type="file" id="file-input" accept="image/*" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select Image</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="relative inline-block max-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <img id="crop-img" class="max-w-full h-auto block">
                    <div id="crop-box" class="absolute border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move w-[100px] h-[100px] top-0 left-0"></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <button class="btn btn-primary" id="crop-btn">Crop & Download</button>
                    <button class="btn btn-outline" onclick="location.reload()">Reset</button>
                </div>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const img = container.querySelector('#crop-img');
        const box = container.querySelector('#crop-box');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                img.src = URL.createObjectURL(file);
                area.style.display = 'block';
                container.querySelector('#drop-zone').style.display = 'none';
            }
        };

        box.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = box.offsetLeft;
            startTop = box.offsetTop;
            e.preventDefault();
        };

        window.onmousemove = (e) => {
            if (!isDragging) return;
            let left = startLeft + (e.clientX - startX);
            let top = startTop + (e.clientY - startY);
            
            left = Math.max(0, Math.min(left, img.clientWidth - box.clientWidth));
            top = Math.max(0, Math.min(top, img.clientHeight - box.clientHeight));
            
            box.style.left = left + 'px';
            box.style.top = top + 'px';
        };

        window.onmouseup = () => isDragging = false;

        container.querySelector('#crop-btn').onclick = () => {
            const canvas = document.createElement('canvas');
            const scaleX = img.naturalWidth / img.clientWidth;
            const scaleY = img.naturalHeight / img.clientHeight;
            
            canvas.width = box.clientWidth * scaleX;
            canvas.height = box.clientHeight * scaleY;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, box.offsetLeft * scaleX, box.offsetTop * scaleY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            ImageTools.downloadCanvas(canvas, 'cropped.png');
        };
    },

    // 21. Image to Base64
    renderImageToBase64: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🔗</div>
                <p>Select image to encode</p>
                <input type="file" id="file-input" accept="image/*" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select Image</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <textarea class="form-control font-mono text-xs" id="output" rows="10" readonly></textarea>
                <button class="btn btn-primary" id="copy-btn">Copy Base64</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const output = container.querySelector('#output');

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    output.value = ev.target.result;
                    area.style.display = 'block';
                    container.querySelector('#drop-zone').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        };

        container.querySelector('#copy-btn').onclick = () => {
            navigator.clipboard.writeText(output.value);
            alert('Copied!');
        };
    },

    // 22. Base64 to Image
    renderBase64ToImage: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Paste Base64 String</label>
                <textarea class="form-control" id="input" rows="8" placeholder="data:image/png;base64,..."></textarea>
            </div>
            <div class="tool-process-area">
                <button class="btn btn-primary" id="convert-btn">Convert to Image</button>
                <div id="preview-area" style="display:none" class="space-y-4">
                    <div class="flex justify-center">
                        <img id="preview" class="max-w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
                    </div>
                    <button class="btn btn-outline" id="download-btn">Download Image</button>
                </div>
            </div>
        `;

        const input = container.querySelector('#input');
        const area = container.querySelector('#preview-area');
        const preview = container.querySelector('#preview');

        container.querySelector('#convert-btn').onclick = () => {
            const str = input.value.trim();
            if (!str.startsWith('data:image')) {
                return alert('Invalid Base64 image string');
            }
            preview.src = str;
            area.style.display = 'block';
        };

        container.querySelector('#download-btn').onclick = () => {
            const a = document.createElement('a');
            a.href = preview.src;
            a.download = 'decoded_image.png';
            a.click();
        };
    },

    // 23. Flip & Rotate
    renderFlipRotateImage: (container) => {
        container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">🔄</div>
                <p>Select image to flip/rotate</p>
                <input type="file" id="file-input" accept="image/*" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select Image</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="flex justify-center">
                    <canvas id="canvas" class="max-w-full h-auto rounded-xl shadow-lg"></canvas>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button class="btn btn-outline" id="rotate-btn">Rotate 90°</button>
                    <button class="btn btn-outline" id="flip-h-btn">Flip Horizontal</button>
                    <button class="btn btn-outline" id="flip-v-btn">Flip Vertical</button>
                    <button class="btn btn-primary" id="download-btn">Download</button>
                </div>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const canvas = container.querySelector('#canvas');
        const ctx = canvas.getContext('2d');
        let currentImg = null;
        let rotation = 0;
        let flipH = 1;
        let flipV = 1;

        function updateCanvas() {
            if (!currentImg) return;
            const isVertical = (rotation / 90) % 2 !== 0;
            canvas.width = isVertical ? currentImg.height : currentImg.width;
            canvas.height = isVertical ? currentImg.width : currentImg.height;
            
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.scale(flipH, flipV);
            ctx.drawImage(currentImg, -currentImg.width / 2, -currentImg.height / 2);
            ctx.restore();
        }

        input.onchange = async (e) => {
            currentImg = await ImageTools.loadImage(e.target.files[0]);
            updateCanvas();
            area.style.display = 'block';
            container.querySelector('#drop-zone').style.display = 'none';
        };

        container.querySelector('#rotate-btn').onclick = () => { rotation = (rotation + 90) % 360; updateCanvas(); };
        container.querySelector('#flip-h-btn').onclick = () => { flipH *= -1; updateCanvas(); };
        container.querySelector('#flip-v-btn').onclick = () => { flipV *= -1; updateCanvas(); };
        container.querySelector('#download-btn').onclick = () => ImageTools.downloadCanvas(canvas, 'transformed.png');
    },

    // 11. Social Media Resizer
    renderSocialResizer: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="drop-zone">
                <div class="icon">📱</div>
                <p>Select image to resize for Social Media</p>
                <input type="file" id="file-input" accept="image/*" style="display:none">
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Platform & Size</label>
                    <select class="form-control" id="size-preset">
                        <option value="1080x1080">Instagram Post (1:1)</option>
                        <option value="1080x1350">Instagram Portrait (4:5)</option>
                        <option value="1080x1920">Instagram Story / Reel (9:16)</option>
                        <option value="1200x630">Facebook Post</option>
                        <option value="1200x675">Twitter Post</option>
                        <option value="1280x720">YouTube Thumbnail</option>
                        <option value="1200x627">LinkedIn Post</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="resize-btn">Resize & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const dropZone = container.querySelector('#drop-zone');
        let selectedImg = null;

        dropZone.onclick = () => input.click();
        input.onchange = async (e) => {
            selectedImg = await ImageTools.loadImage(e.target.files[0]);
            area.style.display = 'block';
            dropZone.style.display = 'none';
        };

        container.querySelector('#resize-btn').onclick = () => {
            const [w, h] = container.querySelector('#size-preset').value.split('x').map(Number);
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            
            const scale = Math.max(w / selectedImg.width, h / selectedImg.height);
            const x = (w - selectedImg.width * scale) / 2;
            const y = (h - selectedImg.height * scale) / 2;
            ctx.drawImage(selectedImg, x, y, selectedImg.width * scale, selectedImg.height * scale);
            
            ImageTools.downloadCanvas(canvas, `social_${w}x${h}.png`);
        };
    },

    // 12. Add Text to Image
    renderAddTextToImage: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="drop-zone">
                <div class="icon">✍️</div>
                <p>Select image to add text</p>
                <input type="file" id="file-input" accept="image/*" style="display:none">
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Overlay Text</label>
                    <input type="text" class="form-control" id="overlay-text" placeholder="Enter text here">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>Color</label>
                        <input type="color" class="form-control h-[44px] p-1" id="text-color" value="#ffffff">
                    </div>
                    <div class="form-group">
                        <label>Size</label>
                        <input type="number" class="form-control" id="text-size" value="50">
                    </div>
                </div>
                <button class="btn btn-primary" id="process-btn">Add Text & Download</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const dropZone = container.querySelector('#drop-zone');
        let selectedImg = null;

        dropZone.onclick = () => input.click();
        input.onchange = async (e) => {
            selectedImg = await ImageTools.loadImage(e.target.files[0]);
            area.style.display = 'block';
            dropZone.style.display = 'none';
        };

        container.querySelector('#process-btn').onclick = () => {
            const text = container.querySelector('#overlay-text').value;
            const color = container.querySelector('#text-color').value;
            const size = container.querySelector('#text-size').value;
            
            const canvas = document.createElement('canvas');
            canvas.width = selectedImg.width;
            canvas.height = selectedImg.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(selectedImg, 0, 0);
            
            ctx.fillStyle = color;
            ctx.font = `bold ${size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            
            ImageTools.downloadCanvas(canvas, 'text_image.png');
        };
    }
};

// Fallback for other image tools
const imageToolMethods = [];
imageToolMethods.forEach(method => {
    if (!ImageTools[method]) {
        ImageTools[method] = (container) => {
            container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace('render', '')}</strong> tool is coming soon.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
        };
    }
});
