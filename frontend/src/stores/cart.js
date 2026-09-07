import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],     // [{ product, quantity }]
    stockMap: {}   // { productId: quantity } สต็อกฝั่งร้าน
  }),

  getters: {
    lineCount: (state) => state.items.length,

    cartCount: (state) =>
      state.items.reduce((sum, i) => sum + i.quantity, 0),

    cartTotal: (state) =>
      state.items.reduce((sum, i) => sum + (i.product.sellingPrice || 0) * i.quantity, 0),

    // Getter แบบ function
    getStock: (state) => (productId) => state.stockMap[productId] ?? 0,

    inCart: (state) => (productId) =>
      state.items.find(i => i.product._id === productId) || null,

    cartQty: (state) => (productId) => {
      const item = state.items.find(i => i.product._id === productId)
      return item ? item.quantity : 0
    },

    remainingStock: (state) => (productId) => {
      const inCart = state.items.find(i => i.product._id === productId)?.quantity || 0
      return (state.stockMap[productId] ?? 0) - inCart
    }
  },

  actions: {
    // รับข้อมูลสต็อกจาก view มาสร้าง map
    setStocks(inventoryItems) {
      const map = {}
      inventoryItems.forEach(s => {
        const id = s.product?._id || s.product
        if (id) map[id] = s.quantity
      })
      this.stockMap = map
    },

    addToCart(product) {
      const stock = this.getStock(product._id)
      const item = this.inCart(product._id)

      if (item) {
        if (item.quantity >= stock) {
          return { ok: false, message: `⚠️ สต็อก ${product.name} ไม่เพียงพอ (คงเหลือ ${stock})` }
        }
        item.quantity++
      } else {
        if (stock <= 0) {
          return { ok: false, message: `⚠️ ${product.name} หมดสต็อก` }
        }
        this.items.push({ product, quantity: 1 })
      }
      return { ok: true }
    },

    changeQty(productId, delta) {
      const item = this.inCart(productId)
      if (!item) return
      const stock = this.getStock(productId)
      const next = item.quantity + delta
      if (next < 1 || next > stock) return
      item.quantity = next
    },

    setQty(productId, value) {
      const item = this.inCart(productId)
      if (!item) return
      const stock = this.getStock(productId)
      let q = Number(value)
      if (isNaN(q) || q < 1) q = 1
      if (q > stock) q = stock
      item.quantity = q
    },

    removeItem(productId) {
      this.items = this.items.filter(i => i.product._id !== productId)
    },

    clearCart() {
      this.items = []
    }
  }
})