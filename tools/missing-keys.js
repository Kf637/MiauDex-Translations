const fs = require("fs");

function getAllKeys(obj, prefix = "") {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function findMissingKeys(referenceFile, targetFile) {
  const reference = JSON.parse(fs.readFileSync(referenceFile, "utf8"));
  const target = JSON.parse(fs.readFileSync(targetFile, "utf8"));

  let referenceKeys = getAllKeys(reference).filter((k) => !k.startsWith("translations.authors"));
  let targetKeys = getAllKeys(target).filter((k) => !k.startsWith("translations.authors"));

  const missing = referenceKeys.filter((key) => !targetKeys.includes(key));
  const extra = targetKeys.filter((key) => !referenceKeys.includes(key));

  if (missing.length > 0) {
    console.log(`\nMissing keys (${missing.length}):`);
    missing.forEach((key) => console.log(`  - ${key}`));
  }

  if (extra.length > 0) {
    console.log(`\nExtra keys (${extra.length}):`);
    extra.forEach((key) => console.log(`  + ${key}`));
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log("All keys match reference");
  }

  if (missing.length > 0) {
    process.exit(1);
  }
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.log("Usage: node missing-keys.js <target-translation-file>");
  process.exit(1);
}

findMissingKeys("locales/en.json", targetFile);