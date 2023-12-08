"use strict"

const fs = require("fs")

let data = {}

const US_STATES = [null]

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


function def_us_state(code, name, region) {
	US_STATES.push({code, name, region})
}

def_us_state("AZ", "Arizona", WEST)
def_us_state("CA", "California", WEST)
def_us_state("ID", "Idaho", WEST)
def_us_state("NM", "New Mexico", WEST)
def_us_state("NV", "Nevada", WEST)
def_us_state("OR", "Oregon", WEST)
def_us_state("UT", "Utah", WEST)
def_us_state("WA", "Washington", WEST)

def_us_state("CO", "Colorado", PLAINS)
def_us_state("KS", "Kansas", PLAINS)
def_us_state("MT", "Montana", PLAINS)
def_us_state("ND", "North Dakota", PLAINS)
def_us_state("NE", "Nebraska", PLAINS)
def_us_state("OK", "Oklahoma", PLAINS)
def_us_state("SD", "South Dakota", PLAINS)
def_us_state("WY", "Wyoming", PLAINS)

def_us_state("AL", "Alabama", SOUTH)
def_us_state("AR", "Arkansas", SOUTH)
def_us_state("FL", "Florida", SOUTH)
def_us_state("GA", "Georgia", SOUTH)
def_us_state("LA", "Louisiana", SOUTH)
def_us_state("MS", "Mississippi", SOUTH)
def_us_state("SC", "South Carolina", SOUTH)
def_us_state("TX", "Texas", SOUTH)

def_us_state("IA", "Iowa", MIDWEST)
def_us_state("IL", "Illinois", MIDWEST)
def_us_state("IN", "Indiana", MIDWEST)
def_us_state("MI", "Michigan", MIDWEST)
def_us_state("MN", "Minnesota", MIDWEST)
def_us_state("MO", "Missouri", MIDWEST)
def_us_state("OH", "Ohio", MIDWEST)
def_us_state("WI", "Wisconsin", MIDWEST)

def_us_state("DE", "Delaware", ATLANTIC_APPALACHIA)
def_us_state("KY", "Kentucky", ATLANTIC_APPALACHIA)
def_us_state("MD", "Maryland", ATLANTIC_APPALACHIA)
def_us_state("NC", "North Carolina", ATLANTIC_APPALACHIA)
def_us_state("PA", "Pennsylvania", ATLANTIC_APPALACHIA)
def_us_state("TN", "Tennessee", ATLANTIC_APPALACHIA)
def_us_state("VA", "Virginia", ATLANTIC_APPALACHIA)
def_us_state("WV", "West Virginia", ATLANTIC_APPALACHIA)

def_us_state("CT", "Connecticut", NORTHEAST)
def_us_state("MA", "Massachusetts", NORTHEAST)
def_us_state("ME", "Maine", NORTHEAST)
def_us_state("NH", "New Hampshire", NORTHEAST)
def_us_state("NJ", "New Jersey", NORTHEAST)
def_us_state("NY", "New York", NORTHEAST)
def_us_state("RI", "Rhode Island", NORTHEAST)
def_us_state("VT", "Vermont", NORTHEAST)

console.log("const us_state_count =", US_STATES.length)
console.log("const US_STATES = " + JSON.stringify(US_STATES, 0, 8))
