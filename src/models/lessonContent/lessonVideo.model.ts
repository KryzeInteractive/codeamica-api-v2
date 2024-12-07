import { Schema, model, Types } from "mongoose";

// Video schema
const lessonVideoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true, // URL for the video content
    },
    duration: {
      type: Number,
      required: true, // Duration in seconds
    },
    description: {
      type: String,
      trim: true, // Optional description
    },
  },
  {
    timestamps: true,
    collection: "lessonVideos",
  }
);

const LessonVideo = model("LessonVideo", lessonVideoSchema);
export default LessonVideo;
