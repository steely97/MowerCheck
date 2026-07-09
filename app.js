// =========================
// MowerCheck v2
// Dashboard Navigation
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const screens = {
    home: document.getElementById("home"),
    machines: document.getElementById("machinesScreen"),
    inspection: document.getElementById("inspectionScreen")
};

    function showScreen(screenName) {

        Object.values(screens).forEach(screen => {
            if (screen) screen.classList.add("hidden");
        });

        if (screens[screenName]) {
            screens[screenName].classList.remove("hidden");
        }

    }

}
    // Dashboard buttons
const newInspection = document.getElementById("newInspection");

if (newInspection) {

    newInspection.addEventListener("click", () => {

        populateMachineList();

        showScreen("inspection");

    });

}
    const manageMachines = document.getElementById("manageMachines");

    if (manageMachines) {

        manageMachines.addEventListener("click", () => {

            showScreen("machines");

            renderMachines();

        });

    }

    const backHome = document.getElementById("backHome");

    if (backHome) {

        backHome.addEventListener("click", () => {

            showScreen("home");

        });

    }
const inspectionBack =
document.getElementById("inspectionBack");

if (inspectionBack) {

    inspectionBack.addEventListener("click", () => {

        showScreen("home");

    });

}
    // Add Machine

    const saveButton = document.getElementById("saveMachine");

    if (saveButton) {

        saveButton.addEventListener("click", () => {

            const input = document.getElementById("newMachine");

            const name = input.value.trim();

            if (name === "") {
                alert("Enter a machine model.");
                return;
            }

            if (!addMachine(name)) {
                alert("Machine already exists.");
                return;
            }

            input.value = "";

            renderMachines();

        });

    }

    showScreen("home");

});

function renderMachines() {

    const list = document.getElementById("machineList");

    if (!list) return;

    list.innerHTML = "";

    getMachines().forEach((machine, index) => {

        const item = document.createElement("div");

        item.className = "machine-item";

        item.innerHTML = `
            <span>${machine}</span>
            <button onclick="removeMachine(${index})">
                Delete
            </button>
        `;

        list.appendChild(item);

    });

}

function removeMachine(index) {

    deleteMachine(index);

    renderMachines();

}function populateMachineList() {

    const select = document.getElementById("machineSelect");

    if (!select) return;

    select.innerHTML = "";

    getMachines().forEach(machine => {

        const option = document.createElement("option");

        option.value = machine;

        option.textContent = machine;

        select.appendChild(option);

    });

}