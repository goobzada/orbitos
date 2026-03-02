"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.log = {
    info: (msg) => console.log(chalk_1.default.cyan(`[INFO] ${msg}`)),
    success: (msg) => console.log(chalk_1.default.green(`[OK] ${msg}`)),
    warn: (msg) => console.log(chalk_1.default.yellow(`[WARN] ${msg}`)),
    error: (msg) => console.error(chalk_1.default.red(`[ERROR] ${msg}`)),
    event: (msg) => console.log(chalk_1.default.magenta(`[EVENT] ${msg}`)),
    api: (msg) => console.log(chalk_1.default.blue(`[API] ${msg}`)),
};
