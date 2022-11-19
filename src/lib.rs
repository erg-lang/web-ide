mod utils;

use wasm_bindgen::prelude::*;
use erg_compiler::error::CompileError;
use erg_compiler::transpile::Transpiler;
use erg_common::traits::{Stream, Runnable};
use erg_common::error::{Location, ErrorDisplay};
use rustpython_wasm::{VMStore, WASMVirtualMachine};
use once_cell::sync::Lazy;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Debug, Clone)]
#[wasm_bindgen]
pub struct ErgErrorLoc(Location);

impl From<Location> for ErgErrorLoc {
    fn from(loc: Location) -> Self {
        Self(loc)
    }
}

impl ErgErrorLoc {
    pub const UNKNOWN: ErgErrorLoc = ErgErrorLoc(Location::Unknown);
}

#[wasm_bindgen]
impl ErgErrorLoc {
    pub fn ln_begin(&self) -> Option<usize> {
        self.0.ln_begin()
    }

    pub fn ln_end(&self) -> Option<usize> {
        self.0.ln_end()
    }

    pub fn col_begin(&self) -> Option<usize> {
        self.0.col_begin()
    }

    pub fn col_end(&self) -> Option<usize> {
        self.0.col_end()
    }
}

#[derive(Debug, Clone)]
#[wasm_bindgen(getter_with_clone)]
pub struct ErgError {
    pub errno: usize,
    // pub kind: ErrorKind,
    pub loc: ErgErrorLoc,
    pub desc: String,
    pub hint: Option<String>,
}

impl From<CompileError> for ErgError {
    fn from(err: CompileError) -> Self {
        Self {
            errno: err.core().errno,
            // kind: err.kind(),
            loc: ErgErrorLoc(err.core().loc),
            desc: err.core.desc,
            hint: err.core.hint,
        }
    }
}

impl ErgError {
    pub const fn new(errno: usize, loc: ErgErrorLoc, desc: String, hint: Option<String>) -> Self {
        Self {
            errno,
            loc,
            desc,
            hint,
        }
    }
}

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

    /// returns `Box<[JsValue]>` instead of `Vec<ErgError>`
    pub fn check(&mut self, input: &str) -> Box<[JsValue]> {
        match self.transpiler.transpile(input.to_string(), "exec") {
            Ok(_) => Box::new([]),
            Err(errs) => {
                let errs = errs.into_iter().map(|err| ErgError::from(err).into()).collect::<Vec<_>>();
                errs.into_boxed_slice()
            }
        }
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
