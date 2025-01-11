const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: function () {
      return this.type === "file";
    },
  },
  fileName: {
    type: String,
    required: function () {
      return this.type === "file";
    },
  },

  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: false,
  },
  sender: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  viewedBy: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Message", messageSchema);
