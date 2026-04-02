import "dotenv/config";
import app from "./app.js";
import "./db/db.js";

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});