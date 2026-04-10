(() => {
  // public/js/tools/gen-tools.js
  window.GenTools = {
    // 41. Password Generator
    renderPassGen: (container) => {
      container.innerHTML = `
            <div class="form-group">
                <label class="flex justify-between items-center">
                    <span>Password Length</span>
                    <span id="len-val" class="text-blue-600 font-bold">16</span>
                </label>
                <input type="range" class="form-control" id="length" min="8" max="64" value="16">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input type="checkbox" id="upper" checked class="w-5 h-5 rounded border-slate-300">
                    <span class="text-sm font-medium">Uppercase</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input type="checkbox" id="lower" checked class="w-5 h-5 rounded border-slate-300">
                    <span class="text-sm font-medium">Lowercase</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input type="checkbox" id="numbers" checked class="w-5 h-5 rounded border-slate-300">
                    <span class="text-sm font-medium">Numbers</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input type="checkbox" id="symbols" checked class="w-5 h-5 rounded border-slate-300">
                    <span class="text-sm font-medium">Symbols</span>
                </label>
            </div>
            <div class="tool-process-area p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                <div id="password" class="font-mono text-xl break-all mb-6 text-slate-900 dark:text-white tracking-wider">********</div>
                <div class="grid grid-cols-2 gap-4">
                    <button class="btn btn-primary" id="gen-btn">Generate</button>
                    <button class="btn btn-outline" id="copy-btn">Copy</button>
                </div>
            </div>
        `;
      const passEl = container.querySelector("#password");
      const lenInput = container.querySelector("#length");
      const lenVal = container.querySelector("#len-val");
      lenInput.oninput = () => lenVal.innerText = lenInput.value;
      const generate = () => {
        const length = parseInt(lenInput.value);
        const charset = {
          upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          lower: "abcdefghijklmnopqrstuvwxyz",
          numbers: "0123456789",
          symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
        };
        let characters = "";
        if (container.querySelector("#upper").checked) characters += charset.upper;
        if (container.querySelector("#lower").checked) characters += charset.lower;
        if (container.querySelector("#numbers").checked) characters += charset.numbers;
        if (container.querySelector("#symbols").checked) characters += charset.symbols;
        if (!characters) {
          passEl.innerText = "Select at least one option";
          return;
        }
        let password = "";
        for (let i = 0; i < length; i++) {
          password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        passEl.innerText = password;
      };
      container.querySelector("#gen-btn").onclick = generate;
      container.querySelector("#copy-btn").onclick = () => {
        navigator.clipboard.writeText(passEl.innerText);
        alert("Password copied!");
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
            <div class="tool-process-area flex flex-col items-center">
                <div id="qr-output" class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6"></div>
                <button class="btn btn-primary w-full" id="gen-btn">Generate QR Code</button>
            </div>
        `;
      const input = container.querySelector("#qr-input");
      const output = container.querySelector("#qr-output");
      container.querySelector("#gen-btn").onclick = () => {
        if (!input.value) return;
        output.innerHTML = "";
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
                <input type="color" class="form-control h-24 p-0 rounded-2xl cursor-pointer" id="picker">
            </div>
            <div class="grid grid-cols-2 gap-4 mt-6">
                <div class="form-group">
                    <label>HEX</label>
                    <input type="text" class="form-control text-center font-mono" id="hex" readonly>
                </div>
                <div class="form-group">
                    <label>RGB</label>
                    <input type="text" class="form-control text-center font-mono" id="rgb" readonly>
                </div>
            </div>
        `;
      const picker = container.querySelector("#picker");
      const hex = container.querySelector("#hex");
      const rgb = container.querySelector("#rgb");
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
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label>Min</label>
                    <input type="number" class="form-control" id="min" value="1">
                </div>
                <div class="form-group">
                    <label>Max</label>
                    <input type="number" class="form-control" id="max" value="100">
                </div>
            </div>
            <div class="tool-process-area p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                <div id="result" class="text-7xl font-bold text-blue-600 dark:text-blue-400 mb-8">?</div>
                <button class="btn btn-primary w-full" id="gen-btn">Generate Number</button>
            </div>
        `;
      const minInput = container.querySelector("#min");
      const maxInput = container.querySelector("#max");
      const res = container.querySelector("#result");
      container.querySelector("#gen-btn").onclick = () => {
        const min = parseInt(minInput.value);
        const max = parseInt(maxInput.value);
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        res.innerText = num;
      };
    },
    // 45. UUID Generator
    renderUuidGen: (container) => {
      container.innerHTML = `
            <div class="tool-process-area p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                <div id="uuid" class="font-mono text-sm sm:text-base break-all mb-8 text-slate-900 dark:text-white">Click Generate</div>
                <div class="grid grid-cols-2 gap-4">
                    <button class="btn btn-primary" id="gen-btn">Generate UUID</button>
                    <button class="btn btn-outline" id="copy-btn">Copy</button>
                </div>
            </div>
        `;
      const uuidEl = container.querySelector("#uuid");
      const generate = () => {
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
          return v.toString(16);
        });
        uuidEl.innerText = uuid;
      };
      container.querySelector("#gen-btn").onclick = generate;
      container.querySelector("#copy-btn").onclick = () => {
        navigator.clipboard.writeText(uuidEl.innerText);
        alert("UUID copied!");
      };
    },
    // 46. Num to Words
    renderNumToWords: (container) => {
      container.innerHTML = `
            <div class="form-group">
                <label>Enter Number</label>
                <input type="number" class="form-control" id="input" value="1234">
            </div>
            <div id="result-area" class="tool-process-area p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div id="output" class="text-xl font-bold text-blue-600 dark:text-blue-400 capitalize leading-relaxed"></div>
            </div>
        `;
      const input = container.querySelector("#input");
      const output = container.querySelector("#output");
      const toWords = (num) => {
        const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        const g = ["", "thousand", "million", "billion", "trillion"];
        const makeGroup = (n) => {
          let s = "";
          if (n >= 100) {
            s += a[Math.floor(n / 100)] + " hundred ";
            n %= 100;
          }
          if (n >= 20) {
            s += b[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + a[n % 10] : "");
          } else if (n > 0) {
            s += a[n];
          }
          return s.trim();
        };
        if (num === 0) return "zero";
        if (num < 0) return "minus " + toWords(Math.abs(num));
        let groups = [];
        while (num > 0) {
          groups.push(num % 1e3);
          num = Math.floor(num / 1e3);
        }
        let res = [];
        for (let i = 0; i < groups.length; i++) {
          if (groups[i] !== 0) {
            res.push(makeGroup(groups[i]) + (g[i] ? " " + g[i] : ""));
          }
        }
        return res.reverse().join(" ").trim();
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
                <div class="icon">\u2728</div>
                <p>Select image to generate Favicons</p>
                <input type="file" id="file-input" accept="image/*" style="display:none">
            </div>
            <div id="process-area" class="tool-process-area" style="display:none">
                <div class="file-list" id="favicon-list"></div>
                <button class="btn btn-primary" id="download-all">Download All as ZIP</button>
            </div>
        `;
      const input = container.querySelector("#file-input");
      const area = container.querySelector("#process-area");
      const list = container.querySelector("#favicon-list");
      const dropZone = container.querySelector("#drop-zone");
      let selectedImg = null;
      dropZone.onclick = () => input.click();
      input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            selectedImg = img;
            area.style.display = "block";
            dropZone.style.display = "none";
            generatePreviews();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
      const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
      const generatePreviews = () => {
        list.innerHTML = sizes.map((s) => `
                <div class="file-item">
                    <span>${s}x${s} favicon.png</span>
                    <canvas id="canvas-${s}" width="${s}" height="${s}" style="display:none"></canvas>
                </div>
            `).join("");
        sizes.forEach((s) => {
          const canvas = container.querySelector(`#canvas-${s}`);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(selectedImg, 0, 0, s, s);
        });
      };
      container.querySelector("#download-all").onclick = async () => {
        const zip = new JSZip();
        for (let s of sizes) {
          const canvas = container.querySelector(`#canvas-${s}`);
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
          zip.file(`favicon-${s}x${s}.png`, blob);
        }
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "favicons.zip";
        link.click();
      };
    },
    // 8. Invoice Generator
    renderInvoiceGen: (container) => {
      container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
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
                <div class="space-y-4">
                    <div class="form-group">
                        <label>Item Description</label>
                        <input type="text" class="form-control" id="item-desc" placeholder="Service/Product">
                    </div>
                    <div class="form-group">
                        <label>Amount (\u20B9)</label>
                        <input type="number" class="form-control" id="item-amt" value="1000">
                    </div>
                    <div class="form-group">
                        <label>Tax (%)</label>
                        <input type="number" class="form-control" id="tax-rate" value="18">
                    </div>
                </div>
            </div>
            <div class="tool-process-area">
                <button class="btn btn-primary" id="gen-btn">Generate Invoice</button>
                <div id="inv-preview" class="mt-8 p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-x-auto" style="display:none">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <h2 id="p-comp-name" class="text-2xl font-bold text-slate-900 dark:text-white">Company</h2>
                        <h2 class="text-2xl font-bold text-slate-400 uppercase tracking-widest">INVOICE</h2>
                    </div>
                    <div class="h-px bg-slate-100 dark:bg-slate-800 mb-8"></div>
                    <div class="flex flex-col sm:flex-row justify-between gap-6 mb-10">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bill To</p>
                            <p id="p-client-name" class="text-lg font-bold text-slate-900 dark:text-white">Client</p>
                        </div>
                        <div class="sm:text-right">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Details</p>
                            <p class="text-slate-600 dark:text-slate-400"># <span id="p-inv-num" class="font-bold text-slate-900 dark:text-white">001</span></p>
                            <p class="text-slate-600 dark:text-slate-400">${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="overflow-x-auto -mx-6 sm:mx-0">
                        <table class="w-full min-w-[500px]">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800/50">
                                    <th class="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                    <th class="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td class="px-6 py-4 text-slate-900 dark:text-white font-medium" id="p-item-desc">Item</td>
                                    <td class="px-6 py-4 text-right text-slate-900 dark:text-white font-bold" id="p-item-amt">\u20B90</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-10 flex flex-col items-end space-y-2">
                        <div class="flex justify-between w-full sm:w-64 text-slate-600 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span id="p-subtotal" class="font-bold text-slate-900 dark:text-white">\u20B90</span>
                        </div>
                        <div class="flex justify-between w-full sm:w-64 text-slate-600 dark:text-slate-400">
                            <span>Tax</span>
                            <span id="p-tax" class="font-bold text-slate-900 dark:text-white">\u20B90</span>
                        </div>
                        <div class="h-px bg-slate-100 dark:bg-slate-800 w-full sm:w-64 my-2"></div>
                        <div class="flex justify-between w-full sm:w-64 text-xl font-bold text-blue-600 dark:text-blue-400">
                            <span>Total</span>
                            <span id="p-total">\u20B90</span>
                        </div>
                    </div>
                    <button class="btn btn-outline mt-10 w-full sm:w-auto" id="print-btn">Print / Save as PDF</button>
                </div>
            </div>
        `;
      container.querySelector("#gen-btn").onclick = () => {
        const comp = container.querySelector("#comp-name").value;
        const client = container.querySelector("#client-name").value;
        const num = container.querySelector("#inv-num").value;
        const desc = container.querySelector("#item-desc").value;
        const amt = Number(container.querySelector("#item-amt").value);
        const taxRate = Number(container.querySelector("#tax-rate").value);
        const tax = amt * (taxRate / 100);
        const total = amt + tax;
        container.querySelector("#p-comp-name").innerText = comp;
        container.querySelector("#p-client-name").innerText = client;
        container.querySelector("#p-inv-num").innerText = num;
        container.querySelector("#p-item-desc").innerText = desc;
        container.querySelector("#p-item-amt").innerText = "\u20B9" + amt.toLocaleString("en-IN");
        container.querySelector("#p-subtotal").innerText = "\u20B9" + amt.toLocaleString("en-IN");
        container.querySelector("#p-tax").innerText = "\u20B9" + tax.toLocaleString("en-IN");
        container.querySelector("#p-total").innerText = "\u20B9" + total.toLocaleString("en-IN");
        container.querySelector("#inv-preview").style.display = "block";
      };
      container.querySelector("#print-btn").onclick = () => {
        window.print();
      };
    }
  };
  var genToolMethods = [];
  genToolMethods.forEach((method) => {
    if (!GenTools[method]) {
      GenTools[method] = (container) => {
        container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace("render", "")}</strong> tool is under maintenance.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
      };
    }
  });
})();
