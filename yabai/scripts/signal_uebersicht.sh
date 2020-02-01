#!/bin/bash

# This is a slight performance optimization to get a faster refresh, as the Applescript interface
# is pretty slow.
# If this ever breaks we can always fall back to using applescript script to regain functionality.

# Uncomment to use applescript
# osascript -e 'tell application id "tracesOf.Uebersicht" to refresh widget id "nibar-yabai-jsx"'

# This is the Uebersicht server address.
HOST=127.0.0.1:41416

echo '{"type":"WIDGET_WANTS_REFRESH","payload":"nibar-yabai-jsx"}' |
    websocat -E --origin http://$HOST ws://$HOST
