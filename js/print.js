// Download PDF button: opens the browser print dialog,
// where the user chooses "Save as PDF".
export function setupPrintButton() {
  const printButton = document.querySelector('[data-action="print"]');

  printButton.addEventListener("click", () => {
    window.print();
  });
}