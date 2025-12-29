import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

// Build extension (Node.js)
const extensionConfig = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  sourcemap: true,
  minify: !watch,
};

// Build webview (browser)
const webviewConfig = {
  entryPoints: ['preview-src/index.ts'],
  bundle: true,
  outfile: 'media/index.js',
  format: 'iife',
  platform: 'browser',
  sourcemap: true,
  minify: !watch,
};

async function build() {
  if (watch) {
    const extCtx = await esbuild.context(extensionConfig);
    const webCtx = await esbuild.context(webviewConfig);
    await Promise.all([extCtx.watch(), webCtx.watch()]);
    console.log('Watching for changes...');
  } else {
    await Promise.all([
      esbuild.build(extensionConfig),
      esbuild.build(webviewConfig),
    ]);
    console.log('Build complete');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
