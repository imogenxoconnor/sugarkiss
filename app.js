const products = [
  {
    id: "vanilla",
    name: "Vanilla Sugar Lip Scrub",
    category: "Vanilla",
    price: 7.5,
    inventory: 30,
    description: "A soft, sweet classic made fresh with natural sugar crystals and a warm vanilla scent.",
    image: "https://cdn.pixabay.com/photo/2017/07/19/15/43/vanilla-2519484_1280.jpg",
  },
  {
    id: "coconut",
    name: "Coconut Sugar Lip Scrub",
    category: "Coconut",
    price: 7.5,
    inventory: 30,
    description: "A tropical coconut flavour for smooth lips, packed in a biodegradable kraft paper jar.",
    image: "https://cdn.pixabay.com/photo/2017/05/30/19/42/skincare-2357980_1280.jpg",
  },
  {
    id: "raspberry",
    name: "Raspberry Sugar Lip Scrub",
    category: "Raspberry",
    price: 7.5,
    inventory: 30,
    description: "A bright berry flavour with a fresh, fruity finish for a naturally polished pout.",
    image: "https://cdn.pixabay.com/photo/2019/11/03/20/33/raspberry-4599580_1280.jpg",
  },
  {
    id: "lemon",
    name: "Lemon Sugar Lip Scrub",
    category: "Lemon",
    price: 7.5,
    inventory: 30,
    description: "A fresh citrus flavour designed to feel clean, bright, and naturally uplifting.",
    image: "https://cdn.pixabay.com/photo/2022/06/26/18/59/lemons-7286139_1280.jpg",
  },
];

const state = {
  cart: JSON.parse(localStorage.getItem("sugar-kiss-cart") || "{}"),
  category: "All",
  search: "",
  sort: "featured",
  paypalRenderedKey: "",
};

const currency = new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
});

const productGrid = document.querySelector("#product-grid");
const categoryList = document.querySelector("#category-list");
const productCount = document.querySelector("#product-count");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const subtotalEl = document.querySelector("#subtotal");
const shippingEl = document.querySelector("#shipping");
const gstEl = document.querySelector("#gst");
const totalEl = document.querySelector("#total");
const checkoutMessage = document.querySelector("#checkout-message");
const paymentStatus = document.querySelector("#payment-status");
const paypalContainer = document.querySelector("#paypal-button-container");
const checkoutForm = document.querySelector("#checkout-form");

document.querySelector("#search-input").addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderProducts();
});

document.querySelector("#sort-select").addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

document.querySelector("#clear-cart").addEventListener("click", () => {
  state.cart = {};
  persistCart();
  renderProducts();
  renderCart();
});

checkoutForm.addEventListener("input", () => {
  paymentStatus.textContent = "";
  paymentStatus.classList.remove("error");
});

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  renderCategories();
  renderProducts();
});

