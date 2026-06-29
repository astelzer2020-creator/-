/**
 * Export utilities for PDF and Excel generation.
 * Uses jsPDF + html2canvas for PDF, xlsx for Excel.
 */

export async function exportToPDF(elementId, fileName = 'report') {
  const { default: jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    backgroundColor: '#0d1526',
    scale: 2,
    useCORS: true,
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * pageWidth) / canvas.width
  let yPos = 0

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  } else {
    let remaining = imgHeight
    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', 0, yPos, imgWidth, imgHeight)
      remaining -= pageHeight
      yPos -= pageHeight
      if (remaining > 0) pdf.addPage()
    }
  }
  pdf.save(`${fileName}.pdf`)
}

export async function exportProjectToExcel(projects, fileName = 'projects') {
  const { utils, writeFile } = await import('xlsx')
  const rows = projects.map((p) => ({
    ID: p.id,
    Name: p.name,
    City: p.city,
    'Plan Type': p.planType,
    Status: p.status,
    Units: p.units,
    'Investment (₪)': p.investment,
    'ROI (%)': p.roi,
    'Avg Unit Size': p.avgUnitSize,
  }))
  const ws = utils.json_to_sheet(rows)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Projects')
  writeFile(wb, `${fileName}.xlsx`)
}
