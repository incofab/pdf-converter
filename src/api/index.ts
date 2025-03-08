import express from "express";

import MessageResponse from "../interfaces/MessageResponse";
import emojis from "./emojis";
import pdfConverter from "./pdf-converter";

const router = express.Router();

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/emojis", emojis);
router.use("/pdf", pdfConverter);

export default router;
