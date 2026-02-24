import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables FIRST
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:3000"
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
// DEBUG: Check if environment variables are loaded
console.log('=== ENV VARIABLES LOADED ===');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);
console.log('================================');

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Now import your routes AFTER environment variables are loaded
import loginRoutes from "./routes/login.js";
import projectRoutes from "./routes/projects.js";
import facultyRoutes from "./routes/faculty.js";
import adminRoutes from './routes/admin.js';
import forgotPasswordRoutes from "./routes/forgot-password.js";
import facultyAuthRoutes from "./routes/facultyAuthRoutes.js";

// API Routes with debug logging
console.log('=== REGISTERING ROUTES ===');
app.use("/api", loginRoutes);
console.log('✅ Login routes registered');

app.use("/api/faculty", facultyRoutes);
console.log('✅ Faculty routes registered');

app.use("/api/projects", projectRoutes);
console.log('✅ Project routes registered');

app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered');
app.use("/api/faculty/auth", facultyAuthRoutes);
console.log('✅ Faculty authentication routes registered');
app.use("/api", forgotPasswordRoutes);
console.log('✅ Forgot password routes registered');
console.log('================================');

// Add a test route to verify server is working
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

