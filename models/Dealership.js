const { model, Schema } = require("mongoose");
const dealershipSchema = new Schema(
    {
        name: {
          type: String,
          required: true
        },
        location: {
          type: String,
          required: true
        },
        contact: {
          phone: {
            type: String,
            required: true
          },
          email: {
            type: String,
            required: false
          }
        },
        owner: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'User',
          required: true
        },
      image: {
          type: String,
          required: true,
        }
      },
       {
        timestamps: true,
      }      
    
);
module.exports = model("Dealership", dealershipSchema);