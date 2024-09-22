import Product from "../models/product.model.js";

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
