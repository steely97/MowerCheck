// MowerCheck Inspection Logic (PASS / ADVISORY / FAIL - ROBUST SAVE)

var inspectionResults = {};

var checklistData = {
  "Fluids": ["Engine Oil", "Hydraulic Oil", "Coolant", "Fuel Level"],
  "Machine": ["Blades Condition", "Tyres", "Belts", "Battery"],
  "Safety": ["Emergency Stop", "Guards", "Seat Switch", "Brakes"],
  "Final Checks": ["Cleanliness", "No Leaks", "Ready for Operation"]
};

function createEl(tag, className, text) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function clearInspectionResults() {
  Object.keys(inspectionResults).forEach(function (key) {
    delete inspectionResults[key];
  });
}

function initialiseInspectionResults() {
  clearInspectionResults();

  for (var group in checklistData) {
    inspectionResults[group] = {};

    for (var i = 0; i < checklistData[group].length; i++) {
      var item = checklistData[group][i];
      inspectionResults[group][item] = {
        status: null,
        notes: ""
      };
    }
  }
}

function setResult(group, item, status) {
  if (!inspectionResults[group]) inspectionResults[group] = {};
  if (!inspectionResults[group][item]) {
    inspectionResults[group][item] = { status: null, notes: "" };
  }
  inspectionResults[group][item].status = status;
}

function setNotes(group, item, notes) {
  if (!inspectionResults[group]) inspectionResults[group] = {};
  if (!inspectionResults[group][item]) {
    inspectionResults[group][item] = { status: null, notes: "" };
  }
  inspectionResults[group][item].notes = notes;
}

function allChecksCompleted() {
  for (var group in inspectionResults) {
    for (var item in inspectionResults[group]) {
      if (!inspectionResults[group][item].status) {
        return false;
      }
    }
  }
  return true;
}

function createChecklistItem(group, item) {
  var container = createEl('div', 'check-item');

  var title = createEl('div', 'check-title', item);
  var btnWrap = createEl('div', 'check-buttons');

  var passBtn = createEl('button', 'pass-btn', 'Pass');
  var advisoryBtn = createEl('button', 'amber-btn', 'Advisory');
  var failBtn = createEl('button', 'fail-btn', 'Fail');

  passBtn.type = 'button';
  advisoryBtn.type = 'button';
  failBtn.type = 'button';

  var notes = createEl('textarea', 'check-notes');
  notes.placeholder = 'Add notes...';
  notes.style.display = 'none';

  passBtn.onclick = function () {
    setResult(group, item, 'pass');

    passBtn.classList.add('pass-active');
    advisoryBtn.classList.remove('amber-active');
    failBtn.classList.remove('fail-active');

    passBtn.textContent = 'Passed ✓';
    advisoryBtn.textContent = 'Advisory';
    failBtn.textContent = 'Fail';

    notes.style.display = 'none';
  };

  advisoryBtn.onclick = function () {
    setResult(group, item, 'advisory');

    advisoryBtn.classList.add('amber-active');
    passBtn.classList.remove('pass-active');
    failBtn.classList.remove('fail-active');

    advisoryBtn.textContent = 'Advisory !';
    passBtn.textContent = 'Pass';
    failBtn.textContent = 'Fail';

    notes.style.display = 'block';
  };

  failBtn.onclick = function () {
    setResult(group, item, 'fail');

    failBtn.classList.add('fail-active');
    passBtn.classList.remove('pass-active');
    advisoryBtn.classList.remove('amber-active');

    failBtn.textContent = 'Failed ✕';
    passBtn.textContent = 'Pass';
    advisoryBtn.textContent = 'Advisory';

    notes.style.display = 'block';
  };

  notes.oninput = function () {
    setNotes(group, item, notes.value);
  };

  btnWrap.appendChild(passBtn);
  btnWrap.appendChild(advisoryBtn);
  btnWrap.appendChild(failBtn);

  container.appendChild(title);
  container.appendChild(btnWrap);
  container.appendChild(notes);

  return container;
}

