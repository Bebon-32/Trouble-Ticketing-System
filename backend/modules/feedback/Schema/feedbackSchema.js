const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: false,
      enum: ["Very Happy", "Happy", "Good", "Sad", "Very Sad"], // could use 🙂 🙁 😐 😠
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = feedbackSchema;
