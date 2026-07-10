// MowerCheck History Logic (GROUPED BY MACHINE - CONSISTENT VERSION)

function createEl(tag, className, text) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

function getHistoryData() {
  if (window.getData) return window.getData('inspectionHistory');

  try {
    return JSON.parse(localStorage.getItem('inspectionHistory')) || [];
  } catch (e) {
    return [];
  }
}

function saveHistoryData(data) {
  if (window.saveData) {
    window.saveData('inspectionHistory', data);
    return;
  }

  localStorage.setItem('inspectionHistory', JSON.stringify(data));
}

function countByStatus(checklist, status) {
  var count = 0;
  if (!checklist || typeof checklist !== 'object') return count;

  for (var group in checklist) {
    var items = checklist[group];
    if (!items || typeof items !== 'object') continue;

    for (var item in items) {
      if (items[item] && items[item].status === status) {
        count++;
      }
    }
  }

  return count;
}

function renderChecklistSummary(checklist) {
  var container = createEl('div', 'history-checklist');

  if (!checklist || typeof checklist !== 'object') {
    container.appendChild(
      createEl('div', 'history-meta', 'No checklist details saved for this inspection.')
    );
    return container;
  }

  for (var group in checklist) {
    var items = checklist[group];
    if (!items || typeof items !== 'object') continue;

    container.appendChild(createEl('div', 'history-group-title', group));

    for (var item in items) {
      var data = items[item] || {};
      var row = createEl('div', 'history-item');

      var icon = '✅ ';
      if (data.status === 'advisory') icon = '⚠️ ';
      if (data.status === 'fail') icon = '❌ ';

      row.appendChild(createEl('div', null, icon + item));

      if ((data.status === 'advisory' || data.status === 'fail') && data.notes) {
        row.appendChild(createEl('div', 'history-notes', 'Note: ' + data.notes));
      }

      container.appendChild(row);
    }
  }

  return container;
}

function groupHistoryByMachine(history) {
  var grouped = {};

  for (var i = history.length - 1; i >= 0; i--) {
    var record = history[i];
    if (!record || typeof record !== 'object') continue;

    var machine = record.machine || 'Unknown machine';
    var fleet = record.fleetNumber || '';
    var key = machine + '||' + fleet;

    if (!grouped[key]) {
      grouped[key] = {
        machine: machine,
        fleetNumber: fleet,
        inspections: []
      };
    }

    grouped[key].inspections.push({
      machine: record.machine || '',
      fleetNumber: record.fleetNumber || '',
      hourMeter: record.hourMeter || '',
      operator: record.operator || '',
      checklist: record.checklist || null,
      date: record.date || '',
      _historyIndex: i
    });
  }

  return grouped;
}

function createInspectionCard(record) {
  var failCount = countByStatus(record.checklist, 'fail');
  var advisoryCount = countByStatus(record.checklist, 'advisory');

  var card = createEl('div', 'history-card');

  if (failCount > 0) {
    card.style.border = '2px solid #e74c3c';
    card.style.background = '#2a1f1f';
  } else if (advisoryCount > 0) {
    card.style.border = '2px solid #f0ad1f';
    card.style.background = '#2d2818';
  }

  var top = createEl('div', 'history-header');

  var title = record.date || 'Inspection record';
  if (record.operator) {
    title += ' - ' + record.operator;
  }

  top.appendChild(createEl('div', 'history-title', title));

  if (record.hourMeter) {
    top.appendChild(createEl('div', 'history-meta', 'Hours: ' + record.hourMeter));
  }

  if (failCount > 0) {
    top.appendChild(
      createEl('div', 'fail-badge', '❌ ' + failCount + ' fail' + (failCount > 1 ? 's' : ''))
    );
  }

  if (advisoryCount > 0) {
    top.appendChild(
      createEl(
        'div',
        'history-meta',
        '⚠️ ' + advisoryCount + ' advisory' + (advisoryCount > 1 ? 'ies' : '')
      )
    );
  }

  if (failCount === 0 && advisoryCount === 0) {
    top.appendChild(createEl('div', 'history-meta', 'No issues recorded ✅'));
  }

  card.appendChild(top);
  card.appendChild(renderChecklistSummary(record.checklist));

  var deleteBtn = createEl('button', 'danger-btn', 'Delete Inspection');
  deleteBtn.type = 'button';
  deleteBtn.style.marginTop = '12px';

  deleteBtn.onclick = function () {
    var history = getHistoryData();
    history.splice(record._historyIndex, 1);
    saveHistoryData(history);
    loadHistory();

    if (typeof updateLastInspection === 'function') {
      updateLastInspection();
    }
  };

  card.appendChild(deleteBtn);

  return card;
}

