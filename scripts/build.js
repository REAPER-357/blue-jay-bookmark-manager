// Builds ./www: compiled Tailwind CSS, bundled Font Awesome, app files. No CDN is used at runtime.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..'), www = path.join(root, 'www');
const rm = p => fs.rmSync(p, { recursive: true, force: true });
rm(www); fs.mkdirSync(path.join(www, 'vendor/fa/css'), { recursive: true }); fs.mkdirSync(path.join(www, 'vendor/fa/webfonts'), { recursive: true });

// 1. Tailwind -> www/app.css
cp.execFileSync(process.execPath, [require.resolve('tailwindcss/lib/cli.js'), '-c', 'tailwind.config.js', '-i', 'src/input.css', '-o', 'www/app.css', '--minify'], { cwd: root, stdio: 'inherit' });

// 2. Font Awesome (css + fonts)
const fa = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));
fs.copyFileSync(path.join(fa, 'css/all.min.css'), path.join(www, 'vendor/fa/css/all.min.css'));
for (const f of fs.readdirSync(path.join(fa, 'webfonts'))) fs.copyFileSync(path.join(fa, 'webfonts', f), path.join(www, 'vendor/fa/webfonts', f));

// 3. App files
for (const f of ['core.js', 'sync.js', 'app.js']) fs.copyFileSync(path.join(root, 'src', f), path.join(www, f));
for (const f of fs.existsSync(path.join(root, 'assets')) ? fs.readdirSync(path.join(root, 'assets')) : []) fs.copyFileSync(path.join(root, 'assets', f), path.join(www, f));

// 4. HTML: swap the DEV block for local files
let html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
const re = /<!--DEV:START-->[\s\S]*?<!--DEV:END-->/;
if (!re.test(html)) throw new Error('DEV block not found');
html = html.replace(re, '<link rel="stylesheet" href="app.css">\n<link rel="stylesheet" href="vendor/fa/css/all.min.css">');
if (/cdn\.tailwindcss|cdnjs|googleapis|fonts\.gstatic/.test(html)) throw new Error('CDN reference left in HTML');
fs.writeFileSync(path.join(www, 'index.html'), html);
console.log('Built www/ OK');
