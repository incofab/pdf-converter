import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";
import express from "express";

export async function getBrowser() {
  return await puppeteer.launch({
    headless: process.env.NODE_ENV !== "development",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // optional, helps with /dev/shm issues
    ],
    timeout: 60_000, // 60 seconds
  });
}

export const pdfFolder = path.join(__dirname, "../pdfs");
export function pdfOutputPath(filename: string) {
  if (!fs.existsSync(pdfFolder)) {
    fs.mkdirSync(pdfFolder);
  }
  return path.join(pdfFolder, filename);
}
export function baseUrl(req: express.Request) {
  return `${req.protocol}://${req.get("host")}`;
}
export function pdfFileUrl(req: express.Request, filename: string) {
  return `${baseUrl(req)}/pdfs/${filename}`;
}

export async function deleteOldPdfFiles() {
  // Delete files that a upto 7 days old
  try {
    const files = fs.readdirSync(pdfFolder);
    const now = Date.now();
    let deletedFiles = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file == ".gitignore") {
        continue;
      }
      const filePath = path.join(pdfFolder, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > 1 * 24 * 60 * 60 * 1000) {
        // 1 day
        if (deletedFiles > 9) {
          break;
        }
        deletedFiles++;
        fs.unlink(filePath, () => {});
      }
    }
  } catch (error) {
    // console.error(error);
  }
}
