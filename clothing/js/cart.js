(function () {
  const KEY = "loom_cart_v1";

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter(row => row && Number.isInteger(row.qty) && row.qty > 0 &&
        window.LOOM_PRODUCTS.some(p => p.id === row.id &&
          p.sizes.includes(row.size) && (p.colors || ["Default"]).includes(row.color)));
    } catch {
      return [];
    }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("loom:cart"));
  }

  window.LoomCart = {
    get: () => read(),
    count: () => read().reduce((n, i) => n + i.qty, 0),
    subtotal() {
      return read().reduce((n, i) => {
        const p = window.LOOM_PRODUCTS.find((x) => x.id === i.id);
        return n + (p ? p.price * i.qty : 0);
      }, 0);
    },
    add(id, qty = 1, opts = {}) {
      const product = window.LOOM_PRODUCTS.find(p => p.id === id);
      if (!product || !Number.isInteger(qty) || qty < 1 ||
        !product.sizes.includes(opts.size) || !(product.colors || ["Default"]).includes(opts.color)) return;
      const items = read();
      const size = opts.size || "";
      const color = opts.color || "";
      const row = items.find(
        (i) => i.id === id && i.size === size && i.color === color
      );
      if (row) row.qty += qty;
      else items.push({ id, qty, size, color });
      write(items);
    },
    setQty(key, qty) {
      if (!Number.isInteger(qty)) return;
      let items = read();
      const [id, size, color] = key.split("||");
      if (qty <= 0) {
        items = items.filter(
          (i) => !(i.id === id && i.size === size && i.color === color)
        );
      } else {
        const row = items.find(
          (i) => i.id === id && i.size === size && i.color === color
        );
        if (row) row.qty = qty;
      }
      write(items);
    },
    remove(key) {
      const [id, size, color] = key.split("||");
      write(
        read().filter(
          (i) => !(i.id === id && i.size === size && i.color === color)
        )
      );
    },
    clear: () => write([]),
  };
})();
