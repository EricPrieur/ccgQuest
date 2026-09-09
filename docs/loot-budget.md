# Card budgets & loot math

Reference for pricing new cards and building drop tables. Derived from the
cards already in the game (mostly the Chapter 3 deep-gnome gear, which was
priced deliberately) and confirmed against the Chapter 2 tables.

**This is a guide, not a law.** The cards have to feel playable and good first;
the numbers are here to keep things in the same neighbourhood and to make
outliers visible. Where a card breaks the formula on purpose, say so in its
comment.

---

## 1. Item budget by tier and rarity

Every card is worth a number of **budget points**, read off its tier + rarity:

| | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| **Tier 1** | 3 | 4 | 5 | 6 | 7 |
| **Tier 2** | 5 | 7 | 9 | 11 | 13 |
| **Tier 3** | 7 | 10 | 13 | 16 | 19 |
| **Tier 4** | 9 | 13 | 17 | 21 | 25 |

```
points = (2 × tier + 1) + tier × rarityStep
rarityStep: common 0, uncommon 1, rare 2, epic 3, legendary 4
```

Two things fall out of that:

- **Common by tier** is 3 / 5 / 7 / 9 — flat +2 per tier.
- **The rarity step equals the tier.** A rarity rung is worth +1 at Tier 1 and
  +4 at Tier 4, so rarity matters four times as much on a Tier 4 item. A Tier 4
  Legendary (25) beats three Tier 1 Legendaries.

Tier 5, if it ever exists, would be 11 / 16 / 21 / 26 / 31.

Both inputs already live on every card (`card.tier`, `card.rarity`), so scoring
is a pure lookup — nothing to maintain.

---

## 2. Costs

A weapon's **own Recharge cost is the baseline** and is already priced into the
number above. "Deal 6 → Recharge" is the free-standing shape.

**A second card cost** (recharge/discard *another* card, i.e. a `recharge_extra`
effect) is a real cost, so it earns a bonus:

```
bonus = that card's own budget − 1
```

| Tier 3 | Common | Uncommon | Rare | Epic |
|---|---|---|---|---|
| base | 7 | 10 | 13 | 16 |
| with a 2-card cost | **13** | **19** | **25** | **31** |

**A Discard cost multiplies the budget by 1.5.** Discarding is harsher than a
recharge — the card is out of rotation until the pile reshuffles, not waiting
at the bottom of the draw pile — so it buys half again as much card:

| | Common | Uncommon | Rare | Epic |
|---|---|---|---|---|
| Tier 1 × 1.5 | 4.5 | **6** | 7.5 | 9 |
| Tier 3 × 1.5 | 10.5 | 15 | **19.5** | 24 |

Reckless Strike is the anchor: T1 uncommon (4) × 1.5 = 6, and it reads
*Discard → Deal 6 Damage*.

**A Draw on the card cancels the bonus** — when the draw reliably refunds the
card that paid for it. The net cost returns to baseline. Bone Bow (*Recharge a
Card → Deal 8, Draw*) gets no bonus; Tunnelbreaker Pick (*Recharge a Card →
Sunder 3, Deal 10*) gets the full +9.

A **gated** draw is different, because it does not reliably hand the card back:

| Draw shape | Cost bonus |
|---|---|
| Unconditional (*"… , Draw"*) | **cancelled in full** |
| Bounded to once per turn (*"First Attack: Draw"*) | **kept** — see §4 |
| Gated on target state (*"On Kill: Draw"*, *"Was Undamaged: Draw"*) | **half** |

---

## 3. What effects cost

