import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@babel/parser';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const TARGET_DIRS = ['src', 'server', 'api', 'tests'];

function getAllFiles(dir, extensions = ['.js', '.jsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.includes(path.extname(file))) {
      results.push(fullPath);
    }
  }
  return results;
}

function removeCommentsFromCode(code) {
  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
  } catch (err) {
    console.warn('   [WARN] Parse failed, skipping AST removal:', err.message);
    return { cleaned: code, count: 0 };
  }

  if (!ast.comments || ast.comments.length === 0) {
    return { cleaned: code, count: 0 };
  }

  const commentCount = ast.comments.length;
  // Sort from last to first so string indices don't shift
  const comments = [...ast.comments].sort((a, b) => b.start - a.start);
  let result = code;

  for (const c of comments) {
    let start = c.start;
    let end = c.end;

    // Detect JSX container: {/* comment */}
    let jsxStart = start - 1;
    while (jsxStart >= 0 && (result[jsxStart] === ' ' || result[jsxStart] === '\t')) {
      jsxStart--;
    }
    let jsxEnd = end;
    while (jsxEnd < result.length && (result[jsxEnd] === ' ' || result[jsxEnd] === '\t')) {
      jsxEnd++;
    }

    if (jsxStart >= 0 && result[jsxStart] === '{' && jsxEnd < result.length && result[jsxEnd] === '}') {
      start = jsxStart;
      end = jsxEnd + 1;
    }

    result = result.slice(0, start) + result.slice(end);
  }

  return { cleaned: result, count: commentCount };
}

async function run() {
  console.log('===============================================================');
  console.log('       MEMULAI PEMBERSIHAN KOMENTAR (PURE CODE INITIATIVE)     ');
  console.log('===============================================================');

  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalCommentsRemoved = 0;

  for (const dirName of TARGET_DIRS) {
    const targetDir = path.join(rootDir, dirName);
    const files = getAllFiles(targetDir);

    for (const filePath of files) {
      // Don't modify this script itself if in target
      if (filePath === __filename) continue;

      totalFiles++;
      const relativePath = path.relative(rootDir, filePath);
      const originalCode = fs.readFileSync(filePath, 'utf8');

      const { cleaned, count } = removeCommentsFromCode(originalCode);

      if (count > 0) {
        let finalCode = cleaned;
        try {
          // Prettier formatting
          const prettierConfig = (await prettier.resolveConfig(filePath)) || {};
          finalCode = await prettier.format(cleaned, {
            ...prettierConfig,
            filepath: filePath,
          });
        } catch {
          // Fallback if prettier encounters formatting issue
          finalCode = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
        }

        fs.writeFileSync(filePath, finalCode, 'utf8');
        modifiedFiles++;
        totalCommentsRemoved += count;
        console.log(` ✓ [CLEANED] ${relativePath.padEnd(50)} (${count} komentar dihapus)`);
      }
    }
  }

  console.log('\n===============================================================');
  console.log('                   RINGKASAN HASIL PEMBERSIHAN                 ');
  console.log('===============================================================');
  console.log(` Total berkas dipindai       : ${totalFiles} berkas`);
  console.log(` Berkas yang dibersihkan     : ${modifiedFiles} berkas`);
  console.log(` Total komentar dihilangkan  : ${totalCommentsRemoved} komentar`);
  console.log(' Status kode                 : 100% PURE CODE');
  console.log('===============================================================\n');
}

run().catch((err) => {
  console.error('Fatal error during clean:', err);
  process.exit(1);
});
