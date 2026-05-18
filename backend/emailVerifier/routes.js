const express = require("express");
const multer = require("multer");
const csv = require("fast-csv");
const fs = require("fs");
const path = require("path");
const { validateEmail } = require("./verifyEmails");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/verify-emails", upload.single("file"), async (req, res) => {
  const results = [];
  const fileRows = [];

  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv.parse({ headers: true }))
    .on("data", (row) => {
      fileRows.push(row);
    })
    .on("end", async () => {
      fs.unlinkSync(filePath);

      for (const row of fileRows) {
        const email = row.email || row.Email || row.email_address;
        if (!email) continue;

        const isValid = await validateEmail(email.trim());
        if (isValid) {
          results.push(row);
        }
      }

      const cleanedPath = path.join("uploads", `cleaned_${Date.now()}.csv`);
      const ws = fs.createWriteStream(cleanedPath);

      csv.write(results, { headers: true }).pipe(ws).on("finish", () => {
        res.download(cleanedPath, (err) => {
          if (err) console.error(err);
          fs.unlinkSync(cleanedPath);
        });
      });
    });
});

module.exports = router;
