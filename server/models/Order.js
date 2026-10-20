import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: { type: String, sparse: true },
    razorpayPaymentId: { type: String, sparse: true },
    shippingAddress: {
      name: String,
      email: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    status: {
      type: String,
      enum: ['Payment pending', 'Payment failed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
