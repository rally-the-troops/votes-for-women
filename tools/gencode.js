"use strict"

let fs = require("fs")

let pc = 0

function emit(line) {
	++pc
	line[0] = "vm_" + line[0]
	for (let i = 1; i < line.length; ++i) {
		if (typeof line[i] === "string") {
			if (line[i] === "all")
				line[i] = 999
			if (line[i][0] === "(" && !line[i].match(/\)=>/))
				line[i] = "()=>" + line[i]
			if (line[i][0] === "`")
				line[i] = "()=>" + line[i]
		}
	}
	console.log("\t[ " + line.join(", ") + " ],")
}

console.log("// #region GENERATED EVENT CODE")
console.log("const CODE = []")
let first = false

for (let line of fs.readFileSync("events.txt", "utf-8").split("\n")) {
	line = line.trim()
	if (line.length === 0 || line[0] === "#")
		continue
	if (line === "EOF")
		break
	line = line.split(" ")
	switch (line[0]) {
	case "CARD":
		if (first++) {
			emit(["return"])
			console.log("]")
		}
		console.log("")
		console.log("CODE[" + line[1] + "] = [ // " + line.slice(3).join(" "))
		break

	case "log":
	case "prompt":
		emit([ line[0], line.slice(1).join(" ") ])
		break

	case "asm":
	case "if":
	case "while":
		emit([ line[0], "()=>" + line.slice(1).join(" ") ])
		break

	default:
		emit(line)
		break
	}
}

emit(["return"])
console.log("]")
console.log("// #endregion")
