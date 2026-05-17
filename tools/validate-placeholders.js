const fs = require("fs");

function collectStringPairs(refObj, targetObj, prefix) {
  prefix = prefix || "";
  const pairs = [];
  for (let key in refObj) {
    const fullKey = prefix ? prefix + "." + key : key;
    const refVal = refObj[key];
    const targetVal = targetObj ? targetObj[key] : undefined;

    if (typeof refVal === "object" && refVal !== null) {
      if (typeof targetVal === "object" && targetVal !== null) {
        pairs.push.apply(pairs, collectStringPairs(refVal, targetVal, fullKey));
      }
    } else if (typeof refVal === "string" && typeof targetVal === "string") {
      pairs.push({ key: fullKey, ref: refVal, target: targetVal });
    }
  }
  return pairs;
}

function extractPlaceholders(str) {
  return (str.match(/\{\{[^}]+\}\}/g) || []).sort();
}

function validatePlaceholders(referenceFile, targetFile) {
  const reference = JSON.parse(fs.readFileSync(referenceFile, "utf8"));
  const target = JSON.parse(fs.readFileSync(targetFile, "utf8"));

  const pairs = collectStringPairs(reference, target);
  const issues = [];

  for (let i = 0; i < pairs.length; i++) {
    const item = pairs[i];
    if (item.key.startsWith("translations.authors")) continue;

    const refPlaceholders = extractPlaceholders(item.ref);
    const tgtPlaceholders = extractPlaceholders(item.target);

    const missing = refPlaceholders.filter((p) => tgtPlaceholders.indexOf(p) === -1);
    const extra = tgtPlaceholders.filter((p) => refPlaceholders.indexOf(p) === -1);

    if (missing.length > 0 || extra.length > 0) {
      issues.push({ key: item.key, missing: missing, extra: extra });
    }
  }

  if (issues.length === 0) {
    return;
  }

  console.log(issues.length + " placeholder issue(s):\n");
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    console.log("  " + issue.key);
    if (issue.missing.length > 0) console.log("    Missing: " + issue.missing.join(", "));
    if (issue.extra.length > 0) console.log("    Extra:   " + issue.extra.join(", "));
  }

  process.exit(1);
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.log("Usage: node validate-placeholders.js <target-translation-file>");
  process.exit(1);
}

validatePlaceholders("locales/en.json", targetFile);