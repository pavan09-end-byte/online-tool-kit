(() => {
  // public/js/tools/calc-tools.js
  window.CalcTools = {
    // 33. Percentage Calculator
    renderPercCalc: (container) => {
      container.innerHTML = `
            <div class="tabs flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                <div class="tab px-4 py-2 cursor-pointer border-b-2 border-transparent active" data-mode="whatis">What is X% of Y?</div>
                <div class="tab px-4 py-2 cursor-pointer border-b-2 border-transparent" data-mode="percof">X is what % of Y?</div>
            </div>
            <div id="calc-ui" class="space-y-6">
                <div class="form-group">
                    <label id="label-1">X (Percentage)</label>
                    <input type="number" class="form-control" id="val1">
                </div>
                <div class="form-group">
                    <label id="label-2">Y (Value)</label>
                    <input type="number" class="form-control" id="val2">
                </div>
                <div class="result-box p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Result</div>
                    <div id="result" class="text-4xl font-bold text-blue-600 dark:text-blue-400">0</div>
                </div>
            </div>
        `;
      const v1 = container.querySelector("#val1");
      const v2 = container.querySelector("#val2");
      const res = container.querySelector("#result");
      let mode = "whatis";
      container.querySelectorAll(".tab").forEach((tab) => {
        tab.onclick = () => {
          container.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          mode = tab.dataset.mode;
          container.querySelector("#label-1").innerText = mode === "whatis" ? "X (Percentage)" : "X (Value)";
          container.querySelector("#label-2").innerText = mode === "whatis" ? "Y (Value)" : "Y (Total Value)";
          update();
        };
      });
      function update() {
        const a = parseFloat(v1.value);
        const b = parseFloat(v2.value);
        if (isNaN(a) || isNaN(b)) {
          res.innerText = "0";
          return;
        }
        if (mode === "whatis") res.innerText = (a / 100 * b).toFixed(2);
        else res.innerText = (a / b * 100).toFixed(2) + "%";
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
            <div id="result-area" class="tool-process-area p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Your Age</div>
                <div id="age-val" class="text-5xl font-bold text-blue-600 dark:text-blue-400">0 Years</div>
                <div id="age-detail" class="text-sm text-slate-400 mt-4">Select your birth date</div>
            </div>
        `;
      const dobInput = container.querySelector("#dob");
      const ageVal = container.querySelector("#age-val");
      const ageDetail = container.querySelector("#age-detail");
      dobInput.onchange = () => {
        const birthDate = new Date(dobInput.value);
        const today = /* @__PURE__ */ new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) {
          age--;
        }
        ageVal.innerText = age + " Years";
        ageDetail.innerText = `Born on ${birthDate.toDateString()}`;
      };
    },
    // 36. BMI Calculator
    renderBmiCalc: (container) => {
      container.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" class="form-control" id="weight" placeholder="e.g. 70">
                </div>
                <div class="form-group">
                    <label>Height (cm)</label>
                    <input type="number" class="form-control" id="height" placeholder="e.g. 175">
                </div>
            </div>
            <div id="result-area" class="tool-process-area p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Your BMI</div>
                <div id="bmi-val" class="text-6xl font-bold text-blue-600 dark:text-blue-400">0.0</div>
                <div class="flex justify-center mt-6">
                    <div id="bmi-status" class="status-badge px-4 py-2 rounded-full text-sm font-bold bg-slate-200 dark:bg-slate-700">Enter values</div>
                </div>
            </div>
        `;
      const w = container.querySelector("#weight");
      const h = container.querySelector("#height");
      const val = container.querySelector("#bmi-val");
      const status = container.querySelector("#bmi-status");
      function update() {
        const weight = parseFloat(w.value);
        const height = parseFloat(h.value) / 100;
        if (weight > 0 && height > 0) {
          const bmi = weight / (height * height);
          val.innerText = bmi.toFixed(1);
          status.className = "status-badge";
          if (bmi < 18.5) {
            status.innerText = "Underweight";
            status.classList.add("danger");
          } else if (bmi < 25) {
            status.innerText = "Normal";
            status.classList.add("success");
          } else if (bmi < 30) {
            status.innerText = "Overweight";
            status.classList.add("danger");
          } else {
            status.innerText = "Obese";
            status.classList.add("danger");
          }
        }
      }
      w.oninput = update;
      h.oninput = update;
    },
    // 37. EMI Calculator
    renderEmiCalc: (container) => {
      container.innerHTML = `
            <div class="space-y-4">
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
            </div>
            <div id="result-area" class="tool-process-area p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Monthly EMI</div>
                <div id="emi-val" class="text-5xl font-bold text-blue-600 dark:text-blue-400">$0.00</div>
            </div>
        `;
      const a = container.querySelector("#amount");
      const r = container.querySelector("#rate");
      const t = container.querySelector("#tenure");
      const res = container.querySelector("#emi-val");
      function update() {
        const p = parseFloat(a.value);
        const rate = parseFloat(r.value) / 12 / 100;
        const n = parseFloat(t.value);
        if (p > 0 && rate > 0 && n > 0) {
          const emi = p * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
          res.innerText = "$" + emi.toFixed(2);
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
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label>Original Price</label>
                    <input type="number" class="form-control" id="price">
                </div>
                <div class="form-group">
                    <label>Discount (%)</label>
                    <input type="number" class="form-control" id="discount">
                </div>
            </div>
            <div id="result-area" class="tool-process-area p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center">
                        <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Final Price</div>
                        <div id="final-price" class="text-2xl font-bold text-slate-900 dark:text-white">$0.00</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">You Save</div>
                        <div id="savings" class="text-2xl font-bold text-green-600 dark:text-green-400">$0.00</div>
                    </div>
                </div>
            </div>
        `;
      const p = container.querySelector("#price");
      const d = container.querySelector("#discount");
      const fp = container.querySelector("#final-price");
      const s = container.querySelector("#savings");
      function update() {
        const price = parseFloat(p.value) || 0;
        const disc = parseFloat(d.value) || 0;
        const saved = price * (disc / 100);
        const final = price - saved;
        fp.innerText = "$" + final.toFixed(2);
        s.innerText = "$" + saved.toFixed(2);
      }
      p.oninput = update;
      d.oninput = update;
    },
    // 34. CGPA Calculator
    renderCgpaCalc: (container) => {
      container.innerHTML = `
            <div id="semesters" class="space-y-3">
                <div class="sem-row grid grid-cols-2 gap-4">
                    <input type="number" class="form-control gpa" placeholder="GPA (e.g. 8.5)" step="0.01">
                    <input type="number" class="form-control credit" placeholder="Credits" value="20">
                </div>
            </div>
            <div class="tool-process-area">
                <button class="btn btn-outline" id="add-sem">+ Add Semester</button>
                <div class="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Overall CGPA</div>
                    <div id="cgpa-res" class="text-5xl font-bold text-blue-600 dark:text-blue-400">0.00</div>
                </div>
            </div>
        `;
      const sems = container.querySelector("#semesters");
      const res = container.querySelector("#cgpa-res");
      const calc = () => {
        let totalPoints = 0;
        let totalCredits = 0;
        sems.querySelectorAll(".sem-row").forEach((row) => {
          const gpa = parseFloat(row.querySelector(".gpa").value) || 0;
          const credit = parseFloat(row.querySelector(".credit").value) || 0;
          totalPoints += gpa * credit;
          totalCredits += credit;
        });
        res.innerText = totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
      };
      container.querySelector("#add-sem").onclick = () => {
        const div = document.createElement("div");
        div.className = "sem-row grid-2";
        div.style.marginBottom = "12px";
        div.innerHTML = `
                <input type="number" class="form-control gpa" placeholder="GPA" step="0.01">
                <input type="number" class="form-control credit" placeholder="Credits" value="20">
            `;
        div.querySelectorAll("input").forEach((i) => i.oninput = calc);
        sems.appendChild(div);
      };
      sems.querySelectorAll("input").forEach((i) => i.oninput = calc);
    },
    // 38. GST Calculator
    renderGstCalc: (container) => {
      container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            <div class="tool-process-area grid grid-cols-2 gap-4">
                <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">GST Amount</div>
                    <div id="gst-amt" class="text-xl font-bold text-slate-900 dark:text-white">$180.00</div>
                </div>
                <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Amount</div>
                    <div id="total-amt" class="text-xl font-bold text-slate-900 dark:text-white">$1180.00</div>
                </div>
            </div>
        `;
      const amtInput = container.querySelector("#amt");
      const rateSelect = container.querySelector("#rate");
      const gstEl = container.querySelector("#gst-amt");
      const totalEl = container.querySelector("#total-amt");
      const calc = () => {
        const amt = parseFloat(amtInput.value) || 0;
        const rate = parseFloat(rateSelect.value);
        const gst = amt * rate / 100;
        gstEl.innerText = "$" + gst.toFixed(2);
        totalEl.innerText = "$" + (amt + gst).toFixed(2);
      };
      amtInput.oninput = calc;
      rateSelect.onchange = calc;
    },
    // 40. Unit Converter
    renderUnitConv: (container) => {
      const units = {
        length: {
          meters: 1,
          kilometers: 1e-3,
          centimeters: 100,
          millimeters: 1e3,
          inches: 39.3701,
          feet: 3.28084,
          yards: 1.09361,
          miles: 621371e-9
        },
        weight: {
          kilograms: 1,
          grams: 1e3,
          milligrams: 1e6,
          pounds: 2.20462,
          ounces: 35.274
        },
        temperature: {
          celsius: (v) => v,
          fahrenheit: (v) => v * 9 / 5 + 32,
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="form-group">
                    <label>From</label>
                    <input type="number" class="form-control" id="from-val" value="1">
                    <select class="form-control mt-2" id="from-unit"></select>
                </div>
                <div class="form-group">
                    <label>To</label>
                    <input type="number" class="form-control" id="to-val" readonly>
                    <select class="form-control mt-2" id="to-unit"></select>
                </div>
            </div>
        `;
      const cat = container.querySelector("#category");
      const fromVal = container.querySelector("#from-val");
      const toVal = container.querySelector("#to-val");
      const fromUnit = container.querySelector("#from-unit");
      const toUnit = container.querySelector("#to-unit");
      const updateUnits = () => {
        const c = cat.value;
        const options = Object.keys(units[c]).map((u) => `<option value="${u}">${u.charAt(0).toUpperCase() + u.slice(1)}</option>`).join("");
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
          toVal.value = "";
          return;
        }
        if (c === "temperature") {
          let base;
          if (f === "celsius") base = val;
          else if (f === "fahrenheit") base = (val - 32) * 5 / 9;
          else if (f === "kelvin") base = val - 273.15;
          if (t === "celsius") toVal.value = base.toFixed(2);
          else if (t === "fahrenheit") toVal.value = (base * 9 / 5 + 32).toFixed(2);
          else if (t === "kelvin") toVal.value = (base + 273.15).toFixed(2);
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
            <div class="space-y-4">
                <div class="form-group">
                    <label>Monthly Investment (\u20B9)</label>
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
            </div>
            <div class="tool-process-area">
                <button class="btn btn-primary" id="calc-btn">Calculate Returns</button>
                <div id="result-area" style="display:none" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Invested Amount</div>
                            <div class="text-lg font-bold text-slate-900 dark:text-white" id="invested-amt">\u20B90</div>
                        </div>
                        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Est. Returns</div>
                            <div class="text-lg font-bold text-slate-900 dark:text-white" id="est-returns">\u20B90</div>
                        </div>
                    </div>
                    <div class="p-8 bg-blue-600 rounded-2xl text-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                        <div class="text-xs uppercase tracking-wider font-semibold opacity-80 mb-2">Total Value</div>
                        <div class="text-4xl font-bold" id="total-val">\u20B90</div>
                    </div>
                </div>
            </div>
        `;
      container.querySelector("#calc-btn").onclick = () => {
        const P = Number(container.querySelector("#monthly-amt").value);
        const r = Number(container.querySelector("#return-rate").value) / 12 / 100;
        const n = Number(container.querySelector("#years").value) * 12;
        const total = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const invested = P * n;
        const returns = total - invested;
        container.querySelector("#invested-amt").innerText = "\u20B9" + Math.round(invested).toLocaleString("en-IN");
        container.querySelector("#est-returns").innerText = "\u20B9" + Math.round(returns).toLocaleString("en-IN");
        container.querySelector("#total-val").innerText = "\u20B9" + Math.round(total).toLocaleString("en-IN");
        container.querySelector("#result-area").style.display = "block";
      };
    },
    // 10. FD Calculator
    renderFdCalc: (container) => {
      container.innerHTML = `
            <div class="space-y-4">
                <div class="form-group">
                    <label>Total Investment (\u20B9)</label>
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
            </div>
            <div class="tool-process-area">
                <button class="btn btn-primary" id="calc-btn">Calculate Maturity</button>
                <div id="result-area" style="display:none" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Invested Amount</div>
                            <div class="text-lg font-bold text-slate-900 dark:text-white" id="invested-amt">\u20B90</div>
                        </div>
                        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Interest</div>
                            <div class="text-lg font-bold text-slate-900 dark:text-white" id="total-interest">\u20B90</div>
                        </div>
                    </div>
                    <div class="p-8 bg-blue-600 rounded-2xl text-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                        <div class="text-xs uppercase tracking-wider font-semibold opacity-80 mb-2">Maturity Value</div>
                        <div class="text-4xl font-bold" id="maturity-val">\u20B90</div>
                    </div>
                </div>
            </div>
        `;
      container.querySelector("#calc-btn").onclick = () => {
        const P = Number(container.querySelector("#principal").value);
        const r = Number(container.querySelector("#rate").value);
        const t = Number(container.querySelector("#years").value);
        const n = 4;
        const total = P * Math.pow(1 + r / 100 / n, n * t);
        const interest = total - P;
        container.querySelector("#invested-amt").innerText = "\u20B9" + Math.round(P).toLocaleString("en-IN");
        container.querySelector("#total-interest").innerText = "\u20B9" + Math.round(interest).toLocaleString("en-IN");
        container.querySelector("#maturity-val").innerText = "\u20B9" + Math.round(total).toLocaleString("en-IN");
        container.querySelector("#result-area").style.display = "block";
      };
    },
    // 11. CGPA to Percentage
    renderCgpaToPerc: (container) => {
      container.innerHTML = `
            <div class="form-group">
                <label>Enter CGPA (10-point scale)</label>
                <input type="number" class="form-control" id="cgpa" value="9.5" step="0.01" min="0" max="10">
            </div>
            <div class="tool-process-area">
                <button class="btn btn-primary" id="calc-btn">Convert to Percentage</button>
                <div id="result-area" style="display:none" class="text-center">
                    <div class="p-8 bg-slate-50 dark:bg-slate-800/50 border-2 border-blue-500 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none">
                        <div class="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-2">Your Percentage is</div>
                        <div class="text-6xl font-bold text-blue-600 dark:text-blue-400" id="perc-val">0%</div>
                        <div class="mt-4 text-xs text-slate-400">Formula: CGPA \xD7 9.5</div>
                    </div>
                </div>
            </div>
        `;
      container.querySelector("#calc-btn").onclick = () => {
        const cgpa = Number(container.querySelector("#cgpa").value);
        if (cgpa > 10 || cgpa < 0) return alert("Please enter CGPA between 0 and 10");
        const perc = cgpa * 9.5;
        container.querySelector("#perc-val").innerText = perc.toFixed(2) + "%";
        container.querySelector("#result-area").style.display = "block";
      };
    }
  };
  var calcToolMethods = [];
  calcToolMethods.forEach((method) => {
    if (!CalcTools[method]) {
      CalcTools[method] = (container) => {
        container.innerHTML = `<div style="text-align:center; padding:40px">
                <p>The <strong>${method.replace("render", "")}</strong> tool is coming soon.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top:20px">Go Back</button>
            </div>`;
      };
    }
  });
})();
