import { Hono } from "hono";
import UserProgress from "../models/userProgress.model";
import Course from "../models/course.model";
import { getErrorMessage } from "../utils/apiErrorHandler";
import LearningPath from "../models/learningPath.model";
import { ObjectId } from "mongodb";
import User from "../models/user.model";

const app = new Hono();

// NOTICE: lessonId input for this api must be a sub lesson (ex: lessonTextId, lessonVideoId,...)
// DO NOT use lessonId in lessons collection
// With lessons of type text and video, content is not required to be passed. However,
// for lessons of type code and quiz, content is required. Content is an object,
// where the content for a quiz is the output returned by the quiz score API
// (the last function in the lessonQuiz.ts file). As for the content of code lessons,
// I haven't implemented it yet because I don't fully understand how it functions on the
// front end, so I will update later
app.post("/update-progress", async (c) => {
  try {
    const { userId, courseId, lessonContentId, content } = await c.req.json();
    // Find or create new progress record
    let userProgress = await UserProgress.findOne({
      user: userId,
      course: courseId,
    });
    if (!userProgress) {
      userProgress = new UserProgress({ user: userId, course: courseId });
    }

    // Add lesson to completedLessons if not already there
    if (!userProgress.completedLessons.includes(lessonContentId)) {
      userProgress.completedLessons.push(lessonContentId);
    }

    // Update lastCompletedLesson
    userProgress.lastCompletedLesson = lessonContentId;
    userProgress.content = content;

    // Retrieve course lessons and calculate total lessons based on content count
    const course = await Course.findById(courseId).populate({
      path: "lessons",
      populate: {
        path: "content",
      },
    });

    if (!course) {
      return c.json({ message: "Course not found" }, 404);
    }

    // Calculate totalLessons based on the number of content items in each lesson
    const totalLessons = course.lessons.reduce(
      (acc, lesson: any) => acc + lesson.content.length,
      0
    );
    const completedLessons = userProgress.completedLessons.length;

    // Calculate progress as a percentage
    userProgress.progress = (completedLessons / totalLessons) * 100;

    // Save updated progress
    await userProgress.save();

    return c.json({
      progress: userProgress.progress,
      completedLessons,
      totalLessons,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Error calculating progress" }, 500);
  }
});

// get user course progress
// use this url to test API below: http://localhost:10004/user-progress/courses/67257d42600872a7d41041c2
app.get("/courses/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userProgress = await UserProgress.find({
      user: new ObjectId(userId),
    }).populate({
      path: "course",
      select: "_id title lessons description",
      populate: {
        path: "lessons",
        select: "_id title content",
        populate: {
          path: "content.contentId",
          model: "LessonText",
          select: "_id title",
        },
      },
    });

    if (!userProgress.length) {
      return c.json({ message: "Cannot find progress for this user" }, 404);
    }

    return c.json(userProgress, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: getErrorMessage(error) }, 500);
  }
});

async function getCourseProgress(userId: string, courseId: string) {
  const userProgress = await UserProgress.findOne({
    user: userId,
    course: courseId,
  });

  if (!userProgress) {
    return { progress: 0, newContent: false };
  }

  const course = await Course.findById(courseId).select("version").exec();
  const hasNewContent =
    (course?.version ?? 0) > (userProgress.courseVersion ?? 0);

  return {
    progress: userProgress.progress,
    newContent: hasNewContent,
    courseTitle: course?.title,
  };
}

// get user learnng path progress
// use this usl to test api below: http://localhost:10004/user-progress/learning-paths/67257d42600872a7d41041c2
app.get("/learning-paths/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const user = await User.findById(userId)
      .populate({
        path: "pathsJoined",
        select: "_id title courses description",
        populate: {
          path: "courses",
          select: "_id title lessons description",
          populate: {
            path: "lessons",
            select: "_id title",
            populate: {
              path: "content.contentId",
              model: "LessonText",
              select: "_id title",
            },
          },
        },
      })
      .exec();

    if (!user || !user.pathsJoined || user.pathsJoined.length === 0) {
      return c.json({ message: "Cannot find any path for this user." }, 404);
    }

    const learningPathsWithProgress = await Promise.all(
      user.pathsJoined.map(async (learningPath: any) => {
        const coursesWithProgress = await Promise.all(
          learningPath.courses.map(async (course: any) => {
            const courseProgress = await getCourseProgress(userId, course._id);
            return {
              ...course.toObject(),
              courseProgress,
            };
          })
        );

        const totalProgress = coursesWithProgress.reduce(
          (acc: number, course: any) =>
            acc + (course.courseProgress.progress || 0),
          0
        );
        const totalCourses = coursesWithProgress.length;
        const learningPathProgress =
          totalCourses > 0 ? totalProgress / totalCourses : 0;

        return {
          ...learningPath.toObject(),
          courses: coursesWithProgress,
          learningPathProgress,
        };
      })
    );

    return c.json(learningPathsWithProgress, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { message: "An error occurred while retrieving user paths." },
      500
    );
  }
});
export default app;
