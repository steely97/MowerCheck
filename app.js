// MowerCheck App Logic (FULL FIXED VERSION)

// -----------------------------
// STORAGE HELPERS
// -----------------------------
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

window.getData = getData;
window.saveData = saveData;

// -----------------------------
// UPDATE LAST INSPECTION CARD
// -----------------------------
function updateLastInspection() {
  const label = document.getElementById('lastInspection');
  if (!label) return;

  const history = getData('inspectionHistory');

  if (!history.length) {
    label.textContent = 'Last inspection: None yet';
    return;
  }

  const last = history[history.length - 1];
  const machine = last.machine || 'Unknown machine';
  const date = last.date || 'Unknown date';

  label.textContent = 'Last inspection: ' + machine + ' (' + date + ')';
}

window.updateLastInspection = updateLastInspection;

// -----------------------------
// VIEW SWITCHING
// -----------------------------
function showView(viewId) {
  const views = document.querySelectorAll('.view');

  views.forEach(function (view) {
    view.classList.remove('active');
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }

  if (viewId === 'dashboard') {
    updateLastInspection();
  }

  if (viewId === 'historyView' && typeof loadHistory === 'function') {
    loadHistory();
  }

  if (viewId === 'reportsView' && typeof populateReportMachineSelect === 'function') {
    populateReportMachineSelect();
  }
}

window.showView = showView;

// -----------------------------
// OPERATOR SETUP
// -----------------------------
function initOperator() {
  let operator = localStorage.getItem('operatorName');

  if (!operator) {
    operator = prompt('Enter your name (operator):');

    if (operator && operator.trim() !== '') {
      localStorage.setItem('operatorName', operator.trim());
    }
  }

  const operatorInput = document.getElementById('operatorName');
  if (operatorInput && operator) {
    operatorInput.value = operator;
  }
}

// -----------------------------
// NAVIGATION
// -----------------------------
function initNavigation() {
  const newBtn = document.getElementById('newInspectionBtn');
  const machinesBtn = document.getElementById('manageMachinesBtn');
  const historyBtn = document.getElementById('historyBtn');
  const reportsBtn = document.getElementById('reportsBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const refreshBtn = document.getElementById('refreshAppBtn');

  if (newBtn) {
    newBtn.onclick = function () {
      showView('inspectionView');
    };
  }

  if (machinesBtn) {
    machinesBtn.onclick = function () {
      showView('machinesView');
    };
  }

  if (historyBtn) {
    historyBtn.onclick = function () {
      showView('historyView');
    };
  }

  if (reportsBtn) {
    reportsBtn.onclick = function () {
      showView('reportsView');
    };
  }

  if (settingsBtn) {
    settingsBtn.onclick = function () {
      showView('settingsView');
    };
  }

  document.querySelectorAll('.back-btn').forEach(function (btn) {
    btn.onclick = function () {
      const target = btn.getAttribute('data-target');
      showView(target);
    };
  });

  if (refreshBtn) {
    refreshBtn.onclick = function () {
      window.location.reload();
    };
  }
}

// -----------------------------
// INSTALL PROMPT
// -----------------------------
function initInstallPrompt() {
  let deferredPrompt = null;
  const installBtn = document.getElementById('installAppBtn');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;

    if (installBtn) {
      installBtn.style.display = 'block';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async function () {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      await deferredPrompt.userChoice;

      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }
}

// -----------------------------
// INIT APP
// -----------------------------
document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initOperator();
  initInstallPrompt();
  updateLastInspection();

  if (window.lucide) {
    lucide.createIcons();
  }
});