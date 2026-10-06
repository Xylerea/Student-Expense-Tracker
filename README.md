# Student Expense Tracker

A beginner-friendly practice app built with HTML, CSS, and JavaScript. Track student expenses in Philippine pesos without a server or database.

## Run

Open `index.html` in a modern browser. Keep using the same browser and file location to access your saved entries. Data is stored in localStorage; clearing browser data removes it. This practice app has no cloud sync or backup.

## Features

- Add a description, amount, category, and date.
- View expenses for a selected month and filter by category.
- Set a separate budget for each month.
- See spending, remaining budget, overspending, and category totals.
- Delete an expense after confirmation.
- Save expenses and budgets across page refreshes.

## Understand the code

- `index.html`: form fields, summary, and expense table.
- `css/style.css`: appearance and responsive layout.
- `js/app.js`: input validation, localStorage, and DOM updates.
- `toCents()` converts an amount into whole cents so totals avoid decimal rounding errors.
- `save()` writes the new data before updating the screen.
- `render()` calculates the selected month's totals and builds table rows using `textContent`.

## Practice exercises

1. Add a new category consistently to the HTML and JavaScript.
2. Explain why filtering a category does not change monthly totals.
3. Implement an edit-expense feature.
4. Add a CSV export for backups.

See `docs/testing.md` for manual checks. The supplied midterm document is reference material; this project does not create a public GitHub repository, submit work, or claim completion of the required exam Git history.

If Node.js is installed, run `node tests/app.test.cjs` for automated behavior checks using a small DOM stub. These checks do not replace testing the real browser interface.
