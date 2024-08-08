# ArgonDreams
Script for VSCode. Heavily inspired by "neon dreams" from [robb0wen/synthwave-vscode](https://github.com/robb0wen/synthwave-vscode)...

...but it works on every theme.

### Requires vscode-custom-css (for now)

If you want to use this, you'll need to download this [vscode-custom-css](https://github.com/be5invis/vscode-custom-css) so you can run custom css/js files.

Copy `argonDreams.css` and `argonDreams.js` to a folder on your computer. Copy the file URI and add it to your VS code `settings.json` in the `"vscode_custom_css.imports":[]` section.

**Important**: The file MUST be referenced by URI with the file protocol i.e. `file://`. Do not simply put the path.
For example:
```
{
  "vscode_custom_css.imports": [
    "file:///Users/{username}/argonDreams.css",
    "file:///Users/{username}/argonDreams.js"
    ]
}
```

Then run "Enable Custom CSS and JS" from the command palette (`Ctrl + Shift + P` or `⇧⌘P`). It will prompt you to restart, click "Restart Visual Studio Code" or run the command from the command palette again. When VSCode restarts, the effect will be active and will update even if you change themes.

If VSCode is complaining about being corrupt or if it says "Unsupported" in the title bar, you can simply ignore the message or look to this extension:
[Fix VSCode Checksums](https://marketplace.visualstudio.com/items?itemName=lehni.vscode-fix-checksums 'Fix VSCode Checksums')

Once installed, run `Fix Checksums: Apply` from the command palette. You may need to completely restart VSCode after running this command (quit and reopen).

**NOTE: You will need to repeat these step(s) to re-enable custom CSS and JS every time you update VSCode.**
