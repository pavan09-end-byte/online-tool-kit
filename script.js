const categories = [
  "All",
  "Academic Calculators",
  "Math & Logic",
  "Converters",
  "Productivity",
  "Utility",
  "Text & Writing",
  "Student-Specific",
  "Fun",
  "Advanced"
];

const tools = [
  ["cgpa", "CGPA Calculator", "Academic Calculators"],
  ["sgpa", "SGPA Calculator", "Academic Calculators"],
  ["percentage", "Percentage Calculator", "Academic Calculators"],
  ["marks-needed", "Marks Needed Calculator", "Academic Calculators"],
  ["attendance", "Attendance Calculator", "Academic Calculators"],
  ["gpa-percentage", "GPA to Percentage Converter", "Academic Calculators"],
  ["study-planner", "Study Time Planner", "Academic Calculators"],
  ["exam-countdown", "Exam Countdown Timer", "Academic Calculators"],

  ["simple-calc", "Simple Calculator", "Math & Logic"],
  ["scientific-calc", "Scientific Calculator", "Math & Logic"],
  ["bmi", "BMI Calculator", "Math & Logic"],
  ["age", "Age Calculator", "Math & Logic"],
  ["discount", "Discount Calculator", "Math & Logic"],
  ["emi", "Loan EMI Calculator", "Math & Logic"],
  ["duration", "Time Duration Calculator", "Math & Logic"],
  ["base-converter", "Number Base Converter", "Math & Logic"],
  ["prime", "Prime Number Checker", "Math & Logic"],
  ["factorial", "Factorial Calculator", "Math & Logic"],

  ["unit", "Unit Converter", "Converters"],
  ["temp", "Temperature Converter", "Converters"],
  ["currency", "Currency Converter (Static Rates)", "Converters"],
  ["bin-dec", "Binary ↔ Decimal Converter", "Converters"],
  ["text-case", "Text Case Converter", "Converters"],
  ["word-counter", "Word Counter", "Converters"],
  ["char-counter", "Character Counter", "Converters"],

  ["todo", "To-Do List", "Productivity"],
  ["notes", "Notes App", "Productivity"],
  ["pomodoro", "Pomodoro Timer", "Productivity"],
  ["password", "Password Generator", "Productivity"],
  ["random-number", "Random Number Generator", "Productivity"],
  ["name-picker", "Random Name Picker", "Productivity"],
  ["daily-planner", "Daily Planner", "Productivity"],

  ["qr", "QR Code Generator", "Utility"],
  ["url", "URL Encoder/Decoder", "Utility"],
  ["json", "JSON Formatter", "Utility"],
  ["color", "Color Picker Tool", "Utility"],
  ["gradient", "Gradient Generator", "Utility"],
  ["stopwatch", "Stopwatch", "Utility"],
  ["countdown", "Countdown Timer", "Utility"],
  ["text-diff", "Text Diff Checker", "Utility"],

  ["text-reverse", "Text Reverser", "Text & Writing"],
  ["spaces", "Remove Extra Spaces", "Text & Writing"],
  ["case-converter", "Case Converter", "Text & Writing"],
  ["palindrome", "Palindrome Checker", "Text & Writing"],
  ["slug", "Slug Generator", "Text & Writing"],

  ["internship", "Internship Tracker", "Student-Specific"],
  ["resume-score", "Resume Score Checker", "Student-Specific"],
  ["goal-tracker", "Study Goal Tracker", "Student-Specific"],
  ["habit", "Habit Tracker", "Student-Specific"],
  ["assignment", "Assignment Tracker", "Student-Specific"],

  ["dice", "Dice Roller", "Fun"],
  ["coin", "Coin Toss", "Fun"],
  ["quote", "Random Quote Generator", "Fun"],
  ["motivation", "Motivational Message Generator", "Fun"],

  ["flashcards", "Flashcard Tool", "Advanced"],
  ["quiz", "Quiz Generator", "Advanced"],
  ["graph", "Graph Plotter", "Advanced"],
  ["typing", "Typing Speed Test", "Advanced"]
].map(([id, name, category]) => ({ id, name, category }));

const state = {
  activeCategory: "All",
  search: "",
  activeIntervals: []
};

const el = {
  grid: document.getElementById("toolsGrid"),
  filters: document.getElementById("filterButtons"),
  search: document.getElementById("searchInput"),
  panel: document.getElementById("toolPanel"),
  panelTitle: document.getElementById("panelTitle"),
  panelBody: document.getElementById("panelBody"),
  closePanel: document.getElementById("closePanel"),
  darkToggle: document.getElementById("darkToggle")
};

