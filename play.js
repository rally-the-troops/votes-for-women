"use strict"

/* global CARDS, action_button, player, scroll_into_view, send_action, view */

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

const US_STATES = [
	null,
	{ code: "AZ", name: "Arizona", region: 1 },
	{ code: "CA", name: "California", region: 1 },
	{ code: "ID", name: "Idaho", region: 1 },
	{ code: "NM", name: "New Mexico", region: 1 },
	{ code: "NV", name: "Nevada", region: 1 },
	{ code: "OR", name: "Oregon", region: 1 },
	{ code: "UT", name: "Utah", region: 1 },
	{ code: "WA", name: "Washington", region: 1 },
	{ code: "CO", name: "Colorado", region: 2 },
	{ code: "KS", name: "Kansas", region: 2 },
	{ code: "MT", name: "Montana", region: 2 },
	{ code: "ND", name: "North Dakota", region: 2 },
	{ code: "NE", name: "Nebraska", region: 2 },
	{ code: "OK", name: "Oklahoma", region: 2 },
	{ code: "SD", name: "South Dakota", region: 2 },
	{ code: "WY", name: "Wyoming", region: 2 },
	{ code: "AL", name: "Alabama", region: 3 },
	{ code: "AR", name: "Arkansas", region: 3 },
	{ code: "FL", name: "Florida", region: 3 },
	{ code: "GA", name: "Georgia", region: 3 },
	{ code: "LA", name: "Louisiana", region: 3 },
	{ code: "MS", name: "Mississippi", region: 3 },
	{ code: "SC", name: "South Carolina", region: 3 },
	{ code: "TX", name: "Texas", region: 3 },
	{ code: "IA", name: "Iowa", region: 4 },
	{ code: "IL", name: "Illinois", region: 4 },
	{ code: "IN", name: "Indiana", region: 4 },
	{ code: "MI", name: "Michigan", region: 4 },
	{ code: "MN", name: "Minnesota", region: 4 },
	{ code: "MO", name: "Missouri", region: 4 },
	{ code: "OH", name: "Ohio", region: 4 },
	{ code: "WI", name: "Wisconsin", region: 4 },
	{ code: "DE", name: "Delaware", region: 5 },
	{ code: "KY", name: "Kentucky", region: 5 },
	{ code: "MD", name: "Maryland", region: 5 },
	{ code: "NC", name: "North Carolina", region: 5 },
	{ code: "PA", name: "Pennsylvania", region: 5 },
	{ code: "TN", name: "Tennessee", region: 5 },
	{ code: "VA", name: "Virginia", region: 5 },
	{ code: "WV", name: "West Virginia", region: 5 },
	{ code: "CT", name: "Connecticut", region: 6 },
	{ code: "MA", name: "Massachusetts", region: 6 },
	{ code: "ME", name: "Maine", region: 6 },
	{ code: "NH", name: "New Hampshire", region: 6 },
	{ code: "NJ", name: "New Jersey", region: 6 },
	{ code: "NY", name: "New York", region: 6 },
	{ code: "RI", name: "Rhode Island", region: 6 },
	{ code: "VT", name: "Vermont", region: 6 },
]

const region_count = 6
const us_states_count = region_count * 8
const last_card = 128
const green_check_count = 36
const red_x_count = 13

const SUF_CARD_BACK = last_card + 1
const OPP_CARD_BACK = last_card + 2
const STRATEGY_CARD_BACK = last_card + 3
const STATE_CARD_BACK = last_card + 4

let ui = {
	favicon: document.getElementById("favicon"),
	status: document.getElementById("status"),
	turn: document.getElementById("turn"),
	congress_hall: document.getElementById("congress_hall"),
	congress_box: document.getElementById("congress_box"),
	congress: [ null ],
	nineteenth_amendment_score: document.getElementById("nineteenth_amendment_score"),
	green_checks_count: document.getElementById("green_checks_count"),
	red_xs_count: document.getElementById("red_xs_count"),
	player: [
		document.getElementById("role_Suffragist"),
		document.getElementById("role_Opposition"),
	],
	pieces: document.getElementById("pieces"),
	support_button_box: document.getElementById("support_buttons"),
	support_buttons: [],
	opposition_button_box: document.getElementById("opposition_buttons"),
	opposition_buttons: [],
	campaigners: [],
	cubes: [],
	green_checks: [],
	red_xs: [],
	cards: [ null ],
	us_states: [ null ],
	regions: [ null ],
	labels: {},
}

