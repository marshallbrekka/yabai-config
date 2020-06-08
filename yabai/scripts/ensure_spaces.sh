#!/bin/bash
set -e;
MAX_SPACES=10
$HOME/.config/yabai/scripts/test_app.js
exit 0

# Grabs the index of each display, and returns each on its own line
# so we can iterate using normal bash semantics
for display_index in $(yabai -m query --displays | jq -c 'map(.index)[]'); do
    echo "Ensuring display ${display_index}"

    count=0
    last_space_index=0
    removed=0

    # Grabs the index of each space, and returns each on its own line
    # so we can iterate using normal bash semantics
    for space_index in $(yabai -m query --spaces --display $display_index | jq -c 'map(.index)[]'); do
        new_count=$((count+1))
        if (( $new_count > $MAX_SPACES )); then
            echo "Destroying space $space_index in display $display_index"
            yabai -m space $((space_index - removed)) --destroy
            removed=$((removed + 1))
        else
            echo "Labeling space ${space_index} in display ${display_index} as $new_count"
            yabai -m space $space_index --label "d:${display_index}:${new_count}"
        fi
        count=$new_count
        last_space_index=$space_index
    done

    echo "Done managing existing spaces, checking if we need to add more"
    while (( $count < $MAX_SPACES )); do
        new_count=$((count+1))
        new_index=$((last_space_index + 1))
        echo "Adding space $new_count of $MAX_SPACES after space index $last_space_index"
        yabai -m space $last_space_index --create
        yabai -m space $new_index --label "display-${display_index}_space-${new_count}"
        last_space_index=$new_index
        count=$new_count
    done
done
