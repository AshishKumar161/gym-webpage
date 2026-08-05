import { safeFetchApi } from '../../../utils/auth.js';

export async function renderAdminPOS() {
  setTimeout(() => initPOS(), 100);

  return `
    <div style="display:flex; height: 80vh; gap: 2rem;">
      <!-- Product Selection Panel -->
      <div class="glass-card" style="flex: 2; padding: 1.5rem; display:flex; flex-direction:column;">
        <h2 class="dash-header-title" style="margin-bottom:1rem;">Point of Sale</h2>
        <input type="text" id="pos-search" placeholder="Search by name, SKU, or barcode..." style="padding:1rem; border-radius:8px; border:1px solid var(--border-color); background:transparent; color:#fff; width:100%; margin-bottom:1.5rem;" />
        
        <div id="pos-product-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:1rem; overflow-y:auto; padding-right:0.5rem; flex-grow:1;">
          <div style="color:var(--text-secondary);">Loading products...</div>
        </div>
      </div>

      <!-- Cart Panel -->
      <div class="glass-card" style="flex: 1; padding: 1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 style="margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">Current Sale</h3>
          <div id="pos-cart-items" style="min-height:200px; max-height:400px; overflow-y:auto;">
            <p style="color:var(--text-secondary); text-align:center;">Cart is empty</p>
          </div>
        </div>

        <div style="border-top:1px solid var(--border-color); padding-top:1rem; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span>Subtotal</span>
            <span id="pos-subtotal">₹0.00</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span>Tax</span>
            <span id="pos-tax">₹0.00</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:1.5rem; font-weight:bold; margin-bottom:1.5rem; color:var(--accent-cyan);">
            <span>Total</span>
            <span id="pos-total">₹0.00</span>
          </div>
          
          <select id="pos-payment-method" style="width:100%; padding:0.8rem; margin-bottom:1rem; background:var(--bg-card); color:#fff; border:1px solid var(--border-color); border-radius:8px;">
            <option value="CASH">Cash</option>
            <option value="CARD">Credit/Debit Card</option>
            <option value="UPI">UPI</option>
          </select>

          <button class="btn btn-primary" style="width:100%; padding:1rem; font-size:1.2rem;" onclick="window.processCheckout()">Checkout</button>
        </div>
      </div>
    </div>
  `;
}

let products = [];
let cart = [];

async function initPOS() {
  try {
    const res = await safeFetchApi('/inventory/products');
    if (res?.data) {
      products = res.data.filter(p => p.inventory && p.inventory.quantity > 0);
      renderProductGrid(products);
    }
  } catch (err) {
    console.error('POS Init error', err);
  }

  document.getElementById('pos-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term) || 
      (p.barcode && p.barcode.toLowerCase().includes(term))
    );
    renderProductGrid(filtered);
  });
}

function renderProductGrid(items) {
  const grid = document.getElementById('pos-product-grid');
  grid.innerHTML = items.map(p => `
    <div style="border:1px solid var(--border-color); border-radius:8px; padding:1rem; cursor:pointer; background:var(--bg-card); transition:transform 0.2s; text-align:center;" 
         onclick="window.addToCart('${p.id}')"
         onmouseover="this.style.transform='scale(1.02)'" 
         onmouseout="this.style.transform='scale(1)'">
      <h4 style="margin-bottom:0.5rem;">${p.name}</h4>
      <div style="color:var(--accent-cyan); font-weight:bold; margin-bottom:0.5rem;">₹${p.price}</div>
      <div style="font-size:0.8rem; color:var(--text-secondary);">Stock: ${p.inventory.quantity}</div>
    </div>
  `).join('');
}

window.addToCart = (id) => {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const existing = cart.find(i => i.product.id === id);
  if (existing) {
    if (existing.quantity < prod.inventory.quantity) {
      existing.quantity++;
    } else {
      alert('Not enough stock available');
    }
  } else {
    cart.push({ product: prod, quantity: 1 });
  }
  updateCartUI();
};

window.removeFromCart = (id) => {
  cart = cart.filter(i => i.product.id !== id);
  updateCartUI();
};

function updateCartUI() {
  const cartContainer = document.getElementById('pos-cart-items');
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">Cart is empty</p>';
    document.getElementById('pos-subtotal').textContent = '₹0.00';
    document.getElementById('pos-tax').textContent = '₹0.00';
    document.getElementById('pos-total').textContent = '₹0.00';
    return;
  }

  let subtotal = 0;
  let tax = 0;

  cartContainer.innerHTML = cart.map(item => {
    const itemSub = parseFloat(item.product.price) * item.quantity;
    const itemTax = itemSub * (parseFloat(item.product.taxRate) / 100);
    subtotal += itemSub;
    tax += itemTax;

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <div style="font-weight:bold;">${item.product.name}</div>
          <div style="font-size:0.85rem; color:var(--text-secondary);">₹${item.product.price} x ${item.quantity}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-weight:bold;">₹${(itemSub + itemTax).toFixed(2)}</span>
          <button style="background:transparent; border:none; color:#ef4444; cursor:pointer;" onclick="window.removeFromCart('${item.product.id}')">❌</button>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('pos-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('pos-tax').textContent = `₹${tax.toFixed(2)}`;
  document.getElementById('pos-total').textContent = `₹${(subtotal + tax).toFixed(2)}`;
}

window.processCheckout = async () => {
  if (cart.length === 0) return alert('Cart is empty');
  const method = document.getElementById('pos-payment-method').value;

  const cartItems = cart.map(i => ({ productId: i.product.id, quantity: i.quantity }));

  try {
    const res = await safeFetchApi('/pos/checkout', {
      method: 'POST',
      body: JSON.stringify({ cartItems, paymentMethod: method })
    });

    if (res?.success) {
      alert(`Sale completed! Receipt: ${res.data.receiptNumber}`);
      cart = [];
      updateCartUI();
      initPOS(); // refresh stock
    }
  } catch (err) {
    alert('Checkout failed');
    console.error(err);
  }
};