function createMachineSection(machineData) {
  var wrap = createEl('div', 'history-machine-group');
  var inspections = Array.isArray(machineData.inspections) ? machineData.inspections : [];
  var latest = inspections.length ? inspections[0] : null;

  var totalFails = 0;
  var totalAdvisories = 0;

  for (var i = 0; i < inspections.length; i++) {
    totalFails += countByStatus(inspections[i].checklist, 'fail');
    totalAdvisories += countByStatus(inspections[i].checklist, 'advisory');
  }

  var header = createEl('div', 'history-header');

  var title = machineData.machine || 'Unknown machine';
  if (machineData.fleetNumber) {
    title += ' (' + machineData.fleetNumber + ')';
  }

  header.appendChild(createEl('div', 'history-title', title));
  header.appendChild(
    createEl(
      'div',
      'history-meta',
      inspections.length + ' inspection' + (inspections.length === 1 ? '' : 's')
    )
  );
  header.appendChild(
    createEl(
      'div',
      'history-meta',
      'Latest inspection: ' + (latest && latest.date ? latest.date : 'No saved date')
    )
  );
  header.appendChild(
    createEl(
      'div',
      'history-meta',
      'Latest hours: ' + (latest && latest.hourMeter ? latest.hourMeter : 'No saved hours')
    )
  );

  if (totalFails > 0) {
    header.appendChild(
      createEl(
        'div',
        'fail-badge',
        '❌ ' + totalFails + ' total fail' + (totalFails > 1 ? 's' : '')
      )
    );
  }

  if (totalAdvisories > 0) {
    header.appendChild(
      createEl(
        'div',
        'history-meta',
        '⚠️ ' + totalAdvisories + ' total advisory' + (totalAdvisories > 1 ? 'ies' : '')
      )
    );
  }

  if (totalFails === 0 && totalAdvisories === 0) {
    header.appendChild(createEl('div', 'history-meta', 'No recorded issues ✅'));
  }

  var toggleBtn = createEl('button', 'history-toggle-btn', 'Show previous checks');
  toggleBtn.type = 'button';
  toggleBtn.style.marginTop = '10px';

  var sublist = createEl('div', 'history-sublist');
  sublist.style.display = 'none';

  for (var j = 0; j < inspections.length; j++) {
    sublist.appendChild(createInspectionCard(inspections[j]));
  }

  toggleBtn.onclick = function () {
    if (sublist.style.display === 'none' || sublist.style.display === '') {
      sublist.style.display = 'block';
      toggleBtn.textContent = 'Hide previous checks';
    } else {
      sublist.style.display = 'none';
      toggleBtn.textContent = 'Show previous checks';
    }
  };

  wrap.appendChild(header);
  wrap.appendChild(toggleBtn);
  wrap.appendChild(sublist);

  return wrap;
}

function loadHistory() {
  var historyList = document.getElementById('historyList');
  if (!historyList) return;

  historyList.innerHTML = '';

  var history = getHistoryData();

  if (!history.length) {
    historyList.appendChild(createEl('li', null, 'No inspections yet'));
    return;
  }

  var grouped = groupHistoryByMachine(history);

  for (var key in grouped) {
    var machineData = grouped[key];

    var li = createEl('li', null, null);
    li.style.display = 'block';
    li.style.background = 'transparent';
    li.style.padding = '0';
    li.style.border = 'none';
    li.style.boxShadow = 'none';
    li.style.marginBottom = '14px';

    li.appendChild(createMachineSection(machineData));
    historyList.appendChild(li);
  }
}

function initHistory() {
  loadHistory();
}

window.addEventListener('load', initHistory);
window.loadHistory = loadHistory;