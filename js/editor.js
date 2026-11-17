// Script for editor.html (the CV editor).
import { setupPrintButton } from "./print.js";
import { setupKeyboardNavigation } from "./keyboard.js";
import { setupLinkEditing } from "./links.js";

const sheet = document.querySelector("#cv");

// Replaces the content of the CV sheet with a copy of the blank template.
function loadBlankCv() {
  const template = document.querySelector("#blank-cv");
  const copy = template.content.cloneNode(true);

  sheet.replaceChildren(copy);
}

// Makes every element with data-editable on the sheet editable by click.
function enableEditing() {
  const editables = sheet.querySelectorAll("[data-editable]");

  for (const element of editables) {
    element.contentEditable = "true";
  }
}

// Pasting inserts plain text only, without fonts and colors
// copied from Word or a web page.
sheet.addEventListener("paste", (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
});

// When a field is cleared, the browser can leave an invisible line
// break in it. Removing it makes the field really empty, so the gray
// hint shows again.
sheet.addEventListener("input", (event) => {
  const element = event.target;

  if (!element.matches("ul") && element.textContent.trim() === "") {
    element.replaceChildren();
  }
});

loadBlankCv();
enableEditing();
setupKeyboardNavigation(sheet);
setupLinkEditing(sheet);
setupPrintButton();