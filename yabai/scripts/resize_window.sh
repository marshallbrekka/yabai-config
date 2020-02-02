#!/bin/bash
set -e
delta="$1"

window_buffer=20

display_width=$(yabai -m query --displays --display | jq -c '.frame.w')
window_frame=$(yabai -m query --windows --window | jq -c '.frame')
window_width=$(echo "$window_frame" | jq -c '.w')
window_x=$(echo "$window_frame" | jq -c '.x')

abs_right=$((window_x+window_width+window_buffer))


# If the window is against the right edge, then adjust from the left.
if (( $abs_right > $display_width)); then
    delta=$((delta*-1))
    echo "yabai -m window --resize left:$delta:0"
    yabai -m window --resize left:$delta:0
else
    echo "yabai -m window --resize right:$delta:0"
    yabai -m window --resize right:$delta:0
fi
