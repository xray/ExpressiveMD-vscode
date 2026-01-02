# ExpressiveMD for VS Code

Syntax highlighting and live preview for [ExpressiveMD](https://github.com/xray/expressivemd) templates.

## Features

- **Syntax highlighting** for `.emd` files with support for:
  - Frontmatter declarations (`inbound`, `include`, `plugin`)
  - Control structures (`${if}`, `${for}`, `${end}`)
  - Variable interpolation (`${variable}`)
  - Comments (`${// comment}`)
  - Embedded Markdown

- **Live preview panel** that renders your templates in real-time

- **Props file support** to test templates with different data

## Requirements

This extension requires the `emd` CLI to be installed for preview functionality.

```bash
# Install the emd CLI (adjust based on your package manager)
npm install -g expressivemd
```

## Usage

1. Open any `.emd` file
2. Use one of these methods to open the preview:
   - Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows/Linux)
   - Press `Cmd+K V` (Mac) or `Ctrl+K V` (Windows/Linux) for side-by-side preview
   - Click the preview icon in the editor title bar
   - Run "ExpressiveMD: Open Preview" from the Command Palette

### Using Props Files

To test your templates with data:

1. Open the preview panel
2. Click the JSON icon in the toolbar or run "ExpressiveMD: Select Props File..."
3. Choose a JSON file containing your template variables

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `expressivemd.emdPath` | `"emd"` | Path to the emd binary |
| `expressivemd.preview.autoRefresh` | `true` | Automatically refresh preview on save |

## Commands

| Command | Description |
|---------|-------------|
| ExpressiveMD: Open Preview | Open preview in current column |
| ExpressiveMD: Open Preview to the Side | Open preview in split view |
| ExpressiveMD: Select Props File... | Choose a JSON file for template data |
| ExpressiveMD: Clear Props File | Remove the current props file |
| ExpressiveMD: Refresh Preview | Manually refresh the preview |

## Keybindings

| Key | Command |
|-----|---------|
| `Cmd+Shift+V` / `Ctrl+Shift+V` | Open Preview |
| `Cmd+K V` / `Ctrl+K V` | Open Preview to Side |

## Development

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Watch for changes during development
npm run watch

# Package as VSIX
npm run package
```

## License

This is free and unencumbered software released into the public domain. See [UNLICENSE](LICENSE) for details.
