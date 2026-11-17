// Script for editor.html (the CV editor).
import { setupPrintButton } from "./print.js";
import { setupKeyboardNavigation } from "./keyboard.js";
import { setupLinkEditing } from "./links.js";
import { setupBlockControls } from "./blocks.js";
import { setupCvList } from "./cv-list.js";

const sheet = document.querySelector("#cv");

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

setupCvList(sheet);
setupKeyboardNavigation(sheet);
setupLinkEditing(sheet);
setupBlockControls(sheet);
setupPrintButton();