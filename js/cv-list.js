// The list of the user's CVs in the toolbar: choose a CV, rename it,
// create a new blank one, duplicate or delete the open one.
// Every change on the sheet is saved automatically.

import { loadCvs, findCv, addCv, updateCv, deleteCv, getCurrentId, setCurrentId } from "./storage.js";
import { loadBlankCv, loadCvHtml, getCvHtml } from "./sheet.js";
import { askConfirm } from "./confirm-dialog.js";

const pickerButton = document.querySelector("#cv-picker-button");
const pickerLabel = document.querySelector("#cv-picker-label");
const pickerList = document.querySelector("#cv-picker-list");
const nameInput = document.querySelector("#cv-name");

// The id of the CV that is on the sheet now.
let currentId = null;

// Fills the drop-down list: one button per CV, with the CV id in
// data-id. The open CV gets the class is-current (marked in CSS), and
// its name is shown on the button that opens the list.
// document.createElement() creates a new element that is not on the
// page yet; append() puts it inside another element.
function renderList() {
  pickerList.replaceChildren();

  for (const cv of loadCvs()) {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = cv.name || "Untitled CV";
    button.dataset.id = cv.id;
    if (cv.id === currentId) {
      button.classList.add("is-current");
      pickerLabel.textContent = button.textContent;
    }
    item.append(button);
    pickerList.append(item);
  }
}

// Opens or closes the drop-down list. aria-expanded tells screen
// readers whether the list is open.
function setListOpen(isOpen) {
  pickerList.hidden = !isOpen;
  pickerButton.setAttribute("aria-expanded", String(isOpen));
}

// The buttons for blocks and links belong to the old CV, so they are
// hidden when another CV is opened.
function hideEditorControls() {
  for (const element of document.querySelectorAll(".sheet-controls, #link-editor")) {
    element.hidden = true;
  }
}

// Shows the CV with this id on the sheet and remembers it as the open one.
function openCv(id, sheet) {
  const cv = findCv(id);

  currentId = cv.id;
  setCurrentId(cv.id);
  loadCvHtml(sheet, cv.html);
  nameInput.value = cv.name;
  hideEditorControls();
  renderList();
}

// Creates a CV from the blank template and opens it.
function createBlankCv(sheet) {
  loadBlankCv(sheet);
  const cv = addCv("Untitled CV", getCvHtml(sheet));

  openCv(cv.id, sheet);
}

// Saves the sheet into the open CV.
function saveNow(sheet) {
  if (currentId !== null) {
    updateCv(currentId, { html: getCvHtml(sheet) });
  }
}

export function setupCvList(sheet) {
  // Start: open the CV from last time. On the first visit (or if that
  // CV was deleted) open the first saved CV, or create a blank one.
  const lastCv = findCv(getCurrentId());
  const firstCv = loadCvs()[0];

  if (lastCv) {
    openCv(lastCv.id, sheet);
  } else if (firstCv) {
    openCv(firstCv.id, sheet);
  } else {
    createBlankCv(sheet);
  }

  // Autosave. A MutationObserver calls the function after any change
  // on the sheet: typed text, a new or deleted block, a hidden section,
  // a new link address. setTimeout waits 400 ms, and clearTimeout
  // cancels the previous wait, so fast typing is saved once, after
  // a short pause, and not after every letter.
  let timer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => saveNow(sheet), 400);
  });
  observer.observe(sheet, {
    childList: true, // elements added or removed
    subtree: true, // also deep inside the sheet
    characterData: true, // text changed
    attributes: true, // class or href changed
  });

  // The button with the name of the open CV opens and closes the list.
  pickerButton.addEventListener("click", () => {
    setListOpen(pickerList.hidden);
  });

  // A click on a CV in the list (event delegation: one listener for all
  // items). closest("button") finds the clicked item button.
  pickerList.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }
    setListOpen(false);
    if (button.dataset.id !== currentId) {
      saveNow(sheet);
      openCv(button.dataset.id, sheet);
    }
  });

  // A click anywhere outside the list and its button closes the list.
  document.addEventListener("click", (event) => {
    if (!pickerButton.contains(event.target) && !pickerList.contains(event.target)) {
      setListOpen(false);
    }
  });

  // Escape closes the list and puts the focus back on its button.
  pickerList.parentElement.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !pickerList.hidden) {
      setListOpen(false);
      pickerButton.focus();
    }
  });

  // Rename: every typed letter is saved, and the list shows the new name.
  nameInput.addEventListener("input", () => {
    updateCv(currentId, { name: nameInput.value });
    renderList();
  });

  document.querySelector('[data-action="new-cv"]').addEventListener("click", () => {
    saveNow(sheet);
    createBlankCv(sheet);
  });

  document.querySelector('[data-action="duplicate-cv"]').addEventListener("click", () => {
    saveNow(sheet);
    const copy = addCv(nameInput.value + " (copy)", getCvHtml(sheet));
    openCv(copy.id, sheet);
  });

  // Delete asks first in the confirmation window (confirm-dialog.js).
  // async lets the function wait for the answer with await.
  // After deleting, the first remaining CV is opened, or a new blank
  // one when there are no CVs left.
  document.querySelector('[data-action="delete-cv"]').addEventListener("click", async () => {
    const name = nameInput.value || "Untitled CV";
    const confirmed = await askConfirm(`Delete "${name}"? This cannot be undone.`, "Delete");

    if (!confirmed) {
      return;
    }
    clearTimeout(timer);
    deleteCv(currentId);
    currentId = null;

    const firstCv = loadCvs()[0];
    if (firstCv) {
      openCv(firstCv.id, sheet);
    } else {
      createBlankCv(sheet);
    }
  });
}
