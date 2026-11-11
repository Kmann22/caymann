/* Build the site for hosting:  npm install  then  npm run build
   Your editable source stays as it is; a minified copy is written to dist/.
   - data.js + script.js + fx.js  → one file, app.min.js
   - style.css                    → style.min.css
   - index.html                   → points at the minified files
   - assets/                      → copied as-is                                   */
import { transform } from 'esbuild';
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'dist');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);

// JS: the three scripts share globals, so join them in load order, then minify as one classic script
const js = ['data.js', 'script.js', 'fx.js'].map(f => `/* ${f} */\n${read(f)}`).join('\n;\n');
const jsMin = await transform(js, { loader: 'js', minify: true, target: 'es2019', legalComments: 'none' });
fs.writeFileSync(path.join(out, 'app.min.js'), jsMin.code);

// CSS
const cssMin = await transform(read('style.css'), { loader: 'css', minify: true, target: ['chrome90', 'safari14', 'firefox90'] });
fs.writeFileSync(path.join(out, 'style.min.css'), cssMin.code);

// HTML: swap in the minified files and drop comments
let html = read('index.html')
    .replace('href="style.css"', 'href="style.min.css"')
    .replace(/\s*<script src="data\.js"><\/script>\s*<script src="script\.js"><\/script>\s*<script src="fx\.js"><\/script>/, '\n    <script src="app.min.js"></script>')
    .replace(/<!--[\s\S]*?-->/g, '');
fs.writeFileSync(path.join(out, 'index.html'), html);

// assets
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });

const kb = f => (fs.statSync(path.join(out, f)).size / 1024).toFixed(1) + ' KB';
console.log('Built dist/:', { 'app.min.js': kb('app.min.js'), 'style.min.css': kb('style.min.css'), 'index.html': kb('index.html') });
