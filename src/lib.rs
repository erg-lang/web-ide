mod utils;

use once_cell::sync::Lazy;
use rustpython_wasm::{VMStore, WASMVirtualMachine};
use wasm_bindgen::prelude::*;

use erg_common::error::{ErrorCore, Location};
use erg_common::traits::{Runnable, Stream};
use erg_compiler::erg_parser::ast::VarName;
use erg_compiler::error::CompileError;
use erg_compiler::transpile::Transpiler;
use erg_compiler::ty::Type;
use erg_compiler::varinfo::VarInfo;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[wasm_bindgen]
pub enum CompItemKind {
    Method = 0,
    Function = 1,
    Constructor = 2,
    Field = 3,
    Variable = 4,
    Class = 5,
    Struct = 6,
    Interface = 7,
    Module = 8,
    Property = 9,
    Event = 10,
    Operator = 11,
    Unit = 12,
    Value = 13,
    Constant = 14,
    Enum = 15,
    EnumMember = 16,
    Keyword = 17,
    Text = 18,
    Color = 19,
    File = 20,
    Reference = 21,
    Customcolor = 22,
    Folder = 23,
    TypeParameter = 24,
    User = 25,
    Issue = 26,
    Snippet = 27,
}

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

#[derive(Debug, Clone)]
#[wasm_bindgen]
pub struct ErgType(Type);

#[derive(Debug, Clone)]
#[wasm_bindgen]
pub struct ErgVarEntry {
    name: VarName,
    vi: VarInfo,
}

impl ErgVarEntry {
    pub fn new(name: VarName, vi: VarInfo) -> Self {
        Self { name, vi }
    }
}

#[wasm_bindgen]
impl ErgVarEntry {
    pub fn name(&self) -> String {
        self.name.to_string()
    }
    pub fn item_kind(&self) -> CompItemKind {
        match &self.vi.t {
            Type::Callable { .. } => CompItemKind::Function,
            Type::Subr(subr) => {
                if subr.self_t().is_some() {
                    CompItemKind::Method
                } else {
                    CompItemKind::Function
                }
            }
            Type::Quantified(quant) => match quant.as_ref() {
                Type::Callable { .. } => CompItemKind::Function,
                Type::Subr(subr) => {
                    if subr.self_t().is_some() {
                        CompItemKind::Method
                    } else {
                        CompItemKind::Function
                    }
                }
                _ => unreachable!(),
            },
            Type::ClassType => CompItemKind::Class,
            Type::TraitType => CompItemKind::Interface,
            Type::Poly { name, .. } if &name[..] == "Module" => CompItemKind::Module,
            _ if self.vi.muty.is_const() => CompItemKind::Constant,
            _ => CompItemKind::Variable,
        }
    }
    pub fn typ(&self) -> String {
        self.vi.t.to_string()
    }
}

#[wasm_bindgen]
impl ErgErrorLoc {
    pub fn ln_begin(&self) -> Option<u32> {
        self.0.ln_begin()
    }

    pub fn ln_end(&self) -> Option<u32> {
        self.0.ln_end()
    }

    pub fn col_begin(&self) -> Option<u32> {
        self.0.col_begin()
    }

    pub fn col_end(&self) -> Option<u32> {
        self.0.col_end()
    }
}

#[derive(Debug, Clone)]
#[wasm_bindgen(getter_with_clone)]
pub struct ErgError {
    pub errno: usize,
    pub is_warning: bool,
    // pub kind: ErrorKind,
    pub loc: ErgErrorLoc,
    pub desc: String,
    pub hint: Option<String>,
}

fn find_fallback_loc(err: &ErrorCore) -> Location {
    if err.loc == Location::Unknown {
        for sub in &err.sub_messages {
            if sub.loc != Location::Unknown {
                return sub.loc;
            }
        }
        Location::Unknown
    } else {
        err.loc
    }
}

impl From<CompileError> for ErgError {
    fn from(err: CompileError) -> Self {
        let loc = ErgErrorLoc(find_fallback_loc(&err.core));
        let sub_msg = err
            .core
            .sub_messages
            .get(0)
            .map(|sub| {
                sub.msg
                    .iter()
                    .fold("\n".to_string(), |acc, s| acc + s + "\n")
            })
            .unwrap_or_default();
        let desc = err.core.main_message + &sub_msg;
        Self {
            errno: err.core.errno,
            is_warning: err.core.kind.is_warning(),
            // kind: err.kind(),
            loc,
            desc,
            hint: err
                .core
                .sub_messages
                .get(0)
                .and_then(|sub| sub.hint.clone()),
        }
    }
}

impl ErgError {
    pub const fn new(
        errno: usize,
        is_warning: bool,
        loc: ErgErrorLoc,
        desc: String,
        hint: Option<String>,
    ) -> Self {
        Self {
            errno,
            is_warning,
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
        crate::utils::set_panic_hook();
        Playground {
            transpiler: Transpiler::default(),
            // vm: VMStore::init("term_vm".into(), None),
            vm: Lazy::new(|| VMStore::init("ide_vm".into(), None)),
            inited: false,
        }
    }

    fn initialize(&mut self) {
        self.vm
            .exec_single("from collections import namedtuple as NamedTuple__", None)
            .unwrap();
        self.inited = true;
    }

    pub fn clear(&mut self) {
        self.transpiler.initialize();
    }

    pub fn set_stdout(&mut self, stdout: JsValue) {
        self.vm.set_stdout(stdout).unwrap();
    }

    pub fn start_message(&self) -> String {
        self.transpiler
            .start_message()
            .replace("Erg transpiler", "Erg Playground (experimental)")
    }

    /// returns `Box<[JsValue]>` instead of `Vec<ErgVarEntry>`
    pub fn dir(&mut self) -> Box<[JsValue]> {
        self.transpiler
            .dir()
            .into_iter()
            .map(|(n, vi)| JsValue::from(ErgVarEntry::new(n.clone(), vi.clone())))
            .collect::<Vec<_>>()
            .into_boxed_slice()
    }

    /// returns `Box<[JsValue]>` instead of `Vec<ErgError>`
    pub fn check(&mut self, input: &str) -> Box<[JsValue]> {
        match self.transpiler.transpile(input.to_string(), "exec") {
            Ok(artifact) => artifact
                .warns
                .into_iter()
                .map(|err| ErgError::from(err).into())
                .collect::<Vec<_>>()
                .into_boxed_slice(),
            Err(mut err_artifact) => {
                err_artifact.errors.extend(err_artifact.warns);
                let errs = err_artifact
                    .errors
                    .into_iter()
                    .map(|err| ErgError::from(err).into())
                    .collect::<Vec<_>>();
                errs.into_boxed_slice()
            }
        }
    }

    pub fn transpile(&mut self, input: &str) -> Option<String> {
        self.transpiler
            .transpile(input.to_string(), "exec")
            .map(|script| script.object.code)
            .ok()
    }

    pub fn exec(&mut self, input: &str) -> String {
        match self.transpiler.transpile(input.to_string(), "exec") {
            Ok(script) => {
                let code = script
                    .object
                    .code
                    .replace("from collections import namedtuple as NamedTuple__\n", "");
                if !self.inited {
                    self.initialize();
                }
                match self.vm.exec(&code, None) {
                    Ok(val) => val.as_string().unwrap_or_default(),
                    Err(err) => format!(
                        "<<RuntimeError>>{}\n{}",
                        code,
                        err.as_string().unwrap_or_default()
                    ),
                }
            }
            Err(errors) => {
                format!("<<CompileError>>{errors}")
            }
        }
    }
}
