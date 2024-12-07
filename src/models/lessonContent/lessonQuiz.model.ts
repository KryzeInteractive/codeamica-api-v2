import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (v: unknown) {
        return (
          typeof v === "string" ||
          (Array.isArray(v) && v.every((item) => typeof item === "string"))
        );
      },
      message: "correctAnswer must be a string or an array of strings",
    },
  },
});

const lessonQuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: [questionSchema],
  },
  {
    timestamps: true,
    collection: "lessonQuizzes",
  }
);

const LessonQuiz = mongoose.model("LessonQuiz", lessonQuizSchema);

export default LessonQuiz;

