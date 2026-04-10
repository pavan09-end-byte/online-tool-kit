(() => {
  // public/js/tools/image-tools.js
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
    downloadCanvas: (canvas, filename, format = "image/png", quality = 1) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }, format, quality);
    },
    // 14. JPG to PNG
    renderJPGToPNG: (container) => {
      container.innerHTML = `
            <div class="dropzone" id="img-dropzone">
                <div class="icon">\u{1F5BC}\uFE0F</div>
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
      const dropzone = container.querySelector("#img-dropzone");
      const input = container.querySelector("#img-input");
      const previewArea = container.querySelector("#preview-area");
      const canvas = container.querySelector("#preview-canvas");
      const convertBtn = container.querySelector("#convert-btn");
      let currentImg = null;
      dropzone.onclick = () => input.click();
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          currentImg = await ImageTools.loadImage(file);
          canvas.width = currentImg.width;
          canvas.height = currentImg.height;
          canvas.getContext("2d").drawImage(currentImg, 0, 0);
          previewArea.style.display = "block";
          dropzone.style.display = "none";
        }
      };
      convertBtn.onclick = () => {
        ImageTools.downloadCanvas(canvas, "converted.png", "image/png");
      };
    },
    // 15. PNG to JPG
    renderPNGToJPG: (container) => {
      container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">\u{1F5BC}\uFE0F</div>
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
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const dropZone = container.querySelector("#drop-zone");
      let files = [];
      dropZone.onclick = () => input.click();
      input.onchange = (e) => {
        files = Array.from(e.target.files);
        if (files.length) {
          area.style.display = "block";
          dropZone.style.display = "none";
        }
      };
      container.querySelector("#convert-btn").onclick = async () => {
        const quality = parseFloat(container.querySelector("#quality").value);
        const zip = new JSZip();
        for (const file of files) {
          const img = await ImageTools.loadImage(file);
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
          zip.file(file.name.replace(".png", ".jpg"), blob);
        }
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted_images.zip";
        a.click();
      };
    },
    // 16. WebP to JPG
    renderWebPToImage: (container) => {
      container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">\u{1F5BC}\uFE0F</div>
                <p>Drag & drop WebP images</p>
                <input type="file" id="file-input" accept=".webp" multiple hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select WebPs</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <button class="btn btn-primary" id="convert-btn">Convert to JPG</button>
            </div>
        `;
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const dropZone = container.querySelector("#drop-zone");
      let files = [];
      dropZone.onclick = () => input.click();
      input.onchange = (e) => {
        files = Array.from(e.target.files);
        if (files.length) {
          area.style.display = "block";
          dropZone.style.display = "none";
        }
      };
      container.querySelector("#convert-btn").onclick = async () => {
        const zip = new JSZip();
        for (const file of files) {
          const img = await ImageTools.loadImage(file);
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.9));
          zip.file(file.name.replace(".webp", ".jpg"), blob);
        }
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted_images.zip";
        a.click();
      };
    },
    // 17. Image Compressor
    renderCompressImage: (container) => {
      container.innerHTML = `
            <div class="dropzone" id="img-dropzone">
                <div class="icon">\u{1F4C9}</div>
                <p>Select image to compress</p>
                <input type="file" id="img-input" accept="image/*" style="display:none">
            </div>
            <div id="compress-ui" class="tool-process-area" style="display:none">
                <div class="form-group">
                    <label>Quality: <span id="q-val">70</span>%</label>
                    <input type="range" class="form-control" id="quality" min="10" max="100" value="70">
                </div>
                <button class="btn btn-primary" id="compress-btn">Compress & Download</button>
            </div>
        `;
      const input = container.querySelector("#img-input");
      const ui = container.querySelector("#compress-ui");
      const qInput = container.querySelector("#quality");
      const qVal = container.querySelector("#q-val");
      const btn = container.querySelector("#compress-btn");
      let currentImg = null;
      container.querySelector("#img-dropzone").onclick = () => input.click();
      input.onchange = async (e) => {
        currentImg = await ImageTools.loadImage(e.target.files[0]);
        ui.style.display = "block";
        container.querySelector("#img-dropzone").style.display = "none";
      };
      qInput.oninput = () => qVal.innerText = qInput.value;
      btn.onclick = () => {
        const canvas = document.createElement("canvas");
        canvas.width = currentImg.width;
        canvas.height = currentImg.height;
        canvas.getContext("2d").drawImage(currentImg, 0, 0);
        ImageTools.downloadCanvas(canvas, "compressed.jpg", "image/jpeg", qInput.value / 100);
      };
    },
    // 18. Image Resizer
    renderResizeImage: (container) => {
      container.innerHTML = `
            <div class="dropzone" id="img-dropzone">
                <div class="icon">\u{1F4CF}</div>
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
      const input = container.querySelector("#img-input");
      const ui = container.querySelector("#resize-ui");
      const wInput = container.querySelector("#width");
      const hInput = container.querySelector("#height");
      const btn = container.querySelector("#resize-btn");
      let currentImg = null;
      container.querySelector("#img-dropzone").onclick = () => input.click();
      input.onchange = async (e) => {
        currentImg = await ImageTools.loadImage(e.target.files[0]);
        wInput.value = currentImg.width;
        hInput.value = currentImg.height;
        ui.style.display = "block";
        container.querySelector("#img-dropzone").style.display = "none";
      };
      btn.onclick = () => {
        const canvas = document.createElement("canvas");
        canvas.width = wInput.value;
        canvas.height = hInput.value;
        canvas.getContext("2d").drawImage(currentImg, 0, 0, canvas.width, canvas.height);
        ImageTools.downloadCanvas(canvas, "resized.png");
      };
    },
    // 22. Grayscale Image
    renderGrayscaleImage: (container) => {
      container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">\u{1F5BC}\uFE0F</div>
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
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const canvas = container.querySelector("#canvas");
      const ctx = canvas.getContext("2d");
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
        area.style.display = "block";
        container.querySelector("#drop-zone").style.display = "none";
      };
      container.querySelector("#download-btn").onclick = () => {
        ImageTools.downloadCanvas(canvas, "grayscale.png");
      };
    },
    // 20. Image Cropper
    renderCropImage: (container) => {
      container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">\u2702\uFE0F</div>
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
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const img = container.querySelector("#crop-img");
      const box = container.querySelector("#crop-box");
      let isDragging = false;
      let startX, startY, startLeft, startTop;
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          img.src = URL.createObjectURL(file);
          area.style.display = "block";
          container.querySelector("#drop-zone").style.display = "none";
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
        box.style.left = left + "px";
        box.style.top = top + "px";
      };
      window.onmouseup = () => isDragging = false;
      container.querySelector("#crop-btn").onclick = () => {
        const canvas = document.createElement("canvas");
        const scaleX = img.naturalWidth / img.clientWidth;
        const scaleY = img.naturalHeight / img.clientHeight;
        canvas.width = box.clientWidth * scaleX;
        canvas.height = box.clientHeight * scaleY;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, box.offsetLeft * scaleX, box.offsetTop * scaleY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        ImageTools.downloadCanvas(canvas, "cropped.png");
      };
    },
    // 21. Image to Base64
    renderImageToBase64: (container) => {
      container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">\u{1F517}</div>
                <p>Select image to encode</p>
                <input type="file" id="file-input" accept="image/*" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select Image</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <textarea class="form-control font-mono text-xs" id="output" rows="10" readonly></textarea>
                <button class="btn btn-primary" id="copy-btn">Copy Base64</button>
            </div>
        `;
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const output = container.querySelector("#output");
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            output.value = ev.target.result;
            area.style.display = "block";
            container.querySelector("#drop-zone").style.display = "none";
          };
          reader.readAsDataURL(file);
        }
      };
      container.querySelector("#copy-btn").onclick = () => {
        navigator.clipboard.writeText(output.value);
        alert("Copied!");
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
      const input = container.querySelector("#input");
      const area = container.querySelector("#preview-area");
      const preview = container.querySelector("#preview");
      container.querySelector("#convert-btn").onclick = () => {
        const str = input.value.trim();
        if (!str.startsWith("data:image")) {
          return alert("Invalid Base64 image string");
        }
        preview.src = str;
        area.style.display = "block";
      };
      container.querySelector("#download-btn").onclick = () => {
        const a = document.createElement("a");
        a.href = preview.src;
        a.download = "decoded_image.png";
        a.click();
      };
    },
    // 23. Flip & Rotate
    renderFlipRotateImage: (container) => {
      container.innerHTML = `
            <div class="upload-area" id="drop-zone">
                <div class="icon">\u{1F504}</div>
                <p>Select image to flip/rotate</p>
                <input type="file" id="file-input" accept="image/*" hidden>
                <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">Select Image</button>
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="flex justify-center">
                    <canvas id="canvas" class="max-w-full h-auto rounded-xl shadow-lg"></canvas>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button class="btn btn-outline" id="rotate-btn">Rotate 90\xB0</button>
                    <button class="btn btn-outline" id="flip-h-btn">Flip Horizontal</button>
                    <button class="btn btn-outline" id="flip-v-btn">Flip Vertical</button>
                    <button class="btn btn-primary" id="download-btn">Download</button>
                </div>
            </div>
        `;
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const canvas = container.querySelector("#canvas");
      const ctx = canvas.getContext("2d");
      let currentImg = null;
      let rotation = 0;
      let flipH = 1;
      let flipV = 1;
      function updateCanvas() {
        if (!currentImg) return;
        const isVertical = rotation / 90 % 2 !== 0;
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
        area.style.display = "block";
        container.querySelector("#drop-zone").style.display = "none";
      };
      container.querySelector("#rotate-btn").onclick = () => {
        rotation = (rotation + 90) % 360;
        updateCanvas();
      };
      container.querySelector("#flip-h-btn").onclick = () => {
        flipH *= -1;
        updateCanvas();
      };
      container.querySelector("#flip-v-btn").onclick = () => {
        flipV *= -1;
        updateCanvas();
      };
      container.querySelector("#download-btn").onclick = () => ImageTools.downloadCanvas(canvas, "transformed.png");
    },
    // 11. Social Media Resizer
    renderSocialResizer: (container) => {
      container.innerHTML = `
            <div class="dropzone" id="drop-zone">
                <div class="icon">\u{1F4F1}</div>
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
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const dropZone = container.querySelector("#drop-zone");
      let selectedImg = null;
      dropZone.onclick = () => input.click();
      input.onchange = async (e) => {
        selectedImg = await ImageTools.loadImage(e.target.files[0]);
        area.style.display = "block";
        dropZone.style.display = "none";
      };
      container.querySelector("#resize-btn").onclick = () => {
        const [w, h] = container.querySelector("#size-preset").value.split("x").map(Number);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
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
                <div class="icon">\u270D\uFE0F</div>
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
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const dropZone = container.querySelector("#drop-zone");
      let selectedImg = null;
      dropZone.onclick = () => input.click();
      input.onchange = async (e) => {
        selectedImg = await ImageTools.loadImage(e.target.files[0]);
        area.style.display = "block";
        dropZone.style.display = "none";
      };
      container.querySelector("#process-btn").onclick = () => {
        const text = container.querySelector("#overlay-text").value;
        const color = container.querySelector("#text-color").value;
        const size = container.querySelector("#text-size").value;
        const canvas = document.createElement("canvas");
        canvas.width = selectedImg.width;
        canvas.height = selectedImg.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(selectedImg, 0, 0);
        ctx.fillStyle = color;
        ctx.font = `bold ${size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        ImageTools.downloadCanvas(canvas, "text_image.png");
      };
    }
  };
  var imageToolMethods = [];
  imageToolMethods.forEach((method) => {
    if (!ImageTools[method]) {
      ImageTools[method] = (container) => {
        container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace("render", "")}</strong> tool is coming soon.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
      };
    }
  });
})();
