#!/bin/bash
set -e;

display_arg=""
space_arg=""
focus_arg=0

while [ "$1" != "" ]; do
    case $1 in
        -d | --display ) shift
                         display_arg=$1
                         ;;
        -s | --space )   shift
			 space_arg=$1
			 ;;
        -f | --focus )   focus_arg=1
    esac
    shift
done

display_index=""
display_uuid=""
space_label=""

# If the caller specified the desired display as an argument
# then lookup its index based on the ordering from left->right.
# otherwise assume the current display
if [[ "$display_arg" != "" ]]; then
    echo "Looking up display by $display_arg"
    display_data=$(yabai -m query --displays | jq -e "sort_by(.frame.x) | .[$display_arg]")
    display_index=$(echo "$display_data" | jq -e -r ".index")
    display_uuid=$(echo "$display_data" | jq -e -r ".uuid")
else
    display_data=$(yabai -m query --displays --display)
    display_index=$(echo "$display_data" | jq -e -r ".index")
    display_uuid=$(echo "$display_data" | jq -e -r ".uuid")
fi
echo "found display index $display_index $display_uuid"

if [[ "$space_arg" != "" ]]; then
    space_label="d:${display_uuid}:${space_arg}"
else
    space_label=$(yabai -m query --spaces --display $display_index | jq -e -r '.[] | select(.visible == 1) | .index')
fi

echo "moving window to space with label $space_label"
window_id=$(yabai -m query --windows --window | jq '.id')
yabai -m window --space $space_label

if [[ $focus_arg == 1 ]]; then
    echo "Focusing window $window_id"
    yabai -m window --focus $window_id
fi
