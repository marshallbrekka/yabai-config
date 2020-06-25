#!/bin/bash
set -e

echo "Focusing display $1"
# Yabai display numbers are not ordered by their arrangement.
# for my purposes I want the numbering to always increase from left->right.

# jq -e will exit non-zero if we get a null result back
DISPLAY_INDEX=$(yabai -m query --displays | jq -r -e "sort_by(.frame.x) | .[$1].index")

echo "Found display index $DISPLAY_INDEX"
yabai -m display --focus $DISPLAY_INDEX
~/.config/yabai/scripts/signal_uebersicht.sh
