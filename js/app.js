// Store amounts as whole cents to avoid floating-point rounding in totals.
const STORAGE_KEY = 'student-expense-tracker-v1';
const categories = ['Food', 'Transport', 'School', 'Personal', 'Other'];
const money = cents => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
const $ = id => document.getElementById(id);
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
let state = { expenses: [], budgets: {} };

function notify(text, error = false) {
  $('message').textContent = text;
  $('message').classList.toggle('error', error);
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.slice(0, 4) === '0000') return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toCents(value, allowZero = false) {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const cents = Math.round(Number(value) * 100);
  return Number.isSafeInteger(cents) && cents >= (allowZero ? 0 : 1) && cents <= 10000000000 ? cents : null;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.expenses) || !saved.budgets || typeof saved.budgets !== 'object' || Array.isArray(saved.budgets)) throw new Error('Invalid data');
    const ids = new Set();
    for (const item of saved.expenses) {
      if (!item || typeof item.id !== 'string' || ids.has(item.id) || typeof item.description !== 'string' || !item.description.trim() || item.description.length > 80 || !categories.includes(item.category) || !validDate(item.date) || !Number.isSafeInteger(item.cents) || item.cents <= 0 || item.cents > 10000000000) throw new Error('Invalid expense');
      ids.add(item.id);
    }
    for (const [month, cents] of Object.entries(saved.budgets)) {
      if (!validDate(`${month}-01`) || !Number.isSafeInteger(cents) || cents < 0 || cents > 10000000000) throw new Error('Invalid budget');
    }
    state = saved;
  } catch {
    notify('Saved data could not be loaded. Existing storage will remain untouched until you save a change.', true);
  }
}

// Save first so a storage failure never appears as a successful change.
function save(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    state = nextState;
    render();
    return true;
  } catch {
    notify('Could not save. Browser storage may be full or disabled. Your change was not applied.', true);
    return false;
  }
}

function render() {
  const month = $('month').value;
  const expenses = state.expenses.filter(item => item.date.startsWith(`${month}-`));
  const total = expenses.reduce((sum, item) => sum + item.cents, 0);
  const budget = state.budgets[month];
  $('total').textContent = money(total);
  $('budget-total').textContent = budget === undefined ? 'Not set' : money(budget);
  $('budget').value = budget === undefined ? '' : (budget / 100).toFixed(2);
  const over = budget !== undefined && total > budget;
  $('remaining-label').textContent = over ? 'Over budget' : 'Remaining budget';
  $('remaining').textContent = budget === undefined ? '—' : money(Math.abs(budget - total));
  $('remaining').classList.toggle('over-budget', over);
  const visible = expenses.filter(item => !$('filter').value || item.category === $('filter').value).sort((a, b) => b.date.localeCompare(a.date));
  $('rows').replaceChildren();
  $('table').hidden = visible.length === 0;
  $('empty').hidden = visible.length > 0;
  $('empty').textContent = expenses.length ? 'No expenses match this category.' : 'No expenses for this month. Add your first expense to get started.';
  for (const item of visible) {
    const row = document.createElement('tr');
    const description = document.createElement('td');
    description.textContent = item.description;
    const category = document.createElement('small');
    category.textContent = item.category;
    description.append(category);
    row.append(description);
    for (const value of [item.date, money(item.cents)]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    const action = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'delete';
    button.textContent = 'Delete';
    button.setAttribute('aria-label', `Delete ${item.description}`);
    button.addEventListener('click', () => {
      if (!window.confirm(`Delete "${item.description}"?`)) return;
      if (save({ ...state, expenses: state.expenses.filter(expense => expense.id !== item.id) })) notify('Expense deleted.');
    });
    action.append(button);
    row.append(action);
    $('rows').append(row);
  }
  $('breakdown').replaceChildren();
  for (const category of categories) {
    const row = document.createElement('li');
    const label = document.createElement('span');
    const amount = document.createElement('span');
    label.textContent = category;
    amount.textContent = money(expenses.filter(item => item.category === category).reduce((sum, item) => sum + item.cents, 0));
    row.append(label, amount);
    $('breakdown').append(row);
  }
}

$('date').value = localDate;
$('month').value = localDate.slice(0, 7);
load();
render();
$('month').addEventListener('change', render);
$('filter').addEventListener('change', render);
$('expense-form').addEventListener('submit', event => {
  event.preventDefault();
  const description = $('description').value.trim();
  const cents = toCents($('amount').value);
  const date = $('date').value;
  const category = $('category').value;
  if (!description || description.length > 80 || cents === null || !validDate(date) || !categories.includes(category)) {
    notify('Enter a description, a valid date, and an amount greater than zero with at most two decimal places.', true);
    return;
  }
  const expense = { id: crypto.randomUUID(), description, cents, category, date };
  if (save({ ...state, expenses: [...state.expenses, expense] })) {
    $('description').value = '';
    $('amount').value = '';
    $('month').value = date.slice(0, 7);
    $('filter').value = '';
    render();
    notify('Expense added and saved.');
    $('description').focus();
  }
});
$('budget-form').addEventListener('submit', event => {
  event.preventDefault();
  const cents = toCents($('budget').value, true);
  const month = $('month').value;
  if (cents === null || !validDate(`${month}-01`)) {
    notify('Choose a month and enter a budget of zero or more with at most two decimal places.', true);
    return;
  }
  if (save({ ...state, budgets: { ...state.budgets, [month]: cents } })) notify('Monthly budget saved.');
});