function createGroupSection(groupName, items) {
  var section = createEl('div', 'check-group');
  var header = createEl('h3', 'check-group-title', groupName);

  section.appendChild(header);

  for (var i = 0; i < items.length; i++) {
    section.appendChild(createChecklistItem(groupName, items[i]));
  }

  return section;
}

function renderInspectionChecklist(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  initialiseInspectionResults();

  for (var group in checklistData) {
    container.appendChild(createGroupSection(group, checklistData[group]));
  }

  var saveBtn = createEl('button', 'primary-btn', 'Complete Inspection');
  saveBtn.type = 'button';

  saveBtn.onclick = function () {
    var machineField = document.getElementById('inspectionMachine');
    var fleetField = document.getElementById('fleetNumber');
    var hourField = document.getElementById('hourMeter');
    var operatorField = document.getElementById('operatorName');

    if (!machineField || !fleetField || !hourField || !operatorField) return;

    if (!allChecksCompleted()) {
      alert('Please complete every checklist item before saving.');
      return;
    }

    var history = window.getData ? window.getData('inspectionHistory') : [];

    var record = {
      machine: machineField.value,
      fleetNumber: fleetField.value,
      hourMeter: hourField.value,
      operator: operatorField.value,
      checklist: JSON.parse(JSON.stringify(inspectionResults)),
      date: new Date().toLocaleString()
    };

    history.push(record);

    if (window.saveData) {
      window.saveData('inspectionHistory', history);
    } else {
      localStorage.setItem('inspectionHistory', JSON.stringify(history));
    }

    if (typeof updateLastInspection === 'function') {
      updateLastInspection();
    }

    alert('Inspection saved');

    resetInspectionFlow();

    if (typeof showView === 'function') {
      showView('dashboard');
    }
  };

  container.appendChild(saveBtn);
}

function resetInspectionFlow() {
  var machineSelect = document.getElementById('inspectionMachine');
  var fleetField = document.getElementById('fleetNumber');
  var hourInput = document.getElementById('hourMeter');
  var nextBtn = document.getElementById('nextInspectionBtn');
  var checklistContainer = document.getElementById('checklistContainer');

  if (machineSelect) machineSelect.disabled = false;

  if (hourInput) {
    hourInput.disabled = false;
    hourInput.value = '';
  }

  if (fleetField) {
    fleetField.readOnly = true;
  }

  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.style.display = 'block';
  }

  if (checklistContainer) {
    checklistContainer.innerHTML = '';
  }

  clearInspectionResults();
}

function initNextButton() {
  var nextBtn = document.getElementById('nextInspectionBtn');
  var hourInput = document.getElementById('hourMeter');
  var machineSelect = document.getElementById('inspectionMachine');
  var fleetField = document.getElementById('fleetNumber');

  if (!nextBtn || !hourInput) return;

  nextBtn.disabled = true;

  hourInput.addEventListener('input', function () {
    if (hourInput.value && Number(hourInput.value) > 0) {
      nextBtn.disabled = false;
    } else {
      nextBtn.disabled = true;
    }
  });

  nextBtn.addEventListener('click', function () {
    if (nextBtn.disabled) return;

    if (machineSelect) machineSelect.disabled = true;
    if (hourInput) hourInput.disabled = true;
    if (fleetField) fleetField.readOnly = true;

    nextBtn.style.display = 'none';

    renderInspectionChecklist('checklistContainer');
  });
}

function initChecklist() {
  var view = document.getElementById('inspectionView');
  if (!view) return;

  var container = document.getElementById('checklistContainer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'checklistContainer';
    view.appendChild(container);
  }
}

window.addEventListener('load', function () {
  initChecklist();
  initNextButton();
});

window.renderInspectionChecklist = renderInspectionChecklist;
window.inspectionResults = inspectionResults;