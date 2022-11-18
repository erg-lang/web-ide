mod utils;

use wasm_bindgen::prelude::*;
use erg_compiler::transpile::Transpiler;
use erg_common::traits::Runnable;
use rustpython_wasm::{VMStore, WASMVirtualMachine};
use once_cell::sync::Lazy;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
// #[derive()]
pub struct Playground {
    transpiler: Transpiler,
    vm: Lazy<WASMVirtualMachine>,
    // vm: WASMVirtualMachine,
    inited: bool,
}

impl Default for Playground {
    fn default() -> Self {
        Self::new()
    }
}

#[wasm_bindgen]
impl Playground {
    pub fn new() -> Self {
        Playground {
            transpiler: Transpiler::default(),
            // vm: VMStore::init("term_vm".into(), None),
            vm: Lazy::new(|| VMStore::init("ide_vm".into(), None)),
            inited: false,
        }
    }

    pub fn initialize(&mut self) {
        self.vm.exec_single("from collections import namedtuple as NamedTuple__", None).unwrap();
        self.inited = true;
    }

    pub fn set_stdout(&mut self, stdout: JsValue) {
        self.vm.set_stdout(stdout).unwrap();
    }

    pub fn start_message(&self) -> String {
        self.transpiler.start_message().replace("Erg transpiler", "Erg Playground (experimental)")
    }

    pub fn exec(&mut self, input: &str) -> String {
        match self.transpiler.transpile(input.to_string(), "exec") {
            Ok(script) => {
                let code = script.code.replace("from collections import namedtuple as NamedTuple__\n", "");
                if !self.inited {
                    self.initialize();
                }
                match self.vm.exec(&code, None) {
                    Ok(val) => val.as_string().unwrap_or_default(),
                    Err(err) => format!("<<RuntimeError>>{}\n{}", code, err.as_string().unwrap_or_default()),
                }
            },
            Err(errors) => {
                format!("<<CompileError>>{errors}")
            },
        }
    }
}
