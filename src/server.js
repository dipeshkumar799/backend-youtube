import "dotenv/config";

import connectDB from "./db/dbConnection.js";
import app from "./app.js";
const PORT = process.env.PORT;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB IS NOT CONNECTED", error);
  });
