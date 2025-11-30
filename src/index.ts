import express, { Request, Response } from "express";
import connectToMongoDB from "../config/mongodb";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

// Start server after MongoDB connection
const startServer = async () => {
  try {
    await connectToMongoDB(); // Ensure MongoDB is connected
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
