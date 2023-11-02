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

exports.scenarios = [ "Standard" ]
exports.roles = [ SUF, OPP ]

exports.setup = function (seed, _scenario, _options) {
	game = {
		seed: seed,
		log: [],
		undo: [],
		active: null,
		state: null,

		turn: 0,
		round: 0,
		congress: 0,
		us_states: new Array(us_states_count).fill(0),

		strategy_deck: [],
		strategy_draw: [],
		states_draw: [],

		persisted_turn: [],
		persisted_game: [],
		persisted_ballot: [],

		support_deck: [],
		support_discard: [],
		support_hand: [],
		support_claimed: [],
		purple_campaigner: [0, 0],
		yellow_campaigner: [0, 0],
		support_buttons: 0,

		opposition_deck: [],
		opposition_discard: [],
		opposition_hand: [],
		opposition_claimed: [],
		opposition_campaigner: [0, 0],
		opposition_buttons: 0,
	}

	log_h1("Votes for Women")
	setup_game()
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
		console.log("PUSH", c)
		game.strategy_deck.push(c)
	}
	for (let c = first_states_card; c <= last_states_card; ++c)
		game.states_draw.push(c)

	shuffle(game.states_draw)
	shuffle(game.strategy_deck)

	game.states_draw.splice(-3) // 3 states card aren't used
	log_h2("States Cards")
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

function draw_card(deck) {
	if (deck.length === 0)
		throw Error("can't draw from empty deck")
	return deck.splice(-1)
}

function start_turn() {
	game.turn += 1
	log_h1("Turn " + game.turn)

	game.active = SUF
	goto_planning_phase()
}

function goto_planning_phase() {
	log_h2("Planning Phase")
	game.state = "planning_phase"
}

states.planning_phase = {
	inactive: "to do Planning Phase",
	prompt() {
		view.prompt = "Planning Phase."
		gen_action("draw")
	},
	draw() {
		/*
		Each player draws six cards from their Draw deck.
		When added to either their Start card (on
		Turn 1) or their card held from the previous turn
		(on Turns 2-6), their hand should begin with
		seven cards.
		*/

		for (let n = 0; n < 6; ++n) {
			game.support_hand.push(draw_card(game.support_deck))
			game.opposition_hand.push(draw_card(game.opposition_deck))
		}

		log("Suffragist drew 7 cards.")
		log("Opposition drew 7 cards.")

		end_planning_phase()
	}
}

function end_planning_phase() {
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
	log_h2("Strategy Phase")
	game.state = "strategy_phase"
}

states.strategy_phase = {
	inactive: "to do Strategy Phase",
	prompt() {
		view.prompt = "Strategy Phase: TODO"
		gen_action("done")
	},
	done() {
		goto_operations_phase()
	}
}

function goto_operations_phase() {
	log_h2("Operations Phase")
	game.state = "operations_phase"
}

states.operations_phase = {
	inactive: "to do Operations Phase",
	prompt() {
		view.prompt = "Operations Phase: TODO"
		gen_action("done")
	},
	done() {
		goto_cleanup_phase()
	}
}

function goto_cleanup_phase() {
	log_h2("Cleanup Phase")
	game.state = "cleanup_phase"
}

states.cleanup_phase = {
	inactive: "to do Cleanup Phase",
	prompt() {
		view.prompt = "Cleanup Phase: TODO"
		gen_action("done")
	},
	done() {
		end_cleanup_phase()
	}
}

function end_cleanup_phase() {
	if (game.turn < 6) {
		start_turn()
	} else {
		goto_game_over(OPP, "Opposition wins.")
	}
}

// public functions

function gen_action(action, argument) {
	if (!(action in view.actions))
		view.actions[action] = []
	view.actions[action].push(argument)
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

exports.resign = function (state, player) {
	game = state
	if (game.state !== "game_over") {
		if (player === SUF)
			goto_game_over(OPP, "Suffragist resigned.")
		if (player === OPP)
			goto_game_over(SUF, "Opposition resigned.")
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
}

// === VIEW ===

exports.view = function(state, player) {
	game = state

	view = {
		log: game.log,
		active: game.active,
		prompt: null,
		actions: null,

		turn: game.turn,
		round: game.round,
		congress: game.congress,
		states: game.states,

		strategy_deck: game.strategy_deck.length,
		strategy_draw: game.strategy_draw,
		states_draw: game.states_draw,

		persisted_turn: game.persisted_turn,
		persisted_game: game.persisted_game,
		persisted_ballot: game.persisted_ballot,

		support_deck: game.support_deck.length,
		support_discard: game.support_discard, // top_discard?
		support_hand: game.support_hand.length,
		support_claimed: game.support_claimed,
		purple_campaigner: game.purple_campaigner,
		yellow_campaigner: game.yellow_campaigner,
		support_buttons: game.support_buttons,

		opposition_deck: game.opposition_deck.length,
		opposition_discard: game.opposition_discard,  // top_discard?
		opposition_hand: game.opposition_hand.length,
		opposition_claimed: game.opposition_claimed,
		opposition_campaigner: game.opposition_campaigner,
		opposition_buttons: game.opposition_buttons,

		hand: 0,
	}

	if (player === SUF) {
		view.hand = game.support_hand
	} else if (player === OPP) {
		view.hand = game.opposition_hand
	}

	if (game.state === "game_over") {
		view.prompt = game.victory
	} else if (player === "Observer" || (game.active !== player && game.active !== "Both")) {
		if (states[game.state]) {
			let inactive = states[game.state].inactive
			view.prompt = `Waiting for ${game.active} to ${inactive}...`
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


// === LOGGING ===

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

function log_sep() {
	log(".hr")
}

// === COMMON LIBRARY ===

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

// === GENERATED EVENT CODE ===
