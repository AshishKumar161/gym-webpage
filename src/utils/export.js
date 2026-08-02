/**
 * Data Export Utilities — Generates PDF reports and Excel/CSV spreadsheets.
 */

/**
 * Exports data to CSV/Excel format and triggers browser file download.
 * @param {string} filename
 * @param {string[]} headers
 * @param {Array<Object>} rows
 */
export function exportToExcel(filename, headers, rows) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.join(',') + '\r\n';

  rows.forEach(row => {
    const rowValues = headers.map(header => {
      const key = header.toLowerCase().replace(/\s+/g, '');
      const val = row[key] !== undefined ? row[key] : row[header] || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvContent += rowValues.join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers clean PDF print report view.
 * @param {string} title
 * @param {string[]} headers
 * @param {Array<Object>} rows
 */
export function exportToPDF(title, headers, rows) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; color: #111; }
        h1 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #3b82f6; }
        p { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 0.9rem; }
        th { background: #f3f4f6; color: #374151; font-weight: bold; }
        tr:nth-child(even) { background: #f9fafb; }
      </style>
    </head>
    <body>
      <h1>A² ReVamp Gym — ${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${headers.map(h => {
                const key = h.toLowerCase().replace(/\s+/g, '');
                return `<td>${row[key] !== undefined ? row[key] : row[h] || ''}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
