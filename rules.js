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

const WEST = 1
const PLAINS = 2
const SOUTH = 3
const MIDWEST = 4
const ATLANTIC_APPALACHIA = 5
const NORTHEAST = 6

const REGION_NAMES = [
    null,
    "West",
    "Plains",
    "South",
    "Midwest",
    "Atlantic & Appalachia",
    "Northeast"
]

const {	CARDS } = require("./cards.js")
const {	US_STATES } = require("./data.js")

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

function draw_card(deck) {
	if (deck.length === 0)
		throw Error("can't draw from empty deck")
	return deck.pop()
}

function player_hand() {
	if (game.active === SUF) {
		return game.support_hand
	} else if (game.active === OPP) {
		return game.opposition_hand
	}
	return []
}

function player_claimed() {
	if (game.active === SUF) {
		return game.support_claimed
	} else {
		return game.opposition_claimed
	}
}

function player_discard() {
	if (game.active === SUF) {
		return game.support_discard
	} else {
		return game.opposition_discard
	}
}

function is_player_claimed_card(c) {
	return player_claimed().includes(c)
}

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

		turn: 0,
		round: 0,
		congress: 0,
		us_states: new Array(us_states_count).fill(0),

		strategy_deck: [],
		strategy_draw: [],
		states_draw: [],

		persistent_turn: [],
		persistent_game: [],
		persistent_ballot: [],

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

		out_of_play: []
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

	game.out_of_play.push(...game.states_draw.splice(-3)) // 3 states card aren't used
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

// #endregion

// #region VIEW

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

		persistent_turn: game.persistent_turn,
		persistent_game: game.persistent_game,
		persistent_ballot: game.persistent_ballot,

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

		out_of_play: game.out_of_play,

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

// #endregion

// #region FLOW OF PLAY

function start_turn() {
	game.turn += 1
	log_h1("Turn " + game.turn)

	game.active = SUF
	goto_planning_phase()
}

function goto_planning_phase() {
	log_h2("Planning")
	game.state = "planning_phase"
}

