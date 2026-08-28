(function () {
  const KEY = "sola_cart_v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("sola:cart"));
  }

  window.SolaCart = {
    get() {
      return read();
    },
    count() {
      return read().reduce((n, i) => n + i.qty, 0);
    },
    subtotal() {
      return read().reduce((n, i) => {
        const p = window.SOLA_PRODUCTS.find((x) => x.id === i.id);
        return n + (p ? p.price * i.qty : 0);
      }, 0);
    },
    add(id, qty = 1) {
      const items = read();
      const row = items.find((i) => i.id === id);
      if (row) row.qty += qty;
      else items.push({ id, qty });
      write(items);
    },
    setQty(id, qty) {
      let items = read();
      if (qty <= 0) items = items.filter((i) => i.id !== id);
      else {
        const row = items.find((i) => i.id === id);
        if (row) row.qty = qty;
      }
      write(items);
    },
    remove(id) {
      write(read().filter((i) => i.id !== id));
    },
    clear() {
      write([]);
    },
  };
})();
