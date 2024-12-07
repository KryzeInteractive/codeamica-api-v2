import { Schema, model, Types } from "mongoose";

// Update the Course schema to reference the User model for instructors
const courseSchema = new Schema(
  {
    _id: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId(), // Automatically generate a new ObjectId
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    instructors: [
      {
        type: Types.ObjectId, // Reference to User model
        ref: "User", // 'User' should match the name of the User model
        required: true,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now, // Set default to current date when the course is created/updated
    },
    language: {
      type: String,
      required: true,
    },
    aboutThisCourse: {
      type: String,
      required: true,
      trim: true,
    },
    whatYouWillLearn: [
      {
        type: String,
        required: true, // Make this field required to ensure every course has learning outcomes
        trim: true,
      },
    ],
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
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
    lessons: [
      {
        type: Types.ObjectId, // Reference to Lesson model
        ref: "Lesson",
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "courses",
  }
);

const Course = model("Course", courseSchema);
export default Course;
