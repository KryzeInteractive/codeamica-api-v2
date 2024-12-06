import { Types, Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  pathsJoined: [
    {
      type: Types.ObjectId,
      ref: "LearningPath",
      default: [],
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin", "instructor"], // Only allow these values
    default: "user",
  },
  createdAt: { type: Date, default: Date.now },
});

const User = model("User", userSchema);
export default User;
