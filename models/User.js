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
    required: true, 
    default: 'dealership-owner'
  },
  dealership: {
    type: Schema.Types.ObjectId,
    ref: 'Dealership',
  },
  profilePicture: {
    type: String,
    required: true,
    default: "https://cvhrma.org/wp-content/uploads/2015/07/default-profile-photo.jpg"
  }
}, 
  {
  timestamps: true,
}


);
module.exports = model("User", userSchema);