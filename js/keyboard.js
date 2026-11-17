// Keyboard navigation between the editable fields of the CV sheet.

// All editable fields on the sheet, in the order of the HTML.
function getFields(sheet) {
  return [...sheet.querySelectorAll("[contenteditable]")];
}

// Finds the first (or the last) piece of text inside an element.
// Returns null if the element has no text.
function findTextNode(element, last) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let found = null;
  let node = walker.nextNode();

  while (node) {
    if (node.textContent.trim() !== "") {
      found = node;
      if (!last) {
        break;
      }
    }
    node = walker.nextNode();
  }

  return found;
}

// Puts the text cursor into a field: at the start or at the end of its text.
// In a list the cursor goes into the first or the last bullet point,
// so the text is never typed outside a bullet point.
function placeCaret(field, atEnd) {
  let target = field;

  if (field.matches("ul")) {
    target = atEnd ? field.lastElementChild : field.firstElementChild;
  }

  field.focus();

  const range = document.createRange();
  const textNode = findTextNode(target, atEnd);

  if (textNode) {
    // Inside the text itself, so the browser knows where the cursor is
    // on the screen.
    range.setStart(textNode, atEnd ? textNode.length : 0);
  } else {
    // An empty field: the cursor goes into the element.
    range.setStart(target, 0);
  }
  range.collapse(true);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

// The text from the start of the field to the cursor, or from the cursor
// to the end of the field.
function getTextAround(field, part) {
  const cursor = window.getSelection().getRangeAt(0);
  const range = document.createRange();
  range.selectNodeContents(field);

  if (part === "before") {
    range.setEnd(cursor.startContainer, cursor.startOffset);
  } else {
    range.setStart(cursor.endContainer, cursor.endOffset);
  }

  return range.toString().trim();
}

function isCaretAtStart(field) {
  return getTextAround(field, "before") === "";
}

function isCaretAtEnd(field) {
  return getTextAround(field, "after") === "";
}

// Checks if the cursor is on the first or the last line of a field
// by comparing the position of the cursor and of the field on the screen.
function isCaretOnEdgeLine(field, edge) {
  const caretRect = window.getSelection().getRangeAt(0).getBoundingClientRect();

  // Sometimes the browser gives a cursor without a size (for example in an
  // empty field, or right after we moved the cursor into a field).
  // Then we check the text instead: the start of the text is on the first
  // line, the end of the text is on the last line.
  if (caretRect.height === 0) {
    return edge === "first" ? isCaretAtStart(field) : isCaretAtEnd(field);
  }

  const fieldRect = field.getBoundingClientRect();
  const lineHeight = caretRect.height;

  if (edge === "first") {
    return caretRect.top < fieldRect.top + lineHeight;
  }
  return caretRect.bottom > fieldRect.bottom - lineHeight;
}

// Finds the field right below (direction 1) or right above (direction -1)
// the current one on the screen. First it finds the closest row,
// then in that row the field closest to the left edge of the current field.
function findFieldInRow(sheet, current, direction) {
  const currentRect = current.getBoundingClientRect();
  const candidates = [];

  for (const field of getFields(sheet)) {
    const rect = field.getBoundingClientRect();

    if (field === current || rect.height === 0) {
      continue;
    }

    // Vertical distance; a negative one means "not below" (or "not above").
    const distanceY = direction === 1
      ? rect.top - currentRect.bottom
      : currentRect.top - rect.bottom;

    if (distanceY >= -2) {
      const distanceX = Math.abs(rect.left - currentRect.left);
      candidates.push({ field, distanceY, distanceX });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // The closest row: fields up to 6px further than the closest one
  // count as the same row (a title and its dates have different heights).
  const closestY = Math.min(...candidates.map((item) => item.distanceY));
  const row = candidates.filter((item) => item.distanceY <= closestY + 6);

  row.sort((a, b) => a.distanceX - b.distanceX);
  return row[0].field;
}

// The next (step 1) or previous (step -1) field in the order of the HTML.
function findFieldInOrder(sheet, current, step) {
  const fields = getFields(sheet);
  return fields[fields.indexOf(current) + step] ?? null;
}

// Moves the cursor to another field, if there is one.
// Returns true if it moved.
function moveTo(field, atEnd) {
  if (!field) {
    return false;
  }
  placeCaret(field, atEnd);
  return true;
}

export function setupKeyboardNavigation(sheet) {
  sheet.addEventListener("keydown", (event) => {
    const field = event.target;
    let moved = false;

    if (event.key === "ArrowDown" && isCaretOnEdgeLine(field, "last")) {
      // Down on the last line: go to the field below.
      moved = moveTo(findFieldInRow(sheet, field, 1), false);
    } else if (event.key === "ArrowUp" && isCaretOnEdgeLine(field, "first")) {
      // Up on the first line: go to the field above, to the end of its text.
      moved = moveTo(findFieldInRow(sheet, field, -1), true);
    } else if (event.key === "ArrowRight" && isCaretAtEnd(field)) {
      // Right at the end of the text: go to the next field.
      moved = moveTo(findFieldInOrder(sheet, field, 1), false);
    } else if (event.key === "ArrowLeft" && isCaretAtStart(field)) {
      // Left at the start of the text: go to the previous field.
      moved = moveTo(findFieldInOrder(sheet, field, -1), true);
    } else if (event.key === "Enter") {
      // Enter goes to the next field. In a list, Enter adds a new bullet
      // point (the browser does it), and Enter on an empty last bullet
      // point removes it and leaves the list.
      if (field.matches("ul")) {
        const lastItem = field.lastElementChild;
        const isLastEmpty = lastItem.textContent.trim() === "";

        if (!isLastEmpty || field.children.length === 1) {
          return;
        }
        lastItem.remove();
      }
      event.preventDefault();
      moveTo(findFieldInOrder(sheet, field, 1), false);
      return;
    }

    // The browser must not move the cursor a second time.
    if (moved) {
      event.preventDefault();
    }
  });
}
