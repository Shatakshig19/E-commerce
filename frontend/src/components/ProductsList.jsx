import React from "react";
import { motion } from "framer-motion";
import { Trash, Star } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
function ProductsList() {
  const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();

  console.log("products", products);

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/5"
                scope="col"
              >
                Product
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/5"
                scope="col"
              >
                Price
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/5"
                scope="col"
              >
                Category
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-1/10"
                scope="col"
              >
                Featured
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-1/10"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {products?.map((product) => (
              <tr key={product._id} className="hover:bg-gray-700">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product.image}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4 max-w-xs">
                      <div className="text-sm font-medium text-white truncate">
                        {product.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-300">
                    ₹{product.price.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-300 truncate max-w-[120px]">
                    {product.category}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => toggleFeaturedProduct(product._id)}
                    className={`p-1.5 rounded-full ${
                      product.isFeatured
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-700 text-gray-300"
                    } hover:bg-opacity-80 transition-colors duration-200`}
                    title={
                      product.isFeatured
                        ? "Remove from featured"
                        : "Add to featured"
                    }
                  >
                    <Star className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-900/20"
                    title="Delete product"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default ProductsList;
