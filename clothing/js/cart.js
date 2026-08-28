(function () {
  const KEY = "loom_cart_v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
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
