import { Schema, model, Types } from "mongoose";

const userProgressSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [
      {
        type: Types.ObjectId,
      },
    ],
    lastCompletedLesson: {
      type: Types.ObjectId,
    },
    progress: {
      type: Number,
      default: 0,
    },
    courseVersion: {
      type: Number,
      default: 1,
    },
    content: {
      type: Object,
    },
  },
  {
    timestamps: true,
    collection: "userProgress",
  }
);

const UserProgress = model("UserProgress", userProgressSchema);
export default UserProgress;
