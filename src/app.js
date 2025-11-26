// // import express from "express"
// // import cors from "cors"
// // import cookieParser from "cookie-parser"

// // const app = express()

// // app.use(cors({
// //     origin:process.env.CORS_ORIGIN,
// //     credentials:true
// // }))
// // app.use(express.json({limit:"16kb"}))
// // app.use(express.urlencoded({extended:true,limit:"16kb"}))
// // app.use(express.static("public"))
// // app.use(cookieParser)
// // // routes import 
// // import useRoute from './routes/user.routes.js'

// // // routes declaration
// // app.use("/api/v1/users",useRoute)// htttp://localhost:3000/api/v1/users

// // app.get("/", (req, res) => res.send("Server running"));
// // app.listen(process.env.PORT || 3000, () => console.log("Server started ho gya "));



// //  export {app}
// import express from "express"
// import cors from "cors"
// import cookieParser from "cookie-parser"

// const app = express()

// // CORS
// app.use(cors({
//     origin: process.env.CORS_ORIGIN || "http://localhost:5173",
//     credentials: true
// }));

// // Body parsers
// app.use(express.json({ limit: "16kb" }))
// app.use(express.urlencoded({ extended: true, limit: "16kb" }))

// // Public folder
// app.use(express.static("public"))

// // Cookie parser (YOU MISSED PARENTHESIS)
// app.use(cookieParser())

// // Routes import
// import userRoute from "./routes/user.routes.js"

// // Routes declaration
// app.use("/api/v1/users", userRoute)

// export { app }
// src/app.js
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

