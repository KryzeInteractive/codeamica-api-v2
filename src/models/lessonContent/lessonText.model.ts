import { Schema, model } from "mongoose";

// Text schema
const lessonTextSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true, // Actual text content
    },
  },
  {
    timestamps: true,
    collection: "lessonTexts",
  }
);

const LessonText = model("LessonText", lessonTextSchema);
export default LessonText;
