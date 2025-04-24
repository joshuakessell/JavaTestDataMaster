"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputMethod = exports.OutputFormat = void 0;
/**
 * Enum for supported output formats
 */
var OutputFormat;
(function (OutputFormat) {
    OutputFormat["JSON"] = "json";
    OutputFormat["JAVA"] = "java";
    OutputFormat["CSV"] = "csv";
})(OutputFormat || (exports.OutputFormat = OutputFormat = {}));
/**
 * Enum for supported output methods
 */
var OutputMethod;
(function (OutputMethod) {
    OutputMethod["INLINE"] = "inline";
    OutputMethod["REPLACE_COMMENT"] = "replace_comment";
    OutputMethod["EXPORT_FILE"] = "export_file";
    OutputMethod["CLIPBOARD"] = "clipboard";
})(OutputMethod || (exports.OutputMethod = OutputMethod = {}));
//# sourceMappingURL=types.js.map