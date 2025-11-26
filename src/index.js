// import dotenv from "dotenv";
// import path from "path";
// // import { app } from "./app.js";

// // Explicitly load .env from project root
// dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// import express from "express";
// import { connectDB } from "./db/index.js"; // if db inside src
// // OR if db is sibling of src: import { connectDB } from "../db/index.js";

// const app = express();

// // debug prints (safe: don't paste URI publicly)
// console.log("ENV key present?", !!process.env.MONGO_URI);
// console.log("PORT:", process.env.PORT || 3000);

// if (!process.env.MONGO_URI) {
//   console.error("ERROR: MONGO_URI not defined. Fix your .env (key name & no spaces).");
//   process.exit(1);
// }

// await connectDB();

// app.get("/", (req, res) => res.send("Server running"));
// app.listen(process.env.PORT || 3000, () => console.log("Server started"));
// index.js (project root)
// src/index.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./db/index.js"; // <- correct relative path (index.js is in src/)
import { app } from "./app.js";            // <- correct relative path

// __dirname fix for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up from src/)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("ENV key present?", !!process.env.MONGO_URI);
console.log("PORT:", process.env.PORT || 3000);

if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI not defined. Fix your .env (key name & no spaces).");
  process.exit(1);
}

await connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
