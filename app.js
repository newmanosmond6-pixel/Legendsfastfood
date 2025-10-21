// Basic static app (no server). Orders stored in localStorage for dashboard demo.
//
// Replace logo.jpeg and wallpaper.jpeg files in same folder.
// WhatsApp button opens chat using NEXT_PUBLIC_WHATSAPP_LINK (we hard-coded earlier).

// Preloaded menu
const MENU = [
  { id: 1, name: 'Banku & Tilapia', cat: 'Foods' },
  { id: 2, name: 'Abete3', cat: 'Foods' },
  { id: 3, name: 'Fufu', cat: 'Foods' },
  { id: 4, name: 'Kenkey & Fish', cat: 'Foods' },
  { id: 5, name: 'Jollof Rice', cat: 'Foods' },
  { id: 6, name: 'Waakye', cat: 'Foods' },
  { id: 7, name: 'Fried Yam', cat: 'Foods' },
  { id: 8, name: 'Coca-Cola', cat: 'Drinks' },
  { id: 9, name: 'Malta', cat: 'Drinks' },
  { id:10, name: 'Sobolo', cat: 'Drinks' },
  { id:11, name: 'Paracetamol', cat: 'Drugs' },
  { id:12, name: 'Hand Sanitizer', cat: 'Drugs' }
];

const cart = [];

function qs(sel){return document.querySelector(sel)}
function qsa(sel){return Array.from(document.querySelectorAll(sel))}

function renderMenu(filter='All'){
  const grid = qs('#menuGrid');
  grid.innerHTML = '';
  MENU.filter(i => filter === 'All' ? true : i.cat === filter)
      .forEach(item => {
        const el = document.createElement('div');
        el.className = 'menu-item';
        el.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="name">${item.name}</div>
            <div class="badge">--</div>
          </div>
          <div class="small">${item.cat}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <button class="btn add" data-id="${item.id}">Add</button>
            <button class="btn" onclick="quickView(${item.id})">Details</button>
          </div>
        `;
        grid.appendChild(el);
      });
  qsa('.add').forEach(b => b.addEventListener('click', e=>{
    const id = +e.currentTarget.dataset.id;
    addToCart(id);
  }));
}

function addToCart(id){
  const item = MENU.find(m=>m.id===id);
  // price left blank for owner; default price 0 so owner can add later.
  cart.push({...item, qty:1, price:0});
  renderCart();
  alert(item.name + ' added to cart (price editable in dashboard).');
}

function renderCart(){
  const container = qs('#cartItems');
  container.innerHTML = '';
  cart.forEach((it, idx) => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.marginBottom = '8px';
    div.innerHTML = `<div>${it.name} x ${it.qty}</div><div><button class="btn small remove" data-i="${idx}">Remove</button></div>`;
    container.appendChild(div);
  });
  qsa('.remove').forEach(b => b.addEventListener('click', e=>{
    cart.splice(+e.currentTarget.dataset.i,1);
    renderCart();
  }));
  updateTotals();
}

function getDeliveryFee(){
  const loc = qs('#locationSelect');
  const sel = loc.selectedOptions[0];
  const dist = parseFloat(sel.dataset.dist || '0'); // km
  const perKm = parseFloat(qs('#perKmRate').value || '0');
  const base = 2.0; // base fee
  return Math.max(0, base + dist * perKm);
}

function updateTotals(){
  const itemsTotal = cart.reduce((s,it)=> s + (it.price || 0) * it.qty, 0);
  const delivery = getDeliveryFee();
  qs('#deliveryFee').textContent = `GHS ${delivery.toFixed(2)}`;
  qs('#cartTotal').textContent = `GHS ${(itemsTotal + delivery).toFixed(2)}`;
}

function openOrderModal(){
  if(cart.length === 0){
    alert('Your cart is empty. Add items from the Menu.');
    return;
  }
  const modal = qs('#orderModal');
  modal.classList.remove('hidden');
  qs('#summaryItems').textContent = cart.length;
  const delivery = getDeliveryFee();
  qs('#summaryDelivery').textContent = `GHS ${delivery.toFixed(2)}`;
  const itemsTotal = cart.reduce((s,it)=> s + (it.price || 0) * it.qty, 0);
  qs('#summaryTotal').textContent = `GHS ${(itemsTotal + delivery).toFixed(2)}`;
}

function closeOrderModal(){
  qs('#orderModal').classList.add('hidden');
}

// Orders storage - localStorage
function getOrders(){ try { return JSON.parse(localStorage.getItem('lff_orders')||'[]') } catch(e){return []} }
function saveOrder(o){ const arr = getOrders(); arr.unshift(o); localStorage.setItem('lff_orders', JSON.stringify(arr)); }

function placeOrder(e){
  e.preventDefault();
  const name = qs('#custName').value.trim();
  const phone = qs('#custPhone').value.trim();
  const address = qs('#custAddress').value.trim();
  if(!name || !phone || !address){ alert('Please fill name, phone and address.'); return; }
  const delivery = getDeliveryFee();
  const itemsTotal = cart.reduce((s,it)=> s + (it.price || 0) * it.qty, 0);
  const total = itemsTotal + delivery;
  const order = {
    id: 'LFF-' + Date.now(),
    name, phone, address,
    items: cart.map(i=>({name:i.name, qty:i.qty, price:i.price || 0})),
    total, time: new Date().toLocaleString(), location: qs('#locationSelect').value
  };
  saveOrder(order);
  // clear cart
  cart.length = 0;
  renderCart();
  closeOrderModal();
  alert('Order placed! It appears in Merchant Dashboard.');
}

function quickView(id){
  const item = MENU.find(m=>m.id===id);
  alert(item.name + '\nCategory: ' + item.cat + '\nPrice: set later by owner');
}

// quick order / reorder: pulls the last order from localStorage and places same
function quickReorder(){
  const last = getOrders()[0];
  if(!last){ alert('No previous orders'); return; }
  // put items into cart
  cart.length = 0;
  last.items.forEach(it => cart.push({id: Date.now()+Math.random(), name: it.name, qty: it.qty, price: it.price}));
  renderCart();
  alert('Loaded last order into cart. Proceed to checkout.');
}

// init UI
document.addEventListener('DOMContentLoaded', ()=>{
  renderMenu();
  qs('#categorySelect').addEventListener('change', e => renderMenu(e.target.value));
  qs('#btnOrderNow').addEventListener('click', ()=> location.href='#menuGrid' || renderMenu() );
  qs('#btnCheckout').addEventListener('click', openOrderModal);
  qs('#cancelOrder').addEventListener('click', closeOrderModal);
  qs('#orderForm').addEventListener('submit', placeOrder);
  qs('#btnClear').addEventListener('click', ()=>{ cart.length=0; renderCart(); });
  qs('#perKmRate').addEventListener('input', updateTotals);
  qs('#locationSelect').addEventListener('change', updateTotals);

  // Setup WhatsApp link to include a sample message
  const wa = qs('#whatsappBtn');
  if(wa){
    wa.href = 'https://wa.me/233591033284?text=' + encodeURIComponent("Hello, I'd like to order from Legend's Fast Food 🍔");
  }

  // quick-order via double-tap on header brand (debug)
  qs('.brand').addEventListener('dblclick', quickReorder);
});
