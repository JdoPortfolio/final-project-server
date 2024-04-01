const { model, Schema } = require("mongoose");
const leadSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    interestedIn: {
      type: String,
      required: true,
      enum: [
        "general info",
        "financing",
        "schedule an appointment",
        "test-drive",
      ],
    },
    message: {
      type: String,
      required: false,
    },
    dealership: {
      type: Schema.Types.ObjectId,
      ref: "Dealership",
      required: true,
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = model("Lead", leadSchema);
