require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");
const subscriptionRoutes = require("./routes/subscriptions");
const historyRoutes = require("./routes/history");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api", commentRoutes); // includes /videos/:id/comments and /comments/:id
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/history", historyRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));