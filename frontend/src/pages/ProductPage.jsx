import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import axios from "../lib/axios";
// import LoadingSpinner from "../components/LoadingSpinner";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "all",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    search: searchParams.get("search") || "",
  });

  // Fetch products with current filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.category && filters.category !== "all")
        params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.search) params.append("search", filters.search);

      // Update URL with filters
      setSearchParams(params);

      const response = await axios.get(`/products/shop?${params.toString()}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and price range on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/products/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchPriceRange = async () => {
      try {
        const response = await axios.get("/products/price-range");
        setPriceRange(response.data);
      } catch (error) {
        console.error("Error fetching price range:", error);
      }
    };

    fetchCategories();
    fetchPriceRange();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      search: "",
    });
    setSearchParams({});
  };

  // Check if any filters are active
  const isFiltersActive =
    filters.category !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sort !== "newest" ||
    filters.search;

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.h1
        className="text-4xl font-bold mb-8 text-emerald-400 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {filters.search
          ? `Search results for "${filters.search}"`
          : "All Products"}
      </motion.h1>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6 flex justify-between items-center">
        <button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-all"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
        </button>

        {isFiltersActive && (
          <button
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-all"
            onClick={clearFilters}
          >
            <X size={18} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <motion.div
          className={`lg:w-1/4 bg-gray-800 p-6 rounded-lg shadow-lg ${
            showFilters ? "block" : "hidden"
          } lg:block`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-emerald-400 flex items-center">
              <SlidersHorizontal className="mr-2" size={18} />
              Filters
            </h2>
            {isFiltersActive && (
              <button
                className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center"
                onClick={clearFilters}
              >
                <X className="mr-1" size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2">
              Category
            </label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Min"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Max"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2">
              Sort By
            </label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Hide filters button (mobile only) */}
          <button
            className="lg:hidden w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md mt-4"
            onClick={() => setShowFilters(false)}
          >
            Close Filters
          </button>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="lg:w-3/4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex justify-center items-center w-full h-64">
              <div className="border-t-4 border-emerald-500 border-solid rounded-full h-12 w-12 animate-spin"></div>
              <span className="ml-3 text-emerald-400">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-800/50 rounded-lg">
              <Search size={48} className="text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300">
                No products found
              </h3>
              <p className="text-gray-400 mt-2">
                Try adjusting your search or filter criteria
              </p>
              {isFiltersActive && (
                <button
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Showing {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductsPage;
