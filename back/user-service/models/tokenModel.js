const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const tokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
  },
});

// tokenSchema.pre("save", async function (next) {
//   if (this.isModified("token") || this.isNew) {
//     try {
//       const salt = await bcrypt.genSalt(10);
//       this.token = await bcrypt.hash(this.token, salt);
//       next();
//     } catch (err) {
//       next(err);
//     }
//   } else {
//     next();
//   }
// });

// tokenSchema.methods.compareToken = async function (candidateToken) {
//   return await bcrypt.compare(candidateToken, this.token);
// };

module.exports = mongoose.model("Token", tokenSchema);
