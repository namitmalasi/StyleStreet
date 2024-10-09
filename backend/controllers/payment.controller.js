import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //stripe accepts in cents format
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: req.user._id.toString(),
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });
    return res
      .status(200)
      .json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // create new order
      const products = JSON.parse(session.metadata.products);
      const order = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });
      await order.save();

      const user = await User.findById(req.user._id);
      if (user) {
        user.cartItems = [];
        await user.save();
      }
      res.status(200).json({
        success: true,
        message: "Payment successful and order created",
        orderId: order._id,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
