import React from "react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

function ProductCard({ product }) {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please Login to add products to cart", { id: "login" });
      return;
    } else {
      addToCart(product);
    }
  };

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg h-[450px]">
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img
          className="object-contain w-full h-full"
          src={product.image}
          alt="product image"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      <div className="mt-4 px-5 pb-5 flex flex-col flex-1">
        <div className="min-h-[4rem]">
          <h5 className="text-xl font-semibold tracking-tight text-white line-clamp-2">
            {product.name}
          </h5>
        </div>
        <div className="mt-auto mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-emerald-400">
              ₹{product.price}
            </span>
          </p>
        </div>
        <button
          className="flex items-center rounded-lg justify-center text-xl font-medium text-black bg-emerald-400 py-2.5 px-5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emarld-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
