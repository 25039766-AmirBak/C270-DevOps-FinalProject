const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase:true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength:8,
      select: false
    },

    role: {
      type: [String],
      enum: ["Donor", "Recipient", "Volunteer", "Admin"],
      default: ["Recipient"] // Default is now an array containing one string
    },

    verificationStatus: {
      type: String,
      enum: ['Not Submitted','Pending','Verified','Rejected'],
      default: 'Not Submitted'
     },
    
    document: {
      type: String
      }
    },
  {
   timestamps: true
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);