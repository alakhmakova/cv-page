// Hiding and showing sections and contacts, duplicating and deleting
// blocks.
// The buttons are in editor.html outside the sheet, so they never become
// part of the CV. They move next to the section or block under the
// mouse (or with the text cursor).

const sectionControls = document.querySelector("#section-controls");
const blockControls = document.querySelector("#block-controls");
const toggleButton = sectionControls.querySelector("button");
const duplicateButton = blockControls.querySelector('[data-action="duplicate-block"]');
const deleteButton = blockControls.querySelector('[data-action="delete-block"]');
const contactControls = document.querySelector("#contact-controls");
const contactButton = contactControls.querySelector("button");

// The section and the block that the buttons belong to now.
// ?. (optional chaining) below calls a method only when the variable
// is not null: currentBlock?.classList... does nothing while it is null.
let currentSection = null;
let currentBlock = null;
let currentContact = null;

// Puts a button group in the free space to the right of the sheet, on
// the same height as the element. When the window is too narrow for
// that, the group goes inside the sheet at its right edge.
// getBoundingClientRect() is relative to the window, so window.scrollY
// is added to get the place in the page.
function placeNextTo(controls, element, sheet) {
  const sheetRect = sheet.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const width = controls.offsetWidth;
  let left = sheetRect.right + 12;

  if (left + width > document.documentElement.clientWidth) {
    left = sheetRect.right - width - 8;
  }
  controls.style.left = left + window.scrollX + "px";
  controls.style.top = rect.top + window.scrollY + "px";
}

// Shows the section button next to the section heading.
// Its text says what a click will do: hide or show.
function showSectionControls(section, sheet) {
  currentSection?.classList.remove("is-target");
  currentSection = section;
  const isHidden = section.classList.contains("is-hidden");

  toggleButton.textContent = isHidden ? "Show section" : "Hide section";
  sectionControls.hidden = false;
  placeNextTo(sectionControls, section.querySelector("h2"), sheet);
}

// Shows the block buttons next to the block. The last block of a
// section cannot be deleted: without it there is nothing to duplicate.
function showBlockControls(block, sheet) {
  currentBlock?.classList.remove("is-target");
  currentBlock = block;
  const siblings = block.parentElement.querySelectorAll(":scope > [data-block]");

  deleteButton.disabled = siblings.length === 1;
  blockControls.hidden = false;
  placeNextTo(blockControls, block, sheet);
}

// Shows the Hide/Show button for one contact (city, phone, email,
// LinkedIn, GitHub) right above it. The button touches the contact,
// so the mouse can move onto it without leaving the contact first.
function showContactControls(contact) {
  currentContact = contact;
  const isHidden = contact.classList.contains("is-hidden");

  contactButton.textContent = isHidden ? "Show" : "Hide";
  contactControls.hidden = false;

  const rect = contact.getBoundingClientRect();
  contactControls.style.left = rect.left + window.scrollX + "px";
  contactControls.style.top =
    rect.top + window.scrollY - contactControls.offsetHeight + 2 + "px";
}

// Finds the contact, the section and the block of an element on the sheet and
// moves the buttons there. closest() goes up from the element to the
// nearest parent that matches the selector (or returns null).
// The empty edges of the sheet itself change nothing, so the mouse can
// cross them on the way to the buttons.
function updateControls(element, sheet) {
  if (element === sheet) {
    return;
  }
  const contact = element.closest(".contacts li");
  const section = element.closest("[data-section]");
  const block = element.closest("[data-block]");

  if (contact) {
    showContactControls(contact);
  } else {
    contactControls.hidden = true;
    currentContact = null;
  }

  if (section) {
    showSectionControls(section, sheet);
  } else {
    sectionControls.hidden = true;
    currentSection = null;
  }

  if (block) {
    showBlockControls(block, sheet);
  } else {
    blockControls.hidden = true;
    currentBlock = null;
  }
}

// Puts the text cursor into the first field of the element.
function focusFirstField(element) {
  const field = element.querySelector("[data-editable]");

  if (field) {
    field.focus();
  }
}

export function setupBlockControls(sheet) {
  // mouseover fires when the mouse comes onto any element on the sheet;
  // focusin when a field gets the text cursor (click, Tab, arrows).
  sheet.addEventListener("mouseover", (event) => {
    updateControls(event.target, sheet);
  });
  sheet.addEventListener("focusin", (event) => {
    updateControls(event.target, sheet);
  });

  // Text that grows or a window that changes size moves the blocks,
  // so the buttons are placed again.
  sheet.addEventListener("input", () => {
    if (currentSection) showSectionControls(currentSection, sheet);
    if (currentBlock) showBlockControls(currentBlock, sheet);
  });
  window.addEventListener("resize", () => {
    if (currentSection) showSectionControls(currentSection, sheet);
    if (currentBlock) showBlockControls(currentBlock, sheet);
  });

  // Hide / Show: the class is-hidden is switched on or off.
  // classList.toggle() adds the class when it is missing and removes it
  // when it is there.
  toggleButton.addEventListener("click", () => {
    currentSection.classList.toggle("is-hidden");
    showSectionControls(currentSection, sheet);
  });

  // Duplicate: cloneNode(true) copies the block with everything inside,
  // after() puts the copy right after the block.
  duplicateButton.addEventListener("click", () => {
    const copy = currentBlock.cloneNode(true);
    copy.classList.remove("is-target");

    currentBlock.after(copy);
    showBlockControls(copy, sheet);
    focusFirstField(copy);
  });

  // Delete: the block is removed from the page; the buttons move to the
  // block before it (or after it, when the first block was deleted).
  deleteButton.addEventListener("click", () => {
    const next = currentBlock.previousElementSibling?.matches("[data-block]")
      ? currentBlock.previousElementSibling
      : currentBlock.nextElementSibling;

    currentBlock.remove();
    showBlockControls(next, sheet);
  });

  // Hide / Show for a contact: the same class is-hidden as for sections.
  contactButton.addEventListener("click", () => {
    currentContact.classList.toggle("is-hidden");
    showContactControls(currentContact);
  });

  // While the mouse is over Duplicate or Delete, the block they belong
  // to is tinted, so it is clear which block will be copied or deleted.
  for (const button of [duplicateButton, deleteButton]) {
    button.addEventListener("mouseenter", () => {
      currentBlock.classList.add("is-target");
    });
    button.addEventListener("mouseleave", () => {
      currentBlock.classList.remove("is-target");
    });
  }
  toggleButton.addEventListener("mouseenter", () => {
    currentSection.classList.add("is-target");
  });
  toggleButton.addEventListener("mouseleave", () => {
    currentSection.classList.remove("is-target");
  });
}
