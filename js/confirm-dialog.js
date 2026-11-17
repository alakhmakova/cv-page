// Own confirmation window instead of the browser's confirm().
// It uses the <dialog> element from editor.html: showModal() opens it
// above the page and dims the page behind it; close(value) closes it
// and keeps value in dialog.returnValue.

const dialog = document.querySelector("#confirm-dialog");
const text = dialog.querySelector(".confirm-dialog-text");
const okButton = dialog.querySelector('[data-answer="ok"]');
const cancelButton = dialog.querySelector('[data-answer="cancel"]');

okButton.addEventListener("click", () => dialog.close("ok"));
cancelButton.addEventListener("click", () => dialog.close("cancel"));

// A click on the dimmed page around the window: the click lands on the
// dialog element itself (its inner box takes all the space inside),
// so event.target is the dialog. It works like Cancel.
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close("cancel");
  }
});

// Shows the question and returns a Promise: a value that comes later.
// It becomes true after OK and false after Cancel, Escape or a click
// outside. The caller waits for it with await:
//   if (await askConfirm("Delete?", "Delete")) { ... }
// { once: true } removes the listener after the first close event.
export function askConfirm(message, okLabel) {
  text.textContent = message;
  okButton.textContent = okLabel;
  dialog.returnValue = "";
  dialog.showModal();
  cancelButton.focus();

  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true });
  });
}