const num = (value) => Number(value);
const safeNum = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function clearIntervals() {
  state.activeIntervals.forEach((id) => clearInterval(id));
  state.activeIntervals = [];
}

function resultBox(message = "Result will appear here.") {
  return `<div class="result" id="result">${message}</div>`;
}

function attachResetButton(scope) {
  const reset = scope.querySelector("[data-reset]");
  if (!reset) return;
  reset.addEventListener("click", () => {
    scope.querySelectorAll("input, textarea, select").forEach((input) => {
      if (input.type === "checkbox") input.checked = false;
      else if (input.tagName === "SELECT") input.selectedIndex = 0;
      else input.value = "";
    });
    const result = scope.querySelector("#result");
    if (result) result.textContent = "Result will appear here.";
  });
}

function createBasicForm(fields, onCalculate) {
  const wrapper = document.createElement("div");
  const fieldsHtml = fields.length
    ? `<div class="row">
      ${fields
        .map(
          (f) =>
            `<input id="${f.id}" type="${f.type || "number"}" placeholder="${f.label}" ${
              f.step ? `step="${f.step}"` : ""
            } />`
        )
        .join("")}
    </div>`
    : "";
  wrapper.innerHTML = `
    ${fieldsHtml}
    <div class="row">
      <button class="btn" id="calculateBtn">Calculate</button>
      <button class="btn ghost" data-reset>Reset</button>
    </div>
    ${resultBox()}
  `;

  const result = wrapper.querySelector("#result");
  wrapper.querySelector("#calculateBtn").addEventListener("click", () => {
    try {
      const out = onCalculate(wrapper);
      result.textContent = out;
    } catch (error) {
      result.textContent = error.message || "Invalid input.";
    }
  });

  attachResetButton(wrapper);
  el.panelBody.appendChild(wrapper);
}

function createTextTool(onProcess, placeholder = "Enter text") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <textarea id="textInput" placeholder="${placeholder}"></textarea>
    <div class="row">
      <button class="btn" id="processBtn">Process</button>
      <button class="btn ghost" data-reset>Reset</button>
    </div>
    ${resultBox()}
  `;
  const result = wrapper.querySelector("#result");

  wrapper.querySelector("#processBtn").addEventListener("click", () => {
    try {
      const text = wrapper.querySelector("#textInput").value;
      result.textContent = onProcess(text);
    } catch (error) {
      result.textContent = error.message || "Invalid input.";
    }
  });

  attachResetButton(wrapper);
  el.panelBody.appendChild(wrapper);
}

function createStorageList(key, inputLabel) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="row">
      <input id="itemInput" placeholder="${inputLabel}" />
      <button class="btn" id="addBtn">Add</button>
    </div>
    <div class="list" id="list"></div>
  `;

  const listEl = wrapper.querySelector("#list");
  const read = () => JSON.parse(localStorage.getItem(key) || "[]");
  const write = (arr) => localStorage.setItem(key, JSON.stringify(arr));

  function draw() {
    const items = read();
    listEl.innerHTML = items
      .map(
        (item, index) =>
          `<div class="list-item"><span>${item}</span><button class="btn ghost" data-delete="${index}">Delete</button></div>`
      )
      .join("");
  }

  wrapper.querySelector("#addBtn").addEventListener("click", () => {
    const input = wrapper.querySelector("#itemInput");
    const value = input.value.trim();
    if (!value) return;
    const items = read();
    items.push(value);
    write(items);
    input.value = "";
    draw();
  });

  listEl.addEventListener("click", (event) => {
    const index = event.target.dataset.delete;
    if (index === undefined) return;
    const items = read();
    items.splice(Number(index), 1);
    write(items);
    draw();
  });

  draw();
  el.panelBody.appendChild(wrapper);
}

