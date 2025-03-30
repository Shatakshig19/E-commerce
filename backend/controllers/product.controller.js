import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); //{ } empty objects means all the products will be fetched
    res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Serer error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts)); //we are converting the string into a json object as redis stores the data in string format
    }

    //if it is not in redis then we will fetch the data from mongoDb database and store it redis
    featuredProducts = await Product.find({ isFeatured: true }).lean(); //lean() is used to convert the mongoose object into a plain javascript object which is good for performance

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    //store in redis for future quick access

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts); //returning the data to client in json format
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);

    res.status(400).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(400).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // we have written the id of the product in the url
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from cloudinary");
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(400).json({ message: "Server error", error: error.message });
  }
};

export const getRecommenedProducts = async (req, res) => {
  try {
    /* 
Short Explanation of the Aggregation in `getRecommendedProducts`

The code uses MongoDB's **aggregation framework** to fetch a random sample of products and return only specific fields.

1. `$sample` Stage:
   - Randomly selects a specified number of documents from the collection.
   - Here, `{ size: 3 }` selects 3 random products.

2. `$project` Stage:
   - Controls which fields are included in the output.
   - `1` means **include this field**, while `0` means **exclude this field**.
   - In this case:
     - Include `_id`, `name`, `description`, `image`, and `price`.

3. Purpose:
   - Fetches a lightweight response optimized for displaying product recommendations by including only relevant fields and excluding others like `stock` or `createdAt`.

4. Why:
   - Improves performance, reduces bandwidth usage, and ensures the client gets only the necessary data.
   */

    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1, // assigning 1 means it will be included in the final output and assigning 0 or not writing anything means it will be excluded
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommenedProducts controller", error.message);
    res.status(400).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params; // it is a destructuring asssignment, a js feature used to extract values from an objector arrays.
  // equivalent to = const category = req.params.category;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(400).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); //req.params is an object that contains route parameters defined in the URL.
    //"/:id" this is the url and id can be obtained using req.params
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updateProduct = await product.save(); //update in the database
      await updateFeaturedProductsCache(); //uppdate in cache
      res.json(updateProduct);
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(400).json({ message: "Server error", error: error.message });
  }
};

const updateFeaturedProductsCache = async () => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in updateFeaturedProductsCache", error.message);
  }
};

export const getAllProductsWithFilters = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, search } = req.query;

    // Build filter object
    const filter = {};

    // Add category filter if provided
    if (category && category !== "all") {
      filter.category = category;
    }

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Determine sort order
    let sortOption = {};
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else {
      // Default sort by newest
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);

    res.json({
      products,
      totalCount: products.length,
      filters: {
        category: category || "all",
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
        sort: sort || "newest",
        search: search || "",
      },
    });
  } catch (error) {
    console.log("Error in getAllProductsWithFilters controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    // Get distinct categories
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    console.log("Error in getCategories controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPriceRange = async (req, res) => {
  try {
    const minPrice = await Product.find()
      .sort({ price: 1 })
      .limit(1)
      .select("price");
    const maxPrice = await Product.find()
      .sort({ price: -1 })
      .limit(1)
      .select("price");

    res.json({
      min: minPrice.length > 0 ? minPrice[0].price : 0,
      max: maxPrice.length > 0 ? maxPrice[0].price : 1000,
    });
  } catch (error) {
    console.log("Error in getPriceRange controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
