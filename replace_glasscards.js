import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove GlassCard import
    content = content.replace(/import\s+\{?\s*GlassCard\s*\}?\s+from\s+['"].*?GlassCard['"];?\n?/g, '');

    // Replace <GlassCard ...> with <div className="neo-box bg-surface ...">
    content = content.replace(/<GlassCard(?:([^>]*?)(?:className=(['"])(.*?)\2)?([^>]*?))?>/g, (match, prefix, quote, cls, suffix) => {
        let classes = ["neo-box", "bg-surface", "p-4", "flex", "flex-col"];
        if (cls) {
            // Remove colliding layouts if provided
            if (cls.includes('p-')) classes = classes.filter(c => c !== 'p-4');
            if (cls.includes('bg-')) classes = classes.filter(c => c !== 'bg-surface');
            classes.push(cls.replace(/glass/g, '').trim());
        }
        let attrs = (prefix || '') + (suffix || '');
        return `<div className="${classes.join(' ')}"${attrs}>`;
    });

    // Replace </GlassCard>
    content = content.replace(/<\/GlassCard>/g, '</div>');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated GlassCard in: ${filePath}`);
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
console.log('GlassCard replacement done!');
