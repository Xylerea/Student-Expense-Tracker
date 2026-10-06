// Small DOM stub for behavior checks without external dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Element {
  constructor() { this.value = ''; this.children = []; this.handlers = {}; this.classList = { toggle() {} }; }
  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; }
  setAttribute() {}
  focus() {}
  addEventListener(name, handler) { this.handlers[name] = handler; }
}
const elements = {};
let stored = null;
let failSaving = false;
let confirmDelete = true;
let nextId = 0;
const context = vm.createContext({
  document: { getElementById: id => elements[id] ||= new Element(), createElement: () => new Element() },
  localStorage: { getItem: () => stored, setItem: (_, value) => { if (failSaving) throw Error('Full'); stored = value; } },
  window: { confirm: () => confirmDelete },
  crypto: { randomUUID: () => String(++nextId) },
  Intl, Date, console
});
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/app.js'), 'utf8');
vm.runInContext(source, context);
const set = (id, value) => { (elements[id] ||= new Element()).value = value; };
const submit = id => elements[id].handlers.submit({ preventDefault() {} });
function add(description, amount, category = 'Food', date = '2026-10-06') {
  set('description', description); set('amount', amount); set('category', category); set('date', date);
  submit('expense-form');
}
add('Lunch', '50.25');
add('Bus', '10.10', 'Transport');
assert.equal(elements.total.textContent, '₱60.35');
set('budget', '100'); submit('budget-form');
assert.equal(elements.remaining.textContent, '₱39.65');
set('budget', '50'); submit('budget-form');
assert.equal(elements['remaining-label'].textContent, 'Over budget');
assert.equal(elements.remaining.textContent, '₱10.35');
set('filter', 'Food'); elements.filter.handlers.change();
assert.equal(elements.rows.children.length, 1);
assert.equal(elements.total.textContent, '₱60.35');
for (const amount of ['0', '-1', '1.001', 'NaN', '100000001']) add('Invalid', amount);
add('   ', '10');
add('Bad date', '10', 'Food', '2026-02-30');
assert.equal(JSON.parse(stored).expenses.length, 2);
failSaving = true;
add('Storage failure', '1');
assert.equal(JSON.parse(stored).expenses.length, 2);
assert.match(elements.message.textContent, /Could not save/);
failSaving = false;
vm.runInContext('load(); render();', context);
assert.equal(elements.total.textContent, '₱60.35');
add('<b>Book</b>', '5', 'School', '2026-09-01');
assert.equal(elements.month.value, '2026-09');
assert.equal(elements.rows.children[0].children[0].textContent, '<b>Book</b>');
const deleteButton = elements.rows.children[0].children[3].children[0];
confirmDelete = false; deleteButton.handlers.click();
assert.equal(JSON.parse(stored).expenses.length, 3);
confirmDelete = true; deleteButton.handlers.click();
assert.equal(JSON.parse(stored).expenses.length, 2);
assert.equal(elements.total.textContent, '₱0.00');
stored = '{broken';
vm.runInContext('load();', context);
assert.match(elements.message.textContent, /could not be loaded/);
console.log('Passed: totals, budgets, filtering, validation, storage failure, reload, safe text, month switching, deletion, corrupt storage.');
