#!/bin/bash

echo "Focusing display $1"
yabai -m display --focus $1
~/.config/yabai/scripts/signal_uebersicht.sh
