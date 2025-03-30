import React from "react";
import { useCartStore } from "../stores/useCartStore";
import { Minus, Plus, Trash } from "lucide-react";

function CartItem({ item }) {
  const { removeAllFromCart, updateQuantity } = useCartStore();

  return (
    <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0 md-gap-6">
        <div className="shrink-0 md:order-1">
          <img
            src={item.image}
            alt={item.name}
            className="h-20 md:h:32 object-cover rounded"
          />
        </div>
        <label className="sr-only">Choose quantity</label>
        {/* The sr-only class hides this label visually but makes it accessible to screen readers like reading it which is given on screen */}
        <div className="flex items-center justify-between md:justify-end md:order-3">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-md border border-gray-600  bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={() => updateQuantity(item._id, item.quantity - 1)}
            >
              <Minus className="text-gray-300" />
            </button>
            <p>{item.quantity}</p>
            <button
              className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-md border border-gray-600  bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
            >
              <Plus className="text-gray-300" />
            </button>
          </div>
          <div className="text-end md:order-4 md:w-32">
            <p className="text-2xl font-bold text-emerald-400">₹{item.price}</p>
          </div>
        </div>

        <div className="w-full min-w-0 md:order-2 flex-1 space-y-4 md:max-w-md">
          <p className="text-base font-medium text-white hover:text-emerald-500 hover:underline">
            {item.name}
          </p>
          <p className="text-sm text-gray-400">{item.description}</p>

          <div className="flex items-center gap-4">
            <button
              className="text-sm text-red-400 inline-flex items-center font-medium hover:text-red-300 hover:underline"
              onClick={() => removeAllFromCart(item._id)}
            >
              <Trash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
