import { Hono } from "hono";

const app = new Hono();

app.get("/en", (c) => c.json("Welcome to Codeamica"));
app.get("/vn", (c) => c.json("Chào mừng bạn đến với Codeamica"));

export default app;