// MowerCheck History (Expandable Inspections)

var historyList = document.getElementById('historyList');

function createEl(tag, className, text) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function renderChecklist(checklist) {
  var container = createEl('div', 'history-checklist');

  for (var group in checklist) {
    var groupTitle = createEl('div', 'history-group-title', group);
    container.appendChild(groupTitle);

    var items = checklist[group];

    for (var item in items) {
      var data = items[item];

      var row = createEl('div', 'history-item');

      var icon = data.status === 'pass' ? '✅' : '❌';
      row.textContent = icon + ' ' + item;

      if (data.status === 'fail' && data.notes) {
        var note = createEl('div', 'history-notes', 'Note: ' + data.notes);
        row.appendChild(note);
      }

      container.appendChild(row);
    }
  }

  return container;
}

function loadHistory() {
  var history = getData('inspectionHistory');
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.appendChild(createEl('li', null, 'No inspections yet'));
    return;
  }

  var reversed = history.slice().reverse();

  for (var i = 0; i < reversed.length; i++) {
    var item = reversed[i];

    var li = createEl('li', 'history-card');

    // HEADER (always visible)
    var header = createEl('div', 'history-header');

    header.appendChild(createEl('div', 'history-title', item.date));

    if (item.machine) {
      header.appendChild(createEl('div', 'history-meta', 'Machine: ' + item.machine));
    }
    if (item.fleetNumber) {
  header.appendChild(createEl('div', 'history-meta', 'Fleet: ' + item.fleetNumber));
}

    if (item.operator) {
      header.appendChild(createEl('div', 'history-meta', 'Operator: ' + item.operator));
    }

    header.style.cursor = 'pointer';

    // CONTENT (hidden by default)
    var content = createEl('div', 'history-content');
    content.style.display = 'none';

    if (item.checklist) {
      content.appendChild(renderChecklist(item.checklist));
    }

    // DELETE BUTTON
    var deleteBtn = createEl('button', null, 'Delete');
    deleteBtn.onclick = (function(index) {
      return function () {
        var history = getData('inspectionHistory');
        history.splice(index, 1);
        saveData('inspectionHistory', history);
        loadHistory();
      };
    })(history.length - 1 - i);

    content.appendChild(deleteBtn);

    // TOGGLE FUNCTION
    header.onclick = (function(c) {
      return function () {
        c.style.display = c.style.display === 'none' ? 'block' : 'none';
      };
    })(content);

    li.appendChild(header);
    li.appendChild(content);

    historyList.appendChild(li);
  }
}

function initHistory() {
  loadHistory();
}

window.addEventListener('load', initHistory);