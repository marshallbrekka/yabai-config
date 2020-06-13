#!/bin/bash
set -e
event=$1
if [[ $event == 'window_created' ]]; then
    echo "Window created, checking window id $YABAI_WINDOW_ID"
    role=$(yabai -m query --windows --window $YABAI_WINDOW_ID | jq -e -r '.role')
    if [[ $role != 'AXWindow' ]]; then
	echo "Skipping update-state as window role is not AXWindow: $role"
	exit 0
    fi
fi

~/.config/yabai/scripts/jxa/run ~/.config/yabai/scripts/jxa/main.js update-state
