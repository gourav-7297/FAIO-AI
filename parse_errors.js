import fs from 'fs';

const content = fs.readFileSync('build_errors.txt', 'utf16le');
const lines = content.split('\n');

const errors = new Map();
let currentFile = null;

for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/(src\/[^\s]+?\.(?:tsx|ts)):(\d+):(\d+)\s+-\s+error/);
    if (match) {
        currentFile = match[1];
        if (!errors.has(currentFile)) {
            errors.set(currentFile, []);
        }
        errors.get(currentFile).push(`Line ${match[2]}: ${lines[i+1]?.trim().slice(0, 100)}`);
    }
}

for (const [file, errs] of errors.entries()) {
    console.log(`${file}: ${errs.length} errors`);
    for (const e of errs) {
        console.log(`  ${e}`);
    }
}
