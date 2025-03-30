import React, { useEffect } from "react";
import { useState } from "react";
import { ChevronLeft, ShoppingCart, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

function FeaturedProducts({ featuredProducts }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  {
    /*current index pehle wala index matlab first product jiska index 0 hai phir jab slider wale arrow par click hoga tab currentIndex 4 ho jayega kyuki 4 wala first position par aa jayegaa */
  }
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const { addToCart } = useCartStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex + itemsPerPage >= featuredProducts.length;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center text-emerald-400 mb-4 sm:text-6xl">
          Featured
        </h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex trnasition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerPage)
                }%)`,
              }}
            >
              {featuredProducts?.map((product) => (
                <div
                  key={product._id}
                  className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-2 flex-shrink-0"
                >
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden h-[400px] flex flex-col transition-all duration-300 hover:shadow-xl border-emerald-500/30">
                    <div className="overflow-hidden h-48">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition transform duration-300 ease-in-out hover:scale-110"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="min-h-[3rem]">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      <div className="mt-2">
                        <p className="text-xl font-bold mb-3 text-emerald-400">
                          ₹{product.price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 flex items-center justify-center"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            disabled={isStartDisabled}
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full trnasition-colors duration-300 ${
              isStartDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isEndDisabled}
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full trnasition-colors duration-300 ${
              isEndDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedProducts;
