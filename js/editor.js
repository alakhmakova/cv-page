// Script for editor.html (the CV editor).
import { setupPrintButton } from "./print.js";

setupPrintButton();

// Replaces the content of the CV sheet with a copy of the blank template.
function loadBlankCv() {
  const sheet = document.querySelector("#cv");
  const template = document.querySelector("#blank-cv");
  const copy = template.content.cloneNode(true);

  sheet.replaceChildren(copy);
}

loadBlankCv();