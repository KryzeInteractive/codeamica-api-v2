import { Hono } from "hono";
import LessonCodeExercise from "../../models/lessonContent/lessonCodeExercise.model";
import UserProgress from "../../models/userProgress.model";
import Course from "../../models/course.model";
import { Types } from "mongoose";

const app = new Hono();

// Create a new code exercise
app.post("/", async (c) => {
  try {
    const exerciseData = await c.req.json();
    const newExercise = new LessonCodeExercise(exerciseData);
    await newExercise.save();
    return c.json(newExercise, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to create code exercise" }, 500);
  }
});

// Get all code exercises
app.get("/", async (c) => {
  try {
    const exercises = await LessonCodeExercise.find();
    return c.json(exercises);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to fetch code exercises" }, 500);
  }
});

// Get a specific code exercise by ID
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const exercise = await LessonCodeExercise.findById(id);
    if (!exercise) {
      return c.json({ message: "Code exercise not found" }, 404);
    }
    return c.json(exercise);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to fetch code exercise" }, 500);
  }
});

// Update a code exercise
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const exerciseData = await c.req.json();
    const updatedExercise = await LessonCodeExercise.findByIdAndUpdate(
      id,
      exerciseData,
      { new: true }
    );
    if (!updatedExercise) {
      return c.json({ message: "Code exercise not found" }, 404);
    }
    return c.json(updatedExercise);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to update code exercise" }, 500);
  }
});

// Delete a code exercise
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deletedExercise = await LessonCodeExercise.findByIdAndDelete(id);
    if (!deletedExercise) {
      return c.json({ message: "Code exercise not found" }, 404);
    }
    return c.json({ message: "Code exercise deleted successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to delete code exercise" }, 500);
  }
});

export default app;
