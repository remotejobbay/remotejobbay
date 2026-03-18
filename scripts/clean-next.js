/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const targets = ['.next', '.turbo', path.join('node_modules', '.cache')];

for (const target of targets) {
  const absPath = path.join(process.cwd(), target);
  try {
    fs.rmSync(absPath, { recursive: true, force: true });
    console.log(`Removed ${target}`);
  } catch (error) {
    console.error(`Failed to remove ${target}`, error);
    process.exitCode = 1;
  }
}
