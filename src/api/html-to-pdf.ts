import fs from "fs";
import { getBrowser, pdfFileUrl, pdfOutputPath } from "../util/util";
import express from "express";
import path from "path";

export default async function htmlToPdf(req: express.Request, res: express.Response) {
  const { html, name } = req.body;
  // return res.json({
  //   message: `HTML content here 2 3 4 ${html}`,
  // });

  if (!html) {
    return res.status(400).json({
      message: "HTML content is required",
    });
  }

  const fileName = name ?? `${Math.random()}.pdf`;
  const pdfPath = pdfOutputPath(fileName);

  if (fs.existsSync(pdfPath)) {
    return res.status(200).json({
      message: "File already exists",
      success: true,
      url: pdfFileUrl(req, fileName),
    });
  }

  if (!fs.existsSync(path.dirname(pdfPath))) {
    fs.mkdirSync(path.dirname(pdfPath));
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

    await browser.close();

    return res.json({
      success: true,
      url: pdfFileUrl(req, fileName),
    });
  } catch (error) {
    if (browser) await browser.close();

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
}
