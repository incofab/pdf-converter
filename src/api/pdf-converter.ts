import express from "express";
import path from "path";
import puppeteer from "puppeteer";

const { NODE_ENV = "" } = process.env;
const router = express.Router();

interface ResponseType {
  path?: string;
  message?: string;
}
router
  .all<{}, ResponseType | string | Buffer>("/", async (req, res) => {
    const url = String(req.query.url);
    const pdfName = String(req.query.name ?? "generated.pdf");
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(url)) {
      return res.status(400).json("Invalid URL format");
    }
    // console.log("url " + url);

    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: NODE_ENV !== "development",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage", // optional, helps with /dev/shm issues
        ],
        timeout: 60_000, // 60 seconds
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });

      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true }); //, path: path });
      await browser.close();
      // res.json({ path: path, message: "Page pdf collected" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(pdfName)}`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF " + error);
      await browser?.close();
    }
  })
  .get<{}, any>("/download", async (req, res) => {
    // console.log("params", req.query, req.query.filename);
    const filename = String(req.query.filename);
    if (!filename) {
      return res.json("Filename not supplied");
    }

    const filePath = path.join("dump", filename); // Change the file path accordingly

    res.setHeader("Content-Disposition", "attachment; filename=example.txt");
    res.setHeader("Content-Type", "application/pdf");
    res.download(filePath, filename, (err) => {
      if (err) {
        // Handle any error that occurred during the download
        console.error(err);
        res.status(500).send("Internal Server Error " + err);
      }
    });
  });

export default router;
