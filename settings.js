// MowerCheck Settings / Reports Logic (GROUPED + ADVISORY PDF EXPORT)

// -----------------------------
// SAFE STORAGE HELPERS
// -----------------------------
function getSafeData(key) {
  if (window.getData) return window.getData(key);

  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

// -----------------------------
// CLEAR ALL DATA
// -----------------------------
function clearAllData() {
  var confirmClear = confirm('Are you sure you want to delete ALL data? This cannot be undone.');

  if (!confirmClear) return;

  localStorage.removeItem('machines');
  localStorage.removeItem('inspectionHistory');
  localStorage.removeItem('operatorName');

  if (typeof loadHistory === 'function') loadHistory();
  if (typeof loadMachines === 'function') loadMachines();
  if (typeof updateLastInspection === 'function') updateLastInspection();

  alert('All data cleared');

  if (typeof showView === 'function') {
    showView('dashboard');
  }
}

// -----------------------------
// GROUP HISTORY BY MACHINE
// -----------------------------
function groupHistoryByMachine(history) {
  var grouped = {};

  for (var i = 0; i < history.length; i++) {
    var record = history[i];
    var machineName = record.machine || 'Unknown machine';
    var fleet = record.fleetNumber || 'No fleet number';
    var key = machineName + '||' + fleet;

    if (!grouped[key]) {
      grouped[key] = {
        machine: machineName,
        fleetNumber: fleet,
        inspections: []
      };
    }

    grouped[key].inspections.push(record);
  }

  return grouped;
}

// -----------------------------
// BUILD CHECKLIST HTML
// -----------------------------
function buildChecklistHtml(checklist) {
  if (!checklist) return '<p>No checklist data</p>';

  var html = '';

  for (var group in checklist) {
    html += '<h4 style="margin:14px 0 8px;font-size:15px;color:#145c43;">' + group + '</h4>';

    var items = checklist[group];
    html += '<ul style="list-style:none;padding:0;margin:0 0 12px 0;">';

    for (var item in items) {
      var data = items[item];
      var status = 'PASS';
      var statusColor = '#1f9d55';

      if (data.status === 'advisory') {
        status = 'ADVISORY';
        statusColor = '#f0ad1f';
      }

      if (data.status === 'fail') {
        status = 'FAIL';
        statusColor = '#c0392b';
      }

      html += '<li style="padding:8px 0;border-bottom:1px solid #ddd;">';
      html += '<div style="font-weight:600;">';
      html += '<span style="color:' + statusColor + ';">' + status + '</span> - ' + item;
      html += '</div>';

      if ((data.status === 'advisory' || data.status === 'fail') && data.notes) {
        html += '<div style="margin-top:4px;font-size:13px;color:#555;">Note: ' + data.notes + '</div>';
      }

      html += '</li>';
    }

    html += '</ul>';
  }

  return html;
}

// -----------------------------
// POPULATE REPORT MACHINE DROPDOWN
// -----------------------------
function populateReportMachineSelect() {
  var select = document.getElementById('reportMachineSelect');
  if (!select) return;

  var history = getSafeData('inspectionHistory');
  var grouped = groupHistoryByMachine(history);

  select.innerHTML = '<option value="all">All Machines</option>';

  for (var key in grouped) {
    var machineData = grouped[key];
    var option = document.createElement('option');
    option.value = key;
    option.textContent = machineData.machine + ' (' + machineData.fleetNumber + ')';
    select.appendChild(option);
  }
}

window.populateReportMachineSelect = populateReportMachineSelect;

// -----------------------------
// EXPORT PDF
// -----------------------------
function exportInspectionsToPdf() {
  var history = getSafeData('inspectionHistory');

  if (!history.length) {
    alert('No inspections available to export.');
    return;
  }

  var grouped = groupHistoryByMachine(history);
  var machineSelect = document.getElementById('reportMachineSelect');
  var selectedMachine = machineSelect ? machineSelect.value : 'all';

  var printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Popup blocked. Please allow popups for this app to export PDF.');
    return;
  }

  var html = '';
  html += '<!DOCTYPE html>';
  html += '<html lang="en">';
  html += '<head>';
  html += '<meta charset="UTF-8">';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += '<title>MowerCheck Inspection Report</title>';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:24px;color:#222;line-height:1.4;}';
  html += 'h1{margin-bottom:8px;color:#0b3d2e;}';
  html += '.sub{margin-bottom:24px;color:#666;font-size:14px;}';
  html += '.machine-block{border:2px solid #145c43;border-radius:14px;padding:18px;margin-bottom:28px;page-break-inside:avoid;}';
  html += '.machine-title{font-size:20px;font-weight:700;color:#145c43;margin-bottom:6px;}';
  html += '.machine-meta{font-size:14px;color:#555;margin-bottom:14px;}';
  html += '.inspection{border:1px solid #ccc;border-radius:12px;padding:14px;margin-bottom:16px;page-break-inside:avoid;}';
  html += '.inspection-title{font-size:16px;font-weight:700;color:#145c43;margin-bottom:8px;}';
  html += '.meta{margin:4px 0;font-size:14px;}';
  html += '@media print { body{padding:0;} .machine-block,.inspection{break-inside:avoid;} }';
  html += '</style>';
  html += '</head>';
  html += '<body>';

  html += '<h1>MowerCheck Inspection Report</h1>';
  html += '<div class="sub">Generated: ' + new Date().toLocaleString() + '</div>';

  var addedAny = false;

  for (var key in grouped) {
    if (selectedMachine !== 'all' && key !== selectedMachine) {
      continue;
    }

    var machineData = grouped[key];
    addedAny = true;

    html += '<div class="machine-block">';
    html += '<div class="machine-title">' + machineData.machine + '</div>';
    html += '<div class="machine-meta"><strong>Fleet Number:</strong> ' + machineData.fleetNumber + '</div>';

    for (var i = machineData.inspections.length - 1; i >= 0; i--) {
      var record = machineData.inspections[i];

      html += '<div class="inspection">';
      html += '<div class="inspection-title">Inspection - ' + (record.date || 'N/A') + '</div>';
      html += '<div class="meta"><strong>Operator:</strong> ' + (record.operator || 'N/A') + '</div>';
      html += '<div class="meta"><strong>Hour Meter:</strong> ' + (record.hourMeter || 'N/A') + '</div>';
      html += buildChecklistHtml(record.checklist);
      html += '</div>';
    }

    html += '</div>';
  }

  if (!addedAny) {
    html += '<p>No matching machine inspections found.</p>';
  }

  html += '</body></html>';

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.focus();

  setTimeout(function () {
    printWindow.print();
  }, 500);
}

// -----------------------------
// INIT
// -----------------------------
function initSettings() {
  var clearDataBtn = document.getElementById('clearDataBtn');
  var exportPdfBtn = document.getElementById('exportPdfBtn');

  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', clearAllData);
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', exportInspectionsToPdf);
  }

  populateReportMachineSelect();
}

document.addEventListener('DOMContentLoaded', initSettings);