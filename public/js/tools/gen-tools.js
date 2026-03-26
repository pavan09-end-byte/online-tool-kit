// Generator Tools Logic
window.GenTools = {
    // 41. Password Generator
    renderPassGen: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Password Length: <span id="len-val">16</span></label>
                <input type="range" class="form-control" id="length" min="8" max="64" value="16">
            </div>
            <div class="grid-2">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
                    <input type="checkbox" id="upper" checked> Uppercase
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
                    <input type="checkbox" id="lower" checked> Lowercase
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
                    <input type="checkbox" id="numbers" checked> Numbers
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
                    <input type="checkbox" id="symbols" checked> Symbols
                </label>
            </div>
            <div style="margin-top:24px; padding:20px; background:var(--bg); border-radius:8px; text-align:center">
                <div id="password" style="font-family:monospace; font-size:1.25rem; word-break:break-all; margin-bottom:16px">********</div>
                <div style="display:flex; justify-content:center; gap:12px">
                    <button class="btn btn-primary" id="gen-btn">Generate</button>
                    <button class="btn btn-outline" id="copy-btn">Copy</button>
                </div>
            </div>
        `;

        const passEl = container.querySelector('#password');
        const lenInput = container.querySelector('#length');
        const lenVal = container.querySelector('#len-val');
        
        lenInput.oninput = () => lenVal.innerText = lenInput.value;

        const generate = () => {
            const length = parseInt(lenInput.value);
            const charset = {
                upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                lower: 'abcdefghijklmnopqrstuvwxyz',
                numbers: '0123456789',
                symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
            };
            
            let characters = '';
            if (container.querySelector('#upper').checked) characters += charset.upper;
            if (container.querySelector('#lower').checked) characters += charset.lower;
            if (container.querySelector('#numbers').checked) characters += charset.numbers;
            if (container.querySelector('#symbols').checked) characters += charset.symbols;

            if (!characters) {
                passEl.innerText = 'Select at least one option';
                return;
            }

            let password = '';
            for (let i = 0; i < length; i++) {
                password += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            passEl.innerText = password;
        };

        container.querySelector('#gen-btn').onclick = generate;
        container.querySelector('#copy-btn').onclick = () => {
            navigator.clipboard.writeText(passEl.innerText);
            alert('Password copied!');
        };

        generate();
    },

    // 42. QR Code Generator
    renderQrGen: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Text or URL</label>
                <input type="text" class="form-control" id="qr-input" placeholder="https://example.com">
            </div>
            <div id="qr-output" style="display:flex; justify-content:center; margin:24px 0"></div>
            <div style="text-align:center">
                <button class="btn btn-primary" id="gen-btn">Generate QR Code</button>
            </div>
        `;

        const input = container.querySelector('#qr-input');
        const output = container.querySelector('#qr-output');
        
        container.querySelector('#gen-btn').onclick = () => {
            if (!input.value) return;
            output.innerHTML = '';
            new QRCode(output, {
                text: input.value,
                width: 256,
                height: 256
            });
        };
    },

    // 43. Color Picker
    renderColorPicker: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Select Color</label>
                <input type="color" class="form-control" id="picker" style="height:100px; padding:0">
            </div>
            <div class="grid-2" style="margin-top:24px">
                <div class="form-group">
                    <label>HEX</label>
                    <input type="text" class="form-control" id="hex" readonly>
                </div>
                <div class="form-group">
                    <label>RGB</label>
                    <input type="text" class="form-control" id="rgb" readonly>
                </div>
            </div>
        `;

        const picker = container.querySelector('#picker');
        const hex = container.querySelector('#hex');
        const rgb = container.querySelector('#rgb');

        function update() {
            const color = picker.value;
            hex.value = color.toUpperCase();
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            rgb.value = `rgb(${r}, ${g}, ${b})`;
        }

        picker.oninput = update;
        update();
    },

    // 44. Random Number Generator
    renderRandomNum: (container) => {
        container.innerHTML = `
            <div class="grid-2">
                <div class="form-group">
                    <label>Min</label>
                    <input type="number" class="form-control" id="min" value="1">
                </div>
                <div class="form-group">
                    <label>Max</label>
                    <input type="number" class="form-control" id="max" value="100">
                </div>
            </div>
            <div style="text-align:center; margin-top:24px">
                <div id="result" style="font-size:4rem; font-weight:800; color:var(--primary); margin-bottom:24px">?</div>
                <button class="btn btn-primary" id="gen-btn">Generate Number</button>
            </div>
        `;

        const minInput = container.querySelector('#min');
        const maxInput = container.querySelector('#max');
        const res = container.querySelector('#result');

        container.querySelector('#gen-btn').onclick = () => {
            const min = parseInt(minInput.value);
            const max = parseInt(maxInput.value);
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            res.innerText = num;
        };
    },

    // 45. UUID Generator
    renderUuidGen: (container) => {
        container.innerHTML = `
            <div style="text-align:center; padding:24px; background:var(--bg); border-radius:8px">
                <div id="uuid" style="font-family:monospace; font-size:1.1rem; margin-bottom:24px; word-break:break-all">Click Generate</div>
                <div style="display:flex; justify-content:center; gap:12px">
                    <button class="btn btn-primary" id="gen-btn">Generate UUID</button>
                    <button class="btn btn-outline" id="copy-btn">Copy</button>
                </div>
            </div>
        `;

        const uuidEl = container.querySelector('#uuid');
        
        const generate = () => {
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            uuidEl.innerText = uuid;
        };

        container.querySelector('#gen-btn').onclick = generate;
        container.querySelector('#copy-btn').onclick = () => {
            navigator.clipboard.writeText(uuidEl.innerText);
            alert('UUID copied!');
        };
    },

    // 46. Num to Words
    renderNumToWords: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Enter Number</label>
                <input type="number" class="form-control" id="input" value="1234">
            </div>
            <div id="result-area" style="padding:24px; background:var(--bg); border-radius:8px; margin-top:24px">
                <div id="output" style="font-size:1.25rem; font-weight:600; color:var(--primary); text-transform:capitalize"></div>
            </div>
        `;

        const input = container.querySelector('#input');
        const output = container.querySelector('#output');

        const toWords = (num) => {
            const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
            const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

            const g = ['', 'thousand', 'million', 'billion', 'trillion'];

            const makeGroup = (n) => {
                let s = '';
                if (n >= 100) {
                    s += a[Math.floor(n / 100)] + ' hundred ';
                    n %= 100;
                }
                if (n >= 20) {
                    s += b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '');
                } else if (n > 0) {
                    s += a[n];
                }
                return s.trim();
            };

            if (num === 0) return 'zero';
            if (num < 0) return 'minus ' + toWords(Math.abs(num));

            let groups = [];
            while (num > 0) {
                groups.push(num % 1000);
                num = Math.floor(num / 1000);
            }

            let res = [];
            for (let i = 0; i < groups.length; i++) {
                if (groups[i] !== 0) {
                    res.push(makeGroup(groups[i]) + (g[i] ? ' ' + g[i] : ''));
                }
            }
            return res.reverse().join(' ').trim();
        };

        input.oninput = () => {
            output.innerText = toWords(parseInt(input.value) || 0);
        };
        output.innerText = toWords(parseInt(input.value));
    },

    // 7. Favicon Generator
    renderFaviconGen: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="drop-zone">
                <p>Select image to generate Favicons</p>
                <input type="file" id="file-input" accept="image/*" style="display:none">
            </div>
            <div id="process-area" style="display:none; margin-top:24px">
                <div class="file-list" id="favicon-list"></div>
                <button class="btn btn-primary" id="download-all" style="width:100%; margin-top:16px">Download All as ZIP</button>
            </div>
        `;

        const input = container.querySelector('#file-input');
        const area = container.querySelector('#process-area');
        const list = container.querySelector('#favicon-list');
        const dropZone = container.querySelector('#drop-zone');
        let selectedImg = null;

        dropZone.onclick = () => input.click();
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    selectedImg = img;
                    area.style.display = 'block';
                    dropZone.style.display = 'none';
                    generatePreviews();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };

        const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
        const generatePreviews = () => {
            list.innerHTML = sizes.map(s => `
                <div class="file-item">
                    <span>${s}x${s} favicon.png</span>
                    <canvas id="canvas-${s}" width="${s}" height="${s}" style="display:none"></canvas>
                </div>
            `).join('');
            
            sizes.forEach(s => {
                const canvas = container.querySelector(`#canvas-${s}`);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(selectedImg, 0, 0, s, s);
            });
        };

        container.querySelector('#download-all').onclick = async () => {
            const zip = new JSZip();
            for (let s of sizes) {
                const canvas = container.querySelector(`#canvas-${s}`);
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                zip.file(`favicon-${s}x${s}.png`, blob);
            }
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "favicons.zip";
            link.click();
        };
    },

    // 8. Invoice Generator
    renderInvoiceGen: (container) => {
        container.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px">
                <div>
                    <div class="form-group">
                        <label>Your Company Name</label>
                        <input type="text" class="form-control" id="comp-name" value="My Business">
                    </div>
                    <div class="form-group">
                        <label>Client Name</label>
                        <input type="text" class="form-control" id="client-name" placeholder="Client Name">
                    </div>
                    <div class="form-group">
                        <label>Invoice #</label>
                        <input type="text" class="form-control" id="inv-num" value="INV-001">
                    </div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Item Description</label>
                        <input type="text" class="form-control" id="item-desc" placeholder="Service/Product">
                    </div>
                    <div class="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" class="form-control" id="item-amt" value="1000">
                    </div>
                    <div class="form-group">
                        <label>Tax (%)</label>
                        <input type="number" class="form-control" id="tax-rate" value="18">
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" id="gen-btn" style="width:100%; margin-top:16px">Generate Invoice</button>
            <div id="inv-preview" style="margin-top:32px; padding:32px; background:white; border:1px solid #ddd; display:none">
                <div style="display:flex; justify-content:space-between">
                    <h2 id="p-comp-name">Company</h2>
                    <h2 style="color:#666">INVOICE</h2>
                </div>
                <hr style="margin:20px 0">
                <div style="display:flex; justify-content:space-between">
                    <div>
                        <p><strong>Bill To:</strong></p>
                        <p id="p-client-name">Client</p>
                    </div>
                    <div style="text-align:right">
                        <p><strong>Invoice #:</strong> <span id="p-inv-num">001</span></p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <table style="width:100%; margin-top:30px; border-collapse:collapse">
                    <thead>
                        <tr style="background:#f4f4f4">
                            <th style="padding:10px; text-align:left">Description</th>
                            <th style="padding:10px; text-align:right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:10px; border-bottom:1px solid #eee" id="p-item-desc">Item</td>
                            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right" id="p-item-amt">₹0</td>
                        </tr>
                    </tbody>
                </table>
                <div style="margin-top:20px; text-align:right">
                    <p>Subtotal: <span id="p-subtotal">₹0</span></p>
                    <p>Tax: <span id="p-tax">₹0</span></p>
                    <h3 style="margin-top:10px">Total: <span id="p-total">₹0</span></h3>
                </div>
                <button class="btn btn-outline" id="print-btn" style="margin-top:24px">Print / Save as PDF</button>
            </div>
        `;

        container.querySelector('#gen-btn').onclick = () => {
            const comp = container.querySelector('#comp-name').value;
            const client = container.querySelector('#client-name').value;
            const num = container.querySelector('#inv-num').value;
            const desc = container.querySelector('#item-desc').value;
            const amt = Number(container.querySelector('#item-amt').value);
            const taxRate = Number(container.querySelector('#tax-rate').value);
            
            const tax = amt * (taxRate / 100);
            const total = amt + tax;
            
            container.querySelector('#p-comp-name').innerText = comp;
            container.querySelector('#p-client-name').innerText = client;
            container.querySelector('#p-inv-num').innerText = num;
            container.querySelector('#p-item-desc').innerText = desc;
            container.querySelector('#p-item-amt').innerText = '₹' + amt.toLocaleString('en-IN');
            container.querySelector('#p-subtotal').innerText = '₹' + amt.toLocaleString('en-IN');
            container.querySelector('#p-tax').innerText = '₹' + tax.toLocaleString('en-IN');
            container.querySelector('#p-total').innerText = '₹' + total.toLocaleString('en-IN');
            
            container.querySelector('#inv-preview').style.display = 'block';
        };

        container.querySelector('#print-btn').onclick = () => {
            window.print();
        };
    }
};

// Fallback for other gen tools
const genToolMethods = [];
genToolMethods.forEach(method => {
    if (!GenTools[method]) {
        GenTools[method] = (container) => {
            container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace('render', '')}</strong> tool is under maintenance.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
        };
    }
});
