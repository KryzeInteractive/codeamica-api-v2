import Lesson from "../models/lesson.model";
import { getErrorMessage } from "../utils/apiErrorHandler";
import { Hono } from "hono";

const app = new Hono();

app.post("/add", async (c) => {
  try {
    const { title, description, content, duration } = await c.req.json(); // Parse JSON body

    // Validate required fields
    if (
      !title ||
      !Array.isArray(content) ||
      // content.length === 0 ||
      !duration
    ) {
      return c.json({ message: "Title, and duration are required." }, 400);
    }

    // Create a new lesson instance
    const newLesson = new Lesson({
      title,
      description,
      content,
      duration,
    });

    // Save the lesson to the database
    await newLesson.save();

    // Return the created lesson
    return c.json(newLesson, 201);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Get all lessons
app.get("/get-all", async (c) => {
  try {
    const lessons = await Lesson.find();
    return c.json(lessons, 200);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Get a lesson by ID
app.get("/get/:id", async (c) => {
  try {
    const lesson = await Lesson.findById(c.req.param("id"));
    if (!lesson) {
      return c.json({ message: "Lesson not found." }, 404);
    }
    return c.json(lesson, 200);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Update a lesson by ID
app.put("/edit/:id", async (c) => {
  try {
    const { title, description, content, duration } = await c.req.json();
    const updatedLesson = await Lesson.findByIdAndUpdate(
      c.req.param("id"),
      { title, description, content, duration },
      { new: true }
    );
    if (!updatedLesson) {
      return c.json({ message: "Lesson not found." }, 404);
    }
    return c.json(updatedLesson, 200);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Delete a lesson by ID
app.delete("/delete/:id", async (c) => {
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(c.req.param("id"));
    if (!deletedLesson) {
      return c.json({ message: "Lesson not found." }, 404);
    }
    return c.json({ message: "Lesson deleted successfully." }, 200);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

export default app;
