import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  isCouponApplied: false,
  
  getMyCoupon: async () => {
    try {
      const response = await axios.get("/api/coupons");
      set({ coupon: response.data });
      console.log("coupon", response.data);
      
    } catch (error) {
      console.error("Error fetching coupon", error);
      
    }
  },

  applyCoupon: async (code) => {
      try {
        const res = await axios.post("/api/coupons/validate", { code });
        set({ coupon: res.data, isCouponApplied: true });
        get().calculateTotals();
        toast.success("Coupon applied successfully");
      } catch (error) {
        toast.error(error.response.data?.message || "Failed to apply coupon");
      }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  getCartItems: async () => {
    try {
      const res = await axios.get("/api/cart");
      set({ cart: res.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response.data.message || "An error occured");
    }
  },

  clearCart: async () => {
    set({ cart: [], coupon: null, total:0, subTotal:0 });
  },

  addToCart: async (product) => {
    try {
      await axios.post("/api/cart", { productId: product._id });
      toast.success("Product added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(
        error.response.data.message || "product failed to add to cart"
      );
      console.log("error in adding to cart", error.message);
    }
  },

  removeAllFromCart: async (productId) => {
    try {
      await axios.delete("/api/cart", { data: { productId } });
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      get().calculateTotals();
    } catch (error) {
      toast.error(
        error.response.data.message || "product failed to remove from cart"
      );
      console.log("error in removing from cart", error);
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeAllFromCart(productId);
      return
    }

    await axios.put(`/api/cart/${productId}`, { quantity });
    set((prevState) => ({ cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
    }));
    get().calculateTotals();
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subTotal;

    if (coupon) {
      const discount = subTotal * (coupon.discountPercentage / 100);
      total = subTotal - discount;
    }

    set({ subTotal, total });
  },
}));
