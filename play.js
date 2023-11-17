"use strict"

/* global CARDS, US_STATES, action_button, send_action, view */

const SUF = 0
const OPP = 1
const SUF_NAME = "Suffragist"
const OPP_NAME = "Opposition"

const REGION_NAMES = [
    null,
    "West",
    "Plains",
    "South",
    "Midwest",
    "Atlantic & Appalachia",
    "Northeast"
]

const PURPLE = 1
const YELLOW = 2
const PURPLE_OR_YELLOW = 3
const RED = 4
const GREEN_CHECK = 5
const RED_X = 6

const region_count = 6
const us_states_count = region_count * 8
const card_count = 128

let ui = {
	status: document.getElementById("status"),
	turn: document.getElementById("turn"),
	congress_box: document.getElementById("congress_box"),
	congress: [ null ],
	player: [
		document.getElementById("role_Suffragist"),
		document.getElementById("role_Opposition"),
	],
	pieces: document.getElementById("pieces"),
	support_campaigner: [],
	opposition_campaigner: [],
	cubes: [],
    cards: [ null ],
	us_states: [ null ],
	regions: [ null ],
}

// :r !python3 tools/genlayout.py
const LAYOUT = {
	"Northeast": [914, 190],
	"AtlanticAppalachia": [797, 366],
	"Midwest": [612, 298],
	"South": [574, 505],
	"Plains": [406, 236],
	"West": [127, 300],
	"NJ": [960, 277],
	"CT": [1019, 237],
	"RI": [1036, 165],
	"MA": [1014, 74],
	"ME": [963, 119],
	"NH": [889, 96],
	"VT": [817, 157],
	"NY": [863, 207],
	"DE": [997, 345],
	"MD": [952, 404],
	"NC": [864, 385],
	"VA": [861, 332],
	"PA": [849, 257],
	"WV": [811, 314],
	"KY": [743, 351],
	"TN": [716, 401],
	"OH": [762, 287],
	"IN": [708, 285],
	"IL": [663, 333],
	"MI": [724, 228],
	"WI": [639, 198],
	"MO": [601, 357],
	"IA": [563, 256],
	"MN": [561, 163],
	"FL": [835, 572],
	"SC": [828, 433],
	"GA": [779, 465],
	"AL": [715, 470],
	"MS": [662, 477],
	"LA": [623, 544],
	"AR": [605, 436],
	"TX": [482, 516],
	"OK": [519, 417],
	"KS": [497, 348],
	"NE": [477, 273],
	"SD": [471, 205],
	"ND": [468, 134],
	"CO": [374, 331],
	"WY": [341, 229],
	"MT": [335, 133],
	"NM": [351, 440],
	"AZ": [245, 432],
	"UT": [264, 310],
	"NV": [180, 290],
	"ID": [233, 203],
	"CA": [126, 367],
	"OR": [135, 173],
	"WA": [158, 97],
}

const US_STATES_LAYOUT = [ null ]
const REGIONS_LAYOUT = [ null ]

// bits

// RED cubes (6 bits), YELLOW cubes (7 bits), PURPLE cubes (7 bits), RED_X (1 bit), GREEN_CHECK (1 bit),
const GREEN_CHECK_SHIFT = 0
const GREEN_CHECK_MASK = 1 << GREEN_CHECK_SHIFT

const RED_X_SHIFT = 1
const RED_X_MASK = 1 << RED_X_SHIFT

const PURPLE_SHIFT = 2
const PURPLE_MASK = 127 << PURPLE_SHIFT

const YELLOW_SHIFT = 9
const YELLOW_MASK = 127 << YELLOW_SHIFT

const RED_SHIFT = 16
const RED_MASK = 63 << RED_SHIFT

function is_green_check(u) {
	return (view.us_states[u] & GREEN_CHECK_MASK) === GREEN_CHECK_MASK
}

function is_red_x(u) {
	return (view.us_states[u] & RED_X_MASK) === RED_X_MASK
}

function purple_cubes(u) {
	return (view.us_states[u] & PURPLE_MASK) >> PURPLE_SHIFT
}

function yellow_cubes(u) {
	return (view.us_states[u] & YELLOW_MASK) >> YELLOW_SHIFT
}

function red_cubes(u) {
	return (view.us_states[u] & RED_MASK) >> RED_SHIFT
}

