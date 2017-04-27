"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _recursiveReaddir = require("recursive-readdir");

var _recursiveReaddir2 = _interopRequireDefault(_recursiveReaddir);

var _jpegtranBin = require("jpegtran-bin");

var _jpegtranBin2 = _interopRequireDefault(_jpegtranBin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const exec = require("child_process").exec;
const cwd = process.cwd();
const outputPath = cwd;

let replace = false;

const argv = require("yargs").usage("用法: progressive [--path|-p] 自定义图片保存路径").alias("p", "path").describe("p", "自定义图片保存路径").version(() => require('../package.json').version).alias("v", "version").describe("v", "显示版本").help("h").alias("h", "help").describe("h", "显示帮助").argv;
let argvP = argv.p;

//开始执行
(0, _recursiveReaddir2.default)(outputPath, (err, files) => {
	files.map(file => {
		if (filterJPG(file)) {
			toProgressive(file);
		}
	});
});

// 检查是否为jpeg 或者 jpeg 文件
function filterJPG(file) {
	const suffix = file.split(".").pop();

	if (suffix === "jpg" || suffix === "jpeg") {
		return true;
	}
}

//把图片转换成progressive
function toProgressive(input) {
	if (argvP) {
		const subPath = getSubFolders(input);
		let path;

		if (subPath) {
			if (argvP.slice(-1) === "/") {
				path = argvP + subPath;
			} else {
				path = argvP + "/" + subPath;
			}

			createSubFolds(subPath);
		} else {
			path = argvP;
		}

		const inputArray = input.split("/").pop();
		const suffix = inputArray.split(".").pop();

		const sliceNumber = suffix === "jpg" ? 4 : 5;
		const filename = inputArray.slice(0, -sliceNumber);

		jpegtransCLI(input, `${path}/${filename}-opt.${suffix}`);
	} else {
		jpegtransCLI(input);
	}
}

//jpegtrans 命令行
function jpegtransCLI(input) {
	let output = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : input;

	const baseCLI = "jpegtran -copy none -progressive ";

	if (input !== output) {
		//不覆盖原文件
		exec(baseCLI + `${input} > ${output}`);
	} else {
		//覆盖原文件
		exec(baseCLI + `-outfile ${input} ${output}`);
	}
}

//获取子目录路径
function getSubFolders(fullPath) {
	let fullPathLength = fullPath.split("/").length,
	    basePathLength = cwd.split("/").length + 1;

	if (fullPathLength > basePathLength) {
		const subFoldersName = fullPath.split("/").slice(cwd.split("/").length, fullPathLength - 1);
		const subPath = subFoldersName.join("/") + "/";

		return subPath;
	}
}

function createSubFolds(subPath) {
	if (!_fs2.default.existsSync(`${argvP}/${subPath}`)) {
		_fs2.default.mkdirSync(`${argvP}/${subPath}`);
	}
}