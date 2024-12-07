import { Schema, model, Types } from "mongoose";

// LearningPath schema
const learningPathSchema = new Schema(
  {
    _id: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId(), // Automatically generate a new ObjectId
    },
    title: {
      type: String,
      required: true, // Title for the learning path
    },
    description: {
      type: String,
      required: true, // Description of what the learning path entails
      trim: true,
    },
    courses: [
      {
        type: Types.ObjectId, // Reference to Course model
        ref: "Course",
        required: true,
      },
    ],
    estimatedHours: {
      type: Number,
      required: true, // Set to true if it must be provided
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId, // Reference to Course model
        ref: "Course",
        required: false, // Set to true if prerequisites are mandatory
      },
    ],
  },
  {
    timestamps: true,
    collection: "learningPaths",
  }
);

const LearningPath = model("LearningPath", learningPathSchema);
export default LearningPath;
