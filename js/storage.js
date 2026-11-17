// Saving CVs in localStorage (the browser keeps it after the browser
// is closed). Only this module knows how the data is stored.
//
// localStorage keeps strings only, so the list is turned into text
// with JSON.stringify() and back with JSON.parse().
// One CV is an object: { id, name, html }.

const LIST_KEY = "cv-editor.cvs";
const CURRENT_KEY = "cv-editor.current";

// Returns the array of all saved CVs ([] on the first visit).
export function loadCvs() {
  const text = localStorage.getItem(LIST_KEY);

  if (text === null) {
    return [];
  }
  return JSON.parse(text);
}

function saveCvs(cvs) {
  localStorage.setItem(LIST_KEY, JSON.stringify(cvs));
}

// find() returns the first element for which the arrow function
// returns true, or undefined when there is none.
export function findCv(id) {
  return loadCvs().find((cv) => cv.id === id);
}

// Adds a new CV to the end of the list and returns it.
// Date.now() is the number of milliseconds since 1970; toString(36)
// writes it with digits and letters, so the id is short and unique.
export function addCv(name, html) {
  const cv = { id: Date.now().toString(36), name, html };
  const cvs = loadCvs();

  cvs.push(cv);
  saveCvs(cvs);
  return cv;
}

// Changes some fields of one CV, for example { html } or { name }.
// { ...cv, ...changes } is a new object with all fields of cv, where
// the fields of changes replace the old ones.
export function updateCv(id, changes) {
  const cvs = loadCvs().map((cv) => (cv.id === id ? { ...cv, ...changes } : cv));

  saveCvs(cvs);
}

// filter() keeps only the CVs for which the function returns true.
export function deleteCv(id) {
  const cvs = loadCvs().filter((cv) => cv.id !== id);

  saveCvs(cvs);
}

// The id of the CV that was open last time (null if none).
export function getCurrentId() {
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentId(id) {
  localStorage.setItem(CURRENT_KEY, id);
}
