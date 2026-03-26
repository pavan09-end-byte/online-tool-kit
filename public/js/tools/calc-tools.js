// Calculator Tools Logic
window.CalcTools = {
    // 33. Percentage Calculator
    renderPercCalc: (container) => {
        container.innerHTML = `
            <div class="tabs" style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid var(--border)">
                <div class="tab active" data-mode="whatis">What is X% of Y?</div>
                <div class="tab" data-mode="percof">X is what % of Y?</div>
            </div>
            <div id="calc-ui">
                <div class="form-group">
                    <label id="label-1">X (Percentage)</label>
                    <input type="number" class="form-control" id="val1">
                </div>
                <div class="form-group">
                    <label id="label-2">Y (Value)</label>
                    <input type="number" class="form-control" id="val2">
                </div>
                <div class="result-box" style="padding:20px; background:var(--bg); border-radius:8px; text-align:center">
                    <div style="font-size:0.875rem; color:var(--text-muted)">Result</div>
                    <div id="result" style="font-size:2rem; font-weight:800; color:var(--primary)">0</div>
                </div>
            </div>
        `;

        const v1 = container.querySelector('#val1');
        const v2 = container.querySelector('#val2');
        const res = container.querySelector('#result');
        let mode = 'whatis';

        container.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                mode = tab.dataset.mode;
                container.querySelector('#label-1').innerText = mode === 'whatis' ? 'X (Percentage)' : 'X (Value)';
                container.querySelector('#label-2').innerText = mode === 'whatis' ? 'Y (Value)' : 'Y (Total Value)';
                update();
            };
        });

        function update() {
            const a = parseFloat(v1.value);
            const b = parseFloat(v2.value);
            if (isNaN(a) || isNaN(b)) {
                res.innerText = '0';
                return;
            }
            if (mode === 'whatis') res.innerText = (a / 100 * b).toFixed(2);
            else res.innerText = (a / b * 100).toFixed(2) + '%';
        }

        v1.oninput = update;
        v2.oninput = update;
    },

    // 35. Age Calculator
    renderAgeCalc: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Date of Birth</label>
                <input type="date" class="form-control" id="dob">
            </div>
            <div id="result-area" style="text-align:center; padding:24px; background:var(--bg); border-radius:8px">
                <div style="font-size:0.875rem; color:var(--text-muted)">Your Age</div>
                <div id="age-val" style="font-size:2.5rem; font-weight:800; color:var(--primary)">0 Years</div>
                <div id="age-detail" style="margin-top:8px; color:var(--text-muted)">Select your birth date</div>
            </div>
        `;

        const dobInput = container.querySelector('#dob');
        const ageVal = container.querySelector('#age-val');
        const ageDetail = container.querySelector('#age-detail');

        dobInput.onchange = () => {
            const birthDate = new Date(dobInput.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            ageVal.innerText = age + ' Years';
            ageDetail.innerText = `Born on ${birthDate.toDateString()}`;
        };
    },

    // 36. BMI Calculator
    renderBmiCalc: (container) => {
        container.innerHTML = `
            <div class="grid-2">
                <div class="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" class="form-control" id="weight" placeholder="e.g. 70">
                </div>
                <div class="form-group">
                    <label>Height (cm)</label>
                    <input type="number" class="form-control" id="height" placeholder="e.g. 175">
                </div>
            </div>
            <div id="result-area" style="text-align:center; padding:24px; background:var(--bg); border-radius:8px">
                <div style="font-size:0.875rem; color:var(--text-muted)">Your BMI</div>
                <div id="bmi-val" style="font-size:3rem; font-weight:800; color:var(--primary)">0.0</div>
                <div id="bmi-status" class="status-badge" style="margin-top:12px">Enter values</div>
            </div>
        `;

        const w = container.querySelector('#weight');
        const h = container.querySelector('#height');
        const val = container.querySelector('#bmi-val');
        const status = container.querySelector('#bmi-status');

        function update() {
            const weight = parseFloat(w.value);
            const height = parseFloat(h.value) / 100;
            if (weight > 0 && height > 0) {
                const bmi = weight / (height * height);
                val.innerText = bmi.toFixed(1);
                
                status.className = 'status-badge';
                if (bmi < 18.5) { status.innerText = 'Underweight'; status.classList.add('danger'); }
                else if (bmi < 25) { status.innerText = 'Normal'; status.classList.add('success'); }
                else if (bmi < 30) { status.innerText = 'Overweight'; status.classList.add('danger'); }
                else { status.innerText = 'Obese'; status.classList.add('danger'); }
            }
        }

        w.oninput = update;
        h.oninput = update;
    },

    // 37. EMI Calculator
    renderEmiCalc: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Loan Amount</label>
                <input type="number" class="form-control" id="amount" value="100000">
            </div>
            <div class="form-group">
                <label>Interest Rate (% per year)</label>
                <input type="number" class="form-control" id="rate" value="10">
            </div>
            <div class="form-group">
                <label>Tenure (Months)</label>
                <input type="number" class="form-control" id="tenure" value="12">
            </div>
            <div id="result-area" style="text-align:center; padding:24px; background:var(--bg); border-radius:8px">
                <div style="font-size:0.875rem; color:var(--text-muted)">Monthly EMI</div>
                <div id="emi-val" style="font-size:2.5rem; font-weight:800; color:var(--primary)">$0.00</div>
            </div>
        `;

        const a = container.querySelector('#amount');
        const r = container.querySelector('#rate');
        const t = container.querySelector('#tenure');
        const res = container.querySelector('#emi-val');

        function update() {
            const p = parseFloat(a.value);
            const rate = parseFloat(r.value) / 12 / 100;
            const n = parseFloat(t.value);
            if (p > 0 && rate > 0 && n > 0) {
                const emi = p * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
                res.innerText = '$' + emi.toFixed(2);
            }
        }

        a.oninput = update;
        r.oninput = update;
        t.oninput = update;
        update();
    },

    // 39. Discount Calculator
    renderDiscountCalc: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Original Price</label>
                <input type="number" class="form-control" id="price">
            </div>
            <div class="form-group">
                <label>Discount (%)</label>
                <input type="number" class="form-control" id="discount">
            </div>
            <div id="result-area" style="padding:24px; background:var(--bg); border-radius:8px">
                <div class="grid-2">
                    <div>
                        <div style="font-size:0.75rem; color:var(--text-muted)">Final Price</div>
                        <div id="final-price" style="font-size:1.5rem; font-weight:700">$0.00</div>
                    </div>
                    <div>
                        <div style="font-size:0.75rem; color:var(--text-muted)">You Save</div>
                        <div id="savings" style="font-size:1.5rem; font-weight:700; color:var(--success)">$0.00</div>
                    </div>
                </div>
            </div>
        `;

        const p = container.querySelector('#price');
        const d = container.querySelector('#discount');
        const fp = container.querySelector('#final-price');
        const s = container.querySelector('#savings');

        function update() {
            const price = parseFloat(p.value) || 0;
            const disc = parseFloat(d.value) || 0;
            const saved = price * (disc / 100);
            const final = price - saved;
            fp.innerText = '$' + final.toFixed(2);
            s.innerText = '$' + saved.toFixed(2);
        }

        p.oninput = update;
        d.oninput = update;
    },

    // 34. CGPA Calculator
    renderCgpaCalc: (container) => {
        container.innerHTML = `
            <div id="semesters">
                <div class="sem-row grid-2" style="margin-bottom:12px">
                    <input type="number" class="form-control gpa" placeholder="GPA (e.g. 8.5)" step="0.01">
                    <input type="number" class="form-control credit" placeholder="Credits" value="20">
                </div>
            </div>
            <button class="btn btn-outline btn-sm" id="add-sem" style="margin-bottom:24px">+ Add Semester</button>
            <div style="padding:20px; background:var(--bg); border-radius:8px; text-align:center">
                <div style="font-size:0.875rem; color:var(--text-muted); margin-bottom:8px">Overall CGPA</div>
                <div id="cgpa-res" style="font-size:2.5rem; font-weight:800; color:var(--primary)">0.00</div>
            </div>
        `;

        const sems = container.querySelector('#semesters');
        const res = container.querySelector('#cgpa-res');

        const calc = () => {
            let totalPoints = 0;
            let totalCredits = 0;
            sems.querySelectorAll('.sem-row').forEach(row => {
                const gpa = parseFloat(row.querySelector('.gpa').value) || 0;
                const credit = parseFloat(row.querySelector('.credit').value) || 0;
                totalPoints += gpa * credit;
                totalCredits += credit;
            });
            res.innerText = totalCredits ? (totalPoints / totalCredits).toFixed(2) : '0.00';
        };

        container.querySelector('#add-sem').onclick = () => {
            const div = document.createElement('div');
            div.className = 'sem-row grid-2';
            div.style.marginBottom = '12px';
            div.innerHTML = `
                <input type="number" class="form-control gpa" placeholder="GPA" step="0.01">
                <input type="number" class="form-control credit" placeholder="Credits" value="20">
            `;
            div.querySelectorAll('input').forEach(i => i.oninput = calc);
            sems.appendChild(div);
        };

        sems.querySelectorAll('input').forEach(i => i.oninput = calc);
    },

    // 38. GST Calculator
    renderGstCalc: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Amount</label>
                <input type="number" class="form-control" id="amt" value="1000">
            </div>
            <div class="form-group">
                <label>GST Rate (%)</label>
                <select class="form-control" id="rate">
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18" selected>18%</option>
                    <option value="28">28%</option>
                </select>
            </div>
            <div class="grid-2" style="margin-top:24px">
                <div style="padding:16px; background:var(--bg); border-radius:8px; text-align:center">
                    <div style="font-size:0.75rem; color:var(--text-muted)">GST Amount</div>
                    <div id="gst-amt" style="font-weight:700">$180.00</div>
                </div>
                <div style="padding:16px; background:var(--bg); border-radius:8px; text-align:center">
                    <div style="font-size:0.75rem; color:var(--text-muted)">Total Amount</div>
                    <div id="total-amt" style="font-weight:700">$1180.00</div>
                </div>
            </div>
        `;

        const amtInput = container.querySelector('#amt');
        const rateSelect = container.querySelector('#rate');
        const gstEl = container.querySelector('#gst-amt');
        const totalEl = container.querySelector('#total-amt');

        const calc = () => {
            const amt = parseFloat(amtInput.value) || 0;
            const rate = parseFloat(rateSelect.value);
            const gst = (amt * rate) / 100;
            gstEl.innerText = '$' + gst.toFixed(2);
            totalEl.innerText = '$' + (amt + gst).toFixed(2);
        };

        amtInput.oninput = calc;
        rateSelect.onchange = calc;
    },

    // 40. Unit Converter
    renderUnitConv: (container) => {
        const units = {
            length: {
                meters: 1,
                kilometers: 0.001,
                centimeters: 100,
                millimeters: 1000,
                inches: 39.3701,
                feet: 3.28084,
                yards: 1.09361,
                miles: 0.000621371
            },
            weight: {
                kilograms: 1,
                grams: 1000,
                milligrams: 1000000,
                pounds: 2.20462,
                ounces: 35.274
            },
            temperature: {
                celsius: (v) => v,
                fahrenheit: (v) => (v * 9/5) + 32,
                kelvin: (v) => v + 273.15
            }
        };

        container.innerHTML = `
            <div class="form-group">
                <label>Category</label>
                <select class="form-control" id="category">
                    <option value="length">Length</option>
                    <option value="weight">Weight</option>
                    <option value="temperature">Temperature</option>
                </select>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>From</label>
                    <input type="number" class="form-control" id="from-val" value="1">
                    <select class="form-control" id="from-unit" style="margin-top:8px"></select>
                </div>
                <div class="form-group">
                    <label>To</label>
                    <input type="number" class="form-control" id="to-val" readonly>
                    <select class="form-control" id="to-unit" style="margin-top:8px"></select>
                </div>
            </div>
        `;

        const cat = container.querySelector('#category');
        const fromVal = container.querySelector('#from-val');
        const toVal = container.querySelector('#to-val');
        const fromUnit = container.querySelector('#from-unit');
        const toUnit = container.querySelector('#to-unit');

        const updateUnits = () => {
            const c = cat.value;
            const options = Object.keys(units[c]).map(u => `<option value="${u}">${u.charAt(0).toUpperCase() + u.slice(1)}</option>`).join('');
            fromUnit.innerHTML = options;
            toUnit.innerHTML = options;
            if (toUnit.options.length > 1) toUnit.selectedIndex = 1;
            convert();
        };

        const convert = () => {
            const c = cat.value;
            const f = fromUnit.value;
            const t = toUnit.value;
            const val = parseFloat(fromVal.value);

            if (isNaN(val)) {
                toVal.value = '';
                return;
            }

            if (c === 'temperature') {
                // Temp is special
                let base;
                if (f === 'celsius') base = val;
                else if (f === 'fahrenheit') base = (val - 32) * 5/9;
                else if (f === 'kelvin') base = val - 273.15;

                if (t === 'celsius') toVal.value = base.toFixed(2);
                else if (t === 'fahrenheit') toVal.value = ((base * 9/5) + 32).toFixed(2);
                else if (t === 'kelvin') toVal.value = (base + 273.15).toFixed(2);
            } else {
                const base = val / units[c][f];
                toVal.value = (base * units[c][t]).toFixed(4);
            }
        };

        cat.onchange = updateUnits;
        fromVal.oninput = convert;
        fromUnit.onchange = convert;
        toUnit.onchange = convert;

        updateUnits();
    },

    // 9. SIP Calculator
    renderSipCalc: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Monthly Investment (₹)</label>
                <input type="number" class="form-control" id="monthly-amt" value="5000">
            </div>
            <div class="form-group">
                <label>Expected Return Rate (p.a %)</label>
                <input type="number" class="form-control" id="return-rate" value="12">
            </div>
            <div class="form-group">
                <label>Time Period (Years)</label>
                <input type="number" class="form-control" id="years" value="10">
            </div>
            <button class="btn btn-primary" id="calc-btn" style="width:100%">Calculate Returns</button>
            <div id="result-area" style="margin-top:24px; display:none">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
                    <div style="padding:16px; background:#f8fafc; border-radius:8px">
                        <div style="font-size:0.875rem; color:var(--text-muted)">Invested Amount</div>
                        <div style="font-size:1.25rem; font-weight:700" id="invested-amt">₹0</div>
                    </div>
                    <div style="padding:16px; background:#f8fafc; border-radius:8px">
                        <div style="font-size:0.875rem; color:var(--text-muted)">Est. Returns</div>
                        <div style="font-size:1.25rem; font-weight:700" id="est-returns">₹0</div>
                    </div>
                </div>
                <div style="margin-top:16px; padding:16px; background:var(--primary); color:white; border-radius:8px; text-align:center">
                    <div style="font-size:0.875rem; opacity:0.9">Total Value</div>
                    <div style="font-size:1.75rem; font-weight:800" id="total-val">₹0</div>
                </div>
            </div>
        `;

        container.querySelector('#calc-btn').onclick = () => {
            const P = Number(container.querySelector('#monthly-amt').value);
            const r = Number(container.querySelector('#return-rate').value) / 12 / 100;
            const n = Number(container.querySelector('#years').value) * 12;
            
            const total = P * (((Math.pow(1 + r, n)) - 1) / r) * (1 + r);
            const invested = P * n;
            const returns = total - invested;
            
            container.querySelector('#invested-amt').innerText = '₹' + Math.round(invested).toLocaleString('en-IN');
            container.querySelector('#est-returns').innerText = '₹' + Math.round(returns).toLocaleString('en-IN');
            container.querySelector('#total-val').innerText = '₹' + Math.round(total).toLocaleString('en-IN');
            container.querySelector('#result-area').style.display = 'block';
        };
    },

    // 10. FD Calculator
    renderFdCalc: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Total Investment (₹)</label>
                <input type="number" class="form-control" id="principal" value="100000">
            </div>
            <div class="form-group">
                <label>Rate of Interest (p.a %)</label>
                <input type="number" class="form-control" id="rate" value="6.5">
            </div>
            <div class="form-group">
                <label>Time Period (Years)</label>
                <input type="number" class="form-control" id="years" value="5">
            </div>
            <button class="btn btn-primary" id="calc-btn" style="width:100%">Calculate Maturity</button>
            <div id="result-area" style="margin-top:24px; display:none">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
                    <div style="padding:16px; background:#f8fafc; border-radius:8px">
                        <div style="font-size:0.875rem; color:var(--text-muted)">Invested Amount</div>
                        <div style="font-size:1.25rem; font-weight:700" id="invested-amt">₹0</div>
                    </div>
                    <div style="padding:16px; background:#f8fafc; border-radius:8px">
                        <div style="font-size:0.875rem; color:var(--text-muted)">Total Interest</div>
                        <div style="font-size:1.25rem; font-weight:700" id="total-interest">₹0</div>
                    </div>
                </div>
                <div style="margin-top:16px; padding:16px; background:var(--primary); color:white; border-radius:8px; text-align:center">
                    <div style="font-size:0.875rem; opacity:0.9">Maturity Value</div>
                    <div style="font-size:1.75rem; font-weight:800" id="maturity-val">₹0</div>
                </div>
            </div>
        `;

        container.querySelector('#calc-btn').onclick = () => {
            const P = Number(container.querySelector('#principal').value);
            const r = Number(container.querySelector('#rate').value);
            const t = Number(container.querySelector('#years').value);
            
            const n = 4; // quarterly
            const total = P * Math.pow((1 + (r / 100) / n), n * t);
            const interest = total - P;
            
            container.querySelector('#invested-amt').innerText = '₹' + Math.round(P).toLocaleString('en-IN');
            container.querySelector('#total-interest').innerText = '₹' + Math.round(interest).toLocaleString('en-IN');
            container.querySelector('#maturity-val').innerText = '₹' + Math.round(total).toLocaleString('en-IN');
            container.querySelector('#result-area').style.display = 'block';
        };
    },

    // 11. CGPA to Percentage
    renderCgpaToPerc: (container) => {
        container.innerHTML = `
            <div class="form-group">
                <label>Enter CGPA (10-point scale)</label>
                <input type="number" class="form-control" id="cgpa" value="9.5" step="0.01" min="0" max="10">
            </div>
            <button class="btn btn-primary" id="calc-btn" style="width:100%">Convert to Percentage</button>
            <div id="result-area" style="margin-top:24px; display:none; text-align:center">
                <div style="padding:24px; background:#f8fafc; border:2px solid var(--primary); border-radius:12px">
                    <div style="font-size:1rem; color:var(--text-muted); margin-bottom:8px">Your Percentage is</div>
                    <div style="font-size:3rem; font-weight:800; color:var(--primary)" id="perc-val">0%</div>
                    <div style="margin-top:12px; font-size:0.875rem; color:var(--text-muted)">Formula: CGPA × 9.5</div>
                </div>
            </div>
        `;

        container.querySelector('#calc-btn').onclick = () => {
            const cgpa = Number(container.querySelector('#cgpa').value);
            if (cgpa > 10 || cgpa < 0) return alert('Please enter CGPA between 0 and 10');
            
            const perc = cgpa * 9.5;
            container.querySelector('#perc-val').innerText = perc.toFixed(2) + '%';
            container.querySelector('#result-area').style.display = 'block';
        };
    }
};

// Fallback for other calc tools
const calcToolMethods = [];
calcToolMethods.forEach(method => {
    if (!CalcTools[method]) {
        CalcTools[method] = (container) => {
            container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace('render', '')}</strong> tool is coming soon.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
        };
    }
});
