(function () {
  function money(n) {
    const cur = (window.SOLA_CONFIG && window.SOLA_CONFIG.currency) || "USD";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: cur,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return "$" + n;
    }
  }

  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function updateCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = String(window.SolaCart.count());
    });
  }

  function productCard(p) {
    return `
      <article class="product">
        <a class="product-media" href="product.html?id=${encodeURIComponent(p.id)}">
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
        </a>
        <div class="product-meta">
          <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3>
          <p class="short">${p.short}</p>
          <div class="price-row">
            <span class="now">${money(p.price)}</span>
            ${p.compareAt ? `<span class="was">${money(p.compareAt)}</span>` : ""}
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" data-add="${p.id}">Add to bag</button>
            <a class="btn btn-ghost" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
          </div>
        </div>
      </article>`;
  }

  function bindAddButtons(root = document) {
    root.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SolaCart.add(btn.getAttribute("data-add"), 1);
        updateCartCount();
        toast("Added to bag");
      });
    });
  }

  function renderHomeFeatured() {
    const el = document.getElementById("featured-grid");
    if (!el) return;
    const picks = window.SOLA_PRODUCTS.slice(0, 4);
    el.innerHTML = picks.map(productCard).join("");
    bindAddButtons(el);
  }

  function renderShop() {
    const el = document.getElementById("shop-grid");
    if (!el) return;
    const cats = ["All", ...new Set(window.SOLA_PRODUCTS.map((p) => p.category))];
    const filters = document.getElementById("shop-filters");
    let active = "All";

    function draw() {
      const list =
        active === "All"
          ? window.SOLA_PRODUCTS
          : window.SOLA_PRODUCTS.filter((p) => p.category === active);
      el.innerHTML = list.map(productCard).join("");
      bindAddButtons(el);
    }

    if (filters) {
      filters.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" class="chip ${c === active ? "active" : ""}" data-cat="${c}">${c}</button>`
        )
        .join("");
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-cat]");
        if (!btn) return;
        active = btn.getAttribute("data-cat");
        filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        draw();
      });
    }
    draw();
  }

  function renderProduct() {
    const root = document.getElementById("pdp");
    if (!root) return;
    const id = new URLSearchParams(location.search).get("id");
    const p = window.SOLA_PRODUCTS.find((x) => x.id === id) || window.SOLA_PRODUCTS[0];
    if (!p) {
      root.innerHTML = `<p class="empty">Product not found.</p>`;
      return;
    }
    document.title = `${p.name} — ${(window.SOLA_CONFIG && window.SOLA_CONFIG.brand) || "SOLA"}`;
    root.innerHTML = `
      <div class="pdp-gallery">
        <div class="pdp-main"><img src="${p.image}" alt="${p.name}" /></div>
      </div>
      <div class="pdp-info">
        <div class="category">${p.category}${p.badge ? " · " + p.badge : ""}</div>
        <h1>${p.name}</h1>
        <div class="price-row" style="margin-bottom:1rem">
          <span class="now" style="font-size:1.25rem">${money(p.price)}</span>
          ${p.compareAt ? `<span class="was">${money(p.compareAt)}</span>` : ""}
        </div>
        <p class="lead">${p.description}</p>
        <ul>${p.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        <div class="qty-row">
          <label for="qty">Qty</label>
          <input id="qty" type="number" min="1" value="1" />
        </div>
        <button class="btn btn-primary btn-block" id="pdp-add">Add to bag — ${money(p.price)}</button>
        <p class="summary note" style="margin-top:1rem">${(window.SOLA_CONFIG && window.SOLA_CONFIG.shippingNote) || ""}</p>
      </div>`;
    document.getElementById("pdp-add").addEventListener("click", () => {
      const q = Math.max(1, parseInt(document.getElementById("qty").value, 10) || 1);
      window.SolaCart.add(p.id, q);
      updateCartCount();
      toast("Added to bag");
    });
  }

  function renderCart() {
    const linesEl = document.getElementById("cart-lines");
    const summaryEl = document.getElementById("cart-summary");
    if (!linesEl || !summaryEl) return;

    function draw() {
      const items = window.SolaCart.get();
      if (!items.length) {
        linesEl.innerHTML = `<div class="empty">Your bag is empty. <a href="shop.html" style="color:var(--copper-deep);text-decoration:underline">Browse the collection</a></div>`;
        summaryEl.style.display = "none";
        return;
      }
      summaryEl.style.display = "block";
      linesEl.innerHTML = items
        .map((row) => {
          const p = window.SOLA_PRODUCTS.find((x) => x.id === row.id);
          if (!p) return "";
          return `
            <div class="cart-line" data-id="${p.id}">
              <img src="${p.image}" alt="${p.name}" />
              <div>
                <h3>${p.name}</h3>
                <div class="price-row"><span class="now">${money(p.price)}</span></div>
                <div class="controls">
                  <input type="number" min="1" value="${row.qty}" data-qty="${p.id}" />
                  <button class="btn btn-ghost" style="padding:0.4rem 0.65rem;font-size:0.7rem" data-remove="${p.id}">Remove</button>
                </div>
              </div>
              <div class="line-total">${money(p.price * row.qty)}</div>
            </div>`;
        })
        .join("");

      const sub = window.SolaCart.subtotal();
      const freeMin = (window.SOLA_CONFIG && window.SOLA_CONFIG.freeShippingMin) || 75;
      const ship = sub >= freeMin ? 0 : 6;
      document.getElementById("sum-sub").textContent = money(sub);
      document.getElementById("sum-ship").textContent = ship === 0 ? "Free" : money(ship);
      document.getElementById("sum-total").textContent = money(sub + ship);

      linesEl.querySelectorAll("[data-qty]").forEach((input) => {
        input.addEventListener("change", () => {
          window.SolaCart.setQty(input.getAttribute("data-qty"), parseInt(input.value, 10) || 1);
          updateCartCount();
          draw();
        });
      });
      linesEl.querySelectorAll("[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          window.SolaCart.remove(btn.getAttribute("data-remove"));
          updateCartCount();
          draw();
        });
      });
    }

    draw();

    const form = document.getElementById("checkout-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const items = window.SolaCart.get();
        if (!items.length) return;
        const data = Object.fromEntries(new FormData(form).entries());
        const sub = window.SolaCart.subtotal();
        const freeMin = (window.SOLA_CONFIG && window.SOLA_CONFIG.freeShippingMin) || 75;
        const ship = sub >= freeMin ? 0 : 6;
        const order = {
          id: "SOLA-" + Date.now().toString(36).toUpperCase(),
          createdAt: new Date().toISOString(),
          customer: data,
          items: items.map((row) => {
            const p = window.SOLA_PRODUCTS.find((x) => x.id === row.id);
            return {
              id: row.id,
              name: p ? p.name : row.id,
              qty: row.qty,
              price: p ? p.price : 0,
              sourceHint: p ? p.sourceHint : "",
            };
          }),
          subtotal: sub,
          shipping: ship,
          total: sub + ship,
        };

        const orders = JSON.parse(localStorage.getItem("sola_orders_v1") || "[]");
        orders.push(order);
        localStorage.setItem("sola_orders_v1", JSON.stringify(orders));

        // Download order ticket for fulfilling via supplier
        const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = order.id + ".json";
        a.click();
        URL.revokeObjectURL(a.href);

        const msg = encodeURIComponent(
          `New ${window.SOLA_CONFIG.brand} order ${order.id}\n` +
            order.items.map((i) => `• ${i.qty}× ${i.name}`).join("\n") +
            `\nTotal: ${money(order.total)}\n` +
            `${data.name}\n${data.email}\n${data.phone}\n${data.address}, ${data.city}, ${data.country} ${data.zip}`
        );

        const wa = window.SOLA_CONFIG && window.SOLA_CONFIG.whatsapp;
        if (wa) {
          window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
        }

        const pay = window.SOLA_CONFIG && window.SOLA_CONFIG.paymentLink;
        if (pay) {
          window.open(pay, "_blank");
        }

        const box = document.getElementById("order-success");
        if (box) {
          box.classList.add("show");
          box.querySelector("[data-order-id]").textContent = order.id;
        }

        window.SolaCart.clear();
        updateCartCount();
        draw();
        toast("Order saved — ticket downloaded");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    window.addEventListener("sola:cart", updateCartCount);
    renderHomeFeatured();
    renderShop();
    renderProduct();
    renderCart();

    const brandEls = document.querySelectorAll("[data-brand]");
    brandEls.forEach((el) => {
      el.textContent = (window.SOLA_CONFIG && window.SOLA_CONFIG.brand) || "SOLA";
    });
  });

  window.SolaUI = { money, toast, productCard };
})();
