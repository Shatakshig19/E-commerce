import React from "react";
import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Search,
  Package,
  X,
  Menu,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Navbar Component
 *
 * Provides navigation, search functionality, and authentication options.
 * Includes responsive design for both mobile and desktop views.
 */

function Navbar() {
  const { user, logout } = useUserStore();

  const isAdmin = user?.role === "admin";

  const { cart } = useCartStore();

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Effect to handle responsive behavior
   * Closes mobile menu automatically on larger screens
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Handles search form submission
   * Navigates to products page with search query parameter
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    // Main header with semi-transparent background and blur effect
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className=" w-full  px-4 py-3">
        <div className="flex items-center justify-between w-full ">
          <div className="flex items-center space-x-2 ">
            {/* Mobile menu toggle button (hamburger/close) */}
            <div className="flex items-center">
              <button
                className="text-gray-300 hover:text-emerald-400 lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Site logo/title with link to homepage */}
            <Link
              to="/"
              className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex"
            >
              MyOwn Store
            </Link>
          </div>
          <div className="sapce-x-4 flex items-center">
            {/* Search bar and shopping cart section */}
            <div className="flex items-center ">
              <div className="relative">
                {/* Mobile search toggle button */}
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="md:hidden p-2 text-gray-300 hover:text-emerald-400"
                >
                  <Search size={20} />
                </button>

                {/* Desktop search form - always visible on larger screens */}
                <form
                  onSubmit={handleSearch}
                  className="hidden md:flex relative w-full max-w-md"
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-2 flex items-center justify-center text-gray-400 hover:text-emerald-400"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>

              {/* Shopping cart icon with item counter badge */}
              {user && (
                <Link
                  to={"/cart"}
                  className="ml-4 relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
                >
                  <ShoppingCart
                    className="group-hover:text-emerald-400"
                    size={22}
                  />
                  {/* Cart item count badge - only shown when cart has items */}
                  {cart.length > 0 && (
                    <span
                      className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 
										text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out"
                    >
                      {cart.length}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 p-3 bg-gray-900 md:hidden">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-emerald-400"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>
            )}

            <nav className="hidden lg:flex items-center gap-4 ml-4">
              <Link
                to={"/"}
                className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
              >
                Home
              </Link>
              <Link
                to={"/products"}
                className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center"
              >
                <Package className="inline-block mr-1" size={18} />
                Products
              </Link>

              {/* Admin-only dashboard link */}
              {isAdmin && (
                <Link
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
                  to={"/secret-dashboard"}
                >
                  <Lock className="inline-block mr-1" size={18} />
                  Dashboard
                </Link>
              )}

              {/* Conditional rendering of authentication buttons */}
              {user ? (
                // Logout button for authenticated users
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                  onClick={logout}
                >
                  <LogOut size={18} />
                  <span className="ml-2">Log Out</span>
                </button>
              ) : (
                // Sign up and login buttons for guests
                <>
                  <Link
                    to={"/signup"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                  >
                    <UserPlus className="mr-2" size={18} />
                    Sign Up
                  </Link>
                  <Link
                    to={"/login"}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                  >
                    <LogIn className="mr-2" size={18} />
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden bg-gray-800 mt-3 p-4 rounded-md space-y-3">
            <Link
              to={"/"}
              className="block text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to={"/products"}
              className="block text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="inline-block mr-2" size={18} />
              Products
            </Link>

            {isAdmin && (
              <Link
                className="block bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-md font-medium transition duration-300 ease-in-out"
                to={"/secret-dashboard"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Lock className="inline-block mr-2" size={18} />
                Dashboard
              </Link>
            )}

            <div className="border-t border-gray-700 pt-2 mt-2">
              {user ? (
                <button
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center justify-center transition duration-300 ease-in-out"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={18} />
                  <span className="ml-2">Log Out</span>
                </button>
              ) : (
                // Authentication buttons for guests
                <div className="flex flex-col space-y-2">
                  <Link
                    to={"/signup"}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition duration-300 ease-in-out"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="mr-2" size={18} />
                    Sign Up
                  </Link>
                  <Link
                    to={"/login"}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center justify-center transition duration-300 ease-in-out"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="mr-2" size={18} />
                    Login
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
export default Navbar;
