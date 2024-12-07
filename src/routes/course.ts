import { Hono } from "hono";
import Course from "../models/course.model";
import LessonQuiz from "../models/lessonContent/lessonQuiz.model";
import LessonText from "../models/lessonContent/lessonText.model";
import { getErrorMessage } from "../utils/apiErrorHandler";

const app = new Hono();

// Fetch all courses
app.get("/get-all", async (c) => {
  try {
    const courses = await Course.find().select(
      "_id title description level estimatedHours"
    );

    return c.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return c.json({ error: "Failed to fetch courses" }, 500);
  }
});

// Fetch a single course by ID
app.get("/get/:id", async (c) => {
  try {
    const courseId = c.req.param("id"); // Get course ID from URL parameter

    // Fetch the course and populate instructors and lessons
    const course = await Course.findById(courseId)
      .populate("instructors") // Populate all instructor fields
      .populate({
        path: "lessons",
        select: "_id title description content", // Select the necessary fields
      });

    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }

    // Process lessons to include text and quiz content if the type is "text" or "quiz"
    const lessonsWithEnrichedContent = await Promise.all(
      course.lessons.map(async (lesson: any) => {
        const enrichedContent = await Promise.all(
          lesson.content.map(async (contentItem: any) => {
            if (contentItem.contentType === "text") {
              // Fetch the corresponding lesson text content with only _id and title
              const lessonText = await LessonText.findById(
                contentItem.contentId
              ).select("_id title");
              return lessonText
                ? { ...lessonText.toObject(), type: "text" }
                : null;
            } else if (contentItem.contentType === "quiz") {
              // Fetch the corresponding lesson quiz content with only _id and title
              const lessonQuiz = await LessonQuiz.findById(
                contentItem.contentId
              ).select("_id title");
              return lessonQuiz
                ? { ...lessonQuiz.toObject(), type: "quiz" }
                : null;
            }
            // Return other content items with their type
            return { ...contentItem, type: contentItem.contentType };
          })
        );

        return {
          ...lesson.toObject(),
          content: enrichedContent.filter(Boolean), // Filter out any nulls
        };
      })
    );

    // Return the course with processed lessons
    return c.json({
      ...course.toObject(),
      lessons: lessonsWithEnrichedContent,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return c.json({ error: "Failed to fetch course" }, 500);
  }
});

// Add a new course
app.post("/add", async (c) => {
  try {
    const body = await c.req.json();
    const newCourse = new Course(body);
    await newCourse.save();
    return c.json(newCourse, 201);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Update a course
app.put("/edit/:id", async (c) => {
  try {
    const courseId = c.req.param("id");
    const updateData = await c.req.json();

    const course = await Course.findById(courseId);
    if (!course) {
      return c.json({ message: "Course not found" }, 404);
    }

    //this is the condition for if
    //the lastUpdated abd version won't be edited when the value of rating and studentsEnrolled change
    const shouldIncreaseVersion = Object.keys(updateData).some(
      (key) => key !== "rating" && key !== "studentsEnrolled"
    );

    if (shouldIncreaseVersion) {
      course.version = (course.version as number) + 1;
      updateData.lastUpdated = new Date();
    }

    //update course
    Object.assign(course, updateData);

    await course.save();

    return c.json(course);
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Delete a course
app.delete("/delete/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return c.json({ message: "Course not found" }, 404);
    }
    return c.json({ message: "Course deleted successfully" });
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// auto-complete search for courses
app.get("/search", async (c) => {
  try {
    const query = c.req.query("q");
    if (!query) {
      return c.json({ message: "Search query is required" }, 400);
    }
    const limit = parseInt(c.req.query("limit") || "5", 10); // Default to 5 suggestions

    console.log(
      `Searching for suggestions with query: "${query}", limit: ${limit}`
    );

    const aggregationPipeline = [
      {
        $search: {
          index: "default",
          compound: {
            should: [
              {
                autocomplete: {
                  query: query,
                  path: "title",
                  fuzzy: { maxEdits: 1, prefixLength: 1 },
                },
              },
              {
                text: {
                  query: query,
                  path: ["description", "category"],
                  fuzzy: { maxEdits: 1 },
                },
              },
            ],
          },
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          title: 1,
          description: 1,
          category: 1,
          score: { $meta: "searchScore" },
        },
      },
    ];

    const suggestions = await Course.aggregate(aggregationPipeline);

    console.log(`Found ${suggestions.length} suggestions`);

    return c.json(suggestions);
  } catch (error) {
    console.error("Error in suggestions route:", error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

// Get courses by category
app.get("/get/category/:category", async (c) => {
  try {
    const category = c.req.param("category");
    const courses = await Course.find({ category });
    return c.json(courses);
  } catch (error) {
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

export default app;
