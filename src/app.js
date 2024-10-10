import express from "express";
<<<<<<< HEAD
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

=======
const app = express();

>>>>>>> dbcc2bdf6bb5e71bab3c6dbdfdc5d804b0ca7c6d
export default app;
