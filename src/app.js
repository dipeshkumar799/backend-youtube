import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

//route Declear
//this running like http://localhost:3000/user

export default app;
