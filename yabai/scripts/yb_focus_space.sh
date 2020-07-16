#!/bin/bash
set -e;
space=$1

MODE="sip-enabled"
# MODE="sip-disabled"

function mode_sip_disabled {
    display=$(yabai -m query --displays --display | jq -r -c '.uuid')

    echo "Focusing space $1 on display $display"
    yabai -m space --focus "d:${display}:${space}"
}

function mode_sip_enabled {
    # declare -a desktophash
    desktophash[0]=29
    desktophash[1]=18
    desktophash[2]=19
    desktophash[3]=20
    desktophash[4]=21
    desktophash[5]=23
    desktophash[6]=22
    desktophash[7]=26
    desktophash[8]=28
    desktophash[9]=25

    desktopkey=${desktophash[$space]}

    display_num=$(yabai -m query --windows --window | jq -r -c '.display')
    if [[ "$display_num" == "" ]]; then
	display_num=$(yabai -m query --displays --display | jq -r -c '.index')
    fi
    base_modifier=""
    if [[ $display_num -eq 2 ]]; then
	base_modifier=", shift down"
    fi

    osascript -e "tell application \"System Events\" to key code $desktopkey using {option down, control down, command down${base_modifier}}"
}

if [[ "$MODE" == "sip-enabled" ]]; then
    mode_sip_enabled
else
    mode_sip_disabled
fi