| Effect | Points |
|---|---|
| Damage | 1 per point |
| Block | 1 per point |
| Shield | 2 per point |
| **Sunder** | **3 per stack** |
| Poison | 2 per stack |
| Bleed | 1 per stack |
| **Weak** | **2 per stack** — halves one attack (rounds down), one stack per attack |
| **Shock** | **2 per stack** — −1 damage dealt AND +1 damage taken, decays 1/turn |
| **Rage** | **5 per stack** — permanent +1 damage to every attack, no decay |
| **Heal** | **0.5 per point** |
| **Heal 1 Ailment** | **~0.25** — cheap enough that "Heal 4 Ailments" is about 1 point |
| Scout | ~0.5 (weak — it filters, it doesn't draw) |
| Armor-while-in-hand (1) | 4 |
| **Bleed-on-attack rider, rest of fight** | **4** |
| **Draw** | **free on DEFENSE cards**; expensive everywhere else |

**Healing is cheap; cleansing is nearly free.** A heal restores a card from the
discard pile — real, but slow and never lethal — so it prices at half a damage
point. Scrubbing an Ailment is cheaper still: it's conditional (worth nothing
when you're clean) and the ailments it removes were mostly going to decay on
their own. Don't be shy with the numbers on a cleanse line — "Heal 4 Ailments"
reads generous and costs about a point.

**Shock is the two-way debuff.** It's the only status that both blunts the
target's swing and softens them for yours, which is why it matches Weak's price
despite decaying every turn. It also means **effect order changes the bill**:
Shock applied BEFORE your own damage raises that hit by 1 per stack (the damage
handlers read `getIncomingDamageModifier`), so "Shock then Deal 2" is a 3-damage
card wearing a 2-damage description. Put the damage first unless you're paying
for the bump.

### Draw is deliberately rare

**Most cards in this game cost nothing to play.** A recharge is not a resource
the way mana is — it comes back. So a card that replaces itself is very close
to free tempo, and enough of them in one deck is an engine that draws the whole
pile every turn. Draw is priced high outside the defensive slot for that reason;
*defense* cards get one free because they're reactive and spend themselves to
block.

This is also why **relics look weak on paper**: most carry a draw cantrip, and
the cantrip eats most of the budget. Umber Eye Charm is a 13-point rare whose
printed effect is only *Sunder Randomly* — the Draw is the rest of the cost.

### Conditionals

A bonus behind a condition is worth **half** its face value — *Armor/Shield:
+2* prices at 1. Two caveats:

- **Who controls the condition?** *Bloodied*, *Was Undamaged* and *On Kill*
  depend on the target's state and are genuinely uncertain. A condition the
  player can simply choose to satisfy is closer to full price for its
  numeric part (see First Attack in §4).
- **Conditions are not a discount on Draw.** Halving the value of a draw
  misses the point — what matters is the abuse ceiling, not the average. §4.

### Multipliers

| | Rule |
|---|---|
| **Stays in hand** | **×3** on the body. A stays-in-hand card's printed effect should read *weak* for its rarity, because it fires every turn. Prefer utility bodies (scout, reveal, a rider) over repeatable raw stats. |
| **2nd target** | **half value.** *Sunder + 3 damage* = 6 on the first target, +3 for the second = 9. |
| **ALL targets** | **×3.** Sunder All = 9 points, Poison All = 6. Prices AoE debuffs out of the low rarities. |

### Specialisation discount

Gear that only works against one thing may run above its budget, because it's
close to a dead card the rest of the time. Burrower's Gauntlet gets an unlimited
free Sunder every turn precisely because Sunder does nothing to an unarmored
monster.

### Worked examples

All exact fits, no rounding:

| Card | Budget | Breakdown |
|---|---|---|
| Svirfhammer (T3 C) | 7 | Sunder 1 (3) + Deal 4 (4) |
| Deep Pick (T3 C + 2-card cost) | 7 + 6 = 13 | Sunder 2 (6) + Deal 7 (7) |
| Tunnelbreaker Pick (T3 U + 2-card cost) | 10 + 9 = 19 | Sunder 3 (9) + Deal 10 (10) |
| Work Gloves (T3 C) | 7 | Block 4 + Sunder 1 (3) + free draw |
| Miner's Helm (T3 C) | 7 | Armor-in-hand (4) + Block 3 + free draw |
| Umber Shield (T3 C) | 7 | Shield 3 (6) + Heal 1 Sunder (1) |
| Mandible Cleaver (T3 U + 2-card cost) | 19 | (Sunder 3 + Deal 9 + Bleed 1) = 13, +6.5 for target 2 |

**Don't calibrate off the Chapter 2 cards.** Bone Bow, Hunter's Recurve and
Bone Cleaver all run 2–5 points hot against this line; they predate the system.

**Don't calibrate off enemy-only cards either.** Some creators in `cards.js`
exist purely to drive a monster mechanic and were never priced as player cards.
Enraged Strike is the trap here: it looks like a cheap Rage card, but it is the
universal monster pity timer — from turn 11 the enemy is handed a fresh copy
every turn — so its numbers say nothing about what Rage costs a player. Check
whether a card is in any class ability pool, starter deck, shop or loot table
before treating it as a data point.

---

## 4. The deck-abuse test

Before pricing a card, ask the question a player trying to break the game asks:

> **What happens if I fill my deck with this card?**

Averages don't break decks; *ceilings* do. A card that is fair as a one-of and
absurd as a ten-of is mispriced no matter what the point math says.

**The cautionary tale.** The old Rock read *"Deal 1, Draw."* Fine on its own.
Then three Sneak Attacks joined it (X = attacks this turn) and the deck drew
itself: every Rock replaced itself, every swing grew the next Sneak Attack, and
the turn stopped ending. Nothing in the point math flagged it, because the
problem was N copies, not one.

### Gate types

What matters is whether **N copies produce N triggers**.

| Gate | N copies → | Verdict |
|---|---|---|
| **Per-turn cap** — *First Attack: Draw* | 1 trigger, however many you run | **Strong gate.** The ceiling is fixed no matter the deck. |
| **Target state** — *Was Undamaged / Bloodied / On Kill* | up to N, given enough targets | Real gate on each instance, weak ceiling against a wide board |
| **Probability** — *50% to …* | ~N/2 | **Weakest.** Randomness slows abuse, it doesn't cap it. |

A per-turn cap is the only one that bounds the deck rather than the card, which
is why *First Attack: Draw* is an acceptable rider on a strong card: it also
carries a real tempo cost, since drawing the card late in a turn (off an ally
cycle) leaves you holding a much weaker version of it.

### A cost can be its own gate

A second card cost is self-limiting at deck scale: a deck stuffed with
two-card-cost weapons mills itself out. Assassinate (*Recharge a Card → Deal
15…*) spends two cards per cast and only refunds one on a qualifying hit, so
running ten is its own punishment.

---

## 5. Loot tables

Two stages, and they compose:

**Stage 1 — the gate.** Tables listed in `GATED_LOOT` (search main.js) drop
nothing 50% of the time. A LOOT phase with `guaranteedLoot: true` bypasses it
(e.g. the Gnoll Pack Lord's guards-cave den fight, which force-sets the flag).

**Stage 2 — the pick.** On a drop, ONE item is drawn by weight. A few tables
override with `pickCount` / `distinct` (Giant Boar, Khydhani — 2 distinct).

```
itemDropChance = gate × (weight / totalWeight)
tableQuality   = Σ(share × points)        // "EV on a drop"
perKill        = gate × tableQuality
```

**EV on a drop is the number that matters** for comparing monsters. Per-kill is
only meaningful for farmable enemies; bosses have their own budget because you
can't farm them.

### House weights

| Rarity | Weight |
|---|---|
| Common | 1.00 |
| Uncommon | 0.75 |
| Rare | 0.50 |
| Ancient Bones | 0.175 (≈4.5% of a roll, ≈2.2% per kill) |

Weighting barely moves the result — composition does. For a fixed set of
rarities, every sane weight shape lands within ~10%. To change a table's value
meaningfully, change the *rarity mix*, not the weights.

### Reference values

| Table | Shape | EV on a drop | Per kill |
|---|---|---|---|
| Crag Cat | C, U, U, R | 6.67 | 3.33 |
| Gnoll Hunter / Warrior / Pack Lord | T2, C→E | ~7.55 | ~3.78 |
| Gnoll Pack Lord (den, guaranteed) | — | 7.59 | 7.59 |
| Gnoll Fang of Yeenoghu (boss, flat) | — | — | 33.0 |
| Umber Hulk / Roper / Carrion Crawler | C, U, U, U, R + bones | **9.66** | 4.83 |

Chapter 3's monsters sit ~28% above Chapter 2's gnolls, which is the intended
step for a chapter deeper.

### Merged pools

`mergeLootEntries(...lists)` unions several tables, deduping by creator and
keeping the **highest** weight (not the sum) — appearing on three tables
shouldn't triple a card's odds. Used to build the Deep Gnome Merchants' rare
stock from the four Underdark hunting tables.

---

## 6. Adding a card or table — checklist

1. Pick tier + rarity → budget from §1.
2. Add the cost bonus if it takes a second card and doesn't Draw (§2).
3. Spend the budget with §3, applying the multipliers — then run the
   deck-abuse test in §4 on anything that draws, repeats or scales.
4. Sanity-check the slot: does the chapter already have three light armors and
   no ranged weapon? Coverage matters as much as the number — the classes are
   Warrior, Paladin, Rogue, Ranger, Wizard, Necromancer, Druid, and the slots
   are `simple` / `martial` / `martial_2h` / `ranged` / `wand` / `staff` /
   `light_armor` / `heavy_armor` / `clothing` / `relic` / `item` / `allies` /
   `ability`.
5. Wire it: `CARD_REGISTRY`, `CARD_ART_MAP`, `CARD_SFX_OVERRIDES`,
   `LOOT_TABLES` + `LOOT_TABLE_LABELS` + `LOOT_TABLE_NOTES`, `GATED_LOOT`, and
   the encounter's LOOT phase. See CLAUDE.md for the codex wiring rules.
6. Re-check the table's EV against §5 and note it in the table's comment.
