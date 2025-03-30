import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommenedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
  getAllProductsWithFilters,
  getCategories,
  getPriceRange,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts); // if the user is the admin then only he/she can get access to the function of getAllProducts the customer cannot get the access to decide whether the product will be featured or nor neither it will be deleted.
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommenedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.get("/shop", getAllProductsWithFilters);
router.get("/categories", getCategories);
router.get("/price-range", getPriceRange);

export default router;

/*
HTTP methods: 
GET: Only retrieves data.
POST: Creates new data.
PUT: Replaces data completely (or fully updates).
PATCH: Partially updates data (modifies some fields).
*/

/*
GET / — Fetches all products (requires authentication and admin check).
POST / — Creates a new product (requires authentication and admin check).
PATCH /:id — Toggles the "featured" status of a product (partially updates).
DELETE /:id — Deletes a product (requires authentication and admin check)
*/
