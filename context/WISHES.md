# Wish ledger

This is the durable, developer-facing backlog used by the `wish`, `plan`, `start`, and `cut` workflows. It is not application state and is never included in user backups.

Next id: `WISH-002`

## Active wishes

### WISH-001 — Zones, rooms, spaces, and grouped tags

- Status: Shipped
- Priority: P2 (provisional)
- Effort: Unestimated
- Target: Unscheduled
- Plan: —
- Released: 0.0.1.10 on 2026-09-08
- Affected modules: Inventory model and editor, location/tag suggestions and filters, state/backup/sync compatibility, Help.

Behavior:
Zones are groups of rooms. Rooms can have multiple parts called spaces. Use the supplied location hierarchy and grouped tag vocabulary below. Parentheses list spaces within the preceding room; rooms without parentheses have no supplied spaces.

Zones: Upstairs, Main Level, Outside.

| Zone | Room | Spaces |
| --- | --- | --- |
| Outside | Yard | — |
| Outside | Shed | — |
| Outside | Nest | — |
| Outside | Patio | Pickle Bag |
| Outside | Garage | Car |
| Outside | Attic | — |
| Outside | Crawl | — |
| Main Level | Foyer | — |
| Main Level | Hallway | — |
| Main Level | Game Room | — |
| Main Level | Kitchen | Pantry |
| Main Level | Nook | Floating, Go Bag, Sling Bag |
| Main Level | Den | Bar |
| Main Level | Doge’s Den | — |
| Main Level | Mud Room | — |
| Main Level | Powder Room | — |
| Main Level | Primary Bedroom | Closet |
| Main Level | Primary Bathroom | Closet, Water Closet |
| Upstairs | Loft | Closet |
| Upstairs | Office | Closet, Desk |
| Upstairs | Utility Room | Closet |
| Upstairs | Guest Room | Closet |
| Upstairs | J&J Bathroom | Guest Sinkroom, Loft Sinkroom |

| Tag group | Tags |
| --- | --- |
| Activity | Pickleball, Backpacking, Biking, Golfing, Hiking |
| Apparel | Headware, Eyewear, Handware, Footware, Clothing, Scarf |
| Power | Cables, Powerbank, Coax, Ethernet, Extension |
| Systems | Fan, Fire, Fixture, HVAC, Temperature, Water, Switch |
| Lighting | Bulb, Decor, LED, Night, String |
| Tech | Curtain, Hub, Lock, Remote, Sensor, Shades, TV, Tracker |
| Other | Paddles, Soccer Balls, Bags, Books, Games, Art, Memorabilia, Barware, Glassware, Dishware, Appliances, Tools |
| Brands | Apple, Fracture, OXO, Ryobi, Popchart, Nespresso |

Rationale:
Capture the user's household locations and tag vocabulary so inventory can describe where an object belongs and how it is classified.

Acceptance criteria:

- Represent all 3 zones, 23 rooms, and 17 spaces with their supplied parent relationships.
- Distinguish repeated space names such as Closet by their parent room.
- Preserve all 8 tag groups and 54 supplied tags, including the user's spelling and punctuation.
- Preserve existing inventory records when introducing structured locations or grouped tags.

Constraints and assumptions:

- Initially captured as requirements only. The 2026-09-08 request explicitly authorized pre-populating the form with this vocabulary.
- Keep runtime static, local-first, and dependency-free, with backup/import and optional sync compatibility.
- Preserve Pickle Bag, Car, Floating, and Go Bag as supplied spaces. Sling Bag was added under Nook by direct request on 2026-09-10.
- Priority is provisional; effort and implementation decisions belong to planning.

Implementation decisions (authorized by the compact-form request):

- Suggestions remain editable and support custom entries alongside supplied vocabulary.
- An item has one location and may stop at a zone or room; choosing a space fills its parent room and zone.
- Grouped tags extend existing categories/presets; Brands remains a tag group.
- Existing rooms and tags remain unchanged. Brand, Zone, and Space use named properties, retaining backup/sync compatibility.

## Entry template

```md
### WISH-### — Short title

- Status: Proposed | Planned | Active | Shipped | Parked
- Priority: P0 | P1 | P2 | P3
- Effort: Small | Medium | Large | X-large
- Target: Unscheduled | Patch | Minor | Major | x.y.z
- Plan: — | context/WISH-###-slug-PLAN.md
- Released: — | x.y.z on YYYY-MM-DD
- Affected modules: ...

Behavior:
Describe what a user can do and the expected result.

Rationale:
Explain the problem or opportunity without prescribing unnecessary implementation.

Acceptance criteria:

- Observable outcome one.
- Observable outcome two.

Constraints and assumptions:

- Compatibility, accessibility, offline, privacy, or architecture constraints.

Open questions:

- Only questions that materially affect scope or design.
```

When adding a wish, replace `Next id` with the following unused number. Keep shipped entries for a compact historical index; detailed public release prose belongs in `assets/js/config.js`, not here.
