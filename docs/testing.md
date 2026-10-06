# Practice Testing

Open `index.html` and perform these checks:

| Check | Expected result |
| --- | --- |
| Add Lunch, 50.25, Food, today's date | New row; total increases by ₱50.25 |
| Add Transport, 10.10, Transport, today's date | Total becomes ₱60.35 |
| Set budget to 100 | Remaining budget is ₱39.65 |
| Set budget to 50 | Over budget is ₱10.35 |
| Filter Food | Lunch row remains; monthly total stays ₱60.35 |
| Reload the page | Expenses and budget remain |
| Switch to a month with no entries | Empty state and zero spending |
| Add an expense in another month | View switches to that month |
| Submit empty, negative, zero, or three-decimal expense amount | Submission rejected |
| Submit a description containing only spaces | Error message; no expense added |
| Add `<b>Lunch</b>` as description | Literal text appears, with no HTML formatting |
| Cancel deletion | Expense remains |
| Confirm deletion | Expense disappears and totals update |
| Use a narrow screen | Forms and summaries remain usable |

Browser storage can fail if disabled or full. The app reports that saving failed and does not apply the change. A malformed stored record shows a load error instead of crashing.

Record your own browser results here when practicing. Automated logic checks are separate from visual browser checks.
