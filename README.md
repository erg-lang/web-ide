# web-ide

Erg Web IDE

[Try now](https://erg-lang.org/web-ide)

![screenshot](./screen.png)

## features

- [x] editor
- [x] executing code
- [x] error highlighting
- [x] auto completion

## building

```bash
cargo install wasm-pack
```

```bash
npm install
wasm-pack build
npm run build
# npm run start
```

If you find an error like:

```bash
Module not found: Error: Can't resolve './snippets/rustpython_wasm-1a681ef34bfe87cf/inline1.js' in '...\web-ide\node_modules\erg-playground'
```

move `snippets` folder from `pkg` to `node_modules/erg-playground` (run `npm run copy` if you use Windows).
