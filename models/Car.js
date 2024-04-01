const { model, Schema } = require("mongoose");
const carSchema = new Schema(
    { make: {
        type: String,
        required: true
      },
      model: {
        type: String,
        required: true
      },
      year: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      condition: {
        type: String,
        required: true,
        enum: ['new', 'used'] 
      },
      mileage: {
        type: Number,
        required: function() { return this.condition === 'used'; } 
      },
      dealershipId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Dealership'
      },
      images: [{
        type: String,
      }],
    }, 
    {
      timestamps: true 
    }
    
);
module.exports = model("Car", carSchema);