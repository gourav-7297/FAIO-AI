import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/border-\[\#1A1C1C\]/g, 'border-border');
    content = content.replace(/text-\[\#1A1C1C\]/g, 'text-foreground');
    content = content.replace(/bg-\[\#1A1C1C\]/g, 'bg-foreground');
    content = content.replace(/from-\[\#1A1C1C\]/g, 'from-foreground');
    content = content.replace(/to-\[\#1A1C1C\]/g, 'to-foreground');
    
    content = content.replace(/text-white/g, 'text-background');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
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
console.log('Done!');
