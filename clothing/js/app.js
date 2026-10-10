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
      el.setAttribute("role", "status");
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
      el.innerHTML = `<div class="empty" style="grid-column:1/-1"><span class="empty-symbol" aria-hidden="true">↗</span><h2>A good thing in the making.</h2><p>Our first edit is taking shape. There are no pieces available to shop just yet.</p><a class="text-link" href="care.html">A little more about LOOM ↗</a></div>`;
      return;
    }
    const picks = window.LOOM_PRODUCTS.slice(0, 8);
    el.innerHTML = picks.map(productCard).join("");
  }

  function renderShop() {
    const el = document.getElementById("shop-grid");
    if (!el) return;
    if (!window.LOOM_PRODUCTS.length) {
      el.innerHTML = `<div class="empty" style="grid-column:1/-1"><span class="empty-symbol" aria-hidden="true">↗</span><h2>The first edit is on its way.</h2><p>We’re taking a little time to get the details right. Check back for pieces, fit notes and the full collection.</p><a class="text-link" href="index.html#perspective">Explore our perspective ↗</a></div>`;
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
      root.innerHTML = `<div class="empty"><span class="empty-symbol" aria-hidden="true">↗</span><h2>The details are still taking shape.</h2><p>Product pages will open with the first collection.</p><a class="text-link" href="shop.html">Back to the collection ↗</a></div>`;
      return;
    }
    const id = new URLSearchParams(location.search).get("id");
    const p = window.LOOM_PRODUCTS.find((x) => x.id === id);
    if (!p) {
      root.innerHTML = `<div class="empty"><h2>Piece not found.</h2><p>This piece is no longer in the collection.</p><a class="text-link" href="shop.html">View the collection ↗</a></div>`;
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
          <div style="align-content:end"><button class="btn btn-primary btn-block" id="pdp-add" type="button">Add to bag</button></div>
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
        linesEl.innerHTML = `<div class="empty"><span class="empty-symbol" aria-hidden="true">↗</span><h2>A little space for something good.</h2><p>Your bag is empty. Explore the collection and find your next favourite.</p><a class="btn btn-primary" href="shop.html">Explore the collection ↗</a></div>`;
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
                  <input type="number" min="1" value="${row.qty}" data-qty="${key}" aria-label="Quantity for ${p.name}" style="width:4rem;padding:0.35rem;background:var(--bg-soft);border:1px solid var(--line-strong);color:var(--text);font-family:var(--body)" />
                  <button class="btn btn-ghost" style="padding:0.35rem 0.55rem;font-size:0.9rem" data-remove="${key}">Remove</button>
                </div>
              </div>
              <div class="line-total">${money(p.price * row.qty)}</div>
            </div>`;
        })
        .join("");

      const sub = window.LoomCart.subtotal();
      document.getElementById("sum-sub").textContent = money(sub);
      document.getElementById("sum-ship").textContent = "Available at launch";
      document.getElementById("sum-total").textContent = money(sub);

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

  }

  function renderTrack() {
    const form = document.getElementById("track-form");
    const out = document.getElementById("track-result");
    if (!form || !out) return;

    const prefill = new URLSearchParams(location.search).get("id");
    if (prefill) form.querySelector('[name="orderId"]').value = prefill;

    function showOrder(order) {
      out.replaceChildren();
      const title = document.createElement("h3");
      title.textContent = "Preview record " + order.id;
      const note = document.createElement("p");
      note.className = "note";
      note.textContent = "Saved on this device. This is not a paid order. Fulfillment and carrier tracking are not connected.";
      out.append(title, note);
      const list = document.createElement("ul");
      for (const item of order.items || []) {
        const row = document.createElement("li");
        row.textContent = item.qty + " × " + item.name + (item.size ? " / " + item.size : "");
        list.append(row);
      }
      out.append(list);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = form.elements.namedItem("orderId").value.trim().toUpperCase();
      const email = (form.elements.namedItem("email").value || "").trim().toLowerCase();
      let orders = [];
      try { const saved = JSON.parse(localStorage.getItem("loom_orders_v1") || "[]"); if (Array.isArray(saved)) orders = saved; } catch {}
      const order = orders.find(
        (o) =>
          typeof o.id === "string" && o.id.toUpperCase() === id &&
          email && (o.customer?.email || "").toLowerCase() === email
      );
      if (!order) {
        out.innerHTML = `<p class="note">No matching preview record on this device. Check the reference and email. Live order tracking will be available when the store opens.</p>`;
        return;
      }
      showOrder(order);
    });


  }

  /* —— Automated CS chatbot (rule-based free) —— */
  function initChat() {
    if (document.getElementById("loom-chat-root")) return;
    const root = document.createElement("div");
    root.id = "loom-chat-root";
    root.innerHTML = `
      <button type="button" class="chat-fab" id="chat-fab" aria-label="Open support" aria-expanded="false" aria-controls="chat-panel">Help</button>
      <div class="chat-panel" id="chat-panel" role="dialog" aria-label="Loom Assist" hidden>
        <div class="chat-head">
          <span>LOOM / Quick help</span>
          <button type="button" id="chat-close" aria-label="Close">×</button>
        </div>
        <div class="chat-log" id="chat-log" aria-live="polite"></div>
        <div class="chat-quick" id="chat-quick"></div>
        <form class="chat-input" id="chat-form">
          <input name="q" aria-label="Your question" autocomplete="off" placeholder="Ask about size, shipping, returns…" />
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
        return "Start with Fit notes to record your measurements. Compare them with the specific garment’s chart when the collection opens; sizes vary by style.";
      }
      if (/ship|deliver|track|where|package|late/.test(t)) {
        return "Orders are not open yet. Destinations, shipping prices and delivery estimates will be confirmed at launch. Order status currently checks preview records on this device.";
      }
      if (/return|exchange|refund/.test(t)) {
        return "Our return and exchange policy will be available before orders open. Read Customer care for the current collection status.";
      }
      if (/help|human|agent|support|email/.test(t)) {
        return "This is automated preview help. A customer contact channel will be available before launch. Read Customer care for details.";
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

    const fab = document.getElementById("chat-fab");
    function closeChat() {
      panel.classList.remove("open");
      panel.hidden = true;
      fab.setAttribute("aria-expanded", "false");
      fab.focus();
    }
    fab.onclick = () => {
      panel.hidden = false;
      panel.classList.add("open");
      fab.setAttribute("aria-expanded", "true");
      document.querySelector("#chat-form input").focus();
    };
    document.getElementById("chat-close").onclick = closeChat;
    panel.addEventListener("keydown", event => { if (event.key === "Escape") closeChat(); });
    document.getElementById("chat-form").onsubmit = (e) => {
      e.preventDefault();
      const input = e.target.elements.namedItem("q");
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
    const fitForm = document.getElementById("fit-form");
    if (fitForm) fitForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const unit = document.getElementById("fit-unit").value;
      const chest = Number(document.getElementById("fit-chest").value);
      const waist = Number(document.getElementById("fit-waist").value);
      const fit = document.getElementById("fit-vibe").value;
      const result = document.getElementById("fit-out");
      result.hidden = false;
      const convert = value => unit === "cm" ? (value / 2.54).toFixed(1) + " in" : (value * 2.54).toFixed(1) + " cm";
      result.textContent = "Chest: " + chest + " " + unit + " (" + convert(chest) + "). Waist: " + waist + " " + unit + " (" + convert(waist) + "). Preferred fit: " + fit + ". Compare these notes with each garment’s chart; this is not a size recommendation.";
    });
  });
})();
