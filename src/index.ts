import { Hono } from 'hono'
import { cors } from "hono/cors";
import mongoose from "mongoose";

import routes from "./routes";

const app = new Hono()
app.use(cors());

// changing name of the database we connecting to: .mongodb.net/{database_name}
const mongoURI =
  "mongodb+srv://kais4rdev:N94NBjKS60nRuGjt@codeamicacluster.krrdz.mongodb.net/codeamicadata?retryWrites=true&w=majority&appName=CodeamicaCluster";
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.notFound((c) => {
  return c.text("404 not found error check your api", 404);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Nuh uh error code 500", 500);
});

app.get("/", (c) => {
  return c.json({
    message:
      "This is Codeamica API project made with Hono.js and running on Bun.js!",
  });
});

app.route("/homepage", routes.homepage);

export default {
  port: 10004,
  fetch: app.fetch,
};