function getCategories() {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function getFilteredProducts() {
  return products
    .filter((product) => {
      const matchesCategory = state.category === "All" || product.category === state.category;
      const matchesSearch =
        !state.search ||
        product.name.toLowerCase().includes(state.search) ||
        product.description.toLowerCase().includes(state.search) ||
        product.category.toLowerCase().includes(state.search);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (state.sort === "price-low") return a.price - b.price;
      if (state.sort === "price-high") return b.price - a.price;
      if (state.sort === "name") return a.name.localeCompare(b.name);
      return products.findIndex((product) => product.id === a.id) - products.findIndex((product) => product.id === b.id);
    });
}

function renderCategories() {
  categoryList.innerHTML = getCategories()
    .map(
      (category) => `
        <button class="category-button ${category === state.category ? "active" : ""}" type="button" data-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");
}

function renderProducts() {
  const visibleProducts = getFilteredProducts();
  productCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "flavour" : "flavours"}`;

  if (!visibleProducts.length) {
    productGrid.innerHTML = `<p class="empty-cart">No products match that search yet.</p>`;
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map((product) => {
      const inCart = state.cart[product.id] || 0;
      const remaining = product.inventory - inCart;
      const isLowStock = remaining > 0 && remaining <= 6;

      return `
        <article class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="product-content">
            <div class="product-meta">
              <h3>${product.name}</h3>
              <span class="badge ${isLowStock ? "low-stock" : ""}">${remaining > 0 ? `${remaining} left` : "Sold out"}</span>
            </div>
            <p>${product.description}</p>
            <div class="price-row">
              <span class="price">${currency.format(product.price)}</span>
              <button class="primary-button" type="button" data-add="${product.id}" ${remaining <= 0 ? "disabled" : ""}>
                Add
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
}

function addToCart(productId) {
  const product = getProduct(productId);
  const currentQuantity = state.cart[productId] || 0;
  if (!product || currentQuantity >= product.inventory) return;
  state.cart[productId] = currentQuantity + 1;
  persistCart();
  renderProducts();
  renderCart();
}

function changeQuantity(productId, change) {
  const product = getProduct(productId);
  if (!product) return;

  const nextQuantity = (state.cart[productId] || 0) + change;
  if (nextQuantity <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = Math.min(nextQuantity, product.inventory);
  }

  persistCart();
  renderProducts();
  renderCart();
}

function removeItem(productId) {
  delete state.cart[productId];
  persistCart();
  renderProducts();
  renderCart();
}

function getCartLines() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => {
      const product = getProduct(id);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean);
}

function getTotals() {
  const lines = getCartLines();
  const subtotal = roundMoney(lines.reduce((sum, product) => sum + product.price * product.quantity, 0));
  const shipping = subtotal === 0 || subtotal >= 30 ? 0 : 4.5;
  const total = roundMoney(subtotal + shipping);
  const gstIncluded = roundMoney(total * 3 / 23);
  return { lines, subtotal, shipping, total, gstIncluded };
}

function renderCart() {
  const totals = getTotals();
  const itemCount = totals.lines.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = itemCount;
  subtotalEl.textContent = currency.format(totals.subtotal);
  shippingEl.textContent = totals.subtotal === 0 ? currency.format(0) : totals.shipping ? currency.format(totals.shipping) : "Free";
  gstEl.textContent = currency.format(totals.gstIncluded);
  totalEl.textContent = currency.format(totals.total);

  checkoutMessage.textContent = totals.lines.length
    ? "Review your Sugar Kiss order, add customer details, then complete the sandbox PayPal checkout."
    : "Add a flavour, enter customer details, then use PayPal sandbox checkout.";

  if (!totals.lines.length) {
    cartItems.innerHTML = `<p class="empty-cart">Your cart is empty. Add a lip scrub flavour from the catalogue to begin checkout.</p>`;
  } else {
    cartItems.innerHTML = totals.lines
      .map(
        (item) => `
          <article class="cart-item">
            <img src="${item.image}" alt="${item.name}" />
            <div class="cart-item-main">
              <strong>${item.name}</strong>
              <small>${currency.format(item.price)} each</small>
              <div class="cart-actions">
                <div class="quantity-control" aria-label="Quantity for ${item.name}">
                  <button class="quantity-button" type="button" data-qty="${item.id}" data-change="-1" aria-label="Decrease ${item.name}">-</button>
                  <span>${item.quantity}</span>
                  <button class="quantity-button" type="button" data-qty="${item.id}" data-change="1" aria-label="Increase ${item.name}">+</button>
                </div>
                <button class="remove-button" type="button" data-remove="${item.id}">Remove</button>
              </div>
            </div>
          </article>
        `,
      )
      .join("");
  }

  cartItems.querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => changeQuantity(button.dataset.qty, Number(button.dataset.change)));
  });

  cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeItem(button.dataset.remove));
  });

  renderPayPalButtons();
}

function renderPayPalButtons() {
  const totals = getTotals();
  const renderKey = totals.lines.map((item) => `${item.id}:${item.quantity}`).join("|");

  if (!totals.lines.length) {
    state.paypalRenderedKey = "";
    paypalContainer.innerHTML = "";
    return;
  }

  if (!window.paypal || !window.paypal.Buttons) {
    paypalContainer.innerHTML = `<p class="empty-cart">PayPal could not load. Check your internet connection and refresh.</p>`;
    return;
  }

  if (state.paypalRenderedKey === renderKey) return;

  state.paypalRenderedKey = renderKey;
  paypalContainer.innerHTML = "";

  window.paypal
    .Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
      onClick(_data, actions) {
        paymentStatus.textContent = "";
        paymentStatus.classList.remove("error");

        if (!getCartLines().length) {
          showPaymentError("Please add at least one lip scrub flavour before checkout.");
          return actions.reject();
        }

        if (!checkoutForm.checkValidity()) {
          checkoutForm.reportValidity();
          showPaymentError("Please complete the customer details first.");
          return actions.reject();
        }

        return actions.resolve();
      },
      createOrder(_data, actions) {
        const freshTotals = getTotals();

        return actions.order.create({
          purchase_units: [
            {
              description: "Sugar Kiss made-to-order lip scrub order",
              amount: {
                currency_code: "NZD",
                value: freshTotals.total.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: "NZD",
                    value: freshTotals.subtotal.toFixed(2),
                  },
                  shipping: {
                    currency_code: "NZD",
                    value: freshTotals.shipping.toFixed(2),
                  },
                },
              },
              items: freshTotals.lines.map((item) => ({
                name: item.name,
                quantity: String(item.quantity),
                unit_amount: {
                  currency_code: "NZD",
                  value: item.price.toFixed(2),
                },
              })),
            },
          ],
        });
      },
      onApprove(_data, actions) {
        return actions.order.capture().then((details) => {
          const firstName = details?.payer?.name?.given_name || document.querySelector("#customer-name").value.split(" ")[0] || "Customer";
          paymentStatus.classList.remove("error");
          paymentStatus.textContent = `Payment completed. Thank you for ordering Sugar Kiss, ${firstName}.`;
          state.cart = {};
          persistCart();
          renderProducts();
          renderCart();
          checkoutForm.reset();
        });
      },
      onCancel() {
        showPaymentError("Payment cancelled. Your cart has been kept.");
      },
      onError(error) {
        console.error("PayPal checkout error:", error);
        showPaymentError("PayPal checkout had a problem. Try again or refresh the page.");
      },
    })
    .render("#paypal-button-container");
}

function showPaymentError(message) {
  paymentStatus.textContent = message;
  paymentStatus.classList.add("error");
}

function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

function persistCart() {
  localStorage.setItem("sugar-kiss-cart", JSON.stringify(state.cart));
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

renderCategories();
renderProducts();
renderCart();
