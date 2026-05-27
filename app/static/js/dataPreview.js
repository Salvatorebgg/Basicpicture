/* ── Data Preview Module ───────────────────────────────── */

function renderDataPreview() {
  // Data preview is now rendered inline in app.js via updatePreviewTable()
  // This function kept for backward compatibility
}

function updateAllSelectors() {
  // Update variable selectors across all panels
  setTimeout(() => {
    if (typeof buildChartVarControls === 'function') {
      buildChartVarControls();
    }
    if (typeof buildTableVarControls === 'function') {
      buildTableVarControls();
    }
  }, 100);
}
