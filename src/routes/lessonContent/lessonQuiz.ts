import { Hono } from "hono";
import LessonQuiz from "../../models/lessonContent/lessonQuiz.model";
import { getErrorMessage } from "../../utils/apiErrorHandler";

const app = new Hono();

// Create a new quiz
app.post("/add", async (c) => {
  try {
    const quizData = await c.req.json();
    const newQuiz = new LessonQuiz(quizData);
    await newQuiz.save();
    return c.json(newQuiz, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Get all quizzes
app.get("/get-all", async (c) => {
  try {
    const quizzes = await LessonQuiz.find();
    return c.json(quizzes);
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Get a specific quiz by ID
app.get("/get/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const quiz = await LessonQuiz.findById(id);
    if (!quiz) {
      return c.json({ message: "Quiz not found" }, 404);
    }
    return c.json(quiz);
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Update a quiz
app.put("/edit/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const quizData = await c.req.json();
    const updatedQuiz = await LessonQuiz.findByIdAndUpdate(id, quizData, {
      new: true,
    });
    if (!updatedQuiz) {
      return c.json({ message: "Quiz not found" }, 404);
    }
    return c.json(updatedQuiz);
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Delete a quiz
app.delete("/delete/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deletedQuiz = await LessonQuiz.findByIdAndDelete(id);
    if (!deletedQuiz) {
      return c.json({ message: "Quiz not found" }, 404);
    }
    return c.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

//example input (this is all user answers)
//  ["HyperText Markup Language", ["red","background-color"], ["<header>","<footer>","<article>"], "<p>"]
// quix score api
app.post("/:id/submit", async (c) => {
  try {
    const quizId = c.req.param("id");
    const userAnswers = await c.req.json();

    // find quiz in database
    const quiz = await LessonQuiz.findById(quizId);
    if (!quiz) {
      return c.json({ message: "Quiz not found" }, 404);
    }

    // scoring
    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = userAnswers[index];
      let isCorrect = false;
      let partialScore = 0;

      if (Array.isArray(question.correctAnswer)) {
        // multiple choice
        if (Array.isArray(userAnswer)) {
          const correctAnswersCount = question.correctAnswer.length;
          const userCorrectAnswersCount = userAnswer.filter((answer) =>
            question.correctAnswer.includes(answer)
          ).length;
          partialScore = userCorrectAnswersCount / correctAnswersCount;
          isCorrect = partialScore === 1;
        }
      } else {
        // single choice
        isCorrect = userAnswer === question.correctAnswer;
        partialScore = isCorrect ? 1 : 0;
      }

      score += partialScore;
      return {
        question: question.question,
        userAnswer,
        options: question.options,
        correctAnswer: question.correctAnswer,
        isCorrect,
        partialScore,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentageScore = (score / totalQuestions) * 100;

    return c.json({
      quizTitle: quiz.title,
      score,
      totalQuestions,
      percentageScore,
      results,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

export default app;
