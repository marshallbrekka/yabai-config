#/bin/bash
set -e
space_id=$1

# Try once right away, but we'l sleep and try again momentarily
for win_id in $(yabai -m query --windows | jq -c ".[] | select(.pid == $YABAI_PROCESS_ID) | .id"); do
    echo "Moving window $win_id to space $space_id"
    yabai -m window $win_id --space $space_id
done

sleep 2
for win_id in $(yabai -m query --windows | jq -c ".[] | select(.pid == $YABAI_PROCESS_ID) | .id"); do
    echo "Moving window $win_id to space $space_id"
    yabai -m window $win_id --space $space_id
done
