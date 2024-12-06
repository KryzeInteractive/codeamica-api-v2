import { Schema, model } from "mongoose";

// Code Exercise schema
const lessonCodeExerciseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true, // Optional description
    },
    starterCode: {
      type: String,
      required: true, // Initial code provided to the user
    },
    expectedOutput: {
      type: String,
      required: true, // Expected output for the exercise
    },
  },
  {
    timestamps: true,
    collection: "lessonCodeExercises",
  }
);

const LessonCodeExercise = model(
  "LessonCodeExercise",
  lessonCodeExerciseSchema
);
export default LessonCodeExercise;
