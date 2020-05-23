#!/bin/bash
set -e

TYPE=$(yabai -m query --spaces --space | jq -r '.type')

if [[ "$TYPE" == "float" ]]; then
    yabai -m space --layout bsp
else
    yabai -m space --layout float
fi
   
