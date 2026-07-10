// MowerCheck App Logic (CLEAN + INSTALL BUTTON)

// -----------------------------
// VIEW NAVIGATION
// -----------------------------
function showView(viewId) {
  const views = document.querySelectorAll('.view');

  views.forEach(view => {
    view.classList.remove('active');
  });

  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
}

// -----------------------------
// NAVIGATION BUTTONS
// -----------------------------
function initNavigation() {
  const newBtn = document.getElementById('newInspectionBtn');
  const machinesBtn = document.getElementById('manageMachinesBtn');
  const historyBtn = document.getElementById('historyBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  if (newBtn) newBtn.onclick = () => showView('inspectionView');
  if (machinesBtn) machinesBtn.onclick = () => showView('machinesView');
  if (historyBtn) historyBtn.onclick = () => showView('historyView');
  if (settingsBtn) settingsBtn.onclick = () => showView('settingsView');

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.onclick = () => {
      const target = btn.getAttribute('data-target');
      showView(target);
    };
  });
}

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
// INSTALL BUTTON LOGIC (FIXED)
// -----------------------------
function initInstallPrompt() {
  let deferredPrompt = null;
  const installBtn = document.getElementById('installAppBtn');

  // Listen for install availability
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (installBtn) {
      installBtn.style.display = 'block';
    }
  });

  // Handle click
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      console.log('Install result:', outcome);

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

  // Activate Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
});