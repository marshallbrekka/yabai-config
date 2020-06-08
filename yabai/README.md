# Display Notes

The display index's can change over time, but index `1` is whatever the primary display is.


## Collapsing
When a display is removed it looks like it auto removes the first space from that display.
So there would be spaces 2-10 remaining.

- Primary space on the removed display is deleted
- Windows on the deleted space default to the primary space on the primary display (index 1)
- Spaces on the removed display are moved to the primary display (index 1)
- Spaces remain on their originally assigned display, but the remaining displays index can change 

## Primary display
When the primary display changes, it appears the spaces from the new and old primary are swapped.
