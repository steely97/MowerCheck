// MowerCheck Machines Logic (CLEAN + WORKING)

// STORAGE
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// GET MACHINES
function getMachines() {
  return getData('machines');
}

// ELEMENT HELPER
function el(id) {
  return document.getElementById(id);
}

// LOAD MACHINES LIST
function loadMachines() {
  const list = el('machineList');
  if (!list) return;

  const machines = getMachines();
  list.innerHTML = '';

  machines.forEach((machine, index) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <span>${machine.name} (${machine.fleet})</span>
      <button data-index="${index}">Delete</button>
    `;

    li.querySelector('button').onclick = () => deleteMachine(index);

    list.appendChild(li);
  });

  populateMachineDropdown();
}

// ADD MACHINE
function addMachine() {
  const nameInput = el('machineName');
  const fleetInput = el('fleetNumberInput');

  const name = nameInput.value.trim();
  const fleet = fleetInput.value.trim();

  if (!name || !fleet) {
    alert('Enter machine name and fleet number');
    return;
  }

  const machines = getMachines();
  machines.push({ name, fleet });

  saveData('machines', machines);

  nameInput.value = '';
  fleetInput.value = '';

  loadMachines();
}

// DELETE MACHINE
function deleteMachine(index) {
  const machines = getMachines();
  machines.splice(index, 1);
  saveData('machines', machines);
  loadMachines();
}

// DROPDOWN
function populateMachineDropdown() {
  const select = el('inspectionMachine');
  if (!select) return;

  const machines = getMachines();
  select.innerHTML = '';

  machines.forEach(machine => {
    const option = document.createElement('option');
    option.value = machine.name;
    option.textContent = `${machine.name} (${machine.fleet})`;
    option.dataset.fleet = machine.fleet;
    select.appendChild(option);
  });
}

// AUTO SELECT + AUTO START
function handleMachineSelect() {
  const select = el('inspectionMachine');
  const fleetField = el('fleetNumber');
  const operatorInput = el('operatorName');

  if (!select) return;

  select.addEventListener('change', function () {
    const selected = this.options[this.selectedIndex];

    // Fill fleet
    if (fleetField) {
      fleetField.value = selected.dataset.fleet || '';
      fleetField.setAttribute('readonly', true);
    }

    // Fill operator
    const operator = localStorage.getItem('operatorName');
    if (operatorInput && operator) {
      operatorInput.value = operator;
    }

   
  });

  // Trigger once
  if (select.options.length > 0) {
    select.dispatchEvent(new Event('change'));
  }
}

// INIT
function initMachines() {
  const addBtn = el('addMachineBtn');

  if (addBtn) {
    addBtn.onclick = addMachine;
  }

  loadMachines();
  handleMachineSelect();
}

document.addEventListener('DOMContentLoaded', initMachines);