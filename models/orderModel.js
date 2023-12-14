const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "order must belong to user"],
    },
    cartItems: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "Product" },
        count: { type: Number, default: 1 },
        color: String,
        price: Number,
      },
    ],
    id: {
      type: Number,
      unique: true,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    taxPrice: {
      type: Number,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      default: 0.0,
    },
    totalOrderPrice: {
      type: Number,
      default: 0.0,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.id) {
    try {
      const highestOrder = await this.constructor.findOne({}, "id").sort("-id");
      this.id = highestOrder ? highestOrder.id + 1 : 1;
    } catch (error) {
      console.error("Error generating order number:", error);
    }
  }

  next();
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg email phone",
  }).populate({
    path: "cartItems.product",
    select: "title imageCover ratingsAverage ratingsQuantity",
  });

  next();
});

module.exports = mongoose.model("Order", orderSchema);
