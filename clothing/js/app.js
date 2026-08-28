(function () {
  function money(n) {
    const cur = (window.LOOM_CONFIG && window.LOOM_CONFIG.currency) || "USD";
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
      el.textContent = String(window.LoomCart.count());
    });
  }

  function lineKey(row) {
    return row.id + "||" + (row.size || "") + "||" + (row.color || "");
  }

  function productImages(p) {
    if (p && p.images && p.images.length) return p.images;
    if (p && p.image) return [p.image];
    return [];
  }

  function mainImage(p) {
    return productImages(p)[0] || "";
  }

  function productCard(p) {
    const onSale = p.compareAt && p.compareAt > p.price;
    const img = mainImage(p);
    return `
      <article class="product-card">
        <a class="product-media" href="product.html?id=${encodeURIComponent(p.id)}">
          ${onSale ? `<span class="badge sale">Sale</span>` : p.badge ? `<span class="badge">${p.badge}</span>` : ""}
          <img src="${img}" alt="${p.name}" loading="lazy" />
        </a>
        <div class="product-meta">
          <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3>
          <div class="price-row">
            <span class="now">${money(p.price)}</span>
            ${onSale ? `<span class="was">${money(p.compareAt)}</span>` : ""}
          </div>
        </div>
      </article>`;
  }

  function renderHome() {
    const el = document.getElementById("featured-grid");
    if (!el) return;
    if (!window.LOOM_PRODUCTS.length) {
      el.innerHTML = `<div class="empty" style="grid-column:1/-1">No products yet. Catalog stays empty until real supplier links are added.</div>`;
      return;
    }
    const picks = window.LOOM_PRODUCTS.slice(0, 8);
    el.innerHTML = picks.map(productCard).join("");
  }

  function renderShop() {
    const el = document.getElementById("shop-grid");
    if (!el) return;
    if (!window.LOOM_PRODUCTS.length) {
      el.innerHTML = `<div class="empty" style="grid-column:1/-1">No products listed. Paste real supplier product URLs and we’ll add only those.</div>`;
      const count = document.getElementById("result-count");
      if (count) count.textContent = "Showing 0 products";
      const filters = document.getElementById("shop-filters");
      if (filters) filters.innerHTML = "";
      return;
    }
    const cats = ["All", ...new Set(window.LOOM_PRODUCTS.map((p) => p.category))];
    const filters = document.getElementById("shop-filters");
    const params = new URLSearchParams(location.search);
    let cat = params.get("cat") || "All";
    if (cat !== "All" && !cats.includes(cat)) cat = "All";

    const titleEl = document.getElementById("collection-title");
    if (titleEl) {
      titleEl.textContent =
        cat === "All" ? "Shop" : cat === "Old Money" ? "Old Money" : cat;
    }

    function draw() {
      const list =
        cat === "All"
          ? window.LOOM_PRODUCTS
          : window.LOOM_PRODUCTS.filter((p) => p.category === cat);
      el.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty" style="grid-column:1/-1">Nothing in this category yet.</div>`;
      const count = document.getElementById("result-count");
      if (count) count.textContent = "Showing " + list.length + " products";
    }

    if (filters) {
      filters.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" class="chip ${c === cat ? "active" : ""}" data-cat="${c}">${
              c === "All" ? "All" : c
            }</button>`
        )
        .join("");

      filters.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-cat]");
        if (!btn) return;
        cat = btn.dataset.cat;
        filters.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        if (titleEl) {
          titleEl.textContent =
            cat === "All" ? "Shop" : cat === "Old Money" ? "Old Money" : cat;
        }
        const url = new URL(location.href);
        if (cat === "All") url.searchParams.delete("cat");
        else url.searchParams.set("cat", cat);
        history.replaceState({}, "", url);
        draw();
      });
    }
    draw();
  }

  function renderProduct() {
    const root = document.getElementById("pdp");
    if (!root) return;
    if (!window.LOOM_PRODUCTS.length) {
      root.innerHTML = `<p class="empty">No products in the catalog yet.</p>`;
      return;
    }
    const id = new URLSearchParams(location.search).get("id");
    const p = window.LOOM_PRODUCTS.find((x) => x.id === id) || window.LOOM_PRODUCTS[0];
    if (!p) {
      root.innerHTML = `<p class="empty">Piece not found.</p>`;
      return;
    }
    document.title = p.name + " — LOOM";
    const chart = p.sizeChart;
    const imgs = productImages(p);
    const chartRows =
      chart && chart.rows
        ? chart.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")
        : "";
    const chartHeads =
      chart && chart.headers ? chart.headers.map((h) => `<th>${h}</th>`).join("") : "";
    const thumbs =
      imgs.length > 1
        ? `<div class="pdp-thumbs" id="pdp-thumbs">
            ${imgs
              .map(
                (src, i) =>
                  `<button type="button" class="pdp-thumb ${i === 0 ? "active" : ""}" data-src="${src}" aria-label="View image ${i + 1}">
                    <img src="${src}" alt="" />
                  </button>`
              )
              .join("")}
          </div>`
        : "";
    root.innerHTML = `
      <div class="pdp-gallery">
        <div class="pdp-main"><img id="pdp-main-img" src="${imgs[0] || ""}" alt="${p.name}" /></div>
        ${thumbs}
      </div>
      <div class="pdp-info">
        <div class="meta-line">${p.gender} · ${p.category}</div>
        <h1>${p.name}</h1>
        <div class="price-row" style="margin-bottom:0.75rem">
          <span class="now" style="font-size:1.25rem">${money(p.price)}</span>
          ${p.compareAt ? `<span class="was">${money(p.compareAt)}</span>` : ""}
        </div>
        <p class="lead">${p.description}</p>
        <div class="fit-callout">
          <strong>Fit:</strong> ${p.fit}<br />
          <span style="font-size:0.88rem;color:var(--muted)">Fabric: ${p.fabric}</span>
        </div>
        <div class="select-row">
          <label>Size
            <select id="sel-size">
              ${p.sizes.map((s, i) => `<option ${i === Math.min(1, p.sizes.length - 1) ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </label>
          <label>Color
            <select id="sel-color">
              ${(p.colors || ["Default"]).map((c) => `<option>${c}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="select-row" style="grid-template-columns:120px 1fr">
          <label>Qty <input id="sel-qty" type="number" min="1" value="1" /></label>
          <label style="align-content:end"><button class="btn btn-primary btn-block" id="pdp-add" type="button">Add to bag</button></label>
        </div>
        <ul>${(p.bullets || []).map((b) => `<li>${b}</li>`).join("")}</ul>
        <h3 style="font-family:var(--display);margin:1.5rem 0 0.5rem">Size guide</h3>
        <table class="size-table">
          <thead><tr>${chartHeads}</tr></thead>
          <tbody>${chartRows}</tbody>
        </table>
        <p class="note"><a href="fit.html" style="text-decoration:underline">Need help with size? →</a></p>
      </div>`;

    const mainImg = document.getElementById("pdp-main-img");
    const thumbWrap = document.getElementById("pdp-thumbs");
    if (thumbWrap && mainImg) {
      thumbWrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".pdp-thumb");
        if (!btn) return;
        mainImg.src = btn.dataset.src;
        thumbWrap.querySelectorAll(".pdp-thumb").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    }

    document.getElementById("pdp-add").addEventListener("click", () => {
      const size = document.getElementById("sel-size").value;
      const color = document.getElementById("sel-color").value;
      const qty = Math.max(1, parseInt(document.getElementById("sel-qty").value, 10) || 1);
      window.LoomCart.add(p.id, qty, { size, color });
      updateCartCount();
      toast("Added " + size + " / " + color);
    });
  }

  function renderCart() {
    const linesEl = document.getElementById("cart-lines");
    const summaryEl = document.getElementById("cart-summary");
    if (!linesEl || !summaryEl) return;

    function draw() {
      const items = window.LoomCart.get();
      if (!items.length) {
        linesEl.innerHTML = `<div class="empty">Your bag is empty. <a href="shop.html" style="color:var(--accent)">Shop the edit</a></div>`;
        summaryEl.style.display = "none";
        return;
      }
      summaryEl.style.display = "block";
      linesEl.innerHTML = items
        .map((row) => {
          const p = window.LOOM_PRODUCTS.find((x) => x.id === row.id);
          if (!p) return "";
          const key = lineKey(row);
          return `
            <div class="cart-line">
              <img src="${mainImage(p)}" alt="${p.name}" />
              <div>
                <h3>${p.name}</h3>
                <div class="opts">${row.size || "—"} · ${row.color || "—"} · ${money(p.price)}</div>
                <div style="margin-top:0.5rem;display:flex;gap:0.5rem;align-items:center">
                  <input type="number" min="1" value="${row.qty}" data-qty="${key}" style="width:3.2rem;padding:0.35rem;background:var(--bg-soft);border:1px solid var(--line-strong);color:var(--text);font-family:var(--body)" />
                  <button class="btn btn-ghost" style="padding:0.35rem 0.55rem;font-size:0.7rem" data-remove="${key}">Remove</button>
                </div>
              </div>
              <div class="line-total">${money(p.price * row.qty)}</div>
            </div>`;
        })
        .join("");

      const sub = window.LoomCart.subtotal();
      const freeMin = (window.LOOM_CONFIG && window.LOOM_CONFIG.freeShippingMin) || 89;
      const ship = sub >= freeMin ? 0 : 8;
      document.getElementById("sum-sub").textContent = money(sub);
      document.getElementById("sum-ship").textContent = ship === 0 ? "Free" : money(ship);
      document.getElementById("sum-total").textContent = money(sub + ship);

      linesEl.querySelectorAll("[data-qty]").forEach((input) => {
        input.addEventListener("change", () => {
          window.LoomCart.setQty(input.dataset.qty, parseInt(input.value, 10) || 1);
          updateCartCount();
          draw();
        });
      });
      linesEl.querySelectorAll("[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          window.LoomCart.remove(btn.dataset.remove);
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
        const items = window.LoomCart.get();
        if (!items.length) return;
        const data = Object.fromEntries(new FormData(form).entries());
        const sub = window.LoomCart.subtotal();
        const freeMin = (window.LOOM_CONFIG && window.LOOM_CONFIG.freeShippingMin) || 89;
        const ship = sub >= freeMin ? 0 : 8;
        const prefix = (window.LOOM_CONFIG && window.LOOM_CONFIG.trackingPrefix) || "LM";
        const order = {
          id: prefix + "-" + Date.now().toString(36).toUpperCase(),
          createdAt: new Date().toISOString(),
          status: "confirmed",
          customer: data,
          items: items.map((row) => {
            const p = window.LOOM_PRODUCTS.find((x) => x.id === row.id);
            return {
              id: row.id,
              name: p ? p.name : row.id,
              size: row.size,
              color: row.color,
              qty: row.qty,
              price: p ? p.price : 0,
              sourceHint: p ? p.sourceHint : "",
              returnRisk: p ? p.returnRisk : "",
            };
          }),
          subtotal: sub,
          shipping: ship,
          total: sub + ship,
          milestones: [
            { key: "confirmed", label: "Order confirmed", at: new Date().toISOString() },
            { key: "sourced", label: "Sent to fulfillment partner", at: null },
            { key: "shipped", label: "Shipped · tracking shared", at: null },
            { key: "transit", label: "In international transit", at: null },
            { key: "delivered", label: "Delivered", at: null },
          ],
        };

        const orders = JSON.parse(localStorage.getItem("loom_orders_v1") || "[]");
        orders.push(order);
        localStorage.setItem("loom_orders_v1", JSON.stringify(orders));

        const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = order.id + ".json";
        a.click();
        URL.revokeObjectURL(a.href);

        const msg = encodeURIComponent(
          `LOOM order ${order.id}\n` +
            order.items
              .map((i) => `• ${i.qty}× ${i.name} (${i.size}/${i.color})`)
              .join("\n") +
            `\nTotal ${money(order.total)}\n${data.name}\n${data.email}\n${data.address}, ${data.city}, ${data.country} ${data.zip}`
        );
        if (window.LOOM_CONFIG.whatsapp) {
          window.open(`https://wa.me/${window.LOOM_CONFIG.whatsapp}?text=${msg}`, "_blank");
        }
        if (window.LOOM_CONFIG.paymentLink) {
          window.open(window.LOOM_CONFIG.paymentLink, "_blank");
        }

        const box = document.getElementById("order-success");
        if (box) {
          box.classList.add("show");
          box.querySelector("[data-order-id]").textContent = order.id;
          const trackLink = box.querySelector("[data-track-link]");
          if (trackLink) trackLink.href = "track.html?id=" + encodeURIComponent(order.id);
        }

        window.LoomCart.clear();
        updateCartCount();
        draw();
        toast("Order saved · ticket downloaded");
      });
    }
  }

  function renderTrack() {
    const form = document.getElementById("track-form");
    const out = document.getElementById("track-result");
    if (!form || !out) return;

    const prefill = new URLSearchParams(location.search).get("id");
    if (prefill) form.querySelector('[name="orderId"]').value = prefill;

    function showOrder(order) {
      // Simulate progression for demo if order is brand new
      const ageMin = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
      const steps = order.milestones.map((m, i) => {
        let state = "";
        if (i === 0 || ageMin > i * 0.01) state = "done";
        if (ageMin > 0 && i === Math.min(2, order.milestones.length - 1)) state = "done";
        if (i === 1) state = "active";
        if (ageMin > 5 && i <= 2) state = "done";
        if (ageMin > 5 && i === 3) state = "active";
        return { ...m, state };
      });
      // Always mark confirmed done on any real order
      steps[0].state = "done";
      if (!steps.some((s) => s.state === "active")) steps[1].state = "active";

      out.innerHTML = `
        <p class="eyebrow">Order ${order.id}</p>
        <h2 style="font-family:var(--display);margin:0.25rem 0 0.75rem">We’ve got this.</h2>
        <p class="note" style="margin-top:0">Updates push automatically when tracking is linked. You’re never stuck guessing where your package is.</p>
        <ul class="timeline">
          ${steps
            .map(
              (s) =>
                `<li class="${s.state}"><strong>${s.label}</strong><br /><span style="font-size:0.8rem">${
                  s.at ? new Date(s.at).toLocaleString() : "Pending automation"
                }</span></li>`
            )
            .join("")}
        </ul>
        <p class="note">Items: ${order.items.map((i) => `${i.qty}× ${i.name} (${i.size})`).join(", ")}</p>
      `;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = form.orderId.value.trim().toUpperCase();
      const email = (form.email.value || "").trim().toLowerCase();
      const orders = JSON.parse(localStorage.getItem("loom_orders_v1") || "[]");
      const order = orders.find(
        (o) =>
          o.id.toUpperCase() === id &&
          (!email || (o.customer.email || "").toLowerCase() === email)
      );
      if (!order) {
        out.innerHTML = `<p class="note">No order found in this browser. Place a demo order first, or paste the ID from your JSON ticket. Live site will use AfterShip/17TRACK API here.</p>`;
        return;
      }
      showOrder(order);
    });

    if (prefill) form.requestSubmit();
  }

  /* —— Automated CS chatbot (rule-based free) —— */
  function initChat() {
    if (document.getElementById("loom-chat-root")) return;
    const root = document.createElement("div");
    root.id = "loom-chat-root";
    root.innerHTML = `
      <button type="button" class="chat-fab" id="chat-fab" aria-label="Open support">CS</button>
      <div class="chat-panel" id="chat-panel" role="dialog" aria-label="Loom Assist">
        <div class="chat-head">
          <span>Loom Assist · 24/7</span>
          <button type="button" id="chat-close" aria-label="Close">×</button>
        </div>
        <div class="chat-log" id="chat-log"></div>
        <div class="chat-quick" id="chat-quick"></div>
        <form class="chat-input" id="chat-form">
          <input name="q" autocomplete="off" placeholder="Ask about size, shipping, returns…" />
          <button type="submit">Send</button>
        </form>
      </div>`;
    document.body.appendChild(root);

    const log = document.getElementById("chat-log");
    const panel = document.getElementById("chat-panel");
    const quick = document.getElementById("chat-quick");

    function add(role, text) {
      const div = document.createElement("div");
      div.className = "bubble " + role;
      div.textContent = text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }

    function answer(q) {
      const t = q.toLowerCase();
      if (/size|fit|chart|small|large|xs|xl/.test(t)) {
        return "Open the size guide on the product page. If you’re between sizes on loose styles, sizing up is usually safer.";
      }
      if (/ship|deliver|track|where|package|late/.test(t)) {
        return "We ship worldwide. International delivery is often 7–18 business days. Track with your order ID under Track.";
      }
      if (/return|exchange|refund/.test(t)) {
        return "Please measure using the size guide before ordering. For exchange help, contact care with your order ID and photos.";
      }
      if (/help|human|agent|support|email/.test(t)) {
        return (
          "I help with size, shipping, and tracking. For other issues email " +
          ((window.LOOM_CONFIG && window.LOOM_CONFIG.supportEmail) || "support") +
          " with your order ID."
        );
      }
      return "Ask about sizes, shipping, tracking, or returns.";
    }

    const greet =
      (window.LOOM_CONFIG && window.LOOM_CONFIG.autoCsGreeting) ||
      "Hi — Loom Assist here. Ask me anything.";
    add("bot", greet);

    const chips = ["Size help", "Shipping times", "Track my order", "Returns"];
    quick.innerHTML = chips
      .map((c) => `<button type="button" data-q="${c}">${c}</button>`)
      .join("");
    quick.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      add("user", b.dataset.q);
      setTimeout(() => add("bot", answer(b.dataset.q)), 280);
    });

    document.getElementById("chat-fab").onclick = () => panel.classList.add("open");
    document.getElementById("chat-close").onclick = () => panel.classList.remove("open");
    document.getElementById("chat-form").onsubmit = (e) => {
      e.preventDefault();
      const input = e.target.q;
      const q = input.value.trim();
      if (!q) return;
      add("user", q);
      input.value = "";
      setTimeout(() => add("bot", answer(q)), 320);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    window.addEventListener("loom:cart", updateCartCount);
    document.querySelectorAll("[data-brand]").forEach((el) => {
      el.textContent = (window.LOOM_CONFIG && window.LOOM_CONFIG.brand) || "LOOM";
    });
    renderHome();
    renderShop();
    renderProduct();
    renderCart();
    renderTrack();
    initChat();
  });
})();
