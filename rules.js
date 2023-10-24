"use strict"

var game
var view
var states

const SUF = "Suffragist"
const OPP = "Opposition"

exports.scenarios = [ "Standard" ]
exports.roles = [ SUF, OPP ]

exports.setup = function (seed, scenario, options) {
	game = {
		seed: seed,
		log: [],
		undo: [],
		active: null,
		state: null,
	}
	return game
}

exports.action = function (state, current, action, arg) {
	game = state
	let S = states[game.state]
	if (action in S)
		S[action](arg, current)
	else
		throw new Error("Invalid action: " + action)
	return game
}

exports.resign = function (state, current) {
	game = state
	if (game.state !== "game_over") {
		if (current === SUF)
			goto_game_over(OPP, "Suffragist resigned.")
		if (current === OPP)
			goto_game_over(SUF, "Opposition resigned.")
	}
	return game
}

exports.view = function(state, current) {
	game = state

	let view = {
		log: game.log,
		prompt: null,
		actions: null,
	}

	return view
}
