import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminInventory() {
  setTimeout(() => initInventory(), 100);

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
      <h2 class="dash-header-title">Inventory Management</h2>
      <button class="btn btn-primary" onclick="window.openAddProductModal()">+ Add Product</button>
    </div>

    <div class="glass-card" style="padding:1.5rem; overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary);">
            <th style="padding:1rem;">SKU</th>
            <th style="padding:1rem;">Product Name</th>
            <th style="padding:1rem;">Price</th>
            <th style="padding:1rem;">Stock</th>
            <th style="padding:1rem;">Status</th>
            <th style="padding:1rem; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="inventory-table-body">
          <tr><td colspan="6" style="padding:1rem; text-align:center;">Loading inventory...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modals for Add/Edit/Stock Adjust (omitted for brevity in template, can be added as needed) -->
  `;
}

async function initInventory() {
  try {
    const res = await safeFetchApi('/inventory/products');
    const tbody = document.getElementById('inventory-table-body');
    if (!res?.data || res.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:1rem; text-align:center;">No products found</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.map(p => {
      const stock = p.inventory?.quantity || 0;
      const threshold = p.inventory?.lowStockThreshold || 5;
      
      let statusBadge = '<span style="background:var(--accent-cyan); color:#000; padding:2px 8px; border-radius:12px; font-size:0.8rem;">In Stock</span>';
      if (stock === 0) {
        statusBadge = '<span style="background:#ef4444; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.8rem;">Out of Stock</span>';
      } else if (stock <= threshold) {
        statusBadge = '<span style="background:#f59e0b; color:#000; padding:2px 8px; border-radius:12px; font-size:0.8rem;">Low Stock</span>';
      }

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:1rem; font-family:monospace;">${p.sku}</td>
          <td style="padding:1rem; font-weight:600;">${p.name}</td>
          <td style="padding:1rem;">₹${p.price}</td>
          <td style="padding:1rem;">${stock}</td>
          <td style="padding:1rem;">${statusBadge}</td>
          <td style="padding:1rem; text-align:right;">
            <button class="btn btn-outline btn-sm" onclick="alert('Adjust stock for ${p.id}')">📦 Adjust</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load inventory', err);
  }
}

window.openAddProductModal = () => {
  alert("Open Add Product Modal (To be implemented with form)");
};
