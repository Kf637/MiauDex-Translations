const fs = require("fs");

function validateTranslation(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    console.log(`${filePath} - Valid JSON`);

    const jsonString = JSON.stringify(data);
    const warnings = [];

    if (jsonString.includes('"Click here"') || jsonString.includes('"undefined"')) {
      warnings.push("Possible untranslated English text found");
    }

    if (warnings.length > 0) {
      console.log("Warnings:");
      warnings.forEach((w) => console.log(`  - ${w}`));
    }
  } catch (error) {
    console.log(`Invalid JSON: ${error.message}`);
    process.exit(1);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.log("Usage: node validate.js <path-to-json>");
  process.exit(1);
}

validateTranslation(filePath);