// MowerCheck Settings Logic

const clearDataBtn = document.getElementById('clearDataBtn');

// Clear All App Data
function clearAllData() {
  const confirmClear = confirm('Are you sure you want to delete ALL data? This cannot be undone.');

  if (!confirmClear) return;

  // Clear relevant storage keys
  localStorage.removeItem('machines');
  localStorage.removeItem('inspectionHistory');

  // Optional: full wipe
  // localStorage.clear();

  // Refresh UI across modules
  if (typeof loadMachines === 'function') loadMachines();
  if (typeof loadHistory === 'function') loadHistory();
  if (typeof updateLastInspection === 'function') updateLastInspection();

  alert('All data cleared');

  // Return to dashboard
  if (typeof showView === 'function') showView('dashboard');
}

// Event
clearDataBtn.addEventListener('click', clearAllData);

// Init
function initSettings() {
  // Future settings can be initialized here
}

document.addEventListener('DOMContentLoaded', initSettings);
