import { Hono } from "hono";
import LessonText from "../../models/lessonContent/lessonText.model";
import { ObjectId } from "mongodb";
import { getErrorMessage } from "../../utils/apiErrorHandler";

const app = new Hono();

// create a new lesson text
app.post("/add", async (c) => {
  const body = await c.req.json();
  try {
    const newLessonText = new LessonText(body);
    const savedLessonText = await newLessonText.save();
    return c.json(savedLessonText, 201);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// get all lesson texts
app.get("/get-all", async (c) => {
  try {
    const lessonTexts = await LessonText.find();
    return c.json(lessonTexts);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// get a lesson text by id
app.get("/get/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const lessonText = await LessonText.findOne({ _id: new ObjectId(id) });
    if (!lessonText) {
      return c.json({ message: "lesson text not found" }, 404);
    }
    return c.json(lessonText);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// update a lesson text
app.put("/edit/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  try {
    const updatedLessonText = await LessonText.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: body },
      { returnDocument: "after" }
    );
    if (!updatedLessonText) {
      return c.json({ message: "lesson text not found" }, 404);
    }
    return c.json(updatedLessonText);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// delete a lesson text
app.delete("/delete/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await LessonText.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return c.json({ message: "lesson text not found" }, 404);
    }
    return c.json({ message: "lesson text deleted successfully" });
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

export default app;
