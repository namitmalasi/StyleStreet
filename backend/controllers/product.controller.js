import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const Products = await Product.find({});

    return res.status(200).json({ Products });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Products fetching failed", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // first search for featured products in redis
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) return res.json(JSON.parse(featuredProducts));

    // if not present in redis search in mongoDb
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts)
      return res.status(404).json({ message: "No featured Products found" });

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    return res.json(featuredProducts);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
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
    res.status(500).json({ message: "server error", error: error.message });
  }
};
