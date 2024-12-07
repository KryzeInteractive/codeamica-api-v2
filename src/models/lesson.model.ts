import { Schema, model, Types } from "mongoose";

// Lesson schema
const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    content: [
      {
        contentId: {
          type: Types.ObjectId,
          required: true,
        },
        contentType: {
          type: String,
          enum: ["video", "text", "quiz", "codeExercise"],
          required: true,
        },
        _id: false,
      },
    ],
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: "lessons",
  }
);

const Lesson = model("Lesson", lessonSchema);
export default Lesson;