// :r !python3 tools/genlayout.py
const LAYOUT = {
	"Northeast": [914, 190],
	"AtlanticAppalachia": [797, 366],
	"Midwest": [612, 298],
	"South": [574, 505],
	"Plains": [406, 236],
	"West": [127, 300],
	"NJ": [960, 267],
	"CT": [1019, 227],
	"RI": [1036, 155],
	"MA": [1014, 64],
	"ME": [963, 109],
	"NH": [889, 86],
	"VT": [817, 147],
	"NY": [863, 191],
	"DE": [997, 335],
	"MD": [952, 394],
	"NC": [864, 375],
	"VA": [861, 322],
	"PA": [849, 247],
	"WV": [811, 300],
	"KY": [743, 341],
	"TN": [686, 401],
	"OH": [762, 277],
	"IN": [708, 285],
	"IL": [663, 323],
	"MI": [724, 214],
	"WI": [639, 188],
	"MO": [601, 347],
	"IA": [563, 246],
	"MN": [561, 153],
	"FL": [835, 562],
	"SC": [828, 423],
	"GA": [779, 455],
	"AL": [715, 460],
	"MS": [662, 467],
	"LA": [623, 520],
	"AR": [605, 426],
	"TX": [482, 506],
	"OK": [519, 407],
	"KS": [497, 338],
	"NE": [477, 263],
	"SD": [471, 195],
	"ND": [468, 124],
	"CO": [374, 321],
	"WY": [341, 219],
	"MT": [335, 123],
	"NM": [351, 430],
	"AZ": [245, 422],
	"UT": [264, 300],
	"NV": [190, 278],
	"ID": [233, 193],
	"CA": [126, 357],
	"OR": [135, 163],
	"WA": [158, 87],
}

const US_STATES_LAYOUT = [ null ]
const REGIONS_LAYOUT = [ null ]

function find_us_state(name) {
	return US_STATES.findIndex((x) => x && x.name === name)
}

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
	document.getElementById("popup_select_card").style.display = "none"
}

function is_card_enabled(card) {
	if (view.actions) {
		if (card_action_menu.some(a => view.actions[a] && view.actions[a].includes(card)))
			return true
		if (view.actions.card_select && view.actions.card_select.includes(card))
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

function is_color_cube_action(color, i) {
	if (view.actions && view.actions[color + "_cube"] && view.actions[color + "_cube"].includes(i))
		return true
	return false
}

function is_green_check_action(i) {
	if (view.actions && view.actions.green_check && view.actions.green_check.includes(i))
		return true
	return false
}

function is_red_x_action(i) {
	if (view.actions && view.actions.red_x && view.actions.red_x.includes(i))
		return true
	return false
}

function is_campaigner_action(i) {
	if (view.actions && view.actions.campaigner && view.actions.campaigner.includes(i))
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
	let us_state = US_STATES[evt.target.my_us_state]
	document.getElementById("status").textContent = `${us_state.name} (${us_state.code})`
}

function on_click_card(evt) {
	let card = evt.target.my_card
	if (is_action('card', card)) {
		send_action('card', card)
	} else if (is_action('card_select', card)) {
		show_popup_menu(evt, "popup_select_card", card, CARDS[card].name)
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

function on_click_cube(evt) {
	if (evt.button === 0) {
		if (send_action(evt.target.my_cube_color + '_cube', evt.target.my_us_state))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function on_click_green_check(evt) {
	if (evt.button === 0) {
		if (send_action('green_check', evt.target.my_us_state))
			evt.stopPropagation()
	}
	hide_popup_menu()
}

function on_click_red_x(evt) {
	if (evt.button === 0) {
		if (send_action('red_x', evt.target.my_us_state))
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
	e.addEventListener("mousedown", on_click_campaigner)
	return e
}

function build_user_interface() {
	let elt

	for(let s of US_STATES) {
		if (s) US_STATES_LAYOUT.push(LAYOUT[s.code])
	}
	for(let r of REGION_NAMES) {
		if (r)
			REGIONS_LAYOUT.push(LAYOUT[r.replaceAll(' & ', '')])
	}

	ui.congress_hall.addEventListener("mousedown", on_click_congress)
	ui.congress_box.addEventListener("mousedown", on_click_congress)
	for (let c = 1; c <= 6; ++c) {
		elt = ui.congress[c] = create("div", {
			className: "piece congress",
			style: `left:${15 + (c-1) * 41.7}px;top:-6px;`,
		})
		elt.addEventListener("mousedown", on_click_congress)
	}

	for (let i = 0; i < 12; ++i) {
		elt = ui.support_buttons[i] = create("div", {
			className: `button button_${(i % 4) + 1}`,
		})
	}

	for (let i = 0; i < 6; ++i) {
		elt = ui.opposition_buttons[i] = create("div", {
			className: `button button_${(i % 2) + 5}`,
		})
	}

	for (let c = 1; c <= last_card; ++c) {
		elt = ui.cards[c] = create("div", {
			className: `card card_${c} ${CARDS[c].type}`,
			my_card: c,
		})
		// TODO use onmousedown and figure out why it didn't work on mobile
		elt.addEventListener("click", on_click_card)
	}

	ui.cards[SUF_CARD_BACK] = create("div", { className: "card card_support_back" })
	ui.cards[OPP_CARD_BACK] = create("div", { className: "card card_opposition_back" })
	ui.cards[STRATEGY_CARD_BACK] = create("div", { className: "card card_strategy_back" })
	ui.cards[STATE_CARD_BACK] = create("div", { className: "card card_states_back" })

	for (let r = 1; r <= region_count; ++r) {
		let region_name_css = REGION_NAMES[r].replaceAll(' & ', '')
		elt = ui.regions[r] = document.querySelector(`#map #${region_name_css}`)
		elt.my_region = r
		elt.addEventListener("mousedown", on_click_region)
		elt.addEventListener("mouseenter", on_focus_region)
		elt.addEventListener("mouseleave", on_blur)
	}

	for (let s = 1; s <= us_states_count; ++s) {
		let us_state_code = US_STATES[s].code
		elt = ui.us_states[s] = document.querySelector(`#map #${us_state_code}`)
		elt.my_us_state = s
		elt.addEventListener("mousedown", on_click_us_state)
		elt.addEventListener("mouseenter", on_focus_us_state)
		elt.addEventListener("mouseleave", on_blur)

		let label = document.getElementById("label_" + us_state_code)
		if (label)
			ui.labels[us_state_code] = label
	}

	ui.campaigners = [
		create_campaigner('purple1', 1),
		create_campaigner('purple2', 2),
		create_campaigner('yellow2', 3),
		create_campaigner('yellow1', 4),
		create_campaigner('red1', 5),
		create_campaigner('red2', 6),
	]

	for (let i = 0; i < 190; ++i) {
		elt = ui.cubes[i] = create("div", {
			className: `piece cube`,
			onmousedown: on_click_cube,
		})
	}

	for (let i = 0; i < green_check_count; ++i) {
		elt = ui.green_checks[i] = create("div", {
			className: `piece yes`,
			onmousedown: on_click_green_check,
		})
	}

	for (let i = 0; i < red_x_count; ++i) {
		elt = ui.red_xs[i] = create("div", {
			className: `piece no`,
			onmousedown: on_click_red_x,
		})
	}
}

function on_focus_card_tip(card_number) { // eslint-disable-line no-unused-vars
	document.getElementById("tooltip").className = "card card_" + card_number
}

function on_blur_card_tip() { // eslint-disable-line no-unused-vars
	document.getElementById("tooltip").classList = "card hide"
}

function on_focus_region_tip(x) { // eslint-disable-line no-unused-vars
	ui.regions[x].classList.add("tip")
}

function on_blur_region_tip(x) { // eslint-disable-line no-unused-vars
	ui.regions[x].classList.remove("tip")
}

function on_click_region_tip(x) { // eslint-disable-line no-unused-vars
	scroll_into_view(ui.regions[x])
}

function on_focus_us_state_tip(x) { // eslint-disable-line no-unused-vars
	ui.us_states[x].classList.add("tip")
}

function on_blur_us_state_tip(x) { // eslint-disable-line no-unused-vars
	ui.us_states[x].classList.remove("tip")
}

function on_click_us_state_tip(x) { // eslint-disable-line no-unused-vars
	scroll_into_view(ui.us_states[x])
}

function sub_card_name(_match, p1, _offset, _string) {
	let c = p1 | 0
	let n = CARDS[c].name
	return `<span class="tip ${CARDS[c].type}" onmouseenter="on_focus_card_tip(${c})" onmouseleave="on_blur_card_tip()">${n}</span>`
}

function sub_region_name(_match, p1, _offset, _string) {
	let r = p1 | 0
	let n = REGION_NAMES[r]
	return `<span class="tip" onmouseenter="on_focus_region_tip(${r})" onmouseleave="on_blur_region_tip(${r})" onclick="on_click_region_tip(${r})">${n}</span>`
}

function sub_us_state_name(_match, p1, _offset, _string) {
	let s = p1 | 0
	let n = US_STATES[s].name
	return `<span class="tip" onmouseenter="on_focus_us_state_tip(${s})" onmouseleave="on_blur_us_state_tip(${s})" onclick="on_click_us_state_tip(${s})">${n}</span>`
}

const ICONS = {
	B1: '<span class="die_d4 d1"></span>',
	B2: '<span class="die_d4 d2"></span>',
	B3: '<span class="die_d4 d3"></span>',
	B4: '<span class="die_d4 d4"></span>',
	D1: '<span class="die_d6 d1"></span>',
	D2: '<span class="die_d6 d2"></span>',
	D3: '<span class="die_d6 d3"></span>',
	D4: '<span class="die_d6 d4"></span>',
	D5: '<span class="die_d6 d5"></span>',
	D6: '<span class="die_d6 d6"></span>',
	W1: '<span class="die_d8 d1"></span>',
	W2: '<span class="die_d8 d2"></span>',
	W3: '<span class="die_d8 d3"></span>',
	W4: '<span class="die_d8 d4"></span>',
	W5: '<span class="die_d8 d5"></span>',
	W6: '<span class="die_d8 d6"></span>',
	W7: '<span class="die_d8 d7"></span>',
	W8: '<span class="die_d8 d8"></span>',
	PR: '<span class="icon purple_campaigner"></span>',
	YR: '<span class="icon yellow_campaigner"></span>',
	RR: '<span class="icon red_campaigner"></span>',
	PC: '<span class="icon purple_cube"></span>',
	YC: '<span class="icon yellow_cube"></span>',
	PYC: '<span class="icon purple_or_yellow_cube"></span>',
	RC: '<span class="icon red_cube"></span>',
	BM: '<span class="icon button"></span>',
	CM: '<span class="icon congressional_marker"></span>',
	GV: '<span class="icon green_check"></span>',
	RX: '<span class="icon red_x"></span>',
}

function sub_icon(match) {
	return ICONS[match] || match
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
	text = text.replace(/R(\d+)/g, sub_region_name)
	text = text.replace(/S(\d+)/g, sub_us_state_name)

	text = text.replace(/\b[PYR]R\b/g, sub_icon)
	text = text.replace(/\b[PYR]C|PYC\b/g, sub_icon)
	text = text.replace(/\b[BC]M|GV|RX\b/g, sub_icon)
	text = text.replace(/\b[BDW]\d\b/g, sub_icon)

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


function support_info() {
	return `${view.support_buttons}\u{2b50} ${view.support_hand}\u{1f3b4}`
}

function opposition_info() {
	return `${view.opposition_buttons}\u{2b50} ${view.opposition_hand}\u{1f3b4}`
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
	switch (player) {
	case SUF_NAME: ui.favicon.href = "images/badge1.png"; break
	case OPP_NAME: ui.favicon.href = "images/badge5.png"; break
	}

	ui.player[SUF].classList.toggle("active", view.active === SUF_NAME)
	ui.player[OPP].classList.toggle("active", view.active === OPP_NAME)

	document.getElementById("support_info").textContent = support_info()
	document.getElementById("opposition_info").textContent = opposition_info()

	ui.turn.style.left = 806 + (42 * (view.turn - 1)) + "px"

	ui.congress_hall.classList.toggle("action", is_action("congress"))
	ui.congress_box.replaceChildren()
	ui.congress_box.classList.toggle("action", view.active === SUF_NAME && is_action("congress"))
	for (let c = 1; c <= view.congress; ++c) {
		ui.congress_box.appendChild(ui.congress[c])
		ui.congress[c].classList.toggle("action", is_action("congress"))
	}

	ui.nineteenth_amendment_score.classList.toggle("hide", !view.nineteenth_amendment)
	if (view.nineteenth_amendment) {
		ui.green_checks_count.textContent = view.green_checks
		ui.red_xs_count.textContent = view.red_xs
	}

	ui.support_button_box.replaceChildren()
	for (let i = 0; i < view.support_buttons; ++i) {
		ui.support_button_box.appendChild(ui.support_buttons[i])
	}

	ui.opposition_button_box.replaceChildren()
	for (let i = 0; i < view.opposition_buttons; ++i) {
		ui.opposition_button_box.appendChild(ui.opposition_buttons[i])
	}

	document.getElementById("hand").replaceChildren()
	document.getElementById("deck").replaceChildren()
	document.getElementById("drawn").replaceChildren()
	document.getElementById("set_aside").replaceChildren()
	document.getElementById("support_claimed").replaceChildren()
	document.getElementById("opposition_claimed").replaceChildren()
	document.getElementById("states_draw").replaceChildren()
	document.getElementById("strategy_draw").replaceChildren()

	if (view.hand.length) {
		document.getElementById("hand_panel").classList.remove("hide")
		for (let c of view.hand)
			document.getElementById("hand").appendChild(ui.cards[c])
	} else {
		document.getElementById("hand_panel").classList.add("hide")
	}

	if (view.drawn) {
		document.getElementById("drawn_panel").classList.remove("hide")
		for (let c of view.drawn)
			document.getElementById("drawn").appendChild(ui.cards[c])
	} else {
		document.getElementById("drawn_panel").classList.add("hide")
	}

	if (view.deck) {
		document.getElementById("deck_panel").classList.remove("hide")
		for (let c of view.deck)
			document.getElementById("deck").appendChild(ui.cards[c])
	} else {
		document.getElementById("deck_panel").classList.add("hide")
	}

	if (view.set_aside.length) {
		document.getElementById("set_aside_panel").classList.remove("hide")
		for (let c of view.set_aside)
			document.getElementById("set_aside").appendChild(ui.cards[c])
	} else {
		document.getElementById("set_aside_panel").classList.add("hide")
	}

	for (let c of view.support_claimed)
		document.getElementById("support_claimed").appendChild(ui.cards[c])
	for (let c of view.opposition_claimed)
		document.getElementById("opposition_claimed").appendChild(ui.cards[c])

	let claimable = new Set()
	for (let c of view.states_draw) {
		document.getElementById("states_draw").appendChild(ui.cards[c])
		claimable.add(find_us_state(CARDS[c].name))
	}
	for (let c of view.strategy_draw)
		document.getElementById("strategy_draw").appendChild(ui.cards[c])

	for (let id of ['persistent_turn', 'persistent_game', 'persistent_ballot']) {
		const container = document.getElementById(id)
		container.replaceChildren()
		const stack = view[id] || []
		for (let i = 0; i < stack.length; ++i) {
			const c = stack[i]
			const elt = ui.cards[c]
			elt.style.top = -85 * i + "px"
			container.appendChild(elt)
		}
	}

	for (let i = 1; i < ui.cards.length; ++i) {
		ui.cards[i].classList.toggle("action", is_card_enabled(i))
		ui.cards[i].classList.toggle("played", i === view.played_card)
		ui.cards[i].classList.toggle("selected", view.selected_cards.includes(i))
	}

	for (let i = 1; i < ui.regions.length; ++i) {
		ui.regions[i].classList.toggle("action", is_region_action(i))
	}

	for (let i = 1; i < ui.us_states.length; ++i) {
		ui.us_states[i].classList.toggle("action", is_us_state_action(i))
	}

	// Pieces (Campaigners, Cubes, Checks and Xs)
	const pieces = new DocumentFragment()
	for (let i = 0; i < ui.campaigners.length; ++i) {
		let campaigner_region = view.campaigners[i]
		if (campaigner_region) {
			pieces.append(ui.campaigners[i])
			let [x, y] = REGIONS_LAYOUT[campaigner_region]
			ui.campaigners[i].style.left = x - 40 + (15 * (i % 4)) + (15 * Math.floor(i / 4)) + "px"
			ui.campaigners[i].style.top = y - 35 + (20 * Math.floor(i / 4)) + "px"
			ui.campaigners[i].classList.toggle("action", is_campaigner_action(1 + i))
			ui.campaigners[i].classList.toggle("selected", 1 + i === view.selected_campaigner)
		}
	}

	let cube_idx = 0
	let green_check_idx = 0
	let red_x_idx = 0
	let e = null
	const colors = ["purple", "yellow", "red"]
	function place_cubes(state_cubes, us_state, count, color) {
		let others = colors.filter(c => c !== color)
		for (let c = 0; c < count; ++c) {
			e = ui.cubes[cube_idx++]
			e.my_us_state = us_state
			e.my_cube_color = color
			e.classList.add(color)
			e.classList.remove(...others)
			e.classList.toggle("action", is_color_cube_action(color, us_state))
			state_cubes.push(e)
			pieces.append(e)
		}
	}
	for (let i = 1; i < ui.us_states.length; ++i) {
		if (view.us_states[i]) {
			let state_cubes = []
			place_cubes(state_cubes, i, purple_cubes(i), "purple")
			place_cubes(state_cubes, i, yellow_cubes(i), "yellow")
			place_cubes(state_cubes, i, red_cubes(i), "red")

			let [x, y] = US_STATES_LAYOUT[i]
			if (state_cubes.length) {
				layout_cubes(state_cubes, x, y)
			} else if (is_green_check(i)) {
				e = ui.green_checks[green_check_idx++]
				e.my_us_state = i
				e.classList.toggle("action", is_green_check_action(i))
				e.style.left = x - 21 + "px"
				e.style.top = y - 16 + "px"
				pieces.append(e)
			} else if (is_red_x(i)) {
				e = ui.red_xs[red_x_idx++]
				e.my_us_state = i
				e.classList.toggle("action", is_red_x_action(i))
				e.style.left = x - 21 + "px"
				e.style.top = y - 16 + "px"
				pieces.append(e)
			}
		}
		ui.us_states[i].classList.toggle("selected", i === view.selected_us_state)
		if (US_STATES[i].code in ui.labels)
			ui.labels[US_STATES[i].code].classList.toggle("claimable", claimable.has(i))
	}
	ui.pieces.replaceChildren(pieces)

	action_button("commit_1_button", "+1 Button")
	action_button("defer", "Defer")
	action_button("match", "Match")
	action_button("supersede", "Supersede")

	action_button("auto_resolve", "Auto-resolve")
	action_button("draw", "Draw")
	action_button("buttons", "Buttons")
	action_button("move", "Move")
	action_button("purple", "Purple")
	action_button("yellow", "Yellow")
	action_button("roll", "Roll")
	action_button("reroll", "Re-roll")
	action_button("commit", "Commit")
	action_button("accept", "Accept")
	action_button("next", "Next")
	action_button("end_event", "End Event")
	action_button("next_turn", "Next Turn")
	action_button("final_voting", "Final Voting")

	action_button("skip", "Skip")
	action_button("pass", "Pass")
	action_button("done", "Done")
	action_button("undo", "Undo")
}

build_user_interface()
