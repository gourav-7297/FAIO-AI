import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/className="([^"]+)"\s+className="([^"]+)"/g, (match, class1, class2) => {
        return `className="${class1} ${class2}"`;
    });

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Merged duplicate classes in: ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Class merging done!');
