import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import * as middlewares from "./middlewares";
import api from "./api";
import MessageResponse from "./interfaces/MessageResponse";
import { pdfOutputPath } from "./util/util";
import fs from "fs";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10mb" }));
// Increase limit for URL-encoded data (common for form submissions)
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));
app.get("/pdfs/:file", (req, res) => {
  const filePath = pdfOutputPath(req.params.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }
  res.download(filePath);
});

app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