function createTimerTool(initialSeconds, mode = "countdown") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="result" id="result">00:00</div>
    <div class="row">
      <button class="btn" id="startBtn">Start</button>
      <button class="btn ghost" id="stopBtn">Stop</button>
      <button class="btn ghost" id="resetBtn">Reset</button>
    </div>
  `;

  let seconds = initialSeconds;
  let intervalId = null;

  const format = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const result = wrapper.querySelector("#result");
  result.textContent = format(seconds);

  wrapper.querySelector("#startBtn").addEventListener("click", () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (mode === "countdown") {
        seconds -= 1;
        if (seconds <= 0) {
          seconds = 0;
          clearInterval(intervalId);
          intervalId = null;
        }
      } else {
        seconds += 1;
      }
      result.textContent = format(seconds);
    }, 1000);
    state.activeIntervals.push(intervalId);
  });

  wrapper.querySelector("#stopBtn").addEventListener("click", () => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  });

  wrapper.querySelector("#resetBtn").addEventListener("click", () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    seconds = initialSeconds;
    result.textContent = format(seconds);
  });

  el.panelBody.appendChild(wrapper);
}

function openTool(tool) {
  clearIntervals();
  el.panelTitle.textContent = tool.name;
  el.panelBody.innerHTML = "";
  renderTool(tool.id);
  el.panel.classList.remove("hidden");
}

function renderTool(id) {
  const quotes = [
    "Small steps daily create big results.",
    "Consistency is your superpower.",
    "Plan smart, study better."
  ];

  const motivation = [
    "You are closer than you think.",
    "One focused hour beats ten distracted hours.",
    "Today’s effort builds tomorrow’s confidence."
  ];

  switch (id) {
    case "cgpa":
    case "sgpa":
      createBasicForm(
        [
          { id: "gradePoints", label: "Total grade points" },
          { id: "credits", label: "Total credits" }
        ],
        (scope) => {
          const gp = safeNum(scope.querySelector("#gradePoints").value);
          const credits = safeNum(scope.querySelector("#credits").value);
          if (credits <= 0) throw new Error("Credits must be greater than 0.");
          return `Result: ${(gp / credits).toFixed(2)}`;
        }
      );
      break;

    case "percentage":
      createBasicForm(
        [
          { id: "obtained", label: "Obtained marks" },
          { id: "total", label: "Total marks" }
        ],
        (scope) => {
          const obtained = safeNum(scope.querySelector("#obtained").value);
          const total = safeNum(scope.querySelector("#total").value);
          if (total <= 0) throw new Error("Total marks must be greater than 0.");
          return `Percentage: ${((obtained / total) * 100).toFixed(2)}%`;
        }
      );
      break;

    case "marks-needed":
      createBasicForm(
        [
          { id: "target", label: "Target percentage" },
          { id: "examTotal", label: "Exam total marks" },
          { id: "current", label: "Current marks" }
        ],
        (scope) => {
          const target = safeNum(scope.querySelector("#target").value);
          const total = safeNum(scope.querySelector("#examTotal").value);
          const current = safeNum(scope.querySelector("#current").value);
          const needed = (target * total) / 100 - current;
          return needed <= 0 ? "You already reached your target." : `Need ${needed.toFixed(2)} more marks.`;
        }
      );
      break;

    case "attendance":
      createBasicForm(
        [
          { id: "attended", label: "Classes attended" },
          { id: "total", label: "Total classes" },
          { id: "target", label: "Target percentage" }
        ],
        (scope) => {
          const attended = safeNum(scope.querySelector("#attended").value);
          const total = safeNum(scope.querySelector("#total").value);
          const target = safeNum(scope.querySelector("#target").value);
          if (total <= 0) throw new Error("Total classes must be greater than 0.");
          const current = (attended / total) * 100;
          const extra = Math.max(0, Math.ceil((target * total - 100 * attended) / (100 - target)));
          return `Current: ${current.toFixed(2)}%. Extra classes needed: ${Number.isFinite(extra) ? extra : 0}`;
        }
      );
      break;

    case "gpa-percentage":
      createBasicForm([{ id: "gpa", label: "GPA", step: "0.01" }], (scope) => {
        const gpa = safeNum(scope.querySelector("#gpa").value);
        return `Approx percentage: ${(gpa * 9.5).toFixed(2)}%`;
      });
      break;

    case "study-planner":
      createBasicForm(
        [
          { id: "subjects", label: "Number of subjects" },
          { id: "hours", label: "Total study hours/day", step: "0.1" }
        ],
        (scope) => {
          const subjects = safeNum(scope.querySelector("#subjects").value);
          const hours = safeNum(scope.querySelector("#hours").value);
          if (subjects <= 0) throw new Error("Subjects must be greater than 0.");
          return `Study ${(hours / subjects).toFixed(2)} hours per subject.`;
        }
      );
      break;

    case "exam-countdown":
      createBasicForm([{ id: "date", label: "Exam date", type: "date" }], (scope) => {
        const date = new Date(scope.querySelector("#date").value);
        if (Number.isNaN(date.getTime())) throw new Error("Pick a valid date.");
        const days = Math.max(0, Math.ceil((date - new Date()) / 86400000));
        return `Days left: ${days}`;
      });
      break;

    case "simple-calc":
      createBasicForm([{ id: "a", label: "First number" }, { id: "b", label: "Second number" }, { id: "op", label: "Operator (+ - * /)", type: "text" }], (scope) => {
        const a = safeNum(scope.querySelector("#a").value);
        const b = safeNum(scope.querySelector("#b").value);
        const op = scope.querySelector("#op").value.trim();
        if (op === "+") return `Result: ${(a + b).toFixed(4)}`;
        if (op === "-") return `Result: ${(a - b).toFixed(4)}`;
        if (op === "*") return `Result: ${(a * b).toFixed(4)}`;
        if (op === "/") return b === 0 ? "Cannot divide by zero." : `Result: ${(a / b).toFixed(4)}`;
        throw new Error("Use one operator: + - * /");
      });
      break;

    case "scientific-calc":
      createBasicForm([{ id: "n", label: "Number", step: "0.001" }], (scope) => {
        const n = safeNum(scope.querySelector("#n").value);
        return `sqrt=${Math.sqrt(Math.max(0, n)).toFixed(4)} | sin=${Math.sin(n).toFixed(4)} | cos=${Math.cos(n).toFixed(4)} | log10=${Math.log10(Math.max(1, n)).toFixed(4)}`;
      });
      break;

    case "bmi":
      createBasicForm([{ id: "weight", label: "Weight (kg)", step: "0.1" }, { id: "height", label: "Height (m)", step: "0.01" }], (scope) => {
        const w = safeNum(scope.querySelector("#weight").value);
        const h = safeNum(scope.querySelector("#height").value);
        if (h <= 0) throw new Error("Height must be greater than 0.");
        const bmi = w / (h * h);
        return `BMI: ${bmi.toFixed(2)}`;
      });
      break;

    case "age":
      createBasicForm([{ id: "dob", label: "Date of birth", type: "date" }], (scope) => {
        const dob = new Date(scope.querySelector("#dob").value);
        if (Number.isNaN(dob.getTime())) throw new Error("Pick a valid date.");
        const age = Math.floor((Date.now() - dob.getTime()) / 31557600000);
        return `Age: ${age} years`;
      });
      break;

    case "discount":
      createBasicForm([{ id: "price", label: "Original price" }, { id: "discount", label: "Discount (%)" }], (scope) => {
        const price = safeNum(scope.querySelector("#price").value);
        const discount = safeNum(scope.querySelector("#discount").value);
        const final = price * (1 - discount / 100);
        return `Final price: ${final.toFixed(2)}`;
      });
      break;

    case "emi":
      createBasicForm(
        [
          { id: "principal", label: "Loan amount" },
          { id: "interest", label: "Annual interest (%)", step: "0.01" },
          { id: "months", label: "Months" }
        ],
        (scope) => {
          const p = safeNum(scope.querySelector("#principal").value);
          const r = safeNum(scope.querySelector("#interest").value) / 1200;
          const n = safeNum(scope.querySelector("#months").value);
          if (n <= 0) throw new Error("Months must be greater than 0.");
          if (r === 0) return `EMI: ${(p / n).toFixed(2)}`;
          const emi = (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
          return `EMI: ${emi.toFixed(2)}`;
        }
      );
      break;

    case "duration":
      createBasicForm(
        [
          { id: "start", label: "Start datetime", type: "datetime-local" },
          { id: "end", label: "End datetime", type: "datetime-local" }
        ],
        (scope) => {
          const start = new Date(scope.querySelector("#start").value);
          const end = new Date(scope.querySelector("#end").value);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("Pick valid dates.");
          const hours = (end - start) / 3600000;
          return `Duration: ${hours.toFixed(2)} hours`;
        }
      );
      break;

    case "base-converter":
      createBasicForm([{ id: "value", label: "Number" }, { id: "from", label: "From base" }, { id: "to", label: "To base" }], (scope) => {
        const value = scope.querySelector("#value").value.trim();
        const from = safeNum(scope.querySelector("#from").value);
        const to = safeNum(scope.querySelector("#to").value);
        if (from < 2 || from > 36 || to < 2 || to > 36) throw new Error("Bases must be 2 to 36.");
        const parsed = parseInt(value, from);
        if (Number.isNaN(parsed)) throw new Error("Invalid number for input base.");
        return `Converted: ${parsed.toString(to).toUpperCase()}`;
      });
      break;

    case "prime":
      createBasicForm([{ id: "n", label: "Number" }], (scope) => {
        const n = Math.floor(safeNum(scope.querySelector("#n").value));
        if (n < 2) return "Not prime";
        for (let i = 2; i <= Math.sqrt(n); i += 1) {
          if (n % i === 0) return "Not prime";
        }
        return "Prime number";
      });
      break;

    case "factorial":
      createBasicForm([{ id: "n", label: "Number (0-170)" }], (scope) => {
        const n = Math.floor(safeNum(scope.querySelector("#n").value));
        if (n < 0 || n > 170) throw new Error("Enter between 0 and 170.");
        let out = 1;
        for (let i = 2; i <= n; i += 1) out *= i;
        return `Factorial: ${out}`;
      });
      break;

    case "unit": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="row">
          <input id="value" type="number" placeholder="Value" />
          <select id="mode">
            <option value="m-km">Meters → Kilometers</option>
            <option value="km-m">Kilometers → Meters</option>
            <option value="kg-g">Kilograms → Grams</option>
            <option value="g-kg">Grams → Kilograms</option>
          </select>
        </div>
        <div class="row">
          <button class="btn" id="calculateBtn">Convert</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        ${resultBox()}
      `;
      wrapper.querySelector("#calculateBtn").addEventListener("click", () => {
        const value = safeNum(wrapper.querySelector("#value").value);
        const mode = wrapper.querySelector("#mode").value;
        const map = {
          "m-km": `${(value / 1000).toFixed(4)} km`,
          "km-m": `${(value * 1000).toFixed(2)} m`,
          "kg-g": `${(value * 1000).toFixed(2)} g`,
          "g-kg": `${(value / 1000).toFixed(4)} kg`
        };
        wrapper.querySelector("#result").textContent = map[mode];
      });
      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "temp":
      createBasicForm([{ id: "c", label: "Celsius", step: "0.1" }], (scope) => {
        const c = safeNum(scope.querySelector("#c").value);
        const f = (c * 9) / 5 + 32;
        const k = c + 273.15;
        return `Fahrenheit: ${f.toFixed(2)}°F | Kelvin: ${k.toFixed(2)}K`;
      });
      break;

    case "currency":
      createBasicForm(
        [
          { id: "amount", label: "Amount" },
          { id: "pair", label: "Pair (USD-INR, USD-EUR, USD-GBP)", type: "text" }
        ],
        (scope) => {
          const rates = { "USD-INR": 83, "USD-EUR": 0.92, "USD-GBP": 0.78 };
          const amount = safeNum(scope.querySelector("#amount").value);
          const pair = scope.querySelector("#pair").value.trim().toUpperCase();
          if (!rates[pair]) throw new Error("Use USD-INR, USD-EUR, or USD-GBP.");
          return `${pair}: ${(amount * rates[pair]).toFixed(2)} (static rate)`;
        }
      );
      break;

    case "bin-dec":
      createBasicForm([{ id: "value", label: "Value" }, { id: "type", label: "Type: bin or dec", type: "text" }], (scope) => {
        const value = scope.querySelector("#value").value.trim();
        const type = scope.querySelector("#type").value.trim().toLowerCase();
        if (type === "bin") {
          if (!/^[01]+$/.test(value)) throw new Error("Binary must contain only 0 and 1.");
          return `Decimal: ${parseInt(value, 2)}`;
        }
        if (type === "dec") {
          if (!/^-?\d+$/.test(value)) throw new Error("Decimal must be a whole number.");
          return `Binary: ${parseInt(value, 10).toString(2)}`;
        }
        throw new Error("Type should be 'bin' or 'dec'.");
      });
      break;

    case "text-case":
    case "case-converter":
      createTextTool((text) => `UPPER: ${text.toUpperCase()}\nlower: ${text.toLowerCase()}\nTitle: ${text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}`);
      break;

    case "word-counter":
      createTextTool((text) => `Words: ${text.trim() ? text.trim().split(/\s+/).length : 0}`);
      break;

    case "char-counter":
      createTextTool((text) => `Characters: ${text.length}`);
      break;

    case "todo":
      createStorageList("student_toolkit_todo", "Add task");
      break;

    case "notes": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <textarea id="notesInput" placeholder="Write your notes..."></textarea>
        <div class="row">
          <button class="btn" id="saveBtn">Save</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        ${resultBox("Saved notes are local to your browser.")}
      `;
      const input = wrapper.querySelector("#notesInput");
      input.value = localStorage.getItem("student_toolkit_notes") || "";
      wrapper.querySelector("#saveBtn").addEventListener("click", () => {
        localStorage.setItem("student_toolkit_notes", input.value);
        wrapper.querySelector("#result").textContent = "Note saved.";
      });
      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "pomodoro":
      createTimerTool(25 * 60, "countdown");
      break;

    case "password":
      createBasicForm([{ id: "length", label: "Length" }], (scope) => {
        const len = Math.max(6, Math.min(64, Math.floor(safeNum(scope.querySelector("#length").value, 12))));
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
        let out = "";
        for (let i = 0; i < len; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
        return `Password: ${out}`;
      });
      break;

    case "random-number":
      createBasicForm([{ id: "min", label: "Min" }, { id: "max", label: "Max" }], (scope) => {
        const min = Math.floor(safeNum(scope.querySelector("#min").value));
        const max = Math.floor(safeNum(scope.querySelector("#max").value));
        if (max < min) throw new Error("Max must be greater than or equal to min.");
        return `Random: ${Math.floor(Math.random() * (max - min + 1)) + min}`;
      });
      break;

    case "name-picker":
      createTextTool((text) => {
        const names = text.split(",").map((n) => n.trim()).filter(Boolean);
        if (names.length === 0) throw new Error("Enter comma-separated names.");
        return `Picked: ${names[Math.floor(Math.random() * names.length)]}`;
      }, "Enter names separated by commas");
      break;

    case "daily-planner":
      createStorageList("student_toolkit_daily_planner", "Plan item");
      break;

    case "qr": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <input id="qrText" placeholder="Text to encode" />
        <div class="row">
          <button class="btn" id="generateBtn">Generate</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        <canvas id="qrCanvas" width="280" height="280"></canvas>
        ${resultBox("Offline QR-style pattern generated.")}
      `;

      wrapper.querySelector("#generateBtn").addEventListener("click", () => {
        const text = wrapper.querySelector("#qrText").value;
        const ctx = wrapper.querySelector("#qrCanvas").getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 280, 280);

        for (let y = 0; y < 28; y += 1) {
          for (let x = 0; x < 28; x += 1) {
            const code = (text.charCodeAt((x * 3 + y * 7) % Math.max(1, text.length)) || 0) + x + y;
            if (code % 2 === 0) {
              ctx.fillStyle = "#000";
              ctx.fillRect(x * 10, y * 10, 9, 9);
            }
          }
        }
        wrapper.querySelector("#result").textContent = "Pattern generated.";
      });

      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "url":
      createTextTool((text) => {
        let decoded = "(invalid encoded text)";
        try {
          decoded = decodeURIComponent(text);
        } catch (_) {
          decoded = "(invalid encoded text)";
        }
        return `Encoded: ${encodeURIComponent(text)}\nDecoded: ${decoded}`;
      });
      break;

    case "json":
      createTextTool((text) => JSON.stringify(JSON.parse(text), null, 2));
      break;

    case "color": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="row">
          <input id="colorInput" type="color" value="#2f6fed" />
          <input id="hexInput" type="text" value="#2f6fed" />
        </div>
        <div class="row">
          <button class="btn" id="applyBtn">Apply</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        ${resultBox()}
      `;
      const colorInput = wrapper.querySelector("#colorInput");
      const hexInput = wrapper.querySelector("#hexInput");
      colorInput.addEventListener("input", () => {
        hexInput.value = colorInput.value;
      });
      wrapper.querySelector("#applyBtn").addEventListener("click", () => {
        const hex = hexInput.value.trim();
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
          wrapper.querySelector("#result").textContent = "Invalid color. Use format #RRGGBB.";
          return;
        }
        wrapper.querySelector("#result").textContent = `Selected color: ${hex}`;
      });
      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "gradient": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="row">
          <input id="c1" type="color" value="#2f6fed" />
          <input id="c2" type="color" value="#7ec8ff" />
        </div>
        <div class="row">
          <button class="btn" id="generateBtn">Generate</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        <div class="result" id="preview">Preview appears here.</div>
      `;
      wrapper.querySelector("#generateBtn").addEventListener("click", () => {
        const c1 = wrapper.querySelector("#c1").value;
        const c2 = wrapper.querySelector("#c2").value;
        const gradient = `linear-gradient(120deg, ${c1}, ${c2})`;
        const preview = wrapper.querySelector("#preview");
        preview.style.background = gradient;
        preview.style.color = "#fff";
        preview.textContent = gradient;
      });
      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "stopwatch":
      createTimerTool(0, "stopwatch");
      break;

    case "countdown":
      createBasicForm([{ id: "seconds", label: "Seconds" }], (scope) => {
        let seconds = Math.max(0, Math.floor(safeNum(scope.querySelector("#seconds").value)));
        const result = scope.querySelector("#result");
        result.textContent = `Remaining: ${seconds}s`;
        const interval = setInterval(() => {
          seconds -= 1;
          result.textContent = `Remaining: ${Math.max(0, seconds)}s`;
          if (seconds <= 0) clearInterval(interval);
        }, 1000);
        state.activeIntervals.push(interval);
        return "Countdown started.";
      });
      break;

    case "text-diff": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="row">
          <textarea id="a" placeholder="Text A"></textarea>
          <textarea id="b" placeholder="Text B"></textarea>
        </div>
        <div class="row">
          <button class="btn" id="compareBtn">Compare</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        ${resultBox()}
      `;
      wrapper.querySelector("#compareBtn").addEventListener("click", () => {
        const a = wrapper.querySelector("#a").value;
        const b = wrapper.querySelector("#b").value;
        let diffCount = 0;
        const max = Math.max(a.length, b.length);
        for (let i = 0; i < max; i += 1) if (a[i] !== b[i]) diffCount += 1;
        wrapper.querySelector("#result").textContent = `Different character positions: ${diffCount}`;
      });
      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "text-reverse":
      createTextTool((text) => text.split("").reverse().join(""));
      break;

    case "spaces":
      createTextTool((text) => text.replace(/\s+/g, " ").trim());
      break;

    case "palindrome":
      createTextTool((text) => {
        const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!normalized) return "Enter alphanumeric text.";
        return normalized === normalized.split("").reverse().join("") ? "Palindrome" : "Not palindrome";
      });
      break;

    case "slug":
      createTextTool((text) => text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"));
      break;

    case "internship":
      createStorageList("student_toolkit_internships", "Company - status");
      break;

    case "resume-score":
      createTextTool((text) => {
        const t = text.toLowerCase();
        let score = 30;
        if (text.length > 300) score += 20;
        if (/project|projects/.test(t)) score += 15;
        if (/experience|internship/.test(t)) score += 15;
        if (/skills?/.test(t)) score += 10;
        if (/education/.test(t)) score += 10;
        return `Resume score: ${Math.min(100, score)}/100`;
      }, "Paste resume text for a basic score");
      break;

    case "goal-tracker":
      createStorageList("student_toolkit_goals", "Study goal");
      break;

    case "habit":
      createStorageList("student_toolkit_habits", "Habit");
      break;

    case "assignment":
      createStorageList("student_toolkit_assignments", "Assignment");
      break;

    case "dice":
      createBasicForm([], () => `🎲 ${Math.floor(Math.random() * 6) + 1}`);
      break;

    case "coin":
      createBasicForm([], () => (Math.random() > 0.5 ? "Heads" : "Tails"));
      break;

    case "quote":
      createBasicForm([], () => quotes[Math.floor(Math.random() * quotes.length)]);
      break;

    case "motivation":
      createBasicForm([], () => motivation[Math.floor(Math.random() * motivation.length)]);
      break;

    case "flashcards": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="row">
          <input id="question" placeholder="Question" />
          <input id="answer" placeholder="Answer" />
          <button class="btn" id="addBtn">Add</button>
        </div>
        <div class="list" id="cardsList"></div>
      `;

      const read = () => JSON.parse(localStorage.getItem("student_toolkit_flashcards") || "[]");
      const write = (arr) => localStorage.setItem("student_toolkit_flashcards", JSON.stringify(arr));
      const list = wrapper.querySelector("#cardsList");

      const draw = () => {
        const cards = read();
        list.innerHTML = cards
          .map(
            (card, index) =>
              `<div class="list-item"><span><strong>${card.q}</strong> → ${card.a}</span><button class="btn ghost" data-delete="${index}">Delete</button></div>`
          )
          .join("");
      };

      wrapper.querySelector("#addBtn").addEventListener("click", () => {
        const q = wrapper.querySelector("#question").value.trim();
        const a = wrapper.querySelector("#answer").value.trim();
        if (!q || !a) return;
        const cards = read();
        cards.push({ q, a });
        write(cards);
        wrapper.querySelector("#question").value = "";
        wrapper.querySelector("#answer").value = "";
        draw();
      });

      list.addEventListener("click", (event) => {
        const idx = event.target.dataset.delete;
        if (idx === undefined) return;
        const cards = read();
        cards.splice(Number(idx), 1);
        write(cards);
        draw();
      });

      draw();
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "quiz": {
      const questions = [
        { q: "2 + 2 = ?", a: "4" },
        { q: "Capital of France?", a: "paris" },
        { q: "HTML stands for?", a: "hypertext markup language" }
      ];
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div id="quizFields"></div>
        <div class="row">
          <button class="btn" id="submitBtn">Submit Quiz</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        ${resultBox()}
      `;
      wrapper.querySelector("#quizFields").innerHTML = questions
        .map((item, idx) => `<p>${item.q}<input id="q${idx}" /></p>`)
        .join("");

      wrapper.querySelector("#submitBtn").addEventListener("click", () => {
        let score = 0;
        questions.forEach((item, idx) => {
          const ans = wrapper.querySelector(`#q${idx}`).value.trim().toLowerCase();
          if (ans === item.a) score += 1;
        });
        wrapper.querySelector("#result").textContent = `Score: ${score}/${questions.length}`;
      });

      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "graph": {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <input id="expr" placeholder="Expression in x (e.g., x*x, Math.sin(x))" />
        <div class="row">
          <button class="btn" id="plotBtn">Plot</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        <canvas id="graphCanvas" width="600" height="320"></canvas>
        ${resultBox("Graph preview ready.")}
      `;

      wrapper.querySelector("#plotBtn").addEventListener("click", () => {
        const expr = wrapper.querySelector("#expr").value.trim() || "x";
        const canvas = wrapper.querySelector("#graphCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#d0d8e8";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        ctx.strokeStyle = "#2f6fed";
        ctx.beginPath();
        let started = false;
        for (let px = 0; px < canvas.width; px += 1) {
          const x = (px - canvas.width / 2) / 30;
          let y;
          try {
            y = Function("x", `return (${expr});`)(x);
          } catch (_) {
            wrapper.querySelector("#result").textContent = "Invalid expression.";
            return;
          }
          if (!Number.isFinite(y)) continue;
          const py = canvas.height / 2 - y * 30;
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
        wrapper.querySelector("#result").textContent = "Graph plotted.";
      });

      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    case "typing": {
      const sample = "Typing speed improves with daily focused practice.";
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <p><strong>Type this:</strong> ${sample}</p>
        <textarea id="typingInput" placeholder="Start typing..."></textarea>
        <div class="row">
          <button class="btn" id="startBtn">Start</button>
          <button class="btn" id="checkBtn">Check Speed</button>
          <button class="btn ghost" data-reset>Reset</button>
        </div>
        ${resultBox()}
      `;
      let startedAt = null;

      wrapper.querySelector("#startBtn").addEventListener("click", () => {
        startedAt = Date.now();
        wrapper.querySelector("#result").textContent = "Timer started. Type and press Check Speed.";
      });

      wrapper.querySelector("#checkBtn").addEventListener("click", () => {
        if (!startedAt) {
          wrapper.querySelector("#result").textContent = "Press Start first.";
          return;
        }
        const text = wrapper.querySelector("#typingInput").value.trim();
        const elapsedMinutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
        const words = text ? text.split(/\s+/).length : 0;
        const wpm = Math.round(words / elapsedMinutes);
        wrapper.querySelector("#result").textContent = `Typing speed: ${wpm} WPM`;
      });

      attachResetButton(wrapper);
      el.panelBody.appendChild(wrapper);
      break;
    }

    default:
      el.panelBody.innerHTML = resultBox("Tool not available.");
  }
}