// CARD MENU

var card_action_menu = Array.from(document.getElementById("popup").querySelectorAll("li[data-action]")).map(e => e.dataset.action)

function is_popup_menu_action(menu_id, target_id) {
	let menu = document.getElementById(menu_id)
	for (let item of menu.querySelectorAll("li")) {
		let action = item.dataset.action
		if (action)
			return true
	}
	return false
}

function show_popup_menu(evt, menu_id, target_id, title) {
	let menu = document.getElementById(menu_id)

	let show = false
	for (let item of menu.querySelectorAll("li")) {
		let action = item.dataset.action
		if (action) {
			if (is_card_action(action, target_id)) {
				show = true
				item.classList.add("action")
				item.classList.remove("disabled")
				item.onclick = function () {
					send_action(action, target_id)
					hide_popup_menu()
					evt.stopPropagation()
				}
			} else {
				item.classList.remove("action")
				item.classList.add("disabled")
				item.onclick = null
			}
		}
	}

	if (show) {
		menu.onmouseleave = hide_popup_menu
		menu.style.display = "block"
		if (title) {
			let item = menu.querySelector("li.title")
			if (item) {
				item.onclick = hide_popup_menu
				item.textContent = title
			}
		}

		let w = menu.clientWidth
		let h = menu.clientHeight
		let x = Math.max(5, Math.min(evt.clientX - w / 2, window.innerWidth - w - 5))
		let y = Math.max(5, Math.min(evt.clientY - 12, window.innerHeight - h - 40))
		menu.style.left = x + "px"
		menu.style.top = y + "px"

		evt.stopPropagation()
	} else {
		menu.style.display = "none"
	}
}

function hide_popup_menu() {
	document.getElementById("popup").style.display = "none"
}

function is_card_enabled(card) {
	if (view.actions) {
		if (card_action_menu.some(a => view.actions[a] && view.actions[a].includes(card)))
			return true
		if (view.actions.card && view.actions.card.includes(card))
			return true
	}
	return false
}

function is_action(action) {
	if (view.actions && view.actions[action])
		return true
	return false
}

function is_card_action(action, card) {
	if (view.actions && view.actions[action] && view.actions[action].includes(card))
		return true
	return false
}

function is_piece_action(i) {
	if (view.actions && view.actions.piece && view.actions.piece.includes(i))
		return true
	return false
}

function is_region_action(i) {
	if (view.actions && view.actions.region && view.actions.region.includes(i))
		return true
	return false
}

function is_us_state_action(i) {
	if (view.actions && view.actions.us_state && view.actions.us_state.includes(i))
		return true
	return false
}

function is_purple_cube_action(i) {
	if (view.actions && view.actions.purple_cube && view.actions.purple_cube.includes(i))
		return true
	return false
}

function is_yellow_cube_action(i) {
	if (view.actions && view.actions.yellow_cube && view.actions.yellow_cube.includes(i))
		return true
	return false
}

function is_red_cube_action(i) {
	if (view.actions && view.actions.red_cube && view.actions.red_cube.includes(i))
		return true
	return false
}

function is_space_action(i) {
	if (view.actions && view.actions.space && view.actions.space.includes(i))
		return true
	return false
}

function on_blur(_evt) {
	document.getElementById("status").textContent = ""
}

function on_focus_region(evt) {
	document.getElementById("status").textContent = REGION_NAMES[evt.target.my_region]
}

function on_focus_us_state(evt) {
	document.getElementById("status").textContent = US_STATES[evt.target.my_us_state].name
}

function on_focus_space(evt) {
	document.getElementById("status").textContent = evt.target.my_name
}

function on_focus_piece(evt) {
	if (evt.target.my_name)
		document.getElementById("status").textContent = evt.target.my_name
}

function on_click_card(evt) {
	let card = evt.target.my_card
	if (is_action('card', card)) {
		send_action('card', card)
	} else {
		show_popup_menu(evt, "popup", card, CARDS[card].name)
	}
}

