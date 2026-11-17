// What is shown on the CV sheet: the blank template or a saved CV.

// Puts a copy of the blank template (in editor.html) onto the sheet.
export function loadBlankCv(sheet) {
  const template = document.querySelector("#blank-cv");
  const copy = template.content.cloneNode(true);

  sheet.replaceChildren(copy);
  enableEditing(sheet);
}

// Puts a saved CV onto the sheet. innerHTML turns the text into
// elements.
export function loadCvHtml(sheet, html) {
  sheet.innerHTML = html;
  enableEditing(sheet);
}

// Makes every element with data-editable on the sheet editable by click.
function enableEditing(sheet) {
  const editables = sheet.querySelectorAll("[data-editable]");

  for (const element of editables) {
    element.contentEditable = "true";
  }
}

// Returns the HTML of the sheet for saving. A copy of the sheet is
// cleaned first: contenteditable is set again when the CV is loaded,
// and is-target is only the tint while the mouse is on a button.
export function getCvHtml(sheet) {
  const copy = sheet.cloneNode(true);

  for (const element of copy.querySelectorAll("[contenteditable]")) {
    element.removeAttribute("contenteditable");
  }
  for (const element of copy.querySelectorAll(".is-target")) {
    element.classList.remove("is-target");
  }
  return copy.innerHTML;
}
