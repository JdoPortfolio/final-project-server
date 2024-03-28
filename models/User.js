const { model, Schema } = require("mongoose");
const userSchema = new Schema(
  {
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  privilege: { 
    type: String, 
    enum: ['admin', 'dealership-owner'],
    required: true
  },
  dealership: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Dealership',
  },
  profilePicture: {
    type: String,
    required: true,
  }
}, 
  {
  timestamps: true,
}


);
module.exports = model("User", userSchema);