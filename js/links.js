// Editing of link addresses (href) on the CV sheet.
// Email and phone links take their address from their text.
// Web links (http/https) get a small box under them with the address.

// The box with the address field; it is in editor.html outside the sheet.
const box = document.querySelector("#link-editor");
const input = box.querySelector("input");

// The web link that the box is showing now (null when it is hidden).
let currentLink = null;

// true for a link that leads to a web page (not email or phone).
function isWebLink(element) {
  return element.matches("a") && element.href.startsWith("http");
}

// Adds https:// when the address has no http:// or https:// at the start.
function toWebAddress(text) {
  if (/^https?:\/\//i.test(text)) {
    return text;
  }
  return "https://" + text;
}

// Sets the href of the link from its text after every change of the text.
// Email: mailto: + text. Phone: tel: + digits and "+" only (no spaces).
// Web link whose text looks like an address (has a dot, no spaces):
// the address is the text, e.g. "github.com/anna/cv".
function updateHrefFromText(link) {
  const text = link.textContent.trim();

  if (link.href.startsWith("mailto:")) {
    link.href = "mailto:" + text;
  } else if (link.href.startsWith("tel:")) {
    link.href = "tel:" + text.replace(/[^\d+]/g, "");
  } else if (isWebLink(link) && text.includes(".") && !text.includes(" ")) {
    link.href = toWebAddress(text);
  }
}

// Shows the box under the link with the current address in the field.
// getBoundingClientRect() gives the place of the link in the window;
// window.scrollY is added because the box is placed in the page.
function showBox(link) {
  currentLink = link;
  input.value = link.href;

  const rect = link.getBoundingClientRect();
  box.style.top = rect.bottom + window.scrollY + 8 + "px";
  box.style.left = rect.left + window.scrollX + "px";
  box.hidden = false;
}

function hideBox() {
  box.hidden = true;
  currentLink = null;
}

// Hides the box and puts the cursor back into the link.
// The link gets the focus again, and focusin would open the box at once;
// returningToLink tells the focusin handler not to do it this time.
// focus() runs the focusin handler right away, before the next line.
let returningToLink = false;

function closeBox() {
  const link = currentLink;
  hideBox();
  returningToLink = true;
  link.focus();
  returningToLink = false;
}

// Saves the address from the field into the link.
function saveAddress() {
  const address = input.value.trim();

  if (address !== "") {
    currentLink.href = toWebAddress(address);
  }
  closeBox();
}

export function setupLinkEditing(sheet) {
  sheet.addEventListener("input", (event) => {
    if (event.target.matches("a")) {
      updateHrefFromText(event.target);
    }
  });

  // focusin: an element on the sheet gets the focus (a click, Tab,
  // arrows). For a web link the box opens under it.
  sheet.addEventListener("focusin", (event) => {
    if (isWebLink(event.target) && !returningToLink) {
      showBox(event.target);
    }
  });

  // focusout: the link or the field in the box loses the focus.
  // relatedTarget is the element that gets the focus next (null after
  // a click on an empty place). The box stays open only while the focus
  // moves between the link and the box.
  document.addEventListener("focusout", (event) => {
    const next = event.relatedTarget;

    if (next !== currentLink && !box.contains(next)) {
      hideBox();
    }
  });

  // Enter in the field saves, Escape closes the box without saving.
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveAddress();
    } else if (event.key === "Escape") {
      closeBox();
    }
  });

  box.querySelector("button").addEventListener("click", saveAddress);
}