function on_click_congress(evt) {
	if (evt.button === 0) {
		if (send_action('congress'))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function on_click_region(evt) {
	if (evt.button === 0) {
		if (send_action('region', evt.target.my_region))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function on_click_us_state(evt) {
	if (evt.button === 0) {
		if (send_action('us_state', evt.target.my_us_state))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function on_click_campaigner(evt) {
	if (evt.button === 0) {
		if (send_action('campaigner', evt.target.my_campaigner))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function on_click_space(evt) {
	if (evt.button === 0) {
		if (send_action('space', evt.target.my_space))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function on_click_cube(evt) {
	if (evt.button === 0) {
		console.log("cube", evt.target.my_cube, evt.target.my_us_state)
		if (evt.target.my_cube === PURPLE && send_action('purple_cube', evt.target.my_us_state))
			evt.stopPropagation()
		if (evt.target.my_cube === YELLOW && send_action('yellow_cube', evt.target.my_us_state))
			evt.stopPropagation()
		if (evt.target.my_cube === RED && send_action('red_cube', evt.target.my_us_state))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function create(t, p, ...c) {
	let e = document.createElement(t)
	Object.assign(e, p)
	e.append(c)
	return e
}

function create_campaigner(color, i) {
	let e = create("div", {
		className: `piece ${color}`,
		my_campaigner: i,
	})
	e.addEventListener("click", on_click_campaigner)
	return e
}

function build_user_interface() {
	let elt

	for(let s of US_STATES) {
		if (s) US_STATES_LAYOUT.push(LAYOUT[s.code])
	}
	for(let r of REGION_NAMES) {
		if (r) REGIONS_LAYOUT.push(LAYOUT[r])
	}

	ui.congress_box.addEventListener("click", on_click_congress)
	for (let c = 1; c <= 6; ++c) {
		elt = ui.congress[c] = create("div", {
			className: "piece congress",
			style: `left:${10 + (c-1) * 42}px;top:5px;`,
		})
		elt.addEventListener("click", on_click_congress)
	}

    for (let c = 1; c <= card_count; ++c) {
		elt = ui.cards[c] = create("div", {
			className: `card card_${c}`,
			my_card: c,
		})
		elt.addEventListener("click", on_click_card)
	}

	for (let r = 1; r <= region_count; ++r) {
		let region_name_css = REGION_NAMES[r].replaceAll(' & ', '')
		elt = ui.regions[r] = document.querySelector(`#map #${region_name_css}`)
		elt.my_region = r
		elt.addEventListener("mousedown", on_click_region)
		elt.addEventListener("mouseenter", on_focus_region)
		elt.addEventListener("mouseleave", on_blur)
	}

	for (let s = 1; s <= us_states_count; ++s) {
		let us_state_css = US_STATES[s].code
		elt = ui.us_states[s] = document.querySelector(`#map #${us_state_css}`)
		elt.my_us_state = s
		elt.addEventListener("mousedown", on_click_us_state)
		elt.addEventListener("mouseenter", on_focus_us_state)
		elt.addEventListener("mouseleave", on_blur)
	}

	ui.support_campaigner = [
		create_campaigner('purple1', 1),
		create_campaigner('purple2', 2),
		create_campaigner('yellow1', 3),
		create_campaigner('yellow2', 4)
	]
	ui.opposition_campaigner = [
		create_campaigner('red1', 1),
		create_campaigner('red2', 2),
	]

	for (let i = 0; i < 190; ++i) {
		// XXX do we need to set the color here?
		// let color = (i < 65) ? "purple" : (i < 130) ? "yellow" : "red"
		elt = ui.cubes[i] = create("div", {
			className: `piece cube`,
			onmousedown: on_click_cube,
		})
		document.getElementById("pieces").appendChild(elt)
	}
}

function on_focus_card_tip(card_number) { // eslint-disable-line no-unused-vars
	document.getElementById("tooltip").className = "card card_" + card_number
}

function on_blur_card_tip() { // eslint-disable-line no-unused-vars
	document.getElementById("tooltip").classList = "card hide"
}

function sub_card_name(_match, p1, _offset, _string) {
	let c = p1 | 0
	let n = CARDS[c].name
	return `<span class="tip" onmouseenter="on_focus_card_tip(${c})" onmouseleave="on_blur_card_tip()">${n}</span>`
}

function on_log(text) { // eslint-disable-line no-unused-vars
	let p = document.createElement("div")

	if (text.match(/^>/)) {
		text = text.substring(1)
		p.className = 'i'
	}

	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")
	text = text.replace(/C(\d+)/g, sub_card_name)

	if (text.match(/^\.h1/)) {
		text = text.substring(4)
		p.className = 'h1'
	}
	else if (text.match(/^\.h2/)) {
		text = text.substring(4)
		p.className = 'h2'
	}
	else if (text.match(/^\.h3.suf/)) {
		text = text.substring(8)
		p.className = 'h3 suf'
	}
	else if (text.match(/^\.h3.opp/)) {
		text = text.substring(8)
		p.className = 'h3 opp'
	}
	else if (text.match(/^\.h3/)) {
		text = text.substring(4)
		p.className = 'h3'
	}

	p.innerHTML = text
	return p
}

const pluralize = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;

function support_info() {
	return `${pluralize(view.support_buttons, 'button')}, ${pluralize(view.support_hand, 'card')} in hand`
}

function opposition_info() {
	return `${pluralize(view.opposition_buttons, 'button')}, ${pluralize(view.opposition_hand, 'card')} in hand`
}

function layout_cubes(list, xorig, yorig) {
	const dx = 12
	const dy = 8
	if (list.length > 0) {
		let ncol = Math.round(Math.sqrt(list.length))
		let nrow = Math.ceil(list.length / ncol)
		function place_cube(row, col, e, z) {
			let x = xorig - (row * dx - col * dx) - 10 + (nrow-ncol) * 6
			let y = yorig - (row * dy + col * dy) - 13 + (nrow-1) * 8
			e.style.left = x + "px"
			e.style.top = y + "px"
			e.style.zIndex = z
		}
		let z = 50
		let i = 0
		for (let row = 0; row < nrow; ++row)
			for (let col = 0; col < ncol && i < list.length; ++col)
				place_cube(row, col, list[list.length-(++i)], z--)
	}
}

function on_update() { // eslint-disable-line no-unused-vars
    console.log("VIEW", view)

	ui.player[SUF].classList.toggle("active", view.active === SUF_NAME)
	ui.player[OPP].classList.toggle("active", view.active === OPP_NAME)

	document.getElementById("support_info").textContent = support_info()
	document.getElementById("opposition_info").textContent = opposition_info()

	ui.turn.style.left = 800 + (42 * (view.turn - 1)) + "px"

	ui.congress_box.replaceChildren()
	ui.congress_box.classList.toggle("action", !view.congress && is_action("congress"))
	for (let c = 1; c <= view.congress; ++c) {
		ui.congress_box.appendChild(ui.congress[c])
		ui.congress[c].classList.toggle("action", is_action("congress"))
	}

	document.getElementById("hand").replaceChildren()
	document.getElementById("support_claimed").replaceChildren()
	document.getElementById("support_discard").replaceChildren()
	document.getElementById("opposition_claimed").replaceChildren()
	document.getElementById("opposition_discard").replaceChildren()
	document.getElementById("states_draw").replaceChildren()
	document.getElementById("strategy_draw").replaceChildren()
	document.getElementById("out_of_play").replaceChildren()

    if (view.hand) {
		document.getElementById("hand_panel").classList.remove("hide")
		for (let c of view.hand)
			document.getElementById("hand").appendChild(ui.cards[c])
	} else {
		document.getElementById("hand_panel").classList.add("hide")
	}

	for (let c of view.support_claimed)
		document.getElementById("support_claimed").appendChild(ui.cards[c])
	for (let c of view.support_discard)
		document.getElementById("support_discard").appendChild(ui.cards[c])
	for (let c of view.opposition_claimed)
		document.getElementById("opposition_claimed").appendChild(ui.cards[c])
	for (let c of view.opposition_discard)
		document.getElementById("opposition_discard").appendChild(ui.cards[c])

	for (let c of view.states_draw)
		document.getElementById("states_draw").appendChild(ui.cards[c])
	for (let c of view.strategy_draw)
		document.getElementById("strategy_draw").appendChild(ui.cards[c])

	for (let c of view.out_of_play)
		document.getElementById("out_of_play").appendChild(ui.cards[c])

	// TODO Replace with stacked cards
	for (let id of ['persistent_turn', 'persistent_game', 'persistent_ballot']) {
		document.getElementById(id).replaceChildren()
		for (let c of view[id] || []) {
			let elt = create("div", {
				className: `persistent_card ${CARDS[c].type}`,
				innerHTML: sub_card_name(null, c)
			})
			document.getElementById(id).appendChild(elt)
		}
	}

	for (let i = 1; i < ui.cards.length; ++i) {
		ui.cards[i].classList.toggle("action", is_card_enabled(i))
		ui.cards[i].classList.toggle("selected", i === view.played_card)
	}

	for (let i = 1; i < ui.regions.length; ++i) {
		ui.regions[i].classList.toggle("action", is_region_action(i))
	}

	for (let i = 1; i < ui.us_states.length; ++i) {
		ui.us_states[i].classList.toggle("action", is_us_state_action(i))
	}

	for (let i = 0; i < ui.support_campaigner.length; ++i) {
		// TODO Cleanup
		let campaigner_region = view.support_campaigner[i]
		if (campaigner_region) {
			ui.pieces.appendChild(ui.support_campaigner[i])
			let [x, y] = REGIONS_LAYOUT[campaigner_region]
			ui.support_campaigner[i].style.left = x - 30 + (15 * i) + "px"
			ui.support_campaigner[i].style.top = y - 40 + "px"
		} else {
			ui.support_campaigner[i].remove()
		}
	}
	for (let i = 0; i < ui.opposition_campaigner.length; ++i) {
		// TODO Cleanup
		let campaigner_region = view.opposition_campaigner[i]
		if (campaigner_region) {
			ui.pieces.appendChild(ui.opposition_campaigner[i])
			let [x, y] = REGIONS_LAYOUT[campaigner_region]
			ui.opposition_campaigner[i].style.left = x - 30 + (15 * i) + "px"
			ui.opposition_campaigner[i].style.top = y - 10 + "px"
		} else {
			ui.opposition_campaigner[i].remove()
		}
	}

	let ci = 0
	for (let i = 1; i < ui.us_states.length; ++i) {
		// TODO Cleanup
		if (view.us_states[i]) {
			let state_cubes = []
			let cube = null
			// console.log("US_STATE", i, purple_cubes(i), yellow_cubes(i), red_cubes(i), is_green_check(i), is_red_x(i))
			for (let c = 0; c < purple_cubes(i); ++c) {
				cube = ui.cubes[ci++]
				// TODO track both state and color
				cube.my_us_state = i
				cube.my_cube = PURPLE
				cube.classList.add("purple")
				cube.classList.remove("yellow", "red")
				cube.classList.toggle("action", is_purple_cube_action(i))
				state_cubes.push(cube)
				ui.pieces.appendChild(cube)
			}
			for (let c = 0; c < yellow_cubes(i); ++c) {
				cube = ui.cubes[ci++]
				cube.my_us_state = i
				cube.my_cube = YELLOW
				cube.classList.add("yellow")
				cube.classList.remove("purple", "red")
				cube.classList.toggle("action", is_yellow_cube_action(i))
				state_cubes.push(cube)
				ui.pieces.appendChild(cube)
			}
			for (let c = 0; c < red_cubes(i); ++c) {
				cube = ui.cubes[ci++]
				cube.my_us_state = i
				cube.my_cube = RED
				cube.classList.add("red")
				cube.classList.remove("purple", "yellow")
				cube.classList.toggle("action", is_red_cube_action(i))
				state_cubes.push(cube)
				ui.pieces.appendChild(cube)
			}
			let [x, y] = US_STATES_LAYOUT[i]
			layout_cubes(state_cubes, x, y)
		}
	}

	// remove remaining unused cubes from DOM
	for (let i = ci; i < ui.cubes.length; ++i) {
		ui.cubes[i].remove()
	}


	action_button("commit_1_button", "+1 Button")
	action_button("defer", "Defer")
	action_button("match", "Match")
	action_button("supersede", "Supersede")

    action_button("draw", "Draw")
	action_button("next", "Next")
	action_button("purple", "Purple")
	action_button("yellow", "Yellow")
	action_button("roll", "Roll")
	action_button("reroll", "Re-roll")
	action_button("end_event", "End Event")

    action_button("skip", "Skip")
	action_button("pass", "Pass")
	action_button("done", "Done")
	action_button("undo", "Undo")

	// XXX
	action_button("restart", "Restart")
}

build_user_interface()
