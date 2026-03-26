// Text Tools Logic
window.TextTools = {
    // 24. Word Counter
    renderWordCounter: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <textarea class="form-control" id="text-input" rows="10" placeholder="Paste your text here..."></textarea>
            </div>
            <div class="word-stats" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:16px">
                <div class="stat-box" style="background:var(--bg); padding:16px; border-radius:8px; text-align:center">
                    <div id="words" style="font-size:1.5rem; font-weight:700; color:var(--primary)">0</div>
                    <div style="font-size:0.75rem; color:var(--text-muted)">Words</div>
                </div>
                <div class="stat-box" style="background:var(--bg); padding:16px; border-radius:8px; text-align:center">
                    <div id="chars" style="font-size:1.5rem; font-weight:700; color:var(--primary)">0</div>
                    <div style="font-size:0.75rem; color:var(--text-muted)">Characters</div>
                </div>
                <div class="stat-box" style="background:var(--bg); padding:16px; border-radius:8px; text-align:center">
                    <div id="reading" style="font-size:1.5rem; font-weight:700; color:var(--primary)">0m</div>
                    <div style="font-size:0.75rem; color:var(--text-muted)">Reading Time</div>
                </div>
            </div>
            <button class="btn btn-outline" id="clear-btn" style="margin-top:20px">Clear Text</button>
        `;

        const input = container.querySelector('#text-input');
        const wordsEl = container.querySelector('#words');
        const charsEl = container.querySelector('#chars');
        const readingEl = container.querySelector('#reading');

        input.oninput = () => {
            const text = input.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            const chars = input.value.length;
            const reading = Math.ceil(words / 200);

            wordsEl.innerText = words;
            charsEl.innerText = chars;
            readingEl.innerText = reading + 'm';
        };

        container.querySelector('#clear-btn').onclick = () => {
            input.value = '';
            input.oninput();
        };
    },

    // 25. Case Converter
    renderCaseConverter: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <textarea class="form-control" id="text-input" rows="10" placeholder="Paste your text here..."></textarea>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:10px">
                <button class="btn btn-outline" data-case="upper">UPPERCASE</button>
                <button class="btn btn-outline" data-case="lower">lowercase</button>
                <button class="btn btn-outline" data-case="title">Title Case</button>
                <button class="btn btn-outline" data-case="sentence">Sentence case</button>
            </div>
        `;

        const input = container.querySelector('#text-input');
        container.querySelectorAll('[data-case]').forEach(btn => {
            btn.onclick = () => {
                const text = input.value;
                const mode = btn.dataset.case;
                if (mode === 'upper') input.value = text.toUpperCase();
                else if (mode === 'lower') input.value = text.toLowerCase();
                else if (mode === 'title') {
                    input.value = text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                }
                else if (mode === 'sentence') {
                    input.value = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
                }
            };
        });
    },

    // 27. Lorem Ipsum Generator
    renderLoremIpsum: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Number of Paragraphs</label>
                <input type="number" class="form-control" id="count" value="3" min="1" max="20">
            </div>
            <button class="btn btn-primary" id="gen-btn" style="width:100%; margin-bottom:24px">Generate Lorem Ipsum</button>
            <textarea class="form-control" id="output" rows="10" readonly></textarea>
        `;

        const countInput = container.querySelector('#count');
        const output = container.querySelector('#output');
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

        container.querySelector('#gen-btn').onclick = () => {
            const count = parseInt(countInput.value);
            output.value = Array(count).fill(text).join('\n\n');
        };
    },

    // 28. Remove Duplicate Lines
    renderDuplicateRemover: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Input Text</label>
                <textarea class="form-control" id="input" rows="10" placeholder="Paste your text here..."></textarea>
            </div>
            <div style="display:flex; gap:12px; margin-bottom:24px">
                <button class="btn btn-primary" id="process-btn">Remove Duplicates</button>
                <button class="btn btn-outline" id="copy-btn">Copy Result</button>
            </div>
            <div class="form-group">
                <label>Result</label>
                <textarea class="form-control" id="output" rows="10" readonly></textarea>
            </div>
        `;

        const input = container.querySelector('#input');
        const output = container.querySelector('#output');

        container.querySelector('#process-btn').onclick = () => {
            const lines = input.value.split('\n');
            const unique = [...new Set(lines)];
            output.value = unique.join('\n');
        };

        container.querySelector('#copy-btn').onclick = () => {
            navigator.clipboard.writeText(output.value);
            alert('Copied!');
        };
    },

    // 31. DOCX Viewer
    renderDocxViewer: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="docx-dropzone">
                <p>Select a .docx file to view</p>
                <input type="file" id="docx-input" accept=".docx" style="display:none">
            </div>
            <div id="docx-content" style="margin-top:24px; background:#fff; padding:24px; border:1px solid #eee; border-radius:8px; display:none"></div>
        `;

        const input = container.querySelector('#docx-input');
        const content = container.querySelector('#docx-content');

        container.querySelector('#docx-dropzone').onclick = () => input.click();
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    mammoth.convertToHtml({ arrayBuffer: event.target.result })
                        .then(result => {
                            content.innerHTML = result.value;
                            content.style.display = 'block';
                            container.querySelector('#docx-dropzone').style.display = 'none';
                        });
                };
                reader.readAsArrayBuffer(file);
            }
        };
    },

    // 26. Text to Slug
    renderTextToSlug: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Enter Text</label>
                <input type="text" class="form-control" id="input" placeholder="e.g. Hello World 123">
            </div>
            <div class="form-group">
                <label>Slug Result</label>
                <input type="text" class="form-control" id="output" readonly>
            </div>
            <button class="btn btn-primary" id="copy-btn" style="width:100%">Copy Slug</button>
        `;

        const input = container.querySelector('#input');
        const output = container.querySelector('#output');

        input.oninput = () => {
            output.value = input.value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        container.querySelector('#copy-btn').onclick = () => {
            navigator.clipboard.writeText(output.value);
            alert('Copied!');
        };
    },

    // 29. Text Reverser
    renderTextReverser: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Input Text</label>
                <textarea class="form-control" id="input" rows="8" placeholder="Enter text to reverse..."></textarea>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:20px">
                <button class="btn btn-outline" id="rev-text">Reverse Text</button>
                <button class="btn btn-outline" id="rev-words">Reverse Words</button>
            </div>
            <div class="form-group">
                <label>Result</label>
                <textarea class="form-control" id="output" rows="8" readonly></textarea>
            </div>
        `;

        const input = container.querySelector('#input');
        const output = container.querySelector('#output');

        container.querySelector('#rev-text').onclick = () => {
            output.value = input.value.split('').reverse().join('');
        };

        container.querySelector('#rev-words').onclick = () => {
            output.value = input.value.split(/\s+/).reverse().join(' ');
        };
    },

    // 30. Char Frequency
    renderCharFrequency: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Input Text</label>
                <textarea class="form-control" id="input" rows="8" placeholder="Paste text to analyze..."></textarea>
            </div>
            <div id="result-area" style="display:none; margin-top:24px">
                <div style="font-weight:600; margin-bottom:12px">Character Frequency Analysis</div>
                <div id="freq-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:8px"></div>
            </div>
        `;

            const input = container.querySelector('#input');
            const area = container.querySelector('#result-area');
            const list = container.querySelector('#freq-list');

            input.oninput = () => {
                const text = input.value;
                if (!text) { area.style.display = 'none'; return; }
                
                const freq = {};
                for (let char of text) {
                    if (char.trim()) freq[char] = (freq[char] || 0) + 1;
                }

                const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
                list.innerHTML = sorted.map(([char, count]) => `
                    <div style="background:var(--bg); padding:8px; border-radius:4px; text-align:center">
                        <div style="font-weight:700">${char === ' ' ? 'Space' : char}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted)">${count}</div>
                    </div>
                `).join('');
                area.style.display = 'block';
            };
    },

    // 32. XLSX Viewer
    renderXlsxViewer: (container) => {
        container.innerHTML = `
            <div class="dropzone" id="xlsx-dropzone">
                <p>Select an .xlsx or .csv file to view</p>
                <input type="file" id="xlsx-input" accept=".xlsx, .csv" style="display:none">
            </div>
            <div id="xlsx-content" style="margin-top:24px; overflow-x:auto; display:none">
                <table class="table" id="xlsx-table" style="font-size:0.85rem"></table>
            </div>
        `;

        const input = container.querySelector('#xlsx-input');
        const content = container.querySelector('#xlsx-content');
        const table = container.querySelector('#xlsx-table');

        container.querySelector('#xlsx-dropzone').onclick = () => input.click();
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    table.innerHTML = jsonData.map((row, i) => `
                        <tr>
                            ${row.map(cell => `<${i === 0 ? 'th' : 'td'}>${cell || ''}</${i === 0 ? 'th' : 'td'}>`).join('')}
                        </tr>
                    `).join('');
                    
                    content.style.display = 'block';
                    container.querySelector('#xlsx-dropzone').style.display = 'none';
                };
                reader.readAsArrayBuffer(file);
            }
        };
    },

    // 10. Text Diff Checker
    renderTextDiff: (container) => {
        container.innerHTML = `
            <div class="grid-2">
                <div class="form-group">
                    <label>Original Text</label>
                    <textarea class="form-control" id="text-1" rows="10" placeholder="Paste original text here..."></textarea>
                </div>
                <div class="form-group">
                    <label>Modified Text</label>
                    <textarea class="form-control" id="text-2" rows="10" placeholder="Paste modified text here..."></textarea>
                </div>
            </div>
            <button class="btn btn-primary" id="compare-btn" style="width:100%; margin-top:16px">Compare Texts</button>
            <div id="diff-output" style="margin-top:24px; white-space: pre-wrap; font-family: monospace; padding: 16px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; display:none"></div>
        `;

        container.querySelector('#compare-btn').onclick = () => {
            const t1 = container.querySelector('#text-1').value.split('\n');
            const t2 = container.querySelector('#text-2').value.split('\n');
            const output = container.querySelector('#diff-output');
            
            let html = '';
            const max = Math.max(t1.length, t2.length);
            for (let i = 0; i < max; i++) {
                const line1 = t1[i] || '';
                const line2 = t2[i] || '';
                if (line1 === line2) {
                    html += `<div style="color: #64748b">  ${line1}</div>`;
                } else {
                    if (i < t1.length) html += `<div style="background: #fee2e2; color: #991b1b">- ${line1}</div>`;
                    if (i < t2.length) html += `<div style="background: #dcfce7; color: #166534">+ ${line2}</div>`;
                }
            }
            output.innerHTML = html;
            output.style.display = 'block';
        };
    },

    // 11. JSON Formatter
    renderJsonFormatter: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>JSON Input</label>
                <textarea class="form-control" id="json-input" rows="10" placeholder="Paste your JSON here..."></textarea>
            </div>
            <div class="grid-2" style="margin-top:16px">
                <button class="btn btn-primary" id="format-btn">Beautify JSON</button>
                <button class="btn btn-outline" id="minify-btn">Minify JSON</button>
            </div>
            <div id="json-output-area" style="margin-top:24px; display:none">
                <label style="display:block; font-weight:600; margin-bottom:8px">Output</label>
                <textarea class="form-control" id="json-output" rows="10" readonly></textarea>
                <button class="btn btn-outline" id="copy-btn" style="margin-top:12px">Copy to Clipboard</button>
            </div>
        `;

        const input = container.querySelector('#json-input');
        const output = container.querySelector('#json-output');
        const area = container.querySelector('#json-output-area');

        const process = (beautify) => {
            try {
                const obj = JSON.parse(input.value);
                output.value = beautify ? JSON.stringify(obj, null, 4) : JSON.stringify(obj);
                area.style.display = 'block';
            } catch (err) {
                alert('Invalid JSON: ' + err.message);
            }
        };

        container.querySelector('#format-btn').onclick = () => process(true);
        container.querySelector('#minify-btn').onclick = () => process(false);
        container.querySelector('#copy-btn').onclick = () => {
            output.select();
            document.execCommand('copy');
            alert('Copied!');
        };
    },

    // 12. HTML Encoder/Decoder
    renderHtmlEncDec: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Input Text / HTML</label>
                <textarea class="form-control" id="html-input" rows="10" placeholder="Enter text or HTML entities..."></textarea>
            </div>
            <div class="grid-2" style="margin-top:16px">
                <button class="btn btn-primary" id="encode-btn">Encode HTML</button>
                <button class="btn btn-primary" id="decode-btn">Decode HTML</button>
            </div>
            <div id="html-output-area" style="margin-top:24px; display:none">
                <label style="display:block; font-weight:600; margin-bottom:8px">Result</label>
                <textarea class="form-control" id="html-output" rows="10" readonly></textarea>
                <button class="btn btn-outline" id="copy-btn" style="margin-top:12px">Copy Result</button>
            </div>
        `;

        const input = container.querySelector('#html-input');
        const output = container.querySelector('#html-output');
        const area = container.querySelector('#html-output-area');

        container.querySelector('#encode-btn').onclick = () => {
            const div = document.createElement('div');
            div.textContent = input.value;
            output.value = div.innerHTML;
            area.style.display = 'block';
        };

        container.querySelector('#decode-btn').onclick = () => {
            const div = document.createElement('div');
            div.innerHTML = input.value;
            output.value = div.textContent;
            area.style.display = 'block';
        };

        container.querySelector('#copy-btn').onclick = () => {
            output.select();
            document.execCommand('copy');
            alert('Copied!');
        };
    }
};

// Fallback for other text tools
const textToolMethods = [];
textToolMethods.forEach(method => {
    if (!TextTools[method]) {
        TextTools[method] = (container) => {
            container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace('render', '')}</strong> tool is coming soon.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
        };
    }
});
