const checklistItems = [

    "Engine oil",

    "Coolant level",

    "Fuel level",

    "Hydraulic oil",

    "Tyres",

    "Blade condition",

    "Deck condition",

    "Safety switches",

    "Parking brake",

    "Steering",

    "Horn",

    "Beacon/Lights",

    "No leaks",

    "Machine clean"

];

let currentResults = {};

const home = document.getElementById("home");

const checkForm = document.getElementById("checkForm");

const historyPage = document.getElementById("history");

const checklist = document.getElementById("checklist");

const newCheckBtn = document.getElementById("newCheck");

const viewHistoryBtn = document.getElementById("viewHistory");

const saveBtn = document.getElementById("saveCheck");

const cancelBtn = document.getElementById("cancel");

const backHomeBtn = document.getElementById("backHome");

// Create checklist

function loadChecklist() {

    checklist.innerHTML = "";

    checklistItems.forEach((item, index) => {

        currentResults[index] = "";

        const box = document.createElement("div");

        box.className = "check-item";

        box.innerHTML = `

            <div class="check-title">${item}</div>

            <button class="pass" data-id="${index}">

            ✅ Pass

            </button>

            <button class="fail" data-id="${index}">

            ❌ Fail

            </button>

        `;

        checklist.appendChild(box);

    });

    document.querySelectorAll(".pass").forEach(button => {

        button.onclick = function() {

            const id = this.dataset.id;

            currentResults[id] = "Pass";

            this.classList.add("selected");

            this.nextElementSibling.classList.remove("selected");

        };

    });

    document.querySelectorAll(".fail").forEach(button => {

        button.onclick = function() {

            const id = this.dataset.id;

            currentResults[id] = "Fail";

            this.classList.add("selected");

            this.previousElementSibling.classList.remove("selected");

        };

    });

}

// Start inspection

newCheckBtn.onclick = function() {

    home.classList.add("hidden");

    checkForm.classList.remove("hidden");

    loadChecklist();

};

// Save inspection

saveBtn.onclick = function() {

    const inspection = {

        id: Date.now(),

        machine: "Ransomes MP653XC",

        fleet: "00010",

        operator: "Adam",

        date: new Date().toLocaleString(),

        hours: document.getElementById("hours").value,

        results: currentResults,

        notes: document.getElementById("notes").value

    };

    let records =

    JSON.parse(localStorage.getItem("mowerChecks")) || [];

    records.push(inspection);

    localStorage.setItem(

        "mowerChecks",

        JSON.stringify(records)

    );

    alert("✅ Morning Check Saved");

    checkForm.classList.add("hidden");

    home.classList.remove("hidden");

};

// View history

viewHistoryBtn.onclick = function() {

    home.classList.add("hidden");

    historyPage.classList.remove("hidden");

    showHistory();

};

// Display records

function showHistory(){

    const list =

    document.getElementById("historyList");

    list.innerHTML = "";

    let records =

    JSON.parse(localStorage.getItem("mowerChecks")) || [];

    records.reverse().forEach(record => {

        let failed =

        Object.values(record.results)

        .includes("Fail");

        const card =

        document.createElement("div");

        card.className =

        "history-card " +

        (failed ? "bad" : "good");

        card.innerHTML = `

        <strong>${failed ? "❌ FAULT" : "✅ PASSED"}</strong>

        <p>${record.date}</p>

        <p>

        Hours: ${record.hours || "Not entered"}

        </p>

        <p>

        Notes: ${record.notes || "None"}

        </p>

        `;

        list.appendChild(card);

    });

}

// Navigation

cancelBtn.onclick = function(){

    checkForm.classList.add("hidden");

    home.classList.remove("hidden");

};

backHomeBtn.onclick = function(){

    historyPage.classList.add("hidden");

    home.classList.remove("hidden");

};
