import LearningPath from "../models/learningPath.model"; // Assuming your LearningPath model is in the models folder
import { getErrorMessage } from "../utils/apiErrorHandler"; // You can create this utility for standardized error handling
import { Hono } from "hono";

const app = new Hono();

// Add a new learning path
app.post("/add", async (c) => {
  try {
    const body = await c.req.json();

    // Validation check for required fields
    // if (
    //   !body.title ||
    //   !body.description ||
    //   !body.courses ||
    //   !body.estimatedHours
    // ) {
    //   return c.json({ message: "Missing required fields" }, 400);
    // }

    // Create a new LearningPath instance
    const newLearningPath = new LearningPath(body);

    // Save the new learning path
    await newLearningPath.save();

    return c.json(newLearningPath, 201); // Return the saved learning path
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500); // Error handling
  }
});

// Get all learning paths
app.get("/get-all", async (c) => {
  try {
    const learningPaths = await LearningPath.find().populate("courses");

    // Transform the result to include the _id and other required fields
    const transformedLearningPaths = learningPaths.map((path) => ({
      _id: path._id,
      title: path.title,
      description: path.description,
      courses: path.courses.map((course) => course._id),
      estimatedHours: path.estimatedHours,
    }));

    return c.json(transformedLearningPaths);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Get learning path by ID
app.get("/get/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const learningPath = await LearningPath.findById(id).populate({
      path: "courses",
      select: "_id title description", // Only include these fields from the Course model
    });

    if (!learningPath) {
      return c.json({ message: "Learning path not found" }, 404);
    }

    return c.json(learningPath);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Update learning path by ID
app.put("/edit/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    // Update the learning path by its ID
    const updatedLearningPath = await LearningPath.findByIdAndUpdate(id, body, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation runs on update
    });

    if (!updatedLearningPath) {
      return c.json({ message: "Learning path not found" }, 404);
    }

    return c.json(updatedLearningPath);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Delete learning path by ID
app.delete("/delete/:id", async (c) => {
  try {
    const { id } = c.req.param();

    const deletedLearningPath = await LearningPath.findByIdAndDelete(id);

    if (!deletedLearningPath) {
      return c.json({ message: "Learning path not found" }, 404);
    }

    return c.json({ message: "Learning path deleted successfully" });
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

export default app;
