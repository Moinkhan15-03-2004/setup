import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express from "express";
import { connectDB } from "./db/index.js"; // if db inside src
// OR if db is sibling of src: import { connectDB } from "../db/index.js";

const app = express();

// debug prints (safe: don't paste URI publicly)
console.log("ENV key present?", !!process.env.MONGO_URI);
console.log("PORT:", process.env.PORT || 3000);

if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI not defined. Fix your .env (key name & no spaces).");
  process.exit(1);
}

await connectDB();

app.get("/", (req, res) => res.send("Server running"));
app.listen(process.env.PORT || 3000, () => console.log("Server started"));

