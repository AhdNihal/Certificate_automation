import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from 'fontkit'; // Import fontkit

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to handle certificate generation
app.post('/generate-certificates', upload.fields([{ name: 'template' }, { name: 'font' }, { name: 'csv' }]), async (req, res) => {
    const templateFile = req.files['template'][0];
    const fontFile = req.files['font'][0];
    const csvFile = req.files['csv'][0];

    const text = req.body.text || '{name}'; // Ensure there's a default text
    const fontSize = parseInt(req.body.fontSize) || 45; // Default font size
    const positionX = parseInt(req.body.positionX) || 50; // Default X position
    const positionY = parseInt(req.body.positionY) || 400; // Default Y position

    try {
        // Load the PDF template
        const templateBytes = fs.readFileSync(templateFile.path);
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Load the custom font
        const fontBytes = fs.readFileSync(fontFile.path);
        const customFont = await pdfDoc.embedFont(fontBytes, { fontkit }); // Embed the font

        // Read CSV file and generate certificates
        const csvData = fs.readFileSync(csvFile.path, 'utf-8').split('\n').slice(1);
        for (const row of csvData) {
            const [name] = row.split(',');

            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();

            // Set the font size and color
            page.drawText(text.replace('{name}', name), {
                x: positionX,
                y: height - positionY,
                size: fontSize,
                font: customFont,
                color: rgb(0, 0, 0),
            });
        }

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Set the response header to indicate a file download
        res.setHeader('Content-Disposition', 'attachment; filename=certificates.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBytes);
    } catch (error) {
        console.error('Error generating certificates:', error);
        res.status(500).send('Failed to generate certificates.');
    } finally {
        // Cleanup uploaded files
        fs.unlinkSync(templateFile.path);
        fs.unlinkSync(fontFile.path);
        fs.unlinkSync(csvFile.path);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});