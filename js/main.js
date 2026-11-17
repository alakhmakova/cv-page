// Download PDF button: opens the browser print dialog,
// where the user chooses "Save as PDF".
const printButton = document.querySelector('[data-action="print"]');

printButton.addEventListener("click", () => {
  window.print();
});