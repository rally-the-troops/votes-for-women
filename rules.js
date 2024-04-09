"use strict"

var game, view, states = {}

const SUF = "Suffragist"
const OPP = "Opposition"

const region_count = 6
const us_states_count = region_count * 8

const era_cards_count = 17
const first_support_card = 1
const last_support_card = 52
const first_opposition_card = 53
const last_opposition_card = 104
const first_strategy_card = 105
const last_strategy_card = 116
const first_states_card = 117
const last_states_card = 128
const last_card = last_states_card

const MAX_SUPPORT_BUTTONS = 12
const MAX_OPPOSITION_BUTTONS = 6

const GREEN_CHECK_VICTORY = 36
const RED_X_VICTORY = 13

const SUF_CARD_BACK = last_card + 1
const OPP_CARD_BACK = last_card + 2
const STRATEGY_CARD_BACK = last_card + 3
const STATE_CARD_BACK = last_card + 4

const WEST = 1
const PLAINS = 2
const SOUTH = 3
const MIDWEST = 4
const ATLANTIC_APPALACHIA = 5
const NORTHEAST = 6

const PURPLE = 1
const YELLOW = 2
const PURPLE_OR_YELLOW = 3
const RED = 4
const GREEN_CHECK = 5
const RED_X = 6

const REST_OF_TURN = 1
const REST_OF_GAME = 2
const BALLOT_BOX = 3

const D4 = 4
const D6 = 6
const D8 = 8

const COLOR_CODE = {
	[PURPLE]: "P",
	[YELLOW]: "Y",
	[PURPLE_OR_YELLOW]: "PY",
	[RED]: "R",
	[GREEN_CHECK]: "GV",
	[RED_X]: "RX",
}

const COLOR_NAMES = {
	[PURPLE]: "Purple",
	[YELLOW]: "Yellow",
	[PURPLE_OR_YELLOW]: "Purple or Yellow",
	[RED]: "Red",
	[GREEN_CHECK]: "Green Check",
	[RED_X]: "Red X",
}

const {	CARDS } = require("./cards.js")

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

function opponent_name() {
	if (game.active === SUF) {
		return OPP
	} else {
		return SUF
	}
}

function next_player() {
	if (game.active === SUF)
		game.active = OPP
	else
		game.active = SUF
}

// #region CARD & HAND FUNCTIONS

function is_support_card(c) {
	return c >= first_support_card && c <= last_support_card
}

function is_opposition_card(c) {
	return c >= first_opposition_card && c <= last_opposition_card
}

function is_strategy_card(c) {
	return c >= first_strategy_card && c <= last_strategy_card
}

function is_states_card(c) {
	return c >= first_states_card && c <= last_states_card
}

function find_card(name) {
	return CARDS.findIndex((x) => x && x.name === name)
}

function draw_card(deck) {
	if (deck.length === 0)
		throw Error("can't draw from empty deck")
	return deck.pop()
}

function player_hand() {
	if (game.active === SUF) {
		return game.support_hand
	} else {
		return game.opposition_hand
	}
}

function opponent_hand() {
	if (game.active === SUF) {
		return game.opposition_hand
	} else {
		return game.support_hand
	}
}

function player_buttons() {
	if (game.active === SUF) {
		return game.support_buttons
	} else {
		return game.opposition_buttons
	}
}

function opponent_buttons() {
	if (game.active === SUF) {
		return game.opposition_buttons
	} else {
		return game.support_buttons
	}
}

function player_claimed() {
	if (game.active === SUF) {
		return game.support_claimed
	} else {
		return game.opposition_claimed
	}
}

function player_deck() {
	if (game.active === SUF) {
		return game.support_deck
	} else {
		return game.opposition_deck
	}
}

function opponent_deck() {
	if (game.active === SUF) {
		return game.opposition_deck
	} else {
		return game.support_deck
	}
}

function player_set_aside() {
	if (game.active === SUF) {
		return game.support_set_aside
	} else {
		return game.opposition_set_aside
	}
}

function set_aside_player_hand() {
	let aside = player_set_aside()
	let hand = player_hand()
	set_clear(aside)
	for (let c of hand)
		aside.push(c)
	set_clear(hand)
}

function restore_player_hand() {
	let aside = player_set_aside()
	let hand = player_hand()
	set_clear(hand)
	for (let c of aside)
		hand.push(c)
	set_clear(aside)
}

// #endregion

// #region US_STATES & REGIONS FUNCTIONS

// functions returning immutable arrays marked with Object.freeze are used in events.txt and should be copied before mutation

const ANYWHERE = Object.freeze(Array.from(Array(us_states_count), (e,i)=>i+1))

function find_us_state(name) {
	return US_STATES.findIndex((x) => x && x.name === name)
}

function us_states(...args) {
	return Object.freeze(args.map(find_us_state).sort())
}

function region_us_states(...args) {
	const indexes = []
	US_STATES.forEach((element, index) => {
		if (element && args.includes(element.region)) indexes.push(index)
	})
	return Object.freeze(indexes)
}

function region_us_states_except(region, excluded) {
	const to_remove = new Set(excluded)
	return Object.freeze(region_us_states(region).filter( x => !to_remove.has(x) ))
}

function us_state_region(s) {
	return US_STATES[s].region
}

function us_state_name(s) {
	return US_STATES[s].name
}

function free_campaigner(color) {
	const start = (color === YELLOW) ? 2 : color === RED ? 4 : 0
	const index = game.campaigners.indexOf(0, start)
	return index > (start + 1) ? -1 : index
}

function add_campaigner(color, region) {
	const index = free_campaigner(color)
	if (index !== -1) {
		game.campaigners[index] = region
	} else {
		throw Error("No free campaigners")
	}
	log(`Placed ${COLOR_CODE[color]}R in R${region}.`)
}

function player_campaigners() {
	if (game.active === SUF) {
		return game.campaigners.slice(0, 4)
	} else {
		return game.campaigners.slice(4)
	}
}

function for_each_player_campaigner(fn) {
	let i = (game.active === SUF) ? 1 : 5
	for (let r of player_campaigners()) {
		if (r)
			fn(i)
		i++
	}
}

function campaigner_region(c) {
	return game.campaigners[c - 1]
}

function move_campaigner(c, region) {
	log(`Moved ${COLOR_CODE[campaigner_color(c)]}R to R${region}.`)
	game.campaigners[c - 1] = region
}

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
	return (game.us_states[u] & GREEN_CHECK_MASK) === GREEN_CHECK_MASK
}

function set_green_check(u) {
	game.us_states[u] |= GREEN_CHECK_MASK
}

function clear_green_check(u) {
	game.us_states[u] &= ~GREEN_CHECK_MASK
}

function is_red_x(u) {
	return (game.us_states[u] & RED_X_MASK) === RED_X_MASK
}

function set_red_x(u) {
	game.us_states[u] |= RED_X_MASK
}

function clear_red_x(u) {
	game.us_states[u] &= ~RED_X_MASK
}

function count_green_checks() {
	let result = 0
	for (let s = 1; s <= us_states_count; ++s) {
		if (is_green_check(s))
			result += 1
	}
	return result
}

function count_red_xs() {
	let result = 0
	for (let s = 1; s <= us_states_count; ++s) {
		if (is_red_x(s))
			result += 1
	}
	return result
}

function purple_cubes(u) {
	return (game.us_states[u] & PURPLE_MASK) >> PURPLE_SHIFT
}

function set_purple_cubes(u, x) {
	game.us_states[u] = (game.us_states[u] & ~PURPLE_MASK) | (x << PURPLE_SHIFT)
}

function yellow_cubes(u) {
	return (game.us_states[u] & YELLOW_MASK) >> YELLOW_SHIFT
}

function set_yellow_cubes(u, x) {
	game.us_states[u] = (game.us_states[u] & ~YELLOW_MASK) | (x << YELLOW_SHIFT)
}

function red_cubes(u) {
	return (game.us_states[u] & RED_MASK) >> RED_SHIFT
}

function set_red_cubes(u, x) {
	game.us_states[u] = (game.us_states[u] & ~RED_MASK) | (x << RED_SHIFT)
}

function support_cubes(u) {
	return purple_cubes(u) + yellow_cubes(u)
}

function player_cubes(u) {
	if (game.active === SUF)
		return support_cubes(u)
	else
		return red_cubes(u)
}

function opponent_cubes(u) {
	if (game.active === SUF)
		return red_cubes(u)
	else
		return support_cubes(u)
}

function color_cubes(cube, u) {
	if (cube === PURPLE)
		return purple_cubes(u)
	else if (cube === YELLOW)
		return yellow_cubes(u)
	else if (cube === PURPLE_OR_YELLOW)
		return purple_cubes(u) + yellow_cubes(u)
	else
		return red_cubes(u)
}

function set_color_cubes(cube, u, x) {
	if (cube === PURPLE)
		set_purple_cubes(u, x)
	else if (cube === YELLOW)
		set_yellow_cubes(u, x)
	else
		set_red_cubes(u, x)
}

function us_states_with_color_cubes(us_states, cube) {
	return us_states.filter( x => color_cubes(cube, x) > 0 )
}

function add_cube(cube, us_state) {
	log(`Added ${COLOR_CODE[cube]}C in S${us_state}.`)

	if ((cube === RED && support_cubes(us_state) > 0) || (cube !== RED && red_cubes(us_state) > 0))
		throw new Error("Can't add cube when opponent still has cubes there")

	if (is_green_check(us_state) || is_red_x(us_state))
		throw new Error("Can't add cube with green_check / red_x")

	set_color_cubes(cube, us_state, color_cubes(cube, us_state) + 1)
}

function remove_cube(cube, us_state) {
	log(`Removed ${COLOR_CODE[cube]}C from S${us_state}.`)

	if ((cube === PURPLE && !purple_cubes(us_state)) || (cube === YELLOW && !yellow_cubes(us_state)) || (cube === RED && !red_cubes(us_state)))
		throw new Error("Can't remove cube that aint there")

	if (is_green_check(us_state) || is_red_x(us_state))
		throw new Error("Can't remove cube in us_state with green_check / red_x")

	set_color_cubes(cube, us_state, color_cubes(cube, us_state) - 1)
}

function remove_green_check(us_state) {
	log(`Removed ${COLOR_CODE[GREEN_CHECK]} from S${us_state}.`)

	if (!is_green_check(us_state))
		throw new Error("Can't remove a green check that aint there")

	clear_green_check(us_state)
}

function remove_red_x(us_state) {
	log(`Removed ${COLOR_CODE[RED_X]} from S${us_state}.`)

	if (!is_red_x(us_state))
		throw new Error("Can't remove a red x that aint there")

	clear_red_x(us_state)
}

// #endregion

// #region PUBLIC FUNCTIONS

exports.scenarios = [ "Standard" ]
exports.roles = [ SUF, OPP ]

function gen_action(action, argument) {
	if (argument === undefined) {
		view.actions[action] = 1
	} else {
		if (!(action in view.actions))
			view.actions[action] = []
		view.actions[action].push(argument)
	}
}

function gen_action_card(c) {
	gen_action("card", c)
}

function gen_action_region(r) {
	gen_action("region", r)
}

function gen_action_us_state(s) {
	gen_action("us_state", s)
}

function gen_action_purple_cube(s) {
	gen_action("purple_cube", s)
}

function gen_action_yellow_cube(s) {
	gen_action("yellow_cube", s)
}

function gen_action_red_cube(s) {
	gen_action("red_cube", s)
}

function gen_action_green_check(s) {
	gen_action("green_check", s)
}

function gen_action_red_x(s) {
	gen_action("red_x", s)
}

function gen_action_campaigner(c) {
	gen_action("campaigner", c)
}

exports.action = function (state, player, action, arg) {
	game = state
	if (states[game.state] && action in states[game.state]) {
		states[game.state][action](arg, player)
	} else {
		if (action === "undo" && game.undo && game.undo.length > 0)
			pop_undo()
		else
			throw new Error("Invalid action: " + action)
	}
	return game
}

function goto_game_over(result, victory) {
	game.state = "game_over"
	game.active = "None"
	game.result = result
	game.victory = victory
	log_br()
	log(game.victory)
	return true
}

const pluralize = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;

// #endregion

// #region SETUP

exports.setup = function (seed, _scenario, _options) {
	game = {
		seed: seed,
		log: [],
		undo: [],
		active: null,
		state: null,

		played_card: 0,
		selected_cards: [],

		turn: 0,
		round: 0,
		congress: 0,
		us_states: new Array(us_states_count + 1).fill(0),
		nineteenth_amendment: 0,
		campaigners: [0, 0, 0, 0, 0, 0], // purple, purple, yellow, yellow, red, red

		strategy_deck: [],
		strategy_draw: [],
		states_draw: [],

		persistent_turn: [],
		persistent_game: [],
		persistent_ballot: [],

		support_deck: [],
		support_hand: [],
		support_set_aside: [],
		support_claimed: [],
		support_buttons: 0,

		opposition_deck: [],
		opposition_hand: [],
		opposition_set_aside: [],
		opposition_claimed: [],
		opposition_buttons: 0,
	}

	log_h1("Votes for Women")
	setup_game()
	game.active = SUF
	start_turn()
	return game
}

function setup_game() {
	// init card decks & shuffle
	game.support_deck = init_player_cards(first_support_card)
	game.support_hand.push(first_support_card)
	game.opposition_deck = init_player_cards(first_opposition_card)
	game.opposition_hand.push(first_opposition_card)

	for (let c = first_strategy_card; c <= last_strategy_card; ++c) {
		game.strategy_deck.push(c)
	}
	for (let c = first_states_card; c <= last_states_card; ++c)
		game.states_draw.push(c)

	shuffle(game.states_draw)
	shuffle(game.strategy_deck)

	game.states_draw.splice(-3) // 3 states card aren't used
	game.states_draw.sort()
	log_h2("State Cards")
	for (let c of game.states_draw)
		log(`C${c}`)

	game.strategy_draw = game.strategy_deck.splice(-3) // draw 3 strategy cards
	log_h2("Strategy Cards")
	for (let c of game.strategy_draw)
		log(`C${c}`)
}

function init_player_cards(first_card) {
	let c = first_card
	let early = []
	let middle = []
	let late = []
	for (let n = 0; n < era_cards_count; ++n)
		early.push(++c)
	for (let n = 0; n < era_cards_count; ++n)
		middle.push(++c)
	for (let n = 0; n < era_cards_count; ++n)
		late.push(++c)
	shuffle(early)
	shuffle(middle)
	shuffle(late)
	return [].concat(late, middle, early)
}

// #endregion

// #region VIEW

// JSON Schema for view data
exports.VIEW_SCHEMA = {
	type: "object",
    properties: {
		log: {type: "array", items: {type: "string"}},
		active: {type: "string"},
		prompt: {type: "string"},
		actions: {type: "object", nullable: true},

		played_card: {type: "integer", minimum: 0},
		selected_campaigner: {type: "integer", minimum: 1},
		selected_us_state: {type: "integer", minimum: 1},

		turn: {type: "integer", minimum: 1, maximum: 6},
		round: {type: "integer", minimum: 0, maximum: 6},
		congress: {type: "integer", minimum: 0, maximum: 6},
		us_states: {type: "array", minItems: us_states_count + 1, maxItems: us_states_count + 1, items: {type: "integer", minimum: 0}},
		nineteenth_amendment: {type: "integer", minimum: 0, maximum: 1},
		campaigners: {type: "array", minItems: 6, maxItems: 6, items: {type: "integer", minimum: 0, maximum: region_count}},
		green_checks: {type: "integer", minimum: 0, maximum: GREEN_CHECK_VICTORY},
		red_xs: {type: "integer", minimum: 0, maximum: RED_X_VICTORY},

		strategy_deck: {type: "integer", minimum: 0, maximum: 12},
		strategy_draw: {type: "array", maxItems: 3, items: {type: "integer", minimum: 1, maximum: 128}},
		states_draw: {type: "array", maxItems: 9, items: {type: "integer", minimum: 1, maximum: 128}},

		persistent_turn: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		persistent_game: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		persistent_ballot: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},

		support_deck: {type: "integer", minimum: 0, maximum: 52},
		support_hand: {type: "integer", minimum: 1},
		support_claimed: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		support_buttons: {type: "integer", minimum: 0, maximum: MAX_SUPPORT_BUTTONS},

		opposition_deck: {type: "integer", minimum: 0, maximum: 52},
		opposition_hand: {type: "integer", minimum: 1},
		opposition_claimed: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		opposition_buttons: {type: "integer", minimum: 0, maximum: MAX_OPPOSITION_BUTTONS},

		hand: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		set_aside: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		selected_cards: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		drawn: {type: "array", items: {type: "integer", minimum: 1, maximum: 128}},
		deck: {type: "array", items: {type: "integer", minimum: 1, maximum: 128 + 4}},

    },
    required: [
		"log", "active", "prompt", "turn", "congress", "us_states", "campaigners",
		"strategy_deck", "strategy_draw", "states_draw",
		"support_deck", "support_hand", "support_claimed", "support_buttons",
		"opposition_deck", "opposition_hand", "opposition_claimed", "opposition_buttons",

	],
    additionalProperties: false
}

exports.view = function(state, player) {
	game = state

	view = {
		log: game.log,
		active: game.active,
		prompt: null,
		actions: null,

		played_card: game.played_card,
		selected_campaigner: game.selected_campaigner,
		selected_us_state: game.selected_us_state,

		turn: game.turn,
		round: game.round,
		congress: game.congress,
		us_states: game.us_states,
		nineteenth_amendment: game.nineteenth_amendment,
		campaigners: game.campaigners,
		green_checks: 0,
		red_xs: 0,

		strategy_deck: game.strategy_deck.length,
		strategy_draw: game.strategy_draw,
		states_draw: game.states_draw,

		persistent_turn: game.persistent_turn,
		persistent_game: game.persistent_game,
		persistent_ballot: game.persistent_ballot,

		support_deck: game.support_deck.length,
		support_hand: game.support_hand.length,
		support_claimed: game.support_claimed,
		support_buttons: game.support_buttons,

		opposition_deck: game.opposition_deck.length,
		opposition_hand: game.opposition_hand.length,
		opposition_claimed: game.opposition_claimed,
		opposition_buttons: game.opposition_buttons,

		hand: [],
		set_aside: [],
		selected_cards: [],
	}

	if (game.nineteenth_amendment) {
		view.green_checks = count_green_checks()
		view.red_xs = count_red_xs()
	}

	if (player === game.active && game.vm && game.vm.draw)
		view.drawn = game.vm.draw

	if (player === SUF) {
		view.hand = game.support_hand
		view.set_aside = game.support_set_aside
		view.selected_cards = game.selected_cards
	} else if (player === OPP) {
		view.hand = game.opposition_hand
		view.set_aside = game.opposition_set_aside
		view.selected_cards = game.selected_cards
	}

	if (game.state === "game_over") {
		view.prompt = game.victory
	} else if (player === "Observer" || (game.active !== player && game.active !== "Both")) {
		if (states[game.state]) {
			let inactive = states[game.state].inactive
			if (typeof inactive === "function")
				view.prompt = `Waiting for ${game.active} ${inactive()}`
			else
				view.prompt = `Waiting for ${game.active} to ${inactive}`
		} else {
			view.prompt = "Unknown state: " + game.state
		}
	} else {
		view.actions = {}
		if (states[game.state])
			states[game.state].prompt(player)
		else
			view.prompt = "Unknown state: " + game.state
		if (view.actions.undo === undefined) {
			if (game.undo && game.undo.length > 0)
				view.actions.undo = 1
			else
				view.actions.undo = 0
		}
	}

	return view
}

// #endregion

// #region FLOW OF PLAY

function start_turn() {
	game.turn += 1
	log_h1("Turn " + game.turn)

	log_h2("Planning")
	end_planning_phase()
}

// XXX Deprecated on 2023-12-09, keep `states.planning_phase` for current games.
states.planning_phase = {
	inactive: "do Planning.",
	prompt() {
		view.prompt = "Planning: Draw cards."
		gen_action("draw")
	},
	draw() {
		end_planning_phase()
	}
}

function end_planning_phase() {
	for (let n = 0; n < 6; ++n) {
		game.support_hand.push(draw_card(game.support_deck))
		game.opposition_hand.push(draw_card(game.opposition_deck))
	}

	log("Suffragist drew 6 cards.")
	log("Opposition drew 6 cards.")

	if (game.support_hand.length !== 7)
		throw Error("ASSERT game.support_hand.length === 7")
	if (game.opposition_hand.length !== 7)
		throw Error("ASSERT game.opposition_hand.length === 7")

	if (game.turn === 1) {
		goto_operations_phase()
	} else {
		goto_strategy_phase()
	}
}

function goto_strategy_phase() {
	log_h2("Strategy")
	game.state = "strategy_phase"
	game.active = SUF
	game.support_committed = 0
}

states.strategy_phase = {
	inactive: "do Strategy.",
	prompt() {
		if (game.active ===  SUF) {
			view.prompt = `Strategy: ${pluralize(game.support_committed, 'button')} committed.`
			if (game.support_buttons > 0 && game.support_committed < game.opposition_buttons + 1) {
				gen_action("commit_1_button")
			}
			gen_action("commit")
		} else {
			view.prompt = `Strategy: Suffragist committed ${pluralize(game.support_committed, 'button')}.`
			view.actions.defer = 0
			view.actions.match = 0
			view.actions.supersede = 0
			if (game.support_committed > 0) {
				view.actions.defer = 1
				view.prompt += " Spend 0 to defer"
			}
			if (game.opposition_buttons >= game.support_committed) {
				view.actions.match = 1
				if (view.actions.defer) {
					view.prompt += ","
				} else {
					view.prompt += " Spend"
				}
				view.prompt += ` ${game.support_committed} to match`
			}
			if (game.opposition_buttons > game.support_committed) {
				view.actions.supersede = 1
				view.prompt += `, ${game.support_committed + 1} to supersede`
			}
			view.prompt += '.'
		}
	},
	commit_1_button() {
		push_undo()
		game.support_buttons -= 1
		game.support_committed += 1

	},
	commit() {
		clear_undo()
		log(`Suffragist committed ${game.support_committed} BM`)
		game.active = OPP
		if (!game.support_committed && !game.opposition_buttons) {
			this.match()
		} else if (game.support_committed > game.opposition_buttons) {
			this.defer()
		}
	},
	defer() {
		log(`Opposition deferred.`)
		game.active = SUF
		game.state = 'select_strategy_card'
	},
	match () {
		log(`Opposition matched.`)
		game.opposition_buttons -= game.support_committed
		end_strategy_phase()
	},
	supersede() {
		const amount = game.support_committed + 1
		log(`Opposition superseded with ${amount} BM`)
		game.opposition_buttons -= amount
		game.state = 'select_strategy_card'
	}
}

function claim_strategy_card(c) {
	log(`${game.active} selected C${c}.`)

	clear_undo()
	array_remove_item(game.strategy_draw, c)
	set_add(player_claimed(), c)
	if (game.strategy_deck.length)
		game.strategy_draw.push(draw_card(game.strategy_deck))
}

states.select_strategy_card = {
	inactive: "select Strategy card.",
	prompt() {
		view.prompt = "Select Strategy card."
		for (let c of game.strategy_draw)
			gen_action("card_select", c)
	},
	card_select(c) {
		claim_strategy_card(c)
		if (game.vm) {
			vm_next()
		} else {
			end_strategy_phase()
		}
	}
}

function end_strategy_phase() {
	delete game.support_committed
	goto_operations_phase()
}

function goto_operations_phase() {
	log_h2("Operations")
	game.state = "operations_phase"
	game.active = SUF
	game.round = 1
}

const THE_CIVIL_WAR = find_card("The Civil War")
const WAR_IN_EUROPE = find_card("War in Europe")
const FIFTEENTH_AMENDMENT = find_card("Fifteenth Amendment")
const EIGHTEENTH_AMENDMENT = find_card("Eighteenth Amendment")
const SOUTHERN_STRATEGY = find_card("Southern Strategy")
const _1918_PANDEMIC = find_card("1918 Pandemic")
const A_THREAT_TO_THE_IDEAL_OF_WOMANHOOD = find_card("A Threat to the Ideal of Womanhood")

function has_extra_event_cost() {
	return game.active === SUF && (game.persistent_turn.includes(_1918_PANDEMIC) || game.persistent_turn.includes(A_THREAT_TO_THE_IDEAL_OF_WOMANHOOD))
}

function has_extra_campaigning_cost() {
	return game.active === SUF && (game.persistent_turn.includes(WAR_IN_EUROPE))
}

function can_play_event(c) {
	if (game.active === SUF && is_opposition_card(c))
		return false
	if (game.active === OPP && is_support_card(c))
		return false

	// Playable if *The Civil War* is in effect
	if (c === 5 && !game.persistent_turn.includes(THE_CIVIL_WAR))
		return false

	// Playable if *The Civil War* is not in effect
	if ([6, 7, 18].includes(c) && game.persistent_turn.includes(THE_CIVIL_WAR))
		return false

	// Playable if *War in Europe* is in effect.
	if (c === 45 && !game.persistent_turn.includes(WAR_IN_EUROPE))
		return false

	// Playable if *Fifteenth Amendment* is in effect
	if ([7, 55, 69].includes(c) && !game.persistent_game.includes(FIFTEENTH_AMENDMENT))
		return false

	// Playable if *Eighteenth Amendment* is not in effect
	if ([68, 83, 92, 96].includes(c) && game.persistent_game.includes(EIGHTEENTH_AMENDMENT))
		return false

	// Playable if *Southern Strategy* is in effect
	if ([82, 85, 94, 95].includes(c) && !game.persistent_game.includes(SOUTHERN_STRATEGY))
		return false

	// Needs 19th amendment to have passed
	if ([102, 106].includes(c) && !game.nineteenth_amendment)
		return false

	let cost = 0
	// Spend 4 buttons to select
	if ([39, 100].includes(c))
		cost += 4

	// Suffragist must pay 1 button to play event card during 1918 Pandemic or A Threat to the Ideal of Womanhood
	// Only for Event cards, not for Strategy / State cards
	if ((is_support_card(c) || is_opposition_card(c)) && has_extra_event_cost())
		cost += 1

	if (player_buttons() < cost)
		return false

	// Playable if it is Turn 5 or Turn 6
	if (c === 113 && game.turn < 5)
		return false

	return true
}

function count_player_active_campaigners() {
	return player_campaigners().filter(value => value !== 0).length
}

function has_player_active_campaigners() {
	return player_campaigners().some(value => value !== 0)
}

function discard_card_from_hand(c) {
	array_remove_item(player_hand(), c)
}

function end_play_card(c) {
	if (set_has(player_claimed(), c)) {
		set_delete(player_claimed(), c)
	} else {
		discard_card_from_hand(c)
	}
	delete game.count
	delete game.dice
	delete game.roll
	game.played_card = 0
	game.state = "operations_phase"
}

function can_campaign() {
	return (game.active !== SUF || !game.persistent_turn.includes(WAR_IN_EUROPE) || player_buttons())
}

function can_organize() {
	return (game.active === SUF && game.support_buttons < MAX_SUPPORT_BUTTONS) || (game.active === OPP && game.opposition_buttons < MAX_OPPOSITION_BUTTONS)
}

function can_lobby() {
	return !game.nineteenth_amendment && (
		(game.active === SUF && game.congress < 6) || (game.active === OPP && game.congress > 0))
}

function update_card_played(c) {
	if (set_has(player_claimed(), c)) {
		game.has_played_claimed = 1
	} else {
		game.has_played_hand = 1
	}
}

states.operations_phase = {
	inactive: "Play a Card.",
	prompt() {
		let can_play_hand = false
		let can_play_claimed = false

		if (!game.has_played_hand) {
			for (let c of player_hand()) {
				if (can_play_event(c)) {
					gen_action("card_event", c)
					can_play_hand = true
				}
				if (has_player_active_campaigners()) {
					if (can_campaign()) {
						gen_action("card_campaigning", c)
						can_play_hand = true
					}
					if (can_organize()) {
						gen_action("card_organizing", c)
						can_play_hand = true
					}
					if (can_lobby()) {
						gen_action("card_lobbying", c)
						can_play_hand = true
					}
				}
			}
		}

		if (!game.has_played_claimed) {
			// only one claimed card can be played per turn
			for (let c of player_claimed()) {
				if (can_play_event(c)) {
					gen_action("card_event", c)
					can_play_claimed = true
				}
			}
		}

		if (can_play_hand && can_play_claimed) {
			view.prompt = "Operations: Play a card from Hand or Claimed card (optional)."
		} else if (can_play_hand) {
			view.prompt = "Operations: Play a card from Hand."
		} else if (can_play_claimed) {
			view.prompt = "Operations: Play a Claimed card (optional)."
		} else {
			view.prompt = "Operations: Done."
		}

		if (game.has_played_hand)
			gen_action("done")
	},
	card_event(c) {
		push_undo()
		update_card_played(c)
		play_card_event(c)
	},
	card_campaigning(c) {
		push_undo()
		log_round("Campaigning")
		log("C" + c)
		if (has_extra_campaigning_cost())
			decrease_player_buttons(1)
		log_br()
		update_card_played(c)
		goto_campaigning(c)
	},
	card_organizing(c) {
		push_undo()
		log_round("Organizing")
		log("C" + c)
		log_br()
		update_card_played(c)
		goto_organizing(c)
	},
	card_lobbying(c) {
		push_undo()
		log_round("Lobbying")
		log("C" + c)
		log_br()
		update_card_played(c)
		goto_lobbying(c)
	},
	done() {
		end_player_round()
	}
}

function play_card_event(c) {
	if (is_strategy_card(c))
		log_round("Strategy")
	else if (is_states_card(c))
		log_round("State")
	else
		log_round("Event")
	log("C" + c)
	if ((is_support_card(c) || is_opposition_card(c)) && has_extra_event_cost())
		decrease_player_buttons(1)
	log_br()
	goto_event(c)
}

function end_player_round() {
	clear_undo()
	delete game.has_played_claimed
	delete game.has_played_hand

	if (game.active === SUF) {
		game.active = OPP
	} else {
		if (game.round < 6) {
			game.active = SUF
			game.round += 1
		} else {
			goto_cleanup_phase()
		}
	}
}

function discard_persistent_card(cards, c) {
	log(`C${c} discarded.`)
	array_remove_item(cards, c)
}

function goto_cleanup_phase() {
	log_h2("Cleanup")

	if (game.turn < 6) {
		// any cards in the “Cards in Effect for the Rest of the Turn box”
		// are placed in the appropriate discard pile.
		for (let c of game.persistent_turn)
			log(`C${c} discarded.`)
		game.persistent_turn = []

		if (game.support_hand.length !== 1)
			throw Error("ASSERT game.support_hand.length === 1")
		if (game.opposition_hand.length !== 1)
			throw Error("ASSERT game.opposition_hand.length === 1")
	} else {
		// At the end of Turn 6, if the Nineteenth
		// Amendment has not been sent to the states for
		// ratification, the game ends in an Opposition victory.
		if (!game.nineteenth_amendment) {
			goto_game_over(OPP, "Opposition wins the game.")
			return
		}

		// If the Nineteenth Amendment has been sent to the
		// states for ratification but neither player has won
		// the necessary number of states for victory, the game
		// advances to Final Voting.

		// Any cards in the “Cards in Effect for the Rest of the Turn box”
		// and “Cards in Effect for the Rest of the Game box” are placed in
		// the appropriate discard pile.
		for (let c of game.persistent_turn)
			log(`C${c} discarded.`)
		game.persistent_turn = []
		for (let c of game.persistent_game)
			log(`C${c} discarded.`)
		game.persistent_game = []
	}

	game.state = "cleanup_phase"
}

states.cleanup_phase = {
	inactive: "do Cleanup.",
	prompt() {
		view.prompt = "Cleanup."
		if (game.turn < 6)
			gen_action("next_turn")
		else
			gen_action("final_voting")
	},
	next_turn() {
		start_turn()
	},
	final_voting() {
		goto_final_voting()
	}
}

const MISS_FEBB_WINS_THE_LAST_VOTE = find_card("Miss Febb Wins the Last Vote")
const VOTER_REGISTRATION = find_card("Voter Registration")
const VOTER_SUPPRESSION = find_card("Voter Suppression")

function final_voting_dice(player) {
	if (player === SUF && game.persistent_ballot.includes(VOTER_REGISTRATION))
		return D8
	if (player === OPP && game.persistent_ballot.includes(VOTER_SUPPRESSION))
		return D8
	else
		return D6
}

function goto_final_voting() {
	log_h1("Final Voting")
	log(`Suffragist has ${count_green_checks()} of ${GREEN_CHECK_VICTORY} States.`)
	log(`Opposition has ${count_red_xs()} of ${RED_X_VICTORY} States.`)

	if (game.persistent_ballot.includes(MISS_FEBB_WINS_THE_LAST_VOTE))
		game.tie_winner = SUF
	else
		game.tie_winner = OPP
	log(`${game.tie_winner} wins all ties.`)

	game.support_dice = final_voting_dice(SUF)
	game.opposition_dice = final_voting_dice(OPP)

	game.active = SUF
	game.state_selector = SUF
	game.state = "final_voting_select_state"
}

function us_states_to_win() {
	return (game.active === SUF) ? GREEN_CHECK_VICTORY - count_green_checks() : RED_X_VICTORY - count_red_xs()
}

function us_states_to_lose() {
	return (game.active === OPP) ? GREEN_CHECK_VICTORY - count_green_checks() : RED_X_VICTORY - count_red_xs()
}

function goto_final_voting_select_state() {
	game.state = "final_voting_select_state"
	if (game.auto_resolve === game.active)
		auto_select_state()
}

function auto_select_state() {
	let most = -1, where = -1
	for (let s of ANYWHERE) {
		if (!(is_green_check(s) || is_red_x(s))) {
			let n = player_cubes(s) - opponent_cubes(s)
			if (n > most) {
				most = n
				where = s
			}
		}
	}
	if (where >= 0)
		final_voting_do_us_state(where)
}

states.final_voting_select_state = {
	inactive: "select a state for Final Voting.",
	prompt() {
		view.prompt = `Final Voting: Select a State. ${pluralize(us_states_to_win(), 'more State')} to win, ${us_states_to_lose()} to lose.`

		for (let s of ANYWHERE)
			if (!(is_green_check(s) || is_red_x(s)))
				gen_action_us_state(s)

		if (!player_buttons() && !game.auto_resolve)
			gen_action("auto_resolve")
	},
	auto_resolve() {
		game.auto_resolve = game.active
		goto_final_voting_select_state()
	},
	us_state(s) {
		push_undo()
		final_voting_do_us_state(s)
	}
}

function final_voting_do_us_state(s) {
	game.selected_us_state = s
	game.state_selector = game.active
	log_h2(`Final Voting for S${game.selected_us_state}`)
	goto_final_voting_roll()
}

function goto_final_voting_roll() {
	game.support_roll = 0
	game.opposition_roll = 0
	game.voting_winner = null

	game.support_drm = support_cubes(game.selected_us_state)
	game.opposition_drm = red_cubes(game.selected_us_state)
	if (game.support_drm)
		log(`Suffragist gets +${game.support_drm}.`)
	if (game.opposition_drm)
		log(`Opposition gets +${game.opposition_drm}.`)

	game.state = "final_voting_roll"
	final_voting_do_roll()
}

function can_reroll() {
	// only loser can reroll
	if (game.active === game.voting_winner)
		return false

	// not if you are broke
	if (!player_buttons())
		return false

	// not if you have already rolled your max
	if (game.active === SUF && game.support_roll === game.support_dice)
		return false
	if (game.active === OPP && game.opposition_roll === game.opposition_dice)
		return false

	let support_potential = game.support_dice + game.support_drm
	let opposition_potential = game.opposition_dice + game.opposition_drm

	let support_total = game.support_roll + game.support_drm
	let opposition_total = game.opposition_roll + game.opposition_drm

	// not if you cant roll a win
	if (game.active === SUF && support_potential < opposition_total)
		return false

	if (game.active === OPP && opposition_potential < support_total)
		return false

	// not if you cant roll a win on tie
	if (game.active === SUF && game.tie_winner !== SUF && support_potential === opposition_total)
		return false

	if (game.active === OPP && game.tie_winner !== OPP && opposition_potential === support_total)
		return false

	// you could give it a shot
	return true
}

function update_final_voting_result() {
	clear_undo()

	let support_total = game.support_roll + game.support_drm
	let opposition_total = game.opposition_roll + game.opposition_drm

	if (support_total > opposition_total)
		game.voting_winner = SUF
	else if (opposition_total > support_total)
		game.voting_winner = OPP
	else
		game.voting_winner = game.tie_winner

	if (game.voting_winner === game.active || !can_reroll())
		final_voting_do_next()
}

function format_final_voting_prompt() {
	let support_total = game.support_roll + game.support_drm
	let opposition_total = game.opposition_roll + game.opposition_drm

	let suf_txt, opp_txt
	if (game.support_drm)
		suf_txt = `${game.support_roll} (+${game.support_drm}) = ${support_total}`
	else
		suf_txt = `${game.support_roll}`
	if (game.opposition_drm)
		opp_txt = `${game.opposition_roll} (+${game.opposition_drm}) = ${opposition_total}`
	else
		opp_txt = `${game.opposition_roll}`

	if (support_total === opposition_total) {
		if (game.tie_winner === SUF)
			return `${game.tie_winner} leads on tie ${suf_txt} vs ${opp_txt}.`
		else
			return `${game.tie_winner} leads on tie ${opp_txt} vs ${suf_txt}.`
	}
	if (game.voting_winner === SUF)
		return `${game.voting_winner} leads ${suf_txt} vs ${opp_txt}.`
	else
		return `${game.voting_winner} leads ${opp_txt} vs ${suf_txt}.`
}

states.final_voting_roll = {
	inactive() {
		if (!game.voting_winner)
			return "to select a state for Final Voting."
		return `\u2014 ${us_state_name(game.selected_us_state)}: ${format_final_voting_prompt()}`
	},
	prompt() {
		view.prompt = `${us_state_name(game.selected_us_state)}: `

		if (!game.voting_winner) {
			if (game.support_drm)
				view.prompt += `Suffragist gets +${game.support_drm}. `
			else if (game.opposition_drm)
				view.prompt += `Opposition gets +${game.opposition_drm}. `
			view.prompt += `${game.tie_winner} wins on ties. `
			view.prompt += "Roll dice."

			view.actions.roll = 1
			view.actions.pass = 0
		} else {
			view.prompt += format_final_voting_prompt()

			// only reroll when you can and when you are on the losing side
			if (game.active !== game.voting_winner && can_reroll())
				view.actions.reroll = 1
			else
				view.actions.reroll = 0

			view.actions.pass = 1
		}
	},
	roll() {
		final_voting_do_roll()
	},
	reroll() {
		decrease_player_buttons(1)
		if (game.active === SUF)
			game.support_roll = roll_ndx(1, game.support_dice, `Suffragist re-rolled`)
		else
			game.opposition_roll = roll_ndx(1, game.opposition_dice, `Opposition re-rolled`)
		update_final_voting_result()
	},
	pass() {
		final_voting_do_next()
	}
}

function final_voting_do_roll() {
	// roll based on order
	if (game.active === SUF) {
		game.support_roll = roll_ndx(1, game.support_dice, `Suffragist rolled`)
		game.opposition_roll = roll_ndx(1, game.opposition_dice, `Opposition rolled`)
	} else {
		game.opposition_roll = roll_ndx(1, game.opposition_dice, `Opposition rolled`)
		game.support_roll = roll_ndx(1, game.support_dice, `Suffragist rolled`)
	}
	update_final_voting_result()
}

function final_voting_do_next() {
	// allow opponent to re-roll if they can
	if (game.active === game.voting_winner) {
		next_player()
		if (!can_reroll())
			finalize_vote()
	} else {
		finalize_vote()
	}
}

function finalize_vote() {
	let support_total = game.support_roll + game.support_drm
	let opposition_total = game.opposition_roll + game.opposition_drm

	log_br()
	let result = `${game.support_roll}`
	if (game.support_drm)
		result += ` (+${game.support_drm}) = ${support_total}`
	result += ` Yea vs. ${game.opposition_roll}`
	if (game.opposition_drm)
		result += ` (+${game.opposition_drm}) = ${opposition_total}`
	result += " Nay."
	log(result)
	// log(`${game.support_roll} (+${game.support_drm}) = ${support_total} Yea vs. ${game.opposition_roll} (+${game.opposition_drm}) = ${opposition_total} Nay`)

	if (support_total === opposition_total)
		log(`${game.tie_winner} won on tie.`)
	else
		log(`${game.voting_winner} won.`)

	if (game.voting_winner === SUF)
		ratify_nineteenth_amendment(game.selected_us_state)
	else
		reject_nineteenth_amendment(game.selected_us_state)

	if (check_victory())
		return

	game.active = game.state_selector
	next_player()

	delete game.selected_us_state
	game.voting_winner = null
	goto_final_voting_select_state()
}

// #endregion

// #region NON-EVENT CARD ACTIONS

const SUPPORT_CAMPAIGNING_BOOST = [
	find_card("Property Rights for Women"),
	find_card("Marie Louise Bottineau Baldwin"),
	find_card("Prison Tour Special")
]
const OPPOSITION_CAMPAIGNING_BOOST = [
	find_card("Beer Brewers"),
	find_card("Conservative Opposition"),
	find_card("Big Liquor’s Big Money")
]

function has_campaigning_boost() {
	for (let c of game.persistent_turn) {
		if (game.active === SUF && SUPPORT_CAMPAIGNING_BOOST.includes(c))
			return true
		if (game.active === OPP && OPPOSITION_CAMPAIGNING_BOOST.includes(c))
			return true
	}
	return false
}

function goto_campaigning(c) {
	game.played_card = c
	game.state = 'campaigning'
	game.count = count_player_active_campaigners()
	if (has_campaigning_boost())
		game.dice = D6
	else
		game.dice = D4
	game.roll = []
}

states.campaigning = {
	inactive: "do Campaigning.",
	prompt() {
		if (!game.roll.length) {
			view.prompt = `Campaigning: Roll ${game.count} d${game.dice}.`
			gen_action("roll")
		} else {
			view.prompt = `Campaigning: You rolled ${game.roll.join(", ")}.`
			if (player_buttons() > 0)
				gen_action("reroll")
			gen_action("accept")
		}
	},
	roll() {
		game.roll = roll_ndx_list(game.count, game.dice)
	},
	reroll() {
		decrease_player_buttons(1)
		game.roll = roll_ndx_list(game.count, game.dice, "Re-rolled")
	},
	accept() {
		push_undo()
		goto_campaigning_assign()
	}
}

function goto_campaigning_assign() {
	if (!game.campaigning) {
		game.campaigning = {
			dice_idx: 0,
			assigned: [],
			count: 0,
			region: 0,
			moved: false
		}
	}

	if (game.campaigning.assigned.length !== game.count) {
		game.state = "campaigning_assign"
	} else {
		delete game.selected_campaigner
		delete game.campaigning
		if (game.vm)
			vm_next()
		else
			end_play_card(game.played_card)
	}
}

states.campaigning_assign = {
	inactive: "do Campaigning.",
	prompt() {
		let die = game.roll[game.campaigning.dice_idx]
		view.prompt = `Campaigning: Assign ${pluralize(die, 'cube')} to a Campaigner.`

		for_each_player_campaigner(c => {
			if (!set_has(game.campaigning.assigned, c))
				gen_action_campaigner(c)
		})
	},
	campaigner(c) {
		push_undo()
		let die = game.roll[game.campaigning.dice_idx]
		goto_campaigning_add_cubes(c, die)
	}
}

function campaigner_color(c) {
	if (c <= 2) {
		return PURPLE
	} else if (c <= 4) {
		return YELLOW
	} else {
		return RED
	}
}

function goto_campaigning_add_cubes(campaigner, die) {
	game.selected_campaigner = campaigner
	set_add(game.campaigning.assigned, campaigner)
	log_br()
	log(`Assigned ${DICE_COLOR[game.dice]}${die} to ${COLOR_CODE[campaigner_color(campaigner)]}R in R${campaigner_region(campaigner)}.`)
	game.campaigning.count = die
	game.campaigning.added = 0
	game.campaigning.moved = false
	game.state = "campaigning_add_cubes"
}

function filter_us_states(us_states) {
	// If a state has already ratified or rejected the Nineteenth Amendment –
	// and therefore has a V or X in the state – cubes may not be added to that state.
	if (game.nineteenth_amendment) {
		set_filter(us_states, s => !(is_green_check(s) || is_red_x(s)))
	}

	// When The Civil War is in effect, for the remainder of the turn, the Suffragist player
	// may not add :purple_or_yellow_cube to any state in the Atlantic & Appalachia and South regions.
	if (game.active === SUF && game.persistent_turn.includes(THE_CIVIL_WAR)) {
		let excluded = region_us_states(ATLANTIC_APPALACHIA, SOUTH)
		set_filter(us_states, s => !set_has(excluded, s))
	}
}

states.campaigning_add_cubes = {
	inactive: "do Campaigning.",
	prompt() {
		let can_move = false
		if (!game.campaigning.added && player_buttons() > 0 && !game.campaigning.moved) {
			gen_action("move")
			can_move = true
		}

		let us_states = region_us_states(campaigner_region(game.selected_campaigner)).slice()
		filter_us_states(us_states)

		for (let s of us_states) {
			if (opponent_cubes(s)) {
				if (game.active === SUF) {
					gen_action_red_cube(s)
				} else {
					if (purple_cubes(s))
						gen_action_purple_cube(s)
					if (yellow_cubes(s))
						gen_action_yellow_cube(s)
				}
			} else {
				gen_action_us_state(s)
			}
		}


		if (us_states.length) {
			let remaining = game.campaigning.count - game.campaigning.added
			view.prompt = `Campaigning: Add ${pluralize(remaining, COLOR_NAMES[campaigner_color(game.selected_campaigner)] + ' cube')}, remove opponent's cubes`
			if (can_move) {
				view.prompt += ", and optionally Move Campaigner"
			}
			view.prompt += '.'
		} else {
			view.prompt = `Campaigning: No available States to Add or Remove cubes.`
			gen_action("done")
		}
	},
	done() {
		end_campaigning_add_cube()
	},
	move() {
		push_undo()
		game.state = "campaigning_move"
	},
	purple_cube(s) {
		push_undo()
		remove_cube(PURPLE, s)
		after_campaigning_add_cube(s)
	},
	yellow_cube(s) {
		push_undo()
		remove_cube(YELLOW, s)
		after_campaigning_add_cube(s)
	},
	red_cube(s) {
		push_undo()
		remove_cube(RED, s)
		after_campaigning_add_cube(s)
	},
	us_state(s) {
		push_undo()
		add_cube(campaigner_color(game.selected_campaigner), s)
		after_campaigning_add_cube(s)
	}
}

function after_campaigning_add_cube(us_state) {
	if (player_cubes(us_state) === 4) {
		if (can_claim_states_card(us_state)) {
			goto_claim_states_card(us_state)
			return
		}
		on_4th_cube(us_state)
		if (check_victory())
			return true
	}

	game.campaigning.added += 1

	if (game.campaigning.added === game.campaigning.count) {
		end_campaigning_add_cube()
	}
}

function end_campaigning_add_cube() {
	delete game.selected_campaigner
	if (game.campaigning.dice_idx < game.roll.length)
		game.campaigning.dice_idx += 1
	goto_campaigning_assign()
}

function goto_claim_states_card(us_state) {
	game.selected_us_state = us_state
	game.continue_state = game.state
	game.state = 'claim_state_card'
}

states.claim_state_card = {
	inactive: "claim State Card.",
	prompt() {
		view.prompt = `Claim the "${us_state_name(game.selected_us_state)}" State Card.`

		for (let c of game.states_draw) {
			if (US_STATES[game.selected_us_state].name === CARDS[c].name) {
				gen_action_card(c)
			}
		}
	},
	card(c) {
		array_remove_item(game.states_draw, c)
		set_add(player_claimed(), c)
		log(`Claimed C${c}.`)

		// continue
		let s = game.selected_us_state
		game.state = game.continue_state
		delete game.selected_us_state
		delete game.continue_state
		if (game.state === "vm_add_cubes") {
			after_vm_add_cube(s)
		} else {
			after_campaigning_add_cube(s)
		}
	}
}

states.campaigning_move = {
	inactive: "do Campaigning.",
	prompt() {
		view.prompt = "Campaigning: Select region to move the Campaigner to."

		let current_region = campaigner_region(game.selected_campaigner)
		for (let r = 1; r <= region_count; r++) {
			if (r !== current_region)
				gen_action_region(r)
		}
	},
	region(r) {
		push_undo()
		decrease_player_buttons(1)
		move_campaigner(game.selected_campaigner, r)
		game.campaigning.moved = true
		game.state = "campaigning_add_cubes"
	}
}

function goto_organizing(c) {
	game.played_card = c
	game.state = 'organizing'
	game.count = count_player_active_campaigners()

}

states.organizing = {
	inactive: "receive buttons.",
	prompt() {
		view.prompt = `Organizing: Receive ${pluralize(game.count, 'button')}`
		gen_action("buttons")
	},
	buttons() {
		push_undo()
		if (game.count)
			increase_player_buttons(game.count)
		end_play_card(game.played_card)
	}
}

const PROCESSIONS_FOR_SUFFRAGE = find_card("Processions for Suffrage")

function has_lobbying_boost() {
	return game.active === SUF && game.persistent_turn.includes(PROCESSIONS_FOR_SUFFRAGE)
}

function goto_lobbying(c) {
	game.played_card = c
	game.state = 'lobbying'
	game.count = count_player_active_campaigners()
	game.roll = -1
	if (has_lobbying_boost())
		game.dice = D8
	else
		game.dice = D6
}

states.lobbying = {
	inactive: "do Lobbying.",
	prompt() {
		if (game.roll === -1) {
			view.prompt = `Lobbying: Roll ${game.count} d${game.dice}.`
			gen_action("roll")
		} else {
			view.prompt = `Lobbying: You rolled ${game.roll} six${game.roll!==1?'es':''} (or higher).`

			if (player_buttons() > 0 && game.roll < game.count)
				gen_action("reroll")
			gen_action("accept")
		}
	},
	roll() {
		game.roll = roll_ndx_count_success(game.count, game.dice)
	},
	reroll() {
		decrease_player_buttons(1)
		game.roll = roll_ndx_count_success(game.count, game.dice, "Re-rolled")
	},
	accept() {
		push_undo()
		if (game.roll > 0) {
			game.count = game.roll
			if (game.active === SUF) {
				game.state = "lobbying_add_congress"
			} else {
				game.state = "lobbying_remove_congress"
			}
		} else {
			end_play_card(game.played_card)
		}
	}
}

function ratify_nineteenth_amendment(us_state) {
	log(`S${us_state} voted ${COLOR_CODE[GREEN_CHECK]}`)
	game.us_states[us_state] = 0
	set_green_check(us_state)
}

function reject_nineteenth_amendment(us_state) {
	log(`S${us_state} voted ${COLOR_CODE[RED_X]}`)
	game.us_states[us_state] = 0
	set_red_x(us_state)
}

function trigger_nineteenth_amendment() {
	if (game.nineteenth_amendment)
		throw Error("ASSERT: nineteenth_amendment already set")
	log_br()
	log("Congress passed the Nineteenth Amendment.")
	game.nineteenth_amendment = 1
	game.congress = 0

	let green_check = 0
	let red_x = 0

	for (let s = 1; s <= us_states_count; ++s) {
		if (support_cubes(s) >= 4) {
			ratify_nineteenth_amendment(s)
			green_check += 1
			if (green_check >= GREEN_CHECK_VICTORY)
				return goto_game_over(SUF, "Suffragist wins the game.")
		} else if (opponent_cubes(s) >= 4) {
			reject_nineteenth_amendment(s)
			red_x += 1
			if (red_x >= RED_X_VICTORY)
				return goto_game_over(OPP, "Opposition wins the game.")
		}
	}

	return false
}

function check_victory() {
	if (!game.nineteenth_amendment)
		return false
	if (count_green_checks() >= GREEN_CHECK_VICTORY) {
		goto_game_over(SUF, "Suffragist wins the game.")
		return true
	} else if (count_red_xs() >= RED_X_VICTORY) {
		goto_game_over(OPP, "Opposition wins the game.")
		return true
	}
	return false
}

function increase_congress(count=1) {
	const before = game.congress
	game.congress = Math.min(game.congress + count, 6)
	const added = game.congress - before
	if (added)
		log(`Congress +${added} CM`)
}

function decrease_congress(count=1) {
	const before = game.congress
	game.congress = Math.max(game.congress - count, 0)
	const removed = before - game.congress
	if (removed)
		log(`Congress -${removed} CM`)
}

states.lobbying_add_congress = {
	inactive: "add a Congressional marker.",
	prompt() {
		view.prompt = `Lobbying: Add ${pluralize(game.count, 'Congressional marker')}.`
		gen_action("congress")
	},
	congress() {
		increase_congress(1)
		game.count--
		if (game.congress >= 6 && trigger_nineteenth_amendment())
			return
		if (game.count === 0 || game.congress === 6 || game.nineteenth_amendment)
			end_play_card(game.played_card)
	}
}

states.lobbying_remove_congress = {
	inactive: "remove a Congressional marker.",
	prompt() {
		view.prompt = `Lobbying: Remove ${pluralize(game.count, 'Congressional marker')}.`
		gen_action("congress")
	},
	congress() {
		decrease_congress(1)
		game.count--
		if (game.count === 0 || game.congress === 0)
			end_play_card(game.played_card)
	}
}


// #endregion

// #region EVENTS GENERIC

function goto_event(c) {
	game.played_card = c
	goto_vm(c)
}

function end_event() {
	let c = game.vm.fp
	game.vm = null
	end_play_card(c)
}

function goto_vm(proc) {
	let old_vm = game.vm

	game.state = "vm"
	game.vm = {
		prompt: 0,
		fp: proc,
		ip: 0,
	}

	// HACK: function call stack
	// should only be triggered by The Winning Plan
	if (old_vm) {
		game.vm.return_vm = old_vm
	}

	vm_exec()
}

function event_prompt(str) {
	if (typeof str === "undefined")
		str = CODE[game.vm.fp][game.vm.prompt][1]
	if (typeof str === "function")
		str = str()
	view.prompt = CARDS[game.vm.fp].name + ": " + str
}

function vm_assert_argcount(n) {
	const argcount = CODE[game.vm.fp][game.vm.ip].length - 1
	if (argcount !== n)
		throw Error(`ASSERT Invalid number of arguments on event ${game.vm.fp}: ${argcount} instead of ${n}`)
}

function vm_inst(a) {
	return CODE[game.vm.fp][game.vm.ip][a]
}

function vm_operand(a) {
	let x = CODE[game.vm.fp][game.vm.ip][a]
	if (a > 0 && typeof x === "function")
		return x()
	return x
}

function vm_operand_us_states(x) {
	let s = vm_operand(x)
	if (typeof s === "number")
		return [ s ]
	return s.slice()
}

function vm_exec() {
	vm_inst(0)()
}

function vm_next() {
	game.vm.ip ++
	vm_exec()
}

function vm_prompt() {
	game.vm.prompt = game.vm.ip
	vm_next()
}

function vm_log() {
	log(vm_operand(1))
	vm_next()
}

function vm_return() {
	let return_vm = game.vm.return_vm

	end_event()

	// HACK: function call stack
	if (return_vm) {
		game.vm = return_vm
		vm_next()
	}
}

states.vm_return = {
	inactive: "finish playing the event.",
	prompt() {
		event_prompt("Done.")
		view.actions.end_event = 1
	},
	end_event() {
		end_event()
	},
	done() {
		end_event()
	},
}

function vm_if() {
	if (!vm_operand(1)) {
		let balance = 1
		while (balance > 0) {
			++game.vm.ip
			switch (vm_operand(0)) {
				case vm_if:
					++balance
					break
				case vm_endif:
					--balance
					break
				case vm_else:
					if (balance === 1)
						--balance
					break
			}
			if (game.vm.ip < 0 || game.vm.ip > CODE[game.vm.fp].length)
				throw "ERROR"
		}
	}
	vm_next()
}

function vm_else() {
	vm_jump(vm_endif, vm_if, 1, 1)
}

function vm_jump(op, nop, dir, step) {
	let balance = 1
	while (balance > 0) {
		game.vm.ip += dir
		if (vm_inst(0) === op)
			--balance
		if (vm_inst(0) === nop)
			++balance
		if (game.vm.ip < 0 || game.vm.ip > CODE[game.vm.fp].length)
			throw "ERROR"
	}
	game.vm.ip += step
	vm_exec()
}

function vm_endif() {
	vm_next()
}

// #endregion

// #region EVENTS VfW DSL

function vm_add_campaigner() {
	vm_assert_argcount(2)
	game.vm.campaigner = vm_operand(1)
	game.vm.region = vm_operand(2)
	game.state = "vm_add_campaigner"
}

function vm_receive_buttons() {
	vm_assert_argcount(1)
	game.vm.count = vm_operand(1)
	game.state = "vm_receive_buttons"
}

function vm_spend_buttons() {
	vm_assert_argcount(1)
	game.vm.count = vm_operand(1)
	game.state = "vm_spend_buttons"
	if (player_buttons() < game.vm.count)
		throw Error("ASSERT: Insufficient buttons")
}

function vm_opponent_loses_buttons() {
	vm_assert_argcount(1)
	game.vm.count = vm_operand(1)
	game.state = "vm_opponent_loses_buttons"
}

function vm_add_cubes() {
	vm_assert_argcount(3)
	game.vm.count = vm_operand(1)
	game.vm.cubes = vm_operand(2)
	game.vm.us_states = vm_operand_us_states(3)
	goto_vm_add_cubes()
}

function vm_add_cubes_limit() {
	vm_assert_argcount(4)
	game.vm.count = vm_operand(1)
	game.vm.cubes = vm_operand(2)
	game.vm.us_states = vm_operand_us_states(3)
	game.vm.limit = vm_operand(4)
	goto_vm_add_cubes()
}

function vm_add_cubes_in_each_of() {
	vm_assert_argcount(3)
	game.vm.count = vm_operand(1)
	game.vm.cubes = vm_operand(2)
	game.vm.us_states = vm_operand_us_states(3)
	game.vm.in_each_of = true
	goto_vm_add_cubes()
}

function vm_add_cubes_in_one_state_of_each_region() {
	vm_assert_argcount(2)
	game.vm.count = vm_operand(1)
	game.vm.cubes = vm_operand(2)
	game.vm.us_states = ANYWHERE.slice()
	game.vm.in_one_state_of_each_region = true
	goto_vm_add_cubes()
}

function vm_add_cubes_per_state_in_any_one_region() {
	vm_assert_argcount(2)
	game.vm.count = vm_operand(1)
	game.vm.cubes = vm_operand(2)
	game.vm.us_states = ANYWHERE.slice()
	game.vm.per_state_in_any_one_region = true
	goto_vm_add_cubes()
}

function vm_remove_cubes_limit() {
	vm_assert_argcount(4)
	game.vm.count = vm_operand(1)
	game.vm.cubes = vm_operand(2)
	game.vm.us_states = us_states_with_color_cubes(vm_operand_us_states(3), game.vm.cubes)
	game.vm.limit = vm_operand(4)
	goto_vm_remove_cubes()
}

function vm_remove_all_cubes() {
	vm_assert_argcount(2)
	game.vm.cubes = vm_operand(1)
	game.vm.us_states = us_states_with_color_cubes(vm_operand_us_states(2), game.vm.cubes)
	game.vm.all = true
	goto_vm_remove_cubes()
}

function vm_remove_all_cubes_up_to() {
	vm_assert_argcount(2)
	game.vm.cubes = vm_operand(1)
	game.vm.us_states = us_states_with_color_cubes(ANYWHERE.slice(), game.vm.cubes)
	game.vm.limit = vm_operand(2)
	game.vm.all = true
	goto_vm_remove_cubes()
}

function vm_replace() {
	vm_assert_argcount(3)
	game.vm.what = vm_operand(1)
	game.vm.count = vm_operand(2)
	game.vm.replacement = vm_operand(3)
	game.vm.us_states = ANYWHERE.slice()
	set_filter(game.vm.us_states, s => is_green_check(s) || is_red_x(s))

	// If Civil War is in effect the Suffragist cannot play Reconsideration in Atlantic & Appalachia and South regions
	if (game.active === SUF && game.persistent_turn.includes(THE_CIVIL_WAR)) {
		let excluded = region_us_states(ATLANTIC_APPALACHIA, SOUTH)
		set_filter(game.vm.us_states, s => !set_has(excluded, s))
	}

	if (!game.nineteenth_amendment || !game.vm.us_states.length || (game.vm.what === GREEN_CHECK && !count_green_checks()) || game.vm.what === RED_X && !count_red_xs()) {
		vm_next()
	} else {
		goto_vm_replace()
	}
}

function vm_add_congress() {
	vm_assert_argcount(1)
	game.vm.count = vm_operand(1)
	if (!game.nineteenth_amendment && game.vm.count) {
		game.state = "vm_add_congress"
	} else {
		vm_next()
	}
}

function vm_remove_congress() {
	vm_assert_argcount(1)
	game.vm.count = vm_operand(1)
	if (!game.nineteenth_amendment && game.congress > 0 && game.vm.count) {
		game.state = "vm_remove_congress"
	} else {
		vm_next()
	}
}

function vm_roll() {
	vm_assert_argcount(2)
	game.vm.count = vm_operand(1)
	game.vm.d = vm_operand(2)
	game.state = "vm_roll"
}

function vm_roll_for_success() {
	vm_assert_argcount(2)
	game.vm.count = vm_operand(1)
	game.vm.d = vm_operand(2)
	game.vm.for_success = true
	game.state = "vm_roll"
}

function vm_roll_sixes() {
	vm_assert_argcount(2)
	game.vm.count = vm_operand(1)
	game.vm.d = vm_operand(2)
	game.vm.roll_sixes = true
	game.state = "vm_roll"
}

function vm_move_each_player_campaigner_free() {
	vm_assert_argcount(0)
	if (has_player_active_campaigners()) {
		game.vm.moved = []
		game.state = "move_each_player_campaigner_free"
		delete game.selected_campaigner
	} else {
		vm_next()
	}
}

function vm_select_strategy_card() {
	vm_assert_argcount(0)
	game.state = "select_strategy_card"
}

function vm_select_us_state() {
	vm_assert_argcount(0)
	game.state = "vm_select_us_state"
	delete game.vm.selected_us_state
}

function vm_persistent() {
	vm_assert_argcount(2)
	let type = vm_operand(1)
	let message = vm_operand(2)
	switch (type) {
		case REST_OF_TURN:
			log(message || "Card in Effect for the Rest of the Turn.")
			game.persistent_turn.push(game.vm.fp)
			break
		case REST_OF_GAME:
			log(message || "Card in Effect for the Rest of the Game.")
			game.persistent_game.push(game.vm.fp)
			break
		case BALLOT_BOX:
			log(message || "Card in Effect for Final Voting.")
			game.persistent_ballot.push(game.vm.fp)
			break
	}
	game.vm.persistent = 1
	vm_next()
}

function vm_requires_persistent() {
	vm_assert_argcount(2)
	let type = vm_operand(1)
	let card = vm_operand(2)

	if (type === REST_OF_TURN && !game.persistent_turn.includes(card))
		throw Error(`ASSERT: Card ${card} not in persistent_turn`)
	if (type === REST_OF_GAME && !game.persistent_game.includes(card))
		throw Error(`ASSERT: Card ${card} not in persistent_game`)
	if (type == BALLOT_BOX && !game.persistent_ballot.includes(card))
		throw Error(`ASSERT: Card ${card} not in persistent_ballot`)

	vm_next()
}

function vm_requires_not_persistent() {
	vm_assert_argcount(2)
	let type = vm_operand(1)
	let card = vm_operand(2)

	if (type === REST_OF_TURN && game.persistent_turn.includes(card))
		throw Error(`ASSERT: Card ${card} not expected in persistent_turn`)
	if (type === REST_OF_GAME && game.persistent_game.includes(card))
		throw Error(`ASSERT: Card ${card} not expected in persistent_game`)
	if (type === BALLOT_BOX && game.persistent_ballot.includes(card))
		throw Error(`ASSERT: Card ${card} not expected in persistent_ballot`)

	vm_next()
}

function vm_discard_persistent() {
	vm_assert_argcount(2)
	let type = vm_operand(1)
	let card = vm_operand(2)

	if (type !== REST_OF_TURN)
		throw Error(`ASSERT: discard_persistent only supported for REST_OF_TURN`)

	if (game.persistent_turn.includes(card)) {
		discard_persistent_card(game.persistent_turn, card)
	} else {
		log(`C${card} not in effect.`)
	}

	vm_next()
}

function vm_campaigning_action() {
	vm_assert_argcount(0)
	if (has_player_active_campaigners() && can_campaign()) {
		log_round("Campaigning")
		if (has_extra_campaigning_cost())
			decrease_player_buttons(1)
		log_br()
		goto_campaigning(game.played_card)
	} else {
		vm_next()
	}
}

function vm_counter_strat() {
	vm_assert_argcount(0)
	if (game.persistent_turn.length) {
		game.state = "vm_counter_strat"
	} else {
		vm_next()
	}
}

function vm_draw_2_play_1_event() {
	vm_assert_argcount(0)
	clear_undo()

	game.vm.draw = []
	let draw_count = Math.min(2, player_deck().length)
	for (let i = 0; i < draw_count; ++i) {
		let card = draw_card(player_deck())
		game.vm.draw.push(card)
	}

	log(`${game.active} drew ${pluralize(draw_count, 'card')}.`)
	game.state = "vm_draw_2_play_1_event"
}

function vm_draw_6_place_any_on_top_of_draw() {
	vm_assert_argcount(0)
	init_vm_place_any_on_top_of_draw()
	game.state = "vm_place_any_on_top_of_draw"
}

function vm_draw_6_play_1() {
	vm_assert_argcount(0)
	init_vm_place_any_on_top_of_draw()
	game.state = "vm_draw_6_play_1"
}

function vm_place_any_on_top_of_draw() {
	vm_assert_argcount(0)
	game.state = "vm_place_any_on_top_of_draw"
}

function vm_opponent_discard_2_random_draw_2() {
	vm_assert_argcount(0)
	clear_undo()
	next_player()
	game.selected_cards = shuffle(object_copy(player_hand())).slice(0, 2)
	log(`Randomly selected ${pluralize(game.selected_cards.length, 'card')} from ${game.active}'s Hand.`)
	game.state = "vm_opponent_discard_2_random_draw_2"
}

function vm_show_opponents_hand_discard_1_draw_1() {
	vm_assert_argcount(0)
	clear_undo()
	set_aside_player_hand()

	for (let c of opponent_hand())
		player_hand().push(c)

	log(`${game.active} looked at ${opponent_name()}'s Hand.`)
	game.state = "vm_show_opponents_hand_discard_1_draw_1"
}

function vm_select_1_card_from_draw_deck_play_event_shuffle() {
	vm_assert_argcount(0)
	clear_undo()
	set_aside_player_hand()

	for (let c of player_deck())
		player_hand().push(c)

	log(`${game.active} looked at their Draw Deck.`)
	game.state = "vm_select_1_card_from_draw_deck_play_event_shuffle"
}

// #endregion

// #region EVENT STATES

states.vm_add_campaigner = {
	inactive: "add a Campaigner.",
	prompt() {
		event_prompt("Add a Campaigner")
		gen_action_region(game.vm.region)
	},
	region(r) {
		push_undo()
		add_campaigner(game.vm.campaigner, r)
		vm_next()
	}
}

function increase_player_buttons(count=1) {
	const before = player_buttons()
	if (game.active === SUF) {
		game.support_buttons = Math.min(game.support_buttons + count, MAX_SUPPORT_BUTTONS)
	} else {
		game.opposition_buttons = Math.min(game.opposition_buttons + count, MAX_OPPOSITION_BUTTONS)
	}
	const added = player_buttons() - before
	if (added)
		log(`${game.active} +${added} BM`)
}

function decrease_player_buttons(count=1) {
	const before = player_buttons()
	if (game.active === SUF) {
		game.support_buttons = Math.max(game.support_buttons - count, 0)
	} else {
		game.opposition_buttons = Math.max(game.opposition_buttons - count, 0)
	}
	const removed = before - player_buttons()
	if (removed)
		log(`${game.active} -${removed} BM`)
}

function decrease_opponent_buttons(count=1) {
	const before = opponent_buttons()
	if (game.active === SUF) {
		game.opposition_buttons = Math.max(game.opposition_buttons - count, 0)
	} else {
		game.support_buttons = Math.max(game.support_buttons - count, 0)
	}
	const removed = before - opponent_buttons()
	if (removed)
		log(`${opponent_name()} -${removed} BM`)
}

states.vm_receive_buttons = {
	inactive: "receive buttons.",
	prompt() {
		event_prompt(`Receive ${pluralize(game.vm.count, 'button')}`)
		gen_action("buttons")
	},
	buttons() {
		push_undo()
		increase_player_buttons(game.vm.count)
		vm_next()
	}
}

states.vm_spend_buttons = {
	inactive: "spend buttons.",
	prompt() {
		event_prompt(`Spend ${pluralize(game.vm.count, 'button')}`)
		gen_action("buttons")
	},
	buttons() {
		push_undo()
		decrease_player_buttons(game.vm.count)
		vm_next()
	}
}

states.vm_opponent_loses_buttons = {
	inactive: "make you lose buttons.",
	prompt() {
		event_prompt(`Opponent loses ${pluralize(game.vm.count, 'button')}`)
		gen_action("buttons")
	},
	buttons() {
		push_undo()
		decrease_opponent_buttons(game.vm.count)
		vm_next()
	}
}

function goto_vm_add_cubes() {
	game.state = "vm_add_cubes"
	if (game.vm.cubes === PURPLE_OR_YELLOW) {
		game.vm.cube_color = 0
	} else {
		game.vm.cube_color = game.vm.cubes
	}
	game.vm.added = []
	filter_us_states(game.vm.us_states)

	if (!game.vm.us_states.length)
		vm_next()
}

states.vm_add_cubes = {
	inactive: "add a cube.",
	prompt() {
		if (game.vm.cubes === PURPLE_OR_YELLOW) {
			view.actions.purple = (game.vm.cube_color !== PURPLE)
			view.actions.yellow = (game.vm.cube_color !== YELLOW)

			// Alternatively allow a click on a campaigner to switch color
			for_each_player_campaigner(c => {
				if (game.vm.cube_color !== campaigner_color(c))
					gen_action_campaigner(c)
			})
		}

		// let has_opponent_cubes = false
		for (let s of game.vm.us_states) {
			if (opponent_cubes(s)) {
				// has_opponent_cubes = true
				if (game.active === SUF) {
					gen_action_red_cube(s)
				} else {
					if (purple_cubes(s))
						gen_action_purple_cube(s)
					if (yellow_cubes(s))
						gen_action_yellow_cube(s)
				}
			} else if (game.vm.cube_color) {
				gen_action_us_state(s)
			}
		}

		if (!game.vm.cube_color) {
			event_prompt("Choose a cube color to add.")
			// if (has_opponent_cubes)
			// 	event_prompt("Choose a cube color to add or remove an Opponent's cube.")
		} else {

			if (!game.vm.in_each_of && !game.vm.in_one_state_of_each_region && !game.vm.per_state_in_any_one_region) {
				let remaining = game.vm.count - map_count(game.vm.added)
				event_prompt(`Add ${pluralize(remaining, COLOR_NAMES[game.vm.cube_color] + ' cube')}`)
				if (game.vm.limit)
					view.prompt += `, no more than ${game.vm.limit} per State`
			} else {
				event_prompt(`Add ${pluralize(game.vm.count, COLOR_NAMES[game.vm.cube_color] + ' cube')}`)
				if (game.vm.in_each_of)
					view.prompt += ` in each of ${pluralize(game.vm.us_states.length, 'State')}`
				if (game.vm.in_one_state_of_each_region)
					view.prompt += ' in one State of each Region'
				if (game.vm.per_state_in_any_one_region)
					view.prompt += ' per State in any one Region'
			}
			view.prompt += '.'
			// if (has_opponent_cubes)
			// 	event_prompt(`Add a ${COLOR_NAMES[game.vm.cube_color]} cube or remove an Opponent's cube.`)
		}
	},
	purple() {
		game.vm.cube_color = PURPLE
	},
	yellow() {
		game.vm.cube_color = YELLOW
	},
	campaigner(c) {
		game.vm.cube_color = campaigner_color(c)
	},
	purple_cube(s) {
		push_undo()
		remove_cube(PURPLE, s)
		after_vm_add_cube(s)
	},
	yellow_cube(s) {
		push_undo()
		remove_cube(YELLOW, s)
		after_vm_add_cube(s)
	},
	red_cube(s) {
		push_undo()
		remove_cube(RED, s)
		after_vm_add_cube(s)
	},
	us_state(s) {
		push_undo()
		add_cube(game.vm.cube_color, s)
		after_vm_add_cube(s)
	},
}

function can_claim_states_card(us_state) {
	for (let c of game.states_draw) {
		if (US_STATES[us_state].name === CARDS[c].name) {
			return true
		}
	}
	return false
}

function on_4th_cube(us_state) {
	if (game.nineteenth_amendment) {
		// replace cubes with checks / Xs
		if (game.active === SUF) {
			ratify_nineteenth_amendment(us_state)
		} else {
			reject_nineteenth_amendment(us_state)
		}
	}
}

function after_vm_add_cube(us_state) {
	if (player_cubes(us_state) === 4) {
		if (can_claim_states_card(us_state)) {
			goto_claim_states_card(us_state)
			return
		}
		on_4th_cube(us_state)
		if (game.nineteenth_amendment)
			set_delete(game.vm.us_states, us_state)
		if (check_victory())
			return true
	}

	map_incr(game.vm.added, us_state, 1)

	if (game.vm.in_one_state_of_each_region) {
		for (let other of region_us_states(us_state_region(us_state)))
			if (us_state !== other)
				set_delete(game.vm.us_states, other)
	}

	if (game.vm.per_state_in_any_one_region && map_get(game.vm.added, us_state) === 1) {
		// only need to do this for the the first cube in the state
		set_filter(game.vm.us_states, s => us_state_region(us_state) === us_state_region(s))
	}

	if (game.vm.limit) {
		if (map_get(game.vm.added, us_state) === game.vm.limit)
			set_delete(game.vm.us_states, us_state)
		if (map_count(game.vm.added) === game.vm.count)
			return vm_next()
	} else {
		if (map_get(game.vm.added, us_state) === game.vm.count)
			set_delete(game.vm.us_states, us_state)
	}

	if (!game.vm.us_states.length)
		vm_next()
}

function goto_vm_remove_cubes() {
	game.state = "vm_remove_cubes"
	game.vm.removed = []
}

states.vm_remove_cubes = {
	inactive: "remove a cube.",
	prompt() {
		if (game.vm.all) {
			if (game.vm.cubes === PURPLE_OR_YELLOW)
				event_prompt(`Remove all Purple and Yellow cubes.`)
			else
				event_prompt(`Remove all ${COLOR_NAMES[game.vm.cubes]} cubes.`)
		} else {
			event_prompt(`Remove ${pluralize(game.vm.count, COLOR_NAMES[game.vm.cubes] + ' cube')}`)
			if (game.vm.limit)
				view.prompt += `, no more than ${game.vm.limit} per State`
			view.prompt += '.'
		}

		let can_remove = false
		for (let s of game.vm.us_states) {
			if ((game.vm.cubes === PURPLE || game.vm.cubes === PURPLE_OR_YELLOW) && purple_cubes(s)) {
				gen_action_purple_cube(s)
				can_remove = true
			}
			if ((game.vm.cubes === YELLOW || game.vm.cubes === PURPLE_OR_YELLOW) && yellow_cubes(s)) {
				gen_action_yellow_cube(s)
				can_remove = true
			}
			if (game.vm.cubes === RED && red_cubes(s)) {
				gen_action_red_cube(s)
				can_remove = true
			}
		}

		if (!can_remove)
			gen_action("next")
	},
	purple_cube(s) {
		push_undo()
		remove_cube(PURPLE, s)
		after_vm_remove_cube(s)
	},
	yellow_cube(s) {
		push_undo()
		remove_cube(YELLOW, s)
		after_vm_remove_cube(s)
	},
	red_cube(s) {
		push_undo()
		remove_cube(RED, s)
		after_vm_remove_cube(s)
	},
	next() {
		vm_next()
	}
}

function after_vm_remove_cube(us_state) {
	map_incr(game.vm.removed, us_state, 1)

	if (game.vm.all) {
		if (map_key_count(game.vm.removed) === game.vm.limit) {
			// remove all other states from eligible list when we reached our limit
			set_filter(game.vm.us_states, s => map_has(game.vm.removed, s))
		}

		if (!color_cubes(game.vm.cubes, us_state)) {
			set_delete(game.vm.us_states, us_state)

			if (game.vm.limit && map_key_count(game.vm.removed) === game.vm.limit && !game.vm.us_states.length)
				return vm_next()
		}
	} else {
		if (!color_cubes(game.vm.cubes, us_state) || map_get(game.vm.removed, us_state) === game.vm.limit)
			set_delete(game.vm.us_states, us_state)

		if (map_count(game.vm.removed) === game.vm.count)
			return vm_next()
	}

	if (!game.vm.us_states.length)
		vm_next()
}

function goto_vm_replace() {
	game.state = "vm_replace"
	game.vm.removed = []
}

states.vm_replace = {
	inactive: "do a replacement",
	prompt() {
		if (game.vm.replacement !== GREEN_CHECK && game.vm.replacement !== RED_X) {
			event_prompt(`Replace a ${COLOR_NAMES[game.vm.what]} with ${pluralize(game.vm.count, COLOR_NAMES[game.vm.replacement] + ' cube')}.`)
		} else {
			event_prompt(`Replace a ${COLOR_NAMES[game.vm.what]} with ${COLOR_NAMES[game.vm.replacement]}.`)
		}

		for (let s of game.vm.us_states) {
			if (game.vm.what === GREEN_CHECK && is_green_check(s))
				gen_action_green_check(s)
			if (game.vm.what === RED_X && is_red_x(s))
				gen_action_red_x(s)
		}
	},
	green_check(s) {
		push_undo()
		remove_green_check(s)

		if (game.vm.replacement !== RED_X) {
			game.vm.cubes = game.vm.replacement
			game.vm.us_states = [s]
			goto_vm_add_cubes()
		} else {
			reject_nineteenth_amendment(s)
			if (check_victory())
				return
			vm_next()
		}
	},
	red_x(s) {
		push_undo()
		remove_red_x(s)

		if (game.vm.replacement !== GREEN_CHECK) {
			game.vm.cubes = game.vm.replacement
			game.vm.us_states = [s]
			goto_vm_add_cubes()
		} else {
			ratify_nineteenth_amendment(s)
			if (check_victory())
				return
			vm_next()
		}
	}
}

states.vm_add_congress = {
	inactive: "add a Congressional marker.",
	prompt() {
		event_prompt(`Add ${pluralize(game.vm.count, 'Congressional marker')}.`)
		gen_action("congress")
	},
	congress() {
		increase_congress(1)
		game.vm.count--
		if (game.congress >= 6 && trigger_nineteenth_amendment())
			return
		if (game.vm.count === 0 || game.congress === 6 || game.nineteenth_amendment)
			vm_next()
	}
}

states.vm_remove_congress = {
	inactive: "remove a congressional marker.",
	prompt() {
		event_prompt(`Remove ${pluralize(game.vm.count, 'Congressional marker')}.`)
		gen_action("congress")
	},
	congress() {
		decrease_congress(1)
		game.vm.count--
		if (game.vm.count === 0 || game.congress === 0)
			vm_next()
	}
}

const DICE_COLOR = {
	[D4]: "B", // blue
	[D6]: "D", // red
	[D8]: "W", // white
}

function roll_ndx(n, x, prefix="Rolled") {
	clear_undo()
	let result = 0
	let summary = []
	for (let i = 0; i < n; ++i) {
		let roll = random(x) + 1
		result += roll
		summary.push(DICE_COLOR[x] + roll)
	}
	log(prefix + " " + summary.join(" "))
	return result
}

function roll_ndx_list(n, x, prefix="Rolled") {
	clear_undo()
	let result = []
	let summary = []
	for (let i = 0; i < n; ++i) {
		let roll = random(x) + 1
		result.push(roll)
		summary.push(DICE_COLOR[x] + roll)
	}
	log(prefix + " " + summary.join(" "))
	return result
}

function roll_ndx_count_success(n, x, prefix="Rolled") {
	clear_undo()
	let result = 0
	let summary = []
	for (let i = 0; i < n; ++i) {
		let roll = random(x) + 1
		if (roll >= 6)
			result += 1
		summary.push(DICE_COLOR[x] + roll)
	}
	log(prefix + " " + summary.join(" "))
	return result
}

states.vm_roll = {
	inactive: "roll dice.",
	prompt() {
		if (game.vm.roll) {
			if (game.vm.roll_sixes) {
				const sixes = game.vm.roll.filter(x => x >= 6).length
				event_prompt(`You rolled ${sixes} six${sixes!==1?'es':''} (or higher).`)
			} else {
				event_prompt(`You rolled ${game.vm.roll}.`)
			}
		} else if (game.vm.count === 1) {
			event_prompt("Roll a die.")
		} else {
			event_prompt("Roll dice.")
		}
		if (!game.vm.roll) {
			gen_action("roll")
		} else {
			if (player_buttons() > 0 && (!game.vm.for_success || game.vm.roll < 3))
				gen_action("reroll")
			gen_action("accept")
		}
	},
	roll() {
		if (game.vm.roll_sixes)
			game.vm.roll = roll_ndx_list(game.vm.count, game.vm.d)
		else
			game.vm.roll = roll_ndx(game.vm.count, game.vm.d)
	},
	reroll() {
		decrease_player_buttons(1)
		if (game.vm.roll_sixes)
			game.vm.roll = roll_ndx_list(game.vm.count, game.vm.d, "Re-rolled")
		else
			game.vm.roll = roll_ndx(game.vm.count, game.vm.d, "Re-rolled")
	},
	accept() {
		push_undo()
		vm_next()
	}
}

states.vm_select_us_state = {
	inactive: "select a state.",
	prompt() {
		if (!game.vm.selected_us_state) {
			event_prompt("Select one state.")
			for (let s of ANYWHERE) {
				gen_action_us_state(s)
			}
		} else {
			event_prompt(`Selected ${us_state_name(game.vm.selected_us_state)}.`)
			gen_action("done")
		}
	},
	us_state(s) {
		push_undo()
		game.vm.selected_us_state = s
	},
	done() {
		log(`Selected S${game.vm.selected_us_state}.`)
		vm_next()
	}
}

states.move_each_player_campaigner_free = {
	inactive: "move a campaigner.",
	prompt() {
		if (!game.selected_campaigner) {
			event_prompt("Select a Campaigner.")

			for_each_player_campaigner(c => {
				if (!set_has(game.vm.moved, c))
					gen_action_campaigner(c)
			})
		} else {
			event_prompt("Select region to move the Campaigner to.")
			let current_region = campaigner_region(game.selected_campaigner)
			for (let r = 1; r <= region_count; r++) {
				if (r !== current_region)
					gen_action_region(r)
			}
		}
		gen_action("next")
	},
	next() {
		delete game.selected_campaigner
		vm_next()
	},
	campaigner(c) {
		push_undo()
		game.selected_campaigner = c
	},
	region(r) {
		push_undo()
		move_campaigner(game.selected_campaigner, r)
		set_add(game.vm.moved, game.selected_campaigner)
		delete game.selected_campaigner

		if (game.vm.moved.length === count_player_active_campaigners()) {
			vm_next()
		}
	}
}

states.vm_counter_strat = {
	inactive: "remove a persistent event card.",
	prompt() {
		event_prompt("Select a persistent event card to discard.")
		for (let c of game.persistent_turn)
			gen_action_card(c)

	},
	card(c) {
		push_undo()
		discard_persistent_card(game.persistent_turn, c)
		vm_next()
	}
}

states.vm_draw_2_play_1_event = {
	inactive: "choose which card to play.",
	prompt() {
		event_prompt("Select which card to play for its event.")
		let can_play = false
		for (let c of game.vm.draw) {
			if (can_play_event(c)) {
				gen_action("card_select", c)
				can_play = true
			}
		}

		if (!can_play)
			gen_action("skip")

	},
	card_select(c) {
		push_undo()
		end_play_card(game.played_card)

		let other = game.vm.draw.find(x => x !== c)
		if (other !== undefined)
			log(`Discarded C${other}.`)

		delete game.vm.draw

		// move to hand to play
		player_hand().push(c)
		play_card_event(c)
	},
	skip() {
		log("None of the cards could be played for their event.")
		for (let c of game.vm.draw)
			log(`Discarded C${c}.`)
		delete game.vm.draw
		vm_next()
	}
}

function init_vm_place_any_on_top_of_draw() {
	clear_undo()
	game.vm.draw = []
	game.vm.on_top = []
	game.vm.on_bottom = []
	let draw_count = Math.min(player_deck().length, 6)
	for (let i = 0; i < draw_count; ++i) {
		let card = draw_card(player_deck())
		game.vm.draw.push(card)
	}
	log(`${game.active} drew ${pluralize(draw_count, 'card')}.`)
}

states.vm_draw_6_play_1 = {
	inactive: "choose which card to play for its event.",
	prompt() {
		let can_play = false
		event_prompt("Select which card to play as Event.")
		for (let c of game.vm.draw) {
			if (can_play_event(c)) {
				gen_action("card_select", c)
				can_play = true
			}
		}
		if (!can_play) {
			gen_action("skip")
		}
	},
	card_select(c) {
		push_undo()
		array_remove_item(game.vm.draw, c)
		player_hand().push(c)
		end_play_card(game.played_card)

		// HACK: nested event call (because we didn't call end_event/vm_return yet!)
		play_card_event(c)
	},
	skip() {
		log("None of the drawn cards could be played for their Event.")
		vm_next()
	},
}

states.vm_place_any_on_top_of_draw = {
	inactive: "choose which cards to place on top of their Draw Deck.",
	prompt() {
		event_prompt("Select which cards to place on TOP of your Draw Deck.")

		// show cards going on top
		if (game.active === OPP)
			view.deck = [ ...game.vm.on_top, OPP_CARD_BACK ]
		else
			view.deck = [ ...game.vm.on_top, SUF_CARD_BACK ]

		for (let c of game.vm.draw)
			gen_action_card(c)

		gen_action("next")
	},
	card(c) {
		push_undo()
		array_remove_item(game.vm.draw, c)
		game.vm.on_top.unshift(c)
	},
	next() {
		push_undo()
		if (game.vm.draw.length > 0)
			game.state = "vm_place_any_on_bottom_of_draw"
		else
			end_vm_place_any_on_top_of_draw()
	},
}

states.vm_place_any_on_bottom_of_draw = {
	inactive: "choose which cards to place at the bottom of their Draw Deck.",
	prompt() {
		event_prompt("Place the remaining cards at the BOTTOM of your Draw Deck.")

		// show cards going at the bottom
		if (game.active === OPP)
			view.deck = [ ...game.vm.on_top, OPP_CARD_BACK, ...game.vm.on_bottom ]
		else
			view.deck = [ ...game.vm.on_top, SUF_CARD_BACK, ...game.vm.on_bottom ]

		for (let c of game.vm.draw)
			gen_action_card(c)

		if (game.vm.draw.length === 0)
			gen_action("next")
	},
	card(c) {
		push_undo()
		array_remove_item(game.vm.draw, c)
		game.vm.on_bottom.push(c)
	},
	next() {
		end_vm_place_any_on_top_of_draw()
	},
}

function end_vm_place_any_on_top_of_draw() {
	log(`${game.active} placed ${pluralize(game.vm.on_top.length, 'card')} on top and ${pluralize(game.vm.on_bottom.length, 'card')} at the bottom of their Draw Deck.`)
	while (game.vm.on_top.length > 0)
		player_deck().push(game.vm.on_top.pop())
	for (let c of game.vm.on_bottom)
		player_deck().unshift(c)
	delete game.vm.draw
	vm_next()
}

states.vm_opponent_discard_2_random_draw_2 = {
	inactive: "discard 2 random cards and then draw 2 cards.",
	prompt() {
		event_prompt("You must discard 2 random cards and then draw 2 cards.")
		gen_action("next")
	},
	next() {
		for (let c of game.selected_cards) {
			discard_card_from_hand(c)
			log(`Discarded C${c}.`)
		}
		// if we could discard less than two, we also draw less than two.
		let draw_count = Math.min(game.selected_cards.length, player_deck().length)
		for (let i = 0; i < draw_count; ++i) {
			let card = draw_card(player_deck())
			player_hand().push(card)
		}
		log(`${game.active} drew ${pluralize(draw_count, 'card')}.`)
		game.selected_cards = []
		next_player()
		vm_next()
	}
}

const CAMPAIGNER_CARDS = [
	1, 19, 36, 53, 71, 84, 108, 114
]

states.vm_show_opponents_hand_discard_1_draw_1 = {
	inactive: "discard one card from of your hand.",
	prompt() {
		event_prompt("Select one card from your opponent's Hand to discard.")
		let can_discard = false
		for (let c of player_hand()) {
			// exclude cards with campaigners on them
			if (!CAMPAIGNER_CARDS.includes(c)) {
				gen_action_card(c)
				can_discard = true
			}
		}

		if (!can_discard)
			gen_action("skip")
	},
	card(c) {
		restore_player_hand()
		log(`Discarded C${c}.`)
		array_remove_item(opponent_hand(), c)
		if (opponent_deck().length) {
			opponent_hand().push(draw_card(opponent_deck()))
			log(`${opponent_name()} drew 1 card.`)
		}
		vm_next()
	},
	skip() {
		restore_player_hand()
		log("None of the Opponent's cards could be discarded.")
		vm_next()
	}
}

states.vm_select_1_card_from_draw_deck_play_event_shuffle = {
	inactive: "play one card from their Draw Deck as Event.",
	prompt() {
		event_prompt("Select one card from your Draw Deck and play for its Event.")
		let can_play = false
		for (let c of player_hand()) {
			if (can_play_event(c)) {
				gen_action_card(c)
				can_play = true
			}
		}

		if (!can_play)
			gen_action("skip")
	},
	card(c) {
		restore_player_hand()
		log(`Selected C${c}.`)
		player_hand().push(c)
		array_remove_item(player_deck(), c)
		log(`Shuffled ${game.active}'s Deck.`)
		shuffle(player_deck())

		end_play_card(game.played_card)
		play_card_event(c)
	},
	skip() {
		restore_player_hand()
		log("None of the cards could be played for their Event.")
		log(`Shuffled ${game.active}'s Deck.`)
		shuffle(player_deck())
		vm_next()
	}
}

// #endregion

// #region LOGGING

function log(msg) {
	game.log.push(msg)
}

function log_br() {
	if (game.log.length > 0 && game.log[game.log.length - 1] !== "")
		game.log.push("")
}

function logi(msg) {
	game.log.push(">" + msg)
}

function log_h1(msg) {
	log_br()
	log(".h1 " + msg)
	log_br()
}

function log_h2(msg) {
	log_br()
	log(".h2 " + msg)
	log_br()
}

function log_h3(msg) {
	log_br()
	log(".h3 " + msg)
}

function log_round(msg) {
	log_br()
	if (game.active === SUF)
		log(".h3.suf " + game.round + " - " + msg)
	else
		log(".h3.opp " + game.round + " - " + msg)
	log_br()
}

function log_sep() {
	log(".hr")
}

// #endregion

// #region COMMON LIBRARY

function clear_undo() {
	if (game.undo.length > 0)
		game.undo = []
}

function push_undo() {
	let copy = {}
	for (let k in game) {
		let v = game[k]
		if (k === "undo")
			continue
		else if (k === "log")
			v = v.length
		else if (typeof v === "object" && v !== null)
			v = object_copy(v)
		copy[k] = v
	}
	game.undo.push(copy)
}

function pop_undo() {
	let save_log = game.log
	let save_undo = game.undo
	game = save_undo.pop()
	save_log.length = game.log
	game.log = save_log
	game.undo = save_undo
}

function random(range) {
	// An MLCG using integer arithmetic with doubles.
	// https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
	// m = 2**35 − 31
	return (game.seed = game.seed * 200105 % 34359738337) % range
}

function shuffle(list) {
	// Fisher-Yates shuffle
	for (let i = list.length - 1; i > 0; --i) {
		let j = random(i + 1)
		let tmp = list[j]
		list[j] = list[i]
		list[i] = tmp
	}
	return list
}

// Fast deep copy for objects without cycles
function object_copy(original) {
	if (Array.isArray(original)) {
		let n = original.length
		let copy = new Array(n)
		for (let i = 0; i < n; ++i) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	} else {
		let copy = {}
		for (let i in original) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	}
}

// Array remove and insert (faster than splice)

function array_remove_item(array, item) {
	let n = array.length
	for (let i = 0; i < n; ++i)
		if (array[i] === item)
			return array_remove(array, i)
}

function array_remove(array, index) {
	let n = array.length
	for (let i = index + 1; i < n; ++i)
		array[i - 1] = array[i]
	array.length = n - 1
}

// insert item at index (faster than splice)
function array_insert(array, index, item) {
	for (let i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
	return array
}

function array_remove_pair(array, index) {
	let n = array.length
	for (let i = index + 2; i < n; ++i)
		array[i - 2] = array[i]
	array.length = n - 2
}

function array_insert_pair(array, index, key, value) {
	for (let i = array.length; i > index; i -= 2) {
		array[i] = array[i-2]
		array[i+1] = array[i-1]
	}
	array[index] = key
	array[index+1] = value
}

function set_clear(set) {
	set.length = 0
}

function set_has(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return true
	}
	return false
}

function set_add(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return set
	}
	return array_insert(set, a, item)
}

function set_delete(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return array_remove(set, m)
	}
	return set
}

function set_filter(set, predicate_fn) {
    let hole = 0
    for (let i = 0; i < set.length; i++) {
        if (predicate_fn(set[i])) {
            if (hole !== i)
                set[hole] = set[i]
            hole++
        }
    }
    set.length = hole
}

function set_toggle(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return array_remove(set, m)
	}
	return array_insert(set, a, item)
}

function map_clear(map) {
	map.length = 0
}

function map_has(map, key) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return true
	}
	return false
}

function map_get(map, key, missing) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m<<1)+1]
	}
	return missing
}

function map_set(map, key, value) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m<<1)+1] = value
			return
		}
	}
	array_insert_pair(map, a<<1, key, value)
}

function map_incr(map, key, value) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m<<1)+1] += value
			return
		}
	}
	array_insert_pair(map, a<<1, key, value)
}

function map_delete(map, item) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove_pair(map, m<<1)
			return
		}
	}
}

function map_for_each(map, f) {
	for (let i = 0; i < map.length; i += 2)
		f(map[i], map[i+1])
}

function map_count(map) {
	let result = 0
	for (let i = 0; i < map.length; i += 2)
		result += map[i+1]
	return result
}

function map_key_count(map) {
	return map.length >> 1
}

// #endregion

// #region GENERATED EVENT CODE
const CODE = []

CODE[1] = [ // Seneca Falls Convention
	[ vm_add_campaigner, PURPLE, NORTHEAST ],
	[ vm_add_campaigner, YELLOW, NORTHEAST ],
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes, 2, PURPLE_OR_YELLOW, us_states("New York") ],
	[ vm_return ],
]

CODE[2] = [ // Property Rights for Women
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, roll D6 instead of B4 when taking a Campaigning action." ],
	[ vm_return ],
]

CODE[3] = [ // Frances Willard
	[ vm_add_congress, 1 ],
	[ vm_receive_buttons, 2 ],
	[ vm_return ],
]

CODE[4] = [ // A Vindication of the Rights of Woman
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[5] = [ // Union Victory
	[ vm_requires_persistent, REST_OF_TURN, find_card("The Civil War") ],
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_receive_buttons, 2 ],
	[ vm_discard_persistent, REST_OF_TURN, find_card("The Civil War") ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[6] = [ // Fifteenth Amendment
	[ vm_requires_not_persistent, REST_OF_TURN, find_card("The Civil War") ],
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_add_congress, 2 ],
	[ vm_add_cubes_limit, 8, PURPLE_OR_YELLOW, ANYWHERE, 2 ],
	[ vm_persistent, REST_OF_GAME, "" ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[7] = [ // Reconstruction
	[ vm_requires_not_persistent, REST_OF_TURN, find_card("The Civil War") ],
	[ vm_requires_persistent, REST_OF_GAME, find_card("Fifteenth Amendment") ],
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, us_states("Virginia", "North Carolina", "South Carolina", "Georgia", "Florida", "Alabama", "Mississippi", "Tennessee", "Arkansas", "Louisiana", "Texas") ],
	[ vm_return ],
]

CODE[8] = [ // Petition to Congress
	[ vm_add_congress, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[9] = [ // Lucy Stone
	[ vm_receive_buttons, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[10] = [ // Susan B. Anthony Indicted
	[ vm_receive_buttons, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[11] = [ // Anna Dickinson
	[ vm_receive_buttons, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[12] = [ // Frederick Douglass
	[ vm_roll, 1, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, region_us_states(NORTHEAST), 1 ],
	[ vm_return ],
]

CODE[13] = [ // Frances Harper
	[ vm_roll, 1, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, region_us_states(ATLANTIC_APPALACHIA), 1 ],
	[ vm_return ],
]

CODE[14] = [ // The Union Signal
	[ vm_receive_buttons, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[15] = [ // Sojourner Truth
	[ vm_roll, 1, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, region_us_states(MIDWEST), 1 ],
	[ vm_return ],
]

CODE[16] = [ // Pioneer Women
	[ vm_roll, 1, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, region_us_states(PLAINS), 1 ],
	[ vm_return ],
]

CODE[17] = [ // Women to the Polls
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, us_states("New Jersey", "Pennsylvania", "Delaware") ],
	[ vm_return ],
]

CODE[18] = [ // National Woman’s Rights Convention
	[ vm_add_congress, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[19] = [ // National American Woman Suffrage Association
	[ vm_add_campaigner, PURPLE, ATLANTIC_APPALACHIA ],
	[ vm_receive_buttons, 3 ],
	[ vm_return ],
]

CODE[20] = [ // Jeannette Rankin
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_add_congress, 1 ],
	[ vm_add_cubes, 4, PURPLE_OR_YELLOW, us_states("Montana") ],
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, region_us_states_except(PLAINS, us_states("Montana")) ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[21] = [ // Ida B. Wells-Barnett
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes, 2, PURPLE_OR_YELLOW, us_states("Illinois") ],
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, region_us_states_except(MIDWEST, us_states("Illinois")) ],
	[ vm_return ],
]

CODE[22] = [ // The Club Movement
	[ vm_receive_buttons, 4 ],
	[ vm_return ],
]

CODE[23] = [ // Equality League of Self-Supporting Women
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[24] = [ // Emmeline Pankhurst
	[ vm_roll, 2, D6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[25] = [ // “Debate Us, You Cowards!”
	[ vm_roll, 2, D6 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[26] = [ // Carrie Chapman Catt
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[27] = [ // Alice Paul & Lucy Burns
	[ vm_roll, 2, D6 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[28] = [ // Inez Milholland
	[ vm_add_congress, 1 ],
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[29] = [ // Farmers for Suffrage
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, us_states("Wisconsin", "Minnesota", "Iowa", "North Dakota", "South Dakota") ],
	[ vm_return ],
]

CODE[30] = [ // Zitkala-Ša
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, us_states("North Dakota", "South Dakota", "Nebraska", "Montana", "Wyoming") ],
	[ vm_return ],
]

CODE[31] = [ // Helen Keller
	[ vm_roll, 2, D6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[32] = [ // Maria de Lopez
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, us_states("California", "Nevada", "Arizona") ],
	[ vm_return ],
]

CODE[33] = [ // Marie Louise Bottineau Baldwin
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, roll D6 instead of B4 when taking a Campaigning action." ],
	[ vm_return ],
]

CODE[34] = [ // The West’s Awakening
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, region_us_states(WEST) ],
	[ vm_return ],
]

CODE[35] = [ // Southern Strategy
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, region_us_states(SOUTH) ],
	[ vm_select_strategy_card ],
	[ vm_persistent, REST_OF_GAME, "" ],
	[ vm_return ],
]

CODE[36] = [ // Women’s Trade Union League
	[ vm_add_campaigner, YELLOW, ATLANTIC_APPALACHIA ],
	[ vm_add_congress, 1 ],
	[ vm_receive_buttons, 2 ],
	[ vm_return ],
]

CODE[37] = [ // The Young Woman Citizen
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[38] = [ // 1918 Midterm Elections
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_add_congress, 3 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[39] = [ // Woodrow Wilson
	[ vm_spend_buttons, 4 ],
	[ vm_select_strategy_card ],
	[ vm_return ],
]

CODE[40] = [ // Maud Wood Park
	[ vm_add_congress, 2 ],
	[ vm_return ],
]

CODE[41] = [ // Voter Registration
	[ vm_persistent, BALLOT_BOX, "The Suffragist player rolls W8 instead of D6 during Final Voting." ],
	[ vm_return ],
]

CODE[42] = [ // Processions for Suffrage
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, roll W8 instead of D6 when taking a Lobbying action. For each 6, 7 or 8 rolled, add 1 CM in Congress." ],
	[ vm_return ],
]

CODE[43] = [ // Prison Tour Special
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, roll D6 instead of B4 when taking a Campaigning action." ],
	[ vm_return ],
]

CODE[44] = [ // Victory Map
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, region_us_states(WEST, PLAINS) ],
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, us_states("Texas", "Arkansas", "Illinois", "Michigan", "New York", "Vermont") ],
	[ vm_return ],
]

CODE[45] = [ // Women and World War I
	[ vm_requires_persistent, REST_OF_TURN, find_card("War in Europe") ],
	[ vm_add_cubes_limit, 10, PURPLE_OR_YELLOW, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[46] = [ // Eighteenth Amendment
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_add_congress, 1 ],
	[ vm_receive_buttons, 2 ],
	[ vm_persistent, REST_OF_GAME, "" ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[47] = [ // Mary McLeod Bethune
	[ vm_roll, 2, D8 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[48] = [ // Make a Home Run for Suffrage
	[ vm_roll, 2, D8 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[49] = [ // Mary Church Terrell
	[ vm_roll, 2, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[50] = [ // Tea Parties for Suffrage
	[ vm_add_congress, 1 ],
	[ vm_receive_buttons, 4 ],
	[ vm_return ],
]

CODE[51] = [ // Dr. Mabel Ping-Hua Lee
	[ vm_roll, 2, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), PURPLE_OR_YELLOW, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[52] = [ // Miss Febb Wins the Last Vote
	[ vm_persistent, BALLOT_BOX, "The Suffragist player wins all ties during Final Voting." ],
	[ vm_return ],
]

CODE[53] = [ // The Patriarchy
	[ vm_add_campaigner, RED, SOUTH ],
	[ vm_receive_buttons, 4 ],
	[ vm_add_cubes_in_each_of, 1, RED, region_us_states(NORTHEAST, ATLANTIC_APPALACHIA, SOUTH, MIDWEST) ],
	[ vm_return ],
]

CODE[54] = [ // The Civil War
	[ vm_remove_congress, 1 ],
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, the Suffragist player may not add PYC to any state in the Atlantic & Appalachia and South regions." ],
	[ vm_return ],
]

CODE[55] = [ // 15th Divides Suffragists
	[ vm_requires_persistent, REST_OF_GAME, find_card("Fifteenth Amendment") ],
	[ vm_remove_all_cubes_up_to, PURPLE, 4 ],
	[ vm_opponent_loses_buttons, 2 ],
	[ vm_return ],
]

CODE[56] = [ // Senator Joseph Brown
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("Georgia") ],
	[ vm_return ],
]

CODE[57] = [ // Minor v. Happersett
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("Missouri") ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[58] = [ // Senate Rejects Suffrage Amendment
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_receive_buttons, 1 ],
	[ vm_remove_congress, 1 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[59] = [ // South Dakota Rejects Suffrage
	[ vm_roll_for_success, 1, D6 ],
	[ vm_if, ()=>(game.vm.roll >= 3) ],
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("South Dakota") ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[60] = [ // Gerrymandering
	[ vm_remove_all_cubes_up_to, YELLOW, 2 ],
	[ vm_return ],
]

CODE[61] = [ // Border States
	[ vm_add_cubes_in_each_of, 1, RED, us_states("Delaware", "Maryland", "West Virginia", "Kentucky", "Missouri") ],
	[ vm_return ],
]

CODE[62] = [ // Horace Greeley
	[ vm_add_cubes_in_each_of, 2, RED, us_states("New York", "Connecticut") ],
	[ vm_return ],
]

CODE[63] = [ // New York Newspapers
	[ vm_add_cubes_in_each_of, 2, RED, us_states("New York", "New Jersey") ],
	[ vm_return ],
]

CODE[64] = [ // Senator George Vest
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("Missouri") ],
	[ vm_return ],
]

CODE[65] = [ // Catharine Beecher
	[ vm_roll, 1, D4 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 1 ],
	[ vm_return ],
]

CODE[66] = [ // Progress, Not Politics
	[ vm_draw_6_place_any_on_top_of_draw ],
	[ vm_return ],
]

CODE[67] = [ // Southern “Hospitality”
	[ vm_add_cubes_in_each_of, 1, RED, us_states("Virginia", "North Carolina", "South Carolina", "Georgia", "Tennessee") ],
	[ vm_return ],
]

CODE[68] = [ // Beer Brewers
	[ vm_requires_not_persistent, REST_OF_GAME, find_card("Eighteenth Amendment") ],
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, roll D6 instead of B4 when taking a Campaigning action." ],
	[ vm_return ],
]

CODE[69] = [ // Southern Resentment
	[ vm_requires_persistent, REST_OF_GAME, find_card("Fifteenth Amendment") ],
	[ vm_add_cubes_in_each_of, 1, RED, us_states("Texas", "Louisiana", "Arkansas", "Mississippi", "Alabama") ],
	[ vm_return ],
]

CODE[70] = [ // Old Dixie
	[ vm_add_cubes_in_each_of, 1, RED, us_states("Louisiana", "Mississippi", "Alabama", "Georgia", "Florida") ],
	[ vm_return ],
]

CODE[71] = [ // NAOWS Forms
	[ vm_add_campaigner, RED, NORTHEAST ],
	[ vm_receive_buttons, 2 ],
	[ vm_return ],
]

CODE[72] = [ // Woman and the Republic
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[73] = [ // The Ladies’ Battle
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[74] = [ // Backlash to the Movement
	[ vm_remove_cubes_limit, 6, PURPLE_OR_YELLOW, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[75] = [ // Xenophobia
	[ vm_remove_all_cubes_up_to, PURPLE, 1 ],
	[ vm_remove_all_cubes_up_to, YELLOW, 1 ],
	[ vm_return ],
]

CODE[76] = [ // “O Save Us Senators, From Ourselves”
	[ vm_add_cubes_in_one_state_of_each_region, 1, RED ],
	[ vm_return ],
]

CODE[77] = [ // Emma Goldman
	[ vm_roll, 1, D6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 1 ],
	[ vm_return ],
]

CODE[78] = [ // The Great 1906 San Francisco Earthquake
	[ vm_remove_all_cubes, PURPLE_OR_YELLOW, us_states("California") ],
	[ vm_opponent_loses_buttons, 1 ],
	[ vm_return ],
]

CODE[79] = [ // A Threat to the Ideal of Womanhood
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, the Suffragist player must spend 1 BM in order to play a card as an event." ],
	[ vm_return ],
]

CODE[80] = [ // “Unwarranted, Unnecessary & Dangerous Interference”
	[ vm_add_cubes_in_one_state_of_each_region, 1, RED ],
	[ vm_return ],
]

CODE[81] = [ // Conservative Opposition
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, roll D6 instead of B4 when taking a Campaigning action." ],
	[ vm_return ],
]

CODE[82] = [ // The SSWSC
	[ vm_requires_persistent, REST_OF_GAME, find_card("Southern Strategy") ],
	[ vm_receive_buttons, 2 ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(SOUTH), 2 ],
	[ vm_return ],
]

CODE[83] = [ // Western Saloons Push Suffrage Veto
	[ vm_requires_not_persistent, REST_OF_GAME, find_card("Eighteenth Amendment") ],
	[ vm_add_cubes, 2, RED, us_states("Arizona") ],
	[ vm_add_cubes_in_each_of, 1, RED, us_states("New Mexico", "Nevada", "Utah") ],
	[ vm_return ],
]

CODE[84] = [ // Transcontinental Railroad
	[ vm_move_each_player_campaigner_free ],
	[ vm_campaigning_action ],
	[ vm_return ],
]

CODE[85] = [ // White Supremacy and the Suffrage Movement
	[ vm_requires_persistent, REST_OF_GAME, find_card("Southern Strategy") ],
	[ vm_remove_all_cubes_up_to, YELLOW, 4 ],
	[ vm_opponent_loses_buttons, 2 ],
	[ vm_return ],
]

CODE[86] = [ // Senator John Weeks
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("New Hampshire") ],
	[ vm_return ],
]

CODE[87] = [ // Senator “Cotton Ed” Smith
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("South Carolina") ],
	[ vm_return ],
]

CODE[88] = [ // War in Europe
	[ vm_remove_congress, 1 ],
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, the Suffragist player must spend 1 BM in order to take a Campaigning action." ],
	[ vm_return ],
]

CODE[89] = [ // 1918 Pandemic
	[ vm_remove_congress, 1 ],
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, the Suffragist player must spend 1 BM in order to play a card as an event." ],
	[ vm_return ],
]

CODE[90] = [ // The Business of Being a Woman
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[91] = [ // The Eden Sphinx
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[92] = [ // Big Liquor’s Big Money
	[ vm_requires_not_persistent, REST_OF_GAME, find_card("Eighteenth Amendment") ],
	[ vm_persistent, REST_OF_TURN, "For the remainder of the turn, roll D6 instead of B4 when taking a Campaigning action." ],
	[ vm_return ],
]

CODE[93] = [ // Red Scare
	[ vm_remove_all_cubes_up_to, PURPLE, 2 ],
	[ vm_return ],
]

CODE[94] = [ // Southern Women’s Rejection League
	[ vm_requires_persistent, REST_OF_GAME, find_card("Southern Strategy") ],
	[ vm_roll, 1, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), RED, region_us_states(SOUTH), 2 ],
	[ vm_return ],
]

CODE[95] = [ // United Daughters of the Confederacy
	[ vm_requires_persistent, REST_OF_GAME, find_card("Southern Strategy") ],
	[ vm_roll, 1, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), RED, region_us_states(SOUTH), 2 ],
	[ vm_return ],
]

CODE[96] = [ // Cheers to “No on Suffrage”
	[ vm_requires_not_persistent, REST_OF_GAME, find_card("Eighteenth Amendment") ],
	[ vm_roll, 1, D8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 2 ],
	[ vm_return ],
]

CODE[97] = [ // The Unnecessary Privilege
	[ vm_roll, 1, D6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.roll), RED, ANYWHERE, 1 ],
	[ vm_return ],
]

CODE[98] = [ // Voter Suppression
	[ vm_persistent, BALLOT_BOX, "The Opposition player rolls W8 instead of D6 during Final Voting." ],
	[ vm_return ],
]

CODE[99] = [ // Anti-Suffrage Riots
	[ vm_opponent_discard_2_random_draw_2 ],
	[ vm_return ],
]

CODE[100] = [ // American Constitutional League
	[ vm_spend_buttons, 4 ],
	[ vm_select_strategy_card ],
	[ vm_return ],
]

CODE[101] = [ // The Woman Patriot
	[ vm_receive_buttons, 3 ],
	[ vm_return ],
]

CODE[102] = [ // Governor Clement’s Veto
	[ vm_replace, GREEN_CHECK, 1, RED_X ],
	[ vm_return ],
]

CODE[103] = [ // Senator Henry Cabot Lodge
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("Massachusetts") ],
	[ vm_return ],
]

CODE[104] = [ // Senator William Borah
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, us_states("Utah") ],
	[ vm_return ],
]

CODE[105] = [ // Efficient Organizing
	[ vm_receive_buttons, 5 ],
	[ vm_return ],
]

CODE[106] = [ // Reconsideration
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_replace, RED_X, 2, PURPLE_OR_YELLOW ],
	[ vm_else ],
	[ vm_replace, GREEN_CHECK, 2, RED ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[107] = [ // Opposition Research
	[ vm_opponent_loses_buttons, ()=>(Math.ceil(opponent_buttons()/2)) ],
	[ vm_return ],
]

CODE[108] = [ // Change In Plans
	[ vm_show_opponents_hand_discard_1_draw_1 ],
	[ vm_return ],
]

CODE[109] = [ // Bellwether State
	[ vm_select_us_state ],
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_remove_all_cubes, RED, ()=>(game.vm.selected_us_state) ],
	[ vm_add_cubes, 4, PURPLE_OR_YELLOW, ()=>(game.vm.selected_us_state) ],
	[ vm_else ],
	[ vm_remove_all_cubes, PURPLE_OR_YELLOW, ()=>(game.vm.selected_us_state) ],
	[ vm_add_cubes, 4, RED, ()=>(game.vm.selected_us_state) ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[110] = [ // Superior Lobbying
	[ vm_roll_sixes, 4, D8 ],
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_congress, ()=>(game.vm.roll.filter(x => x >= 6).length) ],
	[ vm_else ],
	[ vm_remove_congress, ()=>(game.vm.roll.filter(x => x >= 6).length) ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[111] = [ // The Winning Plan
	[ vm_draw_6_play_1 ],
	[ vm_place_any_on_top_of_draw ],
	[ vm_return ],
]

CODE[112] = [ // Regional Focus
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_per_state_in_any_one_region, 1, PURPLE_OR_YELLOW ],
	[ vm_else ],
	[ vm_add_cubes_per_state_in_any_one_region, 1, RED ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[113] = [ // Eye on the Future
	[ vm_select_1_card_from_draw_deck_play_event_shuffle ],
	[ vm_return ],
]

CODE[114] = [ // Transportation
	[ vm_move_each_player_campaigner_free ],
	[ vm_campaigning_action ],
	[ vm_return ],
]

CODE[115] = [ // Counter Strat
	[ vm_counter_strat ],
	[ vm_return ],
]

CODE[116] = [ // National Focus
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_in_one_state_of_each_region, 2, PURPLE_OR_YELLOW ],
	[ vm_else ],
	[ vm_add_cubes_in_one_state_of_each_region, 2, RED ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[117] = [ // California
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[118] = [ // Utah
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_limit, 6, PURPLE_OR_YELLOW, region_us_states(WEST), 2 ],
	[ vm_else ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(WEST), 2 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[119] = [ // Montana
	[ vm_receive_buttons, 2 ],
	[ vm_return ],
]

CODE[120] = [ // Kansas
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_limit, 6, PURPLE_OR_YELLOW, region_us_states(PLAINS), 2 ],
	[ vm_else ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(PLAINS), 2 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[121] = [ // Texas
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_limit, 6, PURPLE_OR_YELLOW, region_us_states(SOUTH), 2 ],
	[ vm_else ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(SOUTH), 2 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[122] = [ // Georgia
	[ vm_receive_buttons, 2 ],
	[ vm_return ],
]

CODE[123] = [ // Illinois
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_limit, 6, PURPLE_OR_YELLOW, region_us_states(MIDWEST), 2 ],
	[ vm_else ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(MIDWEST), 2 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[124] = [ // Ohio
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[125] = [ // Pennsylvania
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_limit, 6, PURPLE_OR_YELLOW, region_us_states(ATLANTIC_APPALACHIA), 2 ],
	[ vm_else ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(ATLANTIC_APPALACHIA), 2 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[126] = [ // Virginia
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[127] = [ // New York
	[ vm_if, ()=>(game.active === SUF) ],
	[ vm_add_cubes_limit, 6, PURPLE_OR_YELLOW, region_us_states(NORTHEAST), 2 ],
	[ vm_else ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(NORTHEAST), 2 ],
	[ vm_endif ],
	[ vm_return ],
]

CODE[128] = [ // New Jersey
	[ vm_receive_buttons, 2 ],
	[ vm_return ],
]
// #endregion
