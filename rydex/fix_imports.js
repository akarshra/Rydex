const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = getFiles('/Users/akarshraj/Downloads/Rydex Demo/rydex/src/app/api');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import { connectDb } from "@/lib/db"')) {
    content = content.replace(/import\s*\{\s*connectDb\s*\}\s*from\s*["']@\/lib\/db["'];?/g, 'import connectDb from "@/lib/db";');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
