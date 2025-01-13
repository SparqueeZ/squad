const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Notification = require("./notificationModel");

const friendSchema = new mongoose.Schema({
  friendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  requestBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  banner: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  friends: [friendSchema],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  rooms: [
    {
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
      status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
      },
    },
  ],
  mfaSecret: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mfaStatus: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
