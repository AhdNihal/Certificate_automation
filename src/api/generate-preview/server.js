import express from "express";
import multer from "multer";
import cors from "cors";
import { PDFDocument, rgb } from "pdf-lib";
import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const MAIL_USERNAME = process.env.MAIL_USERNAME;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = process.env.MAIL_PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json()); // Enable JSON parsing for incoming requests

const upload = multer({ dest: "uploads/" });

app.post(
  "/api/generate-preview",
  upload.single("template"),
  async (req, res) => {
    try {
      const { fontSize, xPosition, yPosition, selectedRecipient } = req.body;
      const templatePath = req.file.path;

      // Ensure template is a valid PDF file
      if (!templatePath || !req.file.mimetype.includes("pdf")) {
        return res.status(400).json({ error: "Invalid PDF file" });
      }

      const pdfDoc = await PDFDocument.load(await fs.readFile(templatePath));
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Draw the text of the selected recipient
      if (selectedRecipient) {
        firstPage.drawText(selectedRecipient, {
          x: parseInt(xPosition),
          y: parseInt(yPosition),
          size: parseInt(fontSize),
          color: rgb(1, 0, 0), // Red color for preview text
        });
      }

      const pdfBytes = await pdfDoc.save();

      res.contentType("application/pdf");
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating preview:", error);
      res.status(500).json({ error: "Failed to generate preview" });
    }
  }
);

app.post(
  "/api/generate-and-send",
  upload.fields([
    { name: "template", maxCount: 1 },
    { name: "font", maxCount: 1 },
    { name: "csv", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { template, csv } = req.files;
      const settings = JSON.parse(req.body.settings);

      // Ensure template and csv are valid files
      if (!template || !csv) {
        return res
          .status(400)
          .json({ error: "Template and CSV files are required" });
      }

      // Read CSV file and parse it to get recipients
      const csvData = await fs.readFile(csv[0].path, "utf-8");
      const recipients = Papa.parse(csvData, { header: true }).data;

      // Generate certificates for each recipient
      for (const recipient of recipients) {
        const pdfDoc = await PDFDocument.load(
          await fs.readFile(template[0].path)
        );
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Draw recipient name (you can customize the position and size)
        firstPage.drawText(recipient.name, {
          x: settings.xPosition,
          y: settings.yPosition,
          size: settings.fontSize,
          color: rgb(0, 0, 0), // Black color for text
        });

        const pdfBytes = await pdfDoc.save();
        const certificateBuffer = Buffer.from(pdfBytes);

        // Send email with the certificate as an attachment
        await sendEmailWithAttachment(
          recipient.email,
          certificateBuffer,
          recipient.name
        );
      }

      res.json({ message: "Certificates generated and sent successfully" });
    } catch (error) {
      console.error("Error generating and sending certificates:", error);
      res
        .status(500)
        .json({ error: "Failed to generate and send certificates" });
    }
  }
);

// Function to send email with attachment
const sendEmailWithAttachment = async (to, attachment, name) => {
  let transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: true,
    auth: {
      type: "login",
      user: MAIL_USERNAME, // Your email
      pass: MAIL_PASSWORD, // Your email password or app password
    },
  });

  const mailOptions = {
    from: MAIL_USERNAME,
    to,
    subject: `Certificate for ${name}`,
    text: `Hello ${name},` < br > `Please find your certificate attached`,
    attachments: [
      {
        filename: `${name}_certificate.pdf`,
        content: attachment,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
