/*
export const ATTR_RESET = "\x1b[0m";
export const BOLD = "\x1b[1m";
export const UNDERLINE = "\x1b[4m";
export const REVERSED = "\x1b[7m";

// Escape sequences change the color of the terminal
export const RESET = "\x1b[m";
export const BLACK = "\x1b[30m";
export const BLUE = "\x1b[94m";
export const CYAN = "\x1b[96m";
export const GRAY = "\x1b[37m";
export const GREEN = "\x1b[92m";
export const MAGENTA = "\x1b[95m";
export const RED = "\x1b[91m";
export const WHITE = "\x1b[97m";
export const YELLOW = "\x1b[93m";
}*/

const BOLD = /\x1b\[1m/g;
const UNDERLINE = /\x1b\[4m/g;
const RESET = /\x1b\[m/g;
const ATTR_RESET = /\x1b\[0m/g;
const RED = /\x1b\[91m/g;
const YELLOW = /\x1b\[93m/g;
const GREEN = /\x1b\[92m/g;
const CYAN = /\x1b\[96m/g;
const GRAY = /\x1b\[37m/g;
const WHITE = /\x1b\[97m/g;

export function escape_ansi(text: string) {
    return text
        .replace("\n", "<br>")
        .replace(RED, '<span style="color:#aa2222">')
        .replace(YELLOW, '<span style="color:#aa8822">')
        .replace(GREEN, '<span style="color:#22aa22">')
        .replace(CYAN, '<span style="color:#22aaaa">')
        .replace(GRAY, '<span style="color:#aaa">')
        .replace(WHITE, '<span style="color:#eee">')
        .replace(BOLD, "<span style='font-weight:bold'>")
        .replace(UNDERLINE, "<span style='text-decoration:underline'>")
        .replace(RESET, "</span>")
        .replace(ATTR_RESET, "</span>");
}
