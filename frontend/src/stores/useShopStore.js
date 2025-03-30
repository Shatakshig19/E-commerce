import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useShopStore = create((set, get) => ({
  products: [],
  filteredProducts: [],
  categories: [],
  priceRange: { min: 0, max: 1000 },
  filters: {
    category: "all",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    search: "",
  },
  loading: false,

  fetchProducts: async (filterParams = {}) => {
    try {
      set({ loading: true });

      // Build query parameters
      const params = new URLSearchParams();
      const { category, minPrice, maxPrice, sort, search } = {
        ...get().filters,
        ...filterParams,
      };

      if (category && category !== "all") params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sort) params.append("sort", sort);
      if (search) params.append("search", search);

      const response = await axios.get(`/products/shop?${params.toString()}`);
      set({
        products: response.data.products,
        filteredProducts: response.data.products,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch products");
      console.error("Error fetching products:", error);
      return { products: [] };
    }
  },

  fetchCategories: async () => {
    try {
      const response = await axios.get("/products/categories");
      set({ categories: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  fetchPriceRange: async () => {
    try {
      const response = await axios.get("/products/price-range");
      set({ priceRange: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching price range:", error);
      return { min: 0, max: 1000 };
    }
  },

  setFilter: (name, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [name]: value,
      },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        category: "all",
        minPrice: "",
        maxPrice: "",
        sort: "newest",
        search: "",
      },
    });
  },

  searchProducts: async (query) => {
    if (!query.trim()) return;

    set((state) => ({
      filters: {
        ...state.filters,
        search: query,
      },
    }));

    return get().fetchProducts({ search: query });
  },
}));
