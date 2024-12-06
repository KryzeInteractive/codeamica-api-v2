// routes/auth.ts
import { Hono } from "hono";
import User from "../models/user.model"; // Import User model
import bcrypt from "bcryptjs";

const app = new Hono();

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  // Check if the user exists
  const user = await User.findOne({ email });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password as string);

  if (!isMatch) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // Remove password before returning user
  const { password: _, ...userWithoutPassword } = user.toObject();

  return c.json({ message: "Login successful", user: userWithoutPassword });
});

// Sign-up route
app.post("/signup", async (c) => {
  const { email, password, name, role } = await c.req.json();

  // Check if user with the given email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return c.json({ error: "Email already in use" }, 400);
  }

  // Hash the password before saving the user
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    role,
  });

  // Save the user to the database
  await newUser.save();

  // Respond with success message
  return c.json({ message: "Sign-up successful", user: newUser });
});

// Update user details (excluding password)
app.put("/edit/:id", async (c) => {
  const { id } = c.req.param(); // Get user ID from the route parameters
  const { email, name } = await c.req.json();

  try {
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Update fields only if they are provided
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return c.json({ error: "Email already in use by another user" }, 400);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    // Save the updated user data
    await user.save();

    // Respond with success message and updated user info
    return c.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "An error occurred while updating the user" }, 500);
  }
});

// Update user password
app.put("/edit-pw/:id", async (c) => {
  const { id } = c.req.param(); // Get user ID from the route parameters
  const { password } = await c.req.json();

  if (!password) {
    return c.json({ error: "Password is required" }, 400);
  }

  try {
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Save the updated user data
    await user.save();

    // Respond with success message
    return c.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return c.json(
      { error: "An error occurred while updating the password" },
      500
    );
  }
});

// Add path to user's pathsJoined
app.post("/add-path/:id", async (c) => {
  const { id } = c.req.param();
  const { pathId } = await c.req.json();

  if (!pathId) {
    return c.json({ error: "Path ID is required" }, 400);
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Add the path ID to the user's pathsJoined array if it doesn't already exist
    if (!user.pathsJoined.includes(pathId)) {
      user.pathsJoined.push(pathId);
      await user.save();
    }

    // Respond with success message
    return c.json({ message: "Path added successfully", user });
  } catch (error) {
    console.error("Error adding path:", error);
    return c.json({ error: "An error occurred while adding the path" }, 500);
  }
});

export default app;
