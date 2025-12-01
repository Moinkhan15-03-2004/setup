
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";

const app = express();

// small logger to see request in terminal
app.use((req, res, next) => {
  console.log(">>", req.method, req.url);
  next();
});

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Static
app.use(express.static("public"));

// Cookies
app.use(cookieParser());
// simple request logger
app.use((req, res, next) => {
  console.log(">>", req.method, req.originalUrl);
  next();
});




// Routes
app.use("/api/v1/users", userRoute);

// Test route
app.get("/", (req, res) => res.send("Server running ✅"));

export { app };

