import fs from "fs";
import { getBrowser, pdfFileUrl, pdfOutputPath } from "../util/util";
import express from "express";

export async function htmlToPdf(req: express.Request, res: express.Response) {
  const { html, name } = req.body;
  // return res.json({
  //   message: `HTML content here 2 3 4 ${html}`,
  // });
  const fileName = name ?? `${Math.random()}.pdf`;
  return processHtmlToPdf(html, fileName, req, res);
}

export async function fileToPdf(req: express.Request, res: express.Response) {
  const { name } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // 1. Read file as string
  const htmlString = req.file.buffer.toString("utf-8");
  return processHtmlToPdf(htmlString, name, req, res);
}

async function processHtmlToPdf(
  html: string,
  fileName: string,
  req: express.Request,
  res: express.Response
) {
  if (!html) {
    return res.status(400).json({
      message: "HTML content is required",
    });
  }

  const pdfPath = pdfOutputPath(fileName);

  if (fs.existsSync(pdfPath)) {
    return res.status(200).json({
      message: "File already exists",
      success: true,
      url: pdfFileUrl(req, fileName),
    });
  }

  let browser;

  try {
    browser = await getBrowser();

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
    });

    return res.json({
      success: true,
      url: pdfFileUrl(req, fileName),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  } finally {
    await browser?.close();
  }
}
