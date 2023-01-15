use wasm_bindgen_test::*;

use erg_web_ide::Playground;

/// run with `wasm-pack test --node`
#[wasm_bindgen_test]
fn exec_pg() {
    let mut pg = Playground::new();
    let out = pg.exec("print! \"Hello, world!\"");
    assert_eq!(out, "None");
    let out = pg.exec("1 + 1");
    assert_eq!(out, "2");
}