states.planning_phase = {
	inactive: "do Planning.",
	prompt() {
		view.prompt = "Planning."
		gen_action("draw")
	},
	draw() {
		/*
		Each player draws six cards from their Draw deck. When added to either their Start card (on
		Turn 1) or their card held from the previous turn (on Turns 2-6), their hand should begin with
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
			if (game.support_buttons > 0) {
				gen_action("commit_1_button")
			}
			gen_action("done")
		} else {
			view.prompt = `Strategy: Suffragist committed ${pluralize(game.support_committed, 'button')}.`
			gen_action("defer")
			view.actions.match = game.opposition_buttons >= game.support_committed
			view.actions.supersede = game.opposition_buttons > game.support_committed
		}
	},
	commit_1_button() {
		push_undo()
		game.support_buttons -= 1
		game.support_committed += 1

	},
	done() {
		log(`Suffragist committed ${pluralize(game.support_committed, 'button')}.`)
		game.active = OPP
	},
	defer() {
		log(`Opposition deferred.`)
		game.active = SUF
		game.state = 'strategy_phase_select_strategy_card'
	},
	match () {
		log(`Opposition matched.`)
		game.opposition_buttons -= game.support_committed
		end_strategy_phase()
	},
	supersede() {
		log(`Opposition superseded.`)
		game.opposition_buttons -= (game.support_committed + 1)
		game.state = 'strategy_phase_select_strategy_card'
	}
}

states.strategy_phase_select_strategy_card = {
	inactive: "select Strategy card.",
	prompt() {
		view.prompt = `Select Strategy card.`
		for (let c of game.strategy_draw)
			gen_action("card", c)
	},
	card(c) {
		log(`${game.active} selected C${c}.`)

		array_remove_item(game.strategy_draw, c)
		player_claimed().push(c)
		game.strategy_draw.push(draw_card(game.strategy_deck))

		end_strategy_phase()
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
	begin_player_round()
}


function count_player_active_campaigners() {
	if (game.active === SUF) {
		return game.purple_campaigner.filter(value => value !== 0).length + game.yellow_campaigner.filter(value => value !== 0).length
	} else {
		return game.opposition_campaigner.filter(value => value !== 0).length
	}
}

function has_player_active_campaigners() {
	if (game.active === SUF) {
		return game.purple_campaigner.some(value => value !== 0) || game.yellow_campaigner.some(value => value !== 0)
	} else {
		return game.opposition_campaigner.some(value => value !== 0)
	}
}

function remove_claimed_card(c) {
	array_remove_item(player_claimed(), c)
	game.out_of_play.push(c)
}

function discard_card_from_hand(c) {
	array_remove_item(player_hand(), c)
	player_discard().push(c)
}

function end_play_card(c) {
	clear_undo()
	if (is_player_claimed_card(c)) {
		game.has_played_claimed = 1
		remove_claimed_card(c)
	} else {
		game.has_played_hand = 1
		discard_card_from_hand(c)
	}
	game.state = "operations_phase"
}

states.operations_phase = {
	inactive: "Play a Card.",
	prompt() {
		view.prompt = "Operations: Play a Card."

		if (!game.has_played_hand) {
			for (let c of player_hand()) {
				gen_action("card_event", c)
				if (has_player_active_campaigners()) {
					gen_action("card_campaigning", c)
					gen_action("card_organizing", c)
					gen_action("card_lobbying", c)
				}
			}
		}

		if (!game.has_played_claimed) {
			// only one claimed can be played per turn
			for (let c of player_claimed()) {
				// TODO is this the right type of event?
				gen_action("card_event", c)
			}
		}
		if (game.has_played_hand)
			gen_action("done")
	},
	card_event(c) {
		push_undo()
		log(`Played C${c} as Event`)
		goto_play_event(c)
	},
	card_campaigning(c) {
		push_undo()
		log(`Played C${c} for Campaigning Action`)
		end_play_card(c)
	},
	card_organizing(c) {
		push_undo()
		log(`Played C${c} for Organizing Action`)
		end_play_card(c)
	},
	card_lobbying(c) {
		push_undo()
		log(`Played C${c} for Lobbying Action`)
		end_play_card(c)
	},
	done() {
		end_player_round()
	}
}

function begin_player_round() {
	log_round(`Round ${game.round}`)
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
			return
		}
	}
	begin_player_round()
}

function goto_cleanup_phase() {
	log_h2("Cleanup")
	game.state = "cleanup_phase"
}

states.cleanup_phase = {
	inactive: "do Cleanup.",
	prompt() {
		view.prompt = "Cleanup."
		gen_action("done")
	},
	done() {
		end_cleanup_phase()
	}
}

function cleanup_persistent_turn_cards() {
	// any cards in the “Cards in Effect for the Rest of the Turn box” are placed in the appropriate discard pile.
	for (let c of game.persistent_turn) {
		if (is_support_card(c)) {
			game.support_discard.push(c)
		} else if (is_opposition_card(c)) {
			game.opposition_discard.push(c)
		} else {
			throw Error(`Unexpected card ${c} on persistent_turn`)
		}
	}
	game.persistent_turn = []
}

function end_cleanup_phase() {
	if (game.turn < 6) {
		cleanup_persistent_turn_cards()

		if (game.support_hand.length !== 1)
			throw Error("ASSERT game.support_hand.length === 1")
		if (game.opposition_hand.length !== 1)
			throw Error("ASSERT game.opposition_hand.length === 1")

		start_turn()
		return
	}

	// TODO
	// At the end of Turn 6, if the Nineteenth
	// Amendment has not been sent to the states for
	// ratification, the game ends in an Opposition victory.
	// If the Nineteenth Amendment has been sent to the
	// states for ratification but neither player has won
	// the necessary number of states for victory, the game
	// advances to Final Voting. Any cards in the “Cards
	// in Effect for the Rest of the Turn box” and “Cards in
	// Effect for the Rest of the Game box” are placed in
	// the appropriate discard pile.

	goto_game_over(OPP, "Opposition wins.")
}

// #endregion

// #region EVENTS

function goto_play_event(c) {
	// update_presence_and_control()
	goto_vm(c)
}

function end_event() {
	let c = game.vm.fp
	console.log('end_event', c)
	game.vm = null
	end_play_card(c)
}

function end_crisis_breach_objective() {
	goto_objective_card_play()
}

function goto_vm(proc) {
	game.state = "vm"
	game.vm = {
		prompt: 0,
		fp: proc,
		ip: 0,
	}
	vm_exec()
}

function event_prompt(str) {
	if (typeof str === "undefined")
		str = CODE[game.vm.fp][game.vm.prompt][1]
	if (typeof str === "function")
		str = str()
	view.prompt = CARDS[game.vm.fp].title + ": " + str
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

function vm_exec() {
	vm_inst(0)()
}

function vm_next() {
	game.vm.ip ++
	vm_exec()
}

function vm_asm() {
	vm_operand(1)
	vm_next()
}

function vm_prompt() {
	game.vm.prompt = game.vm.ip
	vm_next()
}

function vm_goto() {
	game.state = vm_operand(1)
}

function vm_return() {
	game.state = "vm_return"
}

states.vm_return = {
	inactive: "finish playing the event",
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

function vm_endswitch() {
	vm_next()
}

function vm_switch() {
	game.vm.choice = null
	game.state = "vm_switch"
}

function vm_case() {
	if (game.vm.choice === vm_operand(1)) {
		vm_next()
	} else {
		do
			++game.vm.ip
		while (vm_inst(0) !== vm_case && vm_inst(0) !== vm_endswitch)
		vm_exec()
	}
}

function vm_ops() {
	goto_operations(vm_operand(1), vm_operand_spaces(2))
}

function vm_increase_revolutionary_momentum() {
	if (game.red_momentum < 3)
		game.state = "vm_increase_revolutionary_momentum"
	else
		vm_next()
}

function vm_increase_prussian_collaboration() {
	if (game.blue_momentum < 3)
		game.state = "vm_increase_prussian_collaboration"
	else
		vm_next()
}

function vm_may_increase_revolutionary_momentum() {
	if (game.red_momentum < 3)
		game.state = "vm_may_increase_revolutionary_momentum"
	else
		vm_next()
}

function vm_may_increase_prussian_collaboration() {
	if (game.blue_momentum < 3)
		game.state = "vm_may_increase_prussian_collaboration"
	else
		vm_next()
}

function vm_decrease_revolutionary_momentum() {
	if (game.red_momentum > 0)
		game.state = "vm_decrease_revolutionary_momentum"
	else
		vm_next()
}

function vm_decrease_prussian_collaboration() {
	if (game.blue_momentum > 0)
		game.state = "vm_decrease_prussian_collaboration"
	else
		vm_next()
}

function vm_operand_spaces(x) {
	let s = vm_operand(x)
	if (typeof s === "number")
		return [ s ]
	return s
}

function vm_remove_up_to() {
	game.vm.upto = 1
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2)
	goto_vm_remove()
}

function vm_remove() {
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2)
	goto_vm_remove()
}

function vm_remove_own() {
	game.vm.spaces = vm_operand_spaces(1)
	game.state = "vm_remove_own"
}

function vm_replace_up_to() {
	game.vm.upto = 1
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2)
	game.state = "vm_replace"
	goto_vm_replace()
}

function vm_replace_different() {
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2).slice() // make a copy for safe mutation
	game.state = "vm_replace_different"
}

function vm_replace() {
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2)
	goto_vm_replace()
}

function vm_place_removed_up_to() {
	game.vm.removed = 1
	game.vm.upto = 1
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2)
	goto_vm_place()
}

function vm_place_up_to() {
	game.vm.upto = 1
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2)
	goto_vm_place()
}

function vm_place() {
	game.vm.count = vm_operand(1)
	game.vm.spaces = vm_operand_spaces(2)
	goto_vm_place()
}

function vm_may_place_disc() {
	game.vm.upto = 1
	game.vm.count = 1
	game.vm.spaces = vm_operand_spaces(1)
	game.state = "vm_place_disc"
	goto_vm_place_disc()
}

function vm_place_disc() {
	game.vm.count = 1
	game.vm.spaces = vm_operand_spaces(1)
	goto_vm_place_disc()
}

function vm_move_up_to() {
	game.vm.count = vm_operand(1)
	game.vm.a = vm_operand_spaces(2)
	game.vm.b = vm_operand_spaces(3)
	goto_vm_move()
}

// #endregion

// #region EVENT STATES

states.vm_switch = {
	inactive: "choose an event option",
	prompt() {
		event_prompt()
		for (let choice of vm_operand(1))
			view.actions[choice] = 1
	},
	place() {
		push_undo()
		game.vm.choice = "place"
		vm_next()
	},
	replace() {
		push_undo()
		game.vm.choice = "replace"
		vm_next()
	},
	remove() {
		push_undo()
		game.vm.choice = "remove"
		vm_next()
	},
	momentum() {
		push_undo()
		game.vm.choice = "momentum"
		vm_next()
	},
	ops() {
		push_undo()
		game.vm.choice = "ops"
		vm_next()
	},
	political() {
		push_undo()
		game.vm.choice = "political"
		vm_next()
	},
	military() {
		push_undo()
		game.vm.choice = "military"
		vm_next()
	},
	public_opinion() {
		push_undo()
		game.vm.choice = "public_opinion"
		vm_next()
	},
	paris() {
		push_undo()
		game.vm.choice = "paris"
		vm_next()
	},
}

states.vm_increase_revolutionary_momentum = {
	inactive: "increase Revolutionary Momentum",
	prompt() {
		event_prompt("Increase Revolutionary Momentum.")
		view.actions.red_momentum = 1
	},
	red_momentum() {
		push_undo()
		increase_revolutionary_momentum()
	},
}

states.vm_may_increase_revolutionary_momentum = {
	inactive: "increase Revolutionary Momentum",
	prompt() {
		event_prompt("Increase Revolutionary Momentum.")
		view.actions.red_momentum = 1
		view.actions.pass = 1
	},
	red_momentum() {
		push_undo()
		increase_revolutionary_momentum()
	},
	pass() {
		push_undo()
		vm_next()
	},
}

states.vm_increase_prussian_collaboration = {
	inactive: "increase Prussian Collaboration",
	prompt() {
		event_prompt("Increase Prussian Collaboration.")
		view.actions.blue_momentum = 1
	},
	blue_momentum() {
		push_undo()
		increase_prussian_collaboration()
	},
}

states.vm_may_increase_prussian_collaboration = {
	inactive: "increase Prussian Collaboration",
	prompt() {
		event_prompt("Increase Prussian Collaboration.")
		view.actions.blue_momentum = 1
		view.actions.pass = 1
	},
	blue_momentum() {
		push_undo()
		increase_prussian_collaboration()
	},
	pass() {
		push_undo()
		vm_next()
	},
}

states.vm_decrease_revolutionary_momentum = {
	inactive: "decrease Revolutionary Momentum",
	prompt() {
		event_prompt("Decrease Revolutionary Momentum.")
		view.actions.red_momentum = 1
	},
	red_momentum() {
		push_undo()
		decrease_revolutionary_momentum()
	},
}

states.vm_decrease_prussian_collaboration = {
	inactive: "decrease Prussian Collaboration",
	prompt() {
		event_prompt("Decrease Prussian Collaboration.")
		view.actions.blue_momentum = 1
	},
	blue_momentum() {
		push_undo()
		decrease_prussian_collaboration()
	},
}

function can_vm_place() {
	for (let s of game.vm.spaces)
		if (can_place_cube(s, game.vm.removed))
			return true
	return false
}

function goto_vm_place() {
	if (can_vm_place(game.vm.removed))
		game.state = "vm_place"
	else
		vm_next()
}

states.vm_place = {
	inactive: "place a cube",
	prompt() {
		event_prompt()
		if (game.vm.upto)
			view.actions.skip = 1
		for (let s of game.vm.spaces)
			if (can_place_cube(s, game.vm.removed))
				gen_action_space(s)
	},
	space(s) {
		push_undo()
		place_cube(s, game.vm.removed)
		if (game.active === COMMUNE)
			log("Placed RC in S" + s + ".")
		else
			log("Placed BC in S" + s + ".")
		if (--game.vm.count === 0 || !can_vm_place(game.vm.removed))
			vm_next()
	},
	skip() {
		push_undo()
		vm_next()
	},
}

function can_vm_place_disc() {
	for (let s of game.vm.spaces)
		if (can_place_disc(s))
			return true
	return false
}

function goto_vm_place_disc() {
	if (can_vm_place_disc()) {
		if (find_available_disc() < 0)
			game.state = "vm_move_disc"
		else
			game.state = "vm_place_disc"
	} else {
		vm_next()
	}
}

states.vm_move_disc = {
	inactive: "place a disc",
	prompt() {
		event_prompt("Remove a disc to place it elsewhere.")
		if (game.vm.upto)
			view.actions.skip = 1
		if (game.active === COMMUNE)
			for (let p = first_commune_disc; p <= last_commune_disc; ++p)
				gen_action_piece(p)
		else
			for (let p = first_versailles_disc; p <= last_versailles_disc; ++p)
				gen_action_piece(p)
	},
	piece(p) {
		push_undo()
		let s = game.pieces[p]
		if (game.active === COMMUNE)
			log("Moved RD from S" + s + ".")
		else
			log("Moved BD from S" + s + ".")
		remove_piece(p)
		game.state = "vm_place_disc"
	},
	skip() {
		push_undo()
		vm_next()
	},
}

states.vm_place_disc = {
	inactive: "place a disc",
	prompt() {
		event_prompt()
		if (game.vm.upto)
			view.actions.skip = 1
		for (let s of game.vm.spaces)
			if (can_place_disc(s))
				gen_action_space(s)
	},
	space(s) {
		push_undo()
		if (game.active === COMMUNE)
			log("Placed RD in S" + s + ".")
		else
			log("Placed BD in S" + s + ".")
		place_disc(s)
		vm_next()
	},
	skip() {
		push_undo()
		vm_next()
	},
}

function can_vm_replace() {
	for (let s of game.vm.spaces)
		if (can_replace_cube(s))
			return true
	return false
}

function goto_vm_replace() {
	if (can_vm_replace())
		game.state = "vm_replace"
	else
		vm_next()
}

states.vm_replace = {
	inactive: "replace a cube",
	prompt() {
		event_prompt()
		if (game.vm.upto)
			view.actions.skip = 1
		for (let s of game.vm.spaces)
			if (can_replace_cube(s))
				for_each_enemy_cube(s, gen_action_piece)
	},
	piece(p) {
		push_undo()
		let s = game.pieces[p]
		replace_cube(p)
		log("Replaced " + piece_abbr(p) + " in S" + s + ".")
		if (--game.vm.count === 0 || !can_vm_replace())
			vm_next()
	},
	skip() {
		push_undo()
		vm_next()
	},
}

function can_vm_remove() {
	for (let s of game.vm.spaces)
		if (can_remove_cube(s))
			return true
	return false
}

function goto_vm_remove() {
	if (can_vm_remove())
		game.state = "vm_remove"
	else
		vm_next()
}

states.vm_remove = {
	inactive: "remove a cube",
	prompt() {
		event_prompt()
		if (game.vm.upto)
			view.actions.skip = 1
		for (let s of game.vm.spaces)
			if (can_remove_cube(s))
				for_each_enemy_cube(s, gen_action_piece)
	},
	piece(p) {
		push_undo()
		let s = game.pieces[p]
		if (game.active === COMMUNE)
			log("Removed BC from S" + s + ".")
		else
			log("Removed RC from S" + s + ".")
		remove_piece(p)
		if (--game.vm.count === 0 || !can_vm_remove())
			vm_next()
	},
	skip() {
		push_undo()
		vm_next()
	},
}

states.vm_remove_own = {
	inactive: "remove a cube",
	prompt() {
		event_prompt()
		for (let s of game.vm.spaces)
			for_each_friendly_cube(s, gen_action_piece)
	},
	piece(p) {
		push_undo()
		let s = game.pieces[p]
		if (game.active === COMMUNE)
			log("Removed RC from S" + s + ".")
		else
			log("Removed BC from S" + s + ".")
		remove_piece(p)
		vm_next()
	},
}

function can_vm_move() {
	let from = false
	let to = false
	for (let s of game.vm.a)
		if (!game.vm.b.includes(s) && has_friendly_cube(s))
			from = true
	for (let s of game.vm.b)
		if (count_friendly_cubes(s) < 4)
			to = true
	return from && to
}

function goto_vm_move() {
	game.who = -1
	if (can_vm_move())
		game.state = "vm_move"
	else
		vm_next()
}

states.vm_move = {
	inactive: "move a cube",
	prompt() {
		event_prompt()
		view.actions.skip = 1
		if (game.who < 0) {
			for (let s of game.vm.a)
				if (!game.vm.b.includes(s))
					for_each_friendly_cube(s, gen_action_piece)
		} else {
			game.selected_cube = game.who
			for (let s of game.vm.b)
				if (count_friendly_cubes(s) < 4)
					gen_action_space(s)
		}
	},
	piece(p) {
		push_undo()
		game.who = p
	},
	space(s) {
		let from = game.pieces[game.who]
		move_piece(game.who, s)
		log("Moved " + piece_abbr(game.who) + " from S" + from + " to S" + s + ".")
		game.who = -1
		if (--game.vm.count === 0 || !can_vm_move())
			vm_next()
	},
	skip() {
		push_undo()
		vm_next()
	},
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
		log(".h3.suf " + msg)
	else
		log(".h3.opp " + msg)
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

// #endregion

// #region GENERATED EVENT CODE
const CODE = []

CODE[1] = [ // Seneca Falls Convention
	[ vm_add_campaigner, 1, PURPLE, NORTHEAST ],
	[ vm_add_campaigner, 1, YELLOW, NORTHEAST ],
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes, 2, PURPLE_OR_YELLOW, "New, York" ],
	[ vm_return ],
]

CODE[2] = [ // Property Rights for Women
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[3] = [ // Frances Willard
	[ vm_add_congress, 1 ],
	[ vm_receive_badges, 2 ],
	[ vm_return ],
]

CODE[4] = [ // A Vindication of the Rights of Woman
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[5] = [ // Union Victory
	[ vm_requires_persistent, "The, Civil, War" ],
	[ vm_roll_d6_success ],
	[ vm_receive_badges, 2 ],
	[ vm_discard_persistent, "The, Civil, War" ],
	[ vm_return ],
]

CODE[6] = [ // Fifteenth Amendment
	[ vm_requires_not_persistent, "The, Civil, War" ],
	[ vm_roll_d6_success ],
	[ vm_add_congress, 2 ],
	[ vm_add_cubes_limit, 8, PURPLE_OR_YELLOW, anywhere(), 2 ],
	[ vm_return ],
]

CODE[7] = [ // Reconstruction
	[ vm_requires_not_persistent, "The, Civil, War" ],
	[ vm_requires_persistent, "Fifteenth, Amendment" ],
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, ["Virginia",, "North, Carolina",, "South, Carolina",, "Georgia",, "Florida",, "Alabama",, "Mississippi",, "Tennessee",, "Arkansas",, "Louisiana",, "Texas"] ],
	[ vm_return ],
]

CODE[8] = [ // Petition to Congress
	[ vm_add_congress, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[9] = [ // Lucy Stone
	[ vm_receive_badges, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[10] = [ // Susan B. Anthony Indicted
	[ vm_receive_badges, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[11] = [ // Anna Dickinson
	[ vm_receive_badges, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[12] = [ // Frederick Douglass
	[ vm_roll_d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), PURPLE_OR_YELLOW, region_us_states(NORTHEAST), 1 ],
	[ vm_return ],
]

CODE[13] = [ // Frances Harper
	[ vm_return ],
]

CODE[14] = [ // The Union Signal
	[ vm_receive_badges, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[15] = [ // Sojourner Truth
	[ vm_roll_d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), PURPLE_OR_YELLOW, region_us_states(MIDWEST), 1 ],
	[ vm_return ],
]

CODE[16] = [ // Pioneer Women
	[ vm_roll_d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), PURPLE_OR_YELLOW, region_us_states(PLAINS), 1 ],
	[ vm_return ],
]

CODE[17] = [ // Women to the Polls
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, ["New, Jersey",, "Pennsylvania",, "Delaware"] ],
	[ vm_return ],
]

CODE[18] = [ // National Woman’s Rights Convention
	[ vm_add_congress, 1 ],
	[ vm_receive_badges, 1 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[19] = [ // National American Woman Suffrage Association
	[ vm_add_campaigner, 1, PURPLE, ATLANTIC_APPALACHIA ],
	[ vm_receive_badges, 3 ],
	[ vm_return ],
]

CODE[20] = [ // Jeannette Rankin
	[ vm_roll_d6_success ],
	[ vm_add_congress, 1 ],
	[ vm_add_cubes, 4, PURPLE_OR_YELLOW, "Montana" ],
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, region_us_states_except(PLAINS,, "Montana") ],
	[ vm_return ],
]

CODE[21] = [ // Ida B. Wells-Barnett
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes, 2, PURPLE_OR_YELLOW, "Illinois" ],
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, region_us_states_except(MIDWEST,, "Illinois") ],
	[ vm_return ],
]

CODE[22] = [ // The Club Movement
	[ vm_receive_badges, 4 ],
	[ vm_return ],
]

CODE[23] = [ // Equality League of Self-Supporting Women
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[24] = [ // Emmeline Pankhurst
	[ vm_roll_2d6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), PURPLE_OR_YELLOW, anywhere(), 1 ],
	[ vm_return ],
]

CODE[25] = [ // “Debate Us, You Cowards!”
	[ vm_roll_2d6 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 2 ],
	[ vm_return ],
]

CODE[26] = [ // Carrie Chapman Catt
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[27] = [ // Alice Paul & Lucy Burns
	[ vm_roll_2d6 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 2 ],
	[ vm_return ],
]

CODE[28] = [ // Inez Milholland
	[ vm_add_congress, 1 ],
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes_in_one_state_of_each_region, 1, PURPLE_OR_YELLOW ],
	[ vm_return ],
]

CODE[29] = [ // Farmers for Suffrage
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, ["Wisconsin",, "Minnesota",, "Iowa",, "North, Dakota",, "South, Dakota"] ],
	[ vm_return ],
]

CODE[30] = [ // Zitkala-Ša
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, ["North, Dakota",, "South, Dakota",, "Nebraska",, "Montana",, "Wyoming"] ],
	[ vm_return ],
]

CODE[31] = [ // Helen Keller
	[ vm_roll_2d6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), PURPLE_OR_YELLOW, anywhere(), 2 ],
	[ vm_return ],
]

CODE[32] = [ // Maria de Lopez
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, ["California",, "Nevada",, "Arizona"] ],
	[ vm_return ],
]

CODE[33] = [ // Marie Louise Bottineau Baldwin
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[34] = [ // The West’s Awakening
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, region_us_states(WEST) ],
	[ vm_return ],
]

CODE[35] = [ // Southern Strategy
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes_in_each_of, 2, PURPLE_OR_YELLOW, region_us_states(SOUTH) ],
	[ vm_select_strategy_card ],
	[ vm_return ],
]

CODE[36] = [ // Women’s Trade Union League
	[ vm_add_cubes_in_each_of, 1, YELLOW, region_us_states(ATLANTIC_APPALACHIA) ],
	[ vm_add_congress, 1 ],
	[ vm_receive_badges, 2 ],
	[ vm_return ],
]

CODE[37] = [ // The Young Woman Citizen
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[38] = [ // 1918 Midterm Elections
	[ vm_roll_d6_success ],
	[ vm_add_congress, 3 ],
	[ vm_return ],
]

CODE[39] = [ // Woodrow Wilson
	[ vm_spend_badges, 4 ],
	[ vm_select_strategy_card ],
	[ vm_return ],
]

CODE[40] = [ // Maud Wood Park
	[ vm_add_congress, 2 ],
	[ vm_return ],
]

CODE[41] = [ // Voter Registration
	[ vm_persistent, BALLOT_BOX ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[42] = [ // Processions for Suffrage
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[43] = [ // Prison Tour Special
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[44] = [ // Victory Map
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, region_us_states(WEST,, PLAINS) ],
	[ vm_add_cubes_in_each_of, 1, PURPLE_OR_YELLOW, ["Texas",, "Arkansas",, "Illinois",, "Michigan",, "New, York",, "Vermont"] ],
	[ vm_return ],
]

CODE[45] = [ // Women and World War I
	[ vm_requires_persistent, "War, in, Europe" ],
	[ vm_add_cubes_limit, 10, PURPLE_OR_YELLOW, anywhere(), 2 ],
	[ vm_return ],
]

CODE[46] = [ // Eighteenth Amendment
	[ vm_persistent, REST_OF_GAME ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[47] = [ // Mary McLeod Bethune
	[ vm_roll_2d8 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 2 ],
	[ vm_return ],
]

CODE[48] = [ // Make a Home Run for Suffrage
	[ vm_roll_2d8 ],
	[ vm_remove_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 2 ],
	[ vm_return ],
]

CODE[49] = [ // Mary Church Terrell
	[ vm_roll_2d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), PURPLE_OR_YELLOW, anywhere(), 2 ],
	[ vm_return ],
]

CODE[50] = [ // Tea Parties for Suffrage
	[ vm_add_congress, 1 ],
	[ vm_receive_badges, 4 ],
	[ vm_return ],
]

CODE[51] = [ // Dr. Mabel Ping-Hua Lee
	[ vm_roll_2d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), PURPLE_OR_YELLOW, anywhere(), 2 ],
	[ vm_return ],
]

CODE[52] = [ // Miss Febb Wins the Last Vote
	[ vm_persistent, BALLOT_BOX ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[53] = [ // The Patriarchy
	[ vm_add_campaigner, 1, RED, SOUTH ],
	[ vm_receive_badges, 4 ],
	[ vm_add_cubes_in_each_of, 1, RED, region_us_states(NORTHEAST,, ATLANTIC_APPALACHIA,, SOUTH,, MIDWEST) ],
	[ vm_return ],
]

CODE[54] = [ // The Civil War
	[ vm_remove_congress, 1 ],
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[55] = [ // 15th Divides Suffragists
	[ vm_requires_persistent, "Fifteenth, Amendment" ],
	[ vm_remove_all_up_to, PURPLE, 4 ],
	[ vm_opponent_loses_badges, 2 ],
	[ vm_return ],
]

CODE[56] = [ // Senator Joseph Brown
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, "Georgia" ],
	[ vm_return ],
]

CODE[57] = [ // Minor v. Happersett
	[ vm_roll_d6_success ],
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, "Missouri" ],
	[ vm_return ],
]

CODE[58] = [ // Senate Rejects Suffrage Amendment
	[ vm_roll_d6_success ],
	[ vm_receive_badges, 1 ],
	[ vm_remove_congress, 1 ],
	[ vm_return ],
]

CODE[59] = [ // South Dakota Rejects Suffrage
	[ vm_roll_d6_success ],
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, "South, Dakota" ],
	[ vm_return ],
]

CODE[60] = [ // Gerrymandering
	[ vm_remove_all_up_to, YELLOW, 2 ],
	[ vm_return ],
]

CODE[61] = [ // Border States
	[ vm_add_cubes_in_each_of, 1, RED, ["Delaware",, "Maryland",, "West, Virginia",, "Kentucky",, "Missouri"] ],
	[ vm_return ],
]

CODE[62] = [ // Horace Greeley
	[ vm_add_cubes_in_each_of, 2, RED, ["New, York",, "Connecticut"] ],
	[ vm_return ],
]

CODE[63] = [ // New York Newspapers
	[ vm_add_cubes_in_each_of, 2, RED, ["New, York",, "New, Jersey"] ],
	[ vm_return ],
]

CODE[64] = [ // Senator George Vest
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, "Missouri" ],
	[ vm_return ],
]

CODE[65] = [ // Catharine Beecher
	[ vm_roll_d4 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 1 ],
	[ vm_return ],
]

CODE[66] = [ // Progress, Not Politics
	[ vm_draw_6_place_any_on_top_of_draw ],
	[ vm_return ],
]

CODE[67] = [ // Southern “Hospitality”
	[ vm_add_cubes_in_each_of, 1, RED, ["Virginia",, "North, Carolina",, "South, Carolina",, "Georgia",, "Tennessee"] ],
	[ vm_return ],
]

CODE[68] = [ // Beer Brewers
	[ vm_requires_not_persistent, "Eighteenth, Amendment" ],
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[69] = [ // Southern Resentment
	[ vm_requires_persistent, "Fifteenth, Amendment" ],
	[ vm_add_cubes_in_each_of, 1, RED, ["Texas",, "Louisiana",, "Arkansas",, "Mississippi",, "Alabama"] ],
	[ vm_return ],
]

CODE[70] = [ // Old Dixie
	[ vm_add_cubes_in_each_of, 1, RED, ["Louisiana",, "Mississippi",, "Alabama",, "Georgia",, "Florida"] ],
	[ vm_return ],
]

CODE[71] = [ // NAOWS Forms
	[ vm_add_campaigner, 1, NORTHEAST ],
	[ vm_receive_badges, 2 ],
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
	[ vm_remove_cubes_limit, 6, PURPLE_OR_YELLOW, 2 ],
	[ vm_return ],
]

CODE[75] = [ // Xenophobia
	[ vm_remove_all_up_to, PURPLE, 1 ],
	[ vm_remove_all_up_to, YELLOW, 1 ],
	[ vm_return ],
]

CODE[76] = [ // “O Save Us Senators, From Ourselves”
	[ vm_add_cubes_in_one_state_of_each_region, 1, RED ],
	[ vm_return ],
]

CODE[77] = [ // Emma Goldman
	[ vm_roll_d6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 1 ],
	[ vm_return ],
]

CODE[78] = [ // The Great 1906 San Francisco Earthquake
	[ vm_remove_all, PURPLE_OR_YELLOW, "California" ],
	[ vm_opponent_loses_badges, 1 ],
	[ vm_return ],
]

CODE[79] = [ // A Threat to the Ideal of Womanhood
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[80] = [ // “Unwarranted, Unnecessary & Dangerous Interference”
	[ vm_add_cubes_in_one_state_of_each_region, 1, RED ],
	[ vm_return ],
]

CODE[81] = [ // Conservative Opposition
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[82] = [ // The SSWSC
	[ vm_requires_persistent, "Southern, Strategy" ],
	[ vm_receive_badges, 2 ],
	[ vm_add_cubes_limit, 6, RED, region_us_states(SOUTH), 2 ],
	[ vm_return ],
]

CODE[83] = [ // Western Saloons Push Suffrage Veto
	[ vm_requires_not_persistent, "Eighteenth, Amendment" ],
	[ vm_add_cubes, 2, RED, "Arizona" ],
	[ vm_add_cubes_in_each_of, 1, RED, ["New, Mexico",, "Nevada",, "Utah"] ],
	[ vm_return ],
]

CODE[84] = [ // Transcontinental Railroad
	[ vm_move_each_campaigner_free, RED ],
	[ vm_campaigning_action ],
	[ vm_return ],
]

CODE[85] = [ // White Supremacy and the Suffrage Movement
	[ vm_requires_persistent, "Southern, Strategy" ],
	[ vm_remove_all_up_to, YELLOW, 4 ],
	[ vm_opponent_loses_badges, 2 ],
	[ vm_return ],
]

CODE[86] = [ // Senator John Weeks
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, "New, Hampshire" ],
	[ vm_return ],
]

CODE[87] = [ // Senator “Cotton Ed” Smith
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, "South, Carolina" ],
	[ vm_return ],
]

CODE[88] = [ // War in Europe
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[89] = [ // 1918 Pandemic
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
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
	[ vm_requires_not_persistent, "Eighteenth, Amendment" ],
	[ vm_persistent, REST_OF_TURN ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[93] = [ // Red Scare
	[ vm_remove_all_up_to, PURPLE, 2 ],
	[ vm_return ],
]

CODE[94] = [ // Southern Women’s Rejection League
	[ vm_requires_persistent, "Southern, Strategy" ],
	[ vm_roll_d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), RED, region_us_states(SOUTH), 2 ],
	[ vm_return ],
]

CODE[95] = [ // United Daughters of the Confederacy
	[ vm_requires_persistent, "Southern, Strategy" ],
	[ vm_roll_d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), RED, region_us_states(SOUTH), 2 ],
	[ vm_return ],
]

CODE[96] = [ // Cheers to “No on Suffrage”
	[ vm_requires_persistent, "Eighteenth, Amendment" ],
	[ vm_roll_d8 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 2 ],
	[ vm_return ],
]

CODE[97] = [ // The Unnecessary Privilege
	[ vm_roll_d6 ],
	[ vm_add_cubes_limit, ()=>(game.vm.die), RED, anywhere(), 1 ],
	[ vm_return ],
]

CODE[98] = [ // Voter Suppression
	[ vm_persistent, BALLOT_BOX ],
	[ vm_todo ],
	[ vm_return ],
]

CODE[99] = [ // Anti-Suffrage Riots
	[ vm_support_discard_2_random_draw_2 ],
	[ vm_return ],
]

CODE[100] = [ // American Constitutional League
	[ vm_spend_badges, 4 ],
	[ vm_select_strategy_card ],
	[ vm_return ],
]

CODE[101] = [ // The Woman Patriot
	[ vm_receive_badges, 3 ],
	[ vm_return ],
]

CODE[102] = [ // Governor Clement’s Veto
	[ vm_replace, 1, GREEN_CHECK ],
	[ vm_return ],
]

CODE[103] = [ // Senator Henry Cabot Lodge
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, "Massachusetts" ],
	[ vm_return ],
]

CODE[104] = [ // Senator William Borah
	[ vm_remove_congress, 1 ],
	[ vm_add_cubes, 2, RED, "Utah" ],
	[ vm_return ],
]

CODE[105] = [ // Efficient Organizing
	[ vm_receive_badges, 5 ],
	[ vm_return ],
]

CODE[106] = [ // Reconsideration
	[ vm_todo ],
	[ vm_return ],
]

CODE[107] = [ // Opposition Research
	[ vm_asm, ()=>game.vm.opponent_half_badges = Math.ceil(opponent_badges() / 2) ],
	[ vm_opponent_loses_badges, game.vm.opponent_half_badges ],
	[ vm_return ],
]

CODE[108] = [ // Change In Plans
	[ vm_todo ],
	[ vm_return ],
]

CODE[109] = [ // Bellwether State
	[ vm_todo ],
	[ vm_return ],
]

CODE[110] = [ // Superior Lobbying
	[ vm_todo ],
	[ vm_return ],
]

CODE[111] = [ // The Winning Plan
	[ vm_todo ],
	[ vm_return ],
]

CODE[112] = [ // Regional Focus
	[ vm_todo ],
	[ vm_return ],
]

CODE[113] = [ // Eye on the Future
	[ vm_todo ],
	[ vm_return ],
]

CODE[114] = [ // Transportation
	[ vm_todo ],
	[ vm_return ],
]

CODE[115] = [ // Counter Strat
	[ vm_todo ],
	[ vm_return ],
]

CODE[116] = [ // National Focus
	[ vm_todo ],
	[ vm_return ],
]

CODE[117] = [ // California
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[118] = [ // Utah
	[ vm_return ],
]

CODE[119] = [ // Montana
	[ vm_return ],
]

CODE[120] = [ // Kansas
	[ vm_return ],
]

CODE[121] = [ // Texas
	[ vm_return ],
]

CODE[122] = [ // Georgia
	[ vm_return ],
]

CODE[123] = [ // Illinois
	[ vm_return ],
]

CODE[124] = [ // Ohio
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[125] = [ // Pennsylvania
	[ vm_return ],
]

CODE[126] = [ // Virginia
	[ vm_draw_2_play_1_event ],
	[ vm_return ],
]

CODE[127] = [ // New York
	[ vm_return ],
]

CODE[128] = [ // New Jersey
	[ vm_return ],
]
// #endregion
