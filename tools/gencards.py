#!/usr/bin/env python3

import json
import re

cards = [None]

# global card object
card = {
    'id': 1,
    'type': "",
    'title': "",
    'era': "",
    'text': [],
    'attrs': {}
}

kv_pattern = r'<!--\s*(?P<key>[^:]+):\s*(?P<value>[^->]+)\s*-->'
file_format = "tools/{}_cards.md"

def flush():
    if card['title']:
        output = card.copy()
        # Combine text into a single string
        output['text'] = " ".join(output['text'])

        # Integrate attrs into the card object and then clear attrs
        for key, value in output['attrs'].items():
            output[key] = value
        output.pop('attrs')

        # Add era only if it's a non-empty string
        if not output['era']:
            output.pop('era')

        cards.append(output)

        # Reset card attributes for the next entry
        card['title'] = ""
        card['text'] = []
        card['attrs'] = {}
        card['id'] += 1

def read_cards(_card_type):
    card['type'] = _card_type
    card['era'] = ""
    filename = file_format.format(_card_type)

    with open(filename) as fp:
        for line in fp:
            line = line.rstrip()
            if line.startswith("# "):
                flush()
                card['era'] = line[2:].strip()
            elif line.startswith("## "):
                flush()
                card['title'] = line[3:].strip()
            elif match := re.match(kv_pattern, line):
                key = match.group('key').strip()
                value = match.group('value').strip()
                card['attrs'][key] = value
            elif line:
                card['text'].append(line)
    flush()

if __name__ == "__main__":
    read_cards("support")
    read_cards("opposition")
    read_cards("strategy")
    read_cards("states")

    print("const CARDS = " + json.dumps(cards))
    print("if (typeof module !== 'undefined') module.exports = {CARDS}")
