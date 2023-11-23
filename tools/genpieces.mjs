import fs from "fs"
import { formatHex, parseHex, convertRgbToOklab } from "culori"

function make_piece_colors(base) {
	let rgb = parseHex(base)
        let sh1 = convertRgbToOklab(rgb); sh1.l *= 0.9;
        let sh2 = convertRgbToOklab(rgb); sh2.l *= 0.8;
        let sh3 = convertRgbToOklab(rgb); sh3.l *= 0.7;
        let sh4 = convertRgbToOklab(rgb); sh4.l *= 0.4;
	return [ base, formatHex(sh1), formatHex(sh2), formatHex(sh3), formatHex(sh4) ]
}

function print_cube(output, c) {
	let svg = []

	let xo = 0
	let yo = 0
	let ys = 2/3

	let w = 14
	let d = Math.sqrt(w * w + w * w)
	let h = Math.round(w * 0.8)

	let v = [
		[ xo + (d/2), yo + (0) * ys ],
		[ xo + (d), yo + (d/2) * ys ],
		[ xo + (d/2), yo + (d) * ys ],
		[ xo + (0), yo + (d/2) * ys ],
	]

	for (let xy of v) {
		xy[0] = Math.round(xy[0]) + 0.5
		xy[1] = Math.round(xy[1]) + 0.5
	}

	let iw = Math.max(...v.map(xy => xy[0])) + 0.5
	let ih = Math.max(...v.map(xy => xy[1])) + h + 0.5

	let v2 = [
		[ v[1][0], v[1][1] ],
		[ v[1][0], v[1][1] + h ],
		[ v[2][0], v[2][1] + h ],
		[ v[3][0], v[3][1] + h ],
		[ v[3][0], v[3][1] ],
	]

	let v3 = [
		[ v[2][0], v[2][1] ],
		[ v[2][0], v[2][1] + h ],
	]

	let f1 = [
		[ v[1][0], v[1][1] ],
		[ v[1][0], v[1][1] + h ],
		[ v[2][0], v[2][1] + h ],
		[ v[2][0], v[2][1] ],
	]

	let f2 = [
		[ v[2][0], v[2][1] ],
		[ v[2][0], v[2][1] + h ],
		[ v[3][0], v[3][1] + h ],
		[ v[3][0], v[3][1] ],
	]

	svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${iw}" height="${ih}">`)

	svg.push(`<path fill="${c[0]}" d="M${v}"/>`)
	svg.push(`<path fill="${c[3]}" d="M${f1}"/>`)
	svg.push(`<path fill="${c[1]}" d="M${f2}"/>`)

	svg.push(`<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${c[4]}" d="M${v}z M${v2} M${v3}"/>`)

	svg.push(`</svg>`)
	fs.writeFileSync(output, svg.join("\n") + "\n")
}

print_cube("pieces/iso_red_cube.svg", make_piece_colors("#e06136"))
print_cube("pieces/iso_yellow_cube.svg", make_piece_colors("#fec36d"))
print_cube("pieces/iso_purple_cube.svg", make_piece_colors("#6d5798"))