function renderFilters() {
  el.filters.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "btn ghost";
    button.textContent = category;
    button.addEventListener("click", () => {
      state.activeCategory = category;
      renderToolCards();
    });
    el.filters.appendChild(button);
  });
}

function renderToolCards() {
  const term = state.search.toLowerCase().trim();
  el.grid.innerHTML = "";

  tools
    .filter(
      (tool) =>
        (state.activeCategory === "All" || tool.category === state.activeCategory) &&
        tool.name.toLowerCase().includes(term)
    )
    .forEach((tool) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `<h3>${tool.name}</h3><p>${tool.category}</p>`;
      card.addEventListener("click", () => openTool(tool));
      el.grid.appendChild(card);
    });
}

function initDarkMode() {
  if (localStorage.getItem("student_toolkit_dark_mode") === "1") {
    document.body.classList.add("dark");
  }
  el.darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("student_toolkit_dark_mode", document.body.classList.contains("dark") ? "1" : "0");
  });
}

function init() {
  renderFilters();
  renderToolCards();
  initDarkMode();

  el.search.addEventListener("input", () => {
    state.search = el.search.value;
    renderToolCards();
  });

  el.closePanel.addEventListener("click", () => {
    clearIntervals();
    el.panel.classList.add("hidden");
  });

  el.panel.addEventListener("click", (event) => {
    if (event.target === el.panel) {
      clearIntervals();
      el.panel.classList.add("hidden");
    }
  });
}

init();
