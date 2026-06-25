/**
 * Codex Lore registry.
 *
 * Hand-curated narrative reference shown on the codex "Lore" tab — names of
 * people, places, factions, creatures of note, artifacts, events, and deities
 * the story has introduced, each with a short 1-2 line gloss.
 *
 * Unlike cards / loot / decks, lore is NOT auto-discovered from runtime data —
 * it's authored here. To add an entry, append an object with:
 *   - name:        the proper noun (string)
 *   - type:        one of LORE_TYPES below (drives the colored tag + filter)
 *   - description: 1-2 lines, ~140 chars max, grounded in what the game says
 *
 * Keep descriptions spoiler-light where it matters, and only state what the
 * narrative text actually establishes. The codex Lore grid renders + searches
 * this list directly (src/main.js drawCodexLoreGrid).
 */

// Canonical category set. The codex builds its type filter pills from this
// order, and LORE_TYPE_COLORS tints each tag. Add a new type here + a color
// below if the world grows a category (e.g. 'Language').
export const LORE_TYPES = ['Person', 'Place', 'Faction', 'Creature', 'Artifact', 'Event', 'Deity'];

export const LORE_TYPE_COLORS = {
  Person:   '#7cc4ff',
  Place:    '#8ad08a',
  Faction:  '#e0b060',
  Creature: '#ff8a8a',
  Artifact: '#c89cff',
  Event:    '#ffd070',
  Deity:    '#f0f0c0',
};

export const LORE_ENTRIES = [
  // ---- Places ----
  { name: 'Qualibaf', type: 'Place', description: 'A small mountain city and adventuring hub, home to the Adventurer’s Guild, the smiths, and the valley’s shops.' },
  { name: 'Qualibaf Bridge', type: 'Place', description: 'The trade bridge linking Qualibaf to the northern territories, partly torn down by kobold raiders.' },
  { name: 'South Outpost', type: 'Place', description: 'A small fortified river tower south of Qualibaf, held by a handful of guards under Captain Gontran.' },
  { name: 'Filibaf Forest', type: 'Place', description: 'A dark, ancient forest east of Qualibaf, choked with giant spiders — a dangerous shortcut toward Tharnag.' },
  { name: 'Plains of No Hope', type: 'Place', description: 'A grey, barren expanse of old bones and howling wind between the mountains and the ruins.' },
  { name: 'Calm Stream', type: 'Place', description: 'An enchanted forest stream tied to old elven magic and healing.' },
  { name: 'Piranha Pool', type: 'Place', description: 'A basin of dark water swarming with carnivorous fish, guarding a flooded ancient temple.' },
  { name: 'Merchant Ship', type: 'Place', description: 'A merchant cog stranded in a mountain lake, now nested by harpies and a kraken spawn — and full of salvage.' },
  { name: 'Tharnag', type: 'Place', description: 'The great dwarven stronghold carved into the northern mountains, housing the Great Forge and the Hall of Ancestors.' },
  { name: 'Great Forge', type: 'Place', description: 'The heart of Tharnag’s smithing, fed by the volcano’s lava — vital to all dwarven craft.' },
  { name: 'The Great Pour', type: 'Event', description: 'A dwarven last resort: tap the mountain and divert its lava through the Great Forge to flood the deep tunnels, sealing them and drowning everything below in fire.' },
  { name: 'Stairs of the Infinite', type: 'Place', description: 'A colossal stairway carved into the cliffs by ancient dwarves, climbing from Tharnag toward the high peaks.' },
  { name: 'Thorgazad', type: 'Place', description: 'An ancient dwarven city within the mountain, once home to thousands, now besieged — keeps the kings’ tomb.' },
  { name: 'Mount Parícutin', type: 'Place', description: 'The active volcano above the Qualibaf valley (the in-city “Qualibaf Volcano”). Its fires were frozen by the dragon Varimatras, chilling the whole valley.' },
  { name: 'Parícutin Valley', type: 'Place', description: 'The valley cradling Mount Parícutin and Qualibaf — walled north by the Border Mountains and south by the Bottomless Lake, with its own mild microclimate.' },
  { name: 'Border Mountains', type: 'Place', description: 'The great range crossing the continent west to east; it plunges into the Sea of Thassa and rises again as the Isles of Gor. (Old: Monts Frontières.)' },
  { name: 'River Cutin', type: 'Place', description: 'The valley’s river, born in the Border Mountains north of Parícutin; below Qualibaf it splits — west into the Bottomless Lake, east toward the Nacutin.' },
  { name: 'Nacutin River', type: 'Place', description: 'The River Cutin grown to a great river east of Qualibaf, carving the Nacutin Canyon as it sinks into the land.' },
  { name: 'Bottomless Lake', type: 'Place', description: 'The deep lake south of the Parícutin valley, fed by the western fork of the River Cutin. (Old: Lac Sans Fond.)' },
  { name: 'Obsidian Tunnels', type: 'Place', description: 'Razor-walled tunnels deep beneath the volcano, a hub linking the buried obsidian districts.' },
  { name: 'Obsidian Forge', type: 'Place', description: 'A deep underground crafting district where dark smithing techniques are practiced.' },
  { name: 'Obsidian Plaza', type: 'Place', description: 'A vast subterranean plaza of obsidian pillars and a long-dry fountain.' },
  { name: 'Obsidian Cathedral', type: 'Place', description: 'A ruined cathedral in the deep places, haunt of the Obsidian Oracle and an ancient shrine.' },
  { name: 'Deep Roads', type: 'Place', description: 'Ancient passages beneath the kingdoms, stalked by goblin warbands and drow scouts — a gathering threat.' },
  { name: 'Silverwood', type: 'Place', description: 'The elven homeland, home of Raena and the elves driven out by kobold ambushes.' },
  { name: 'Chapel of Light', type: 'Place', description: 'A small church in Qualibaf offering blessings and healing in exchange for an offering.' },

  // ---- People ----
  { name: 'Thorb', type: 'Person', description: 'A dwarven prince (Thorbadin), son of King Thorgrim, freed from the kobold warren; betrothed to Valdrisa Emberforge.' },
  { name: 'Raena', type: 'Person', description: 'An elf warrior and archer of the Silverwood who joins the party after the clash with General Zhost.' },
  { name: 'Valdrisa Emberforge', type: 'Person', description: 'A fierce dwarven princess, Thorb’s betrothed, who insists on joining the quest.' },
  { name: 'King Thorgrim', type: 'Person', description: 'King of Tharnag and Thorb’s father — a broad-shouldered dwarf, silver beard braided with golden rings.' },
  { name: 'General Durgan', type: 'Person', description: 'Grey-bearded war-marshal of the Tharnag army; rallies the halls when the goblins break up through the sealed deep tunnels into the city.' },
  { name: 'Queen Eirdrís', type: 'Person', description: 'Queen of Tharnag and Thorb’s mother, who gave him her lucky locket before his quest.' },
  { name: 'Khydhani', type: 'Person', description: 'A drow (dark elf) assassin and one of the secret drow leaders behind the goblin assault on Tharnag. He murders the forge-dwarves to stop the Great Pour, clashes with the party at the Great Forge, then escapes.' },
  { name: 'Kellen', type: 'Person', description: 'A fifteen-year-old boy, son of the smiths Doran and Mira, carried off by kobolds while defending Qualibaf.' },
  { name: 'Doran', type: 'Person', description: 'The armorsmith of Qualibaf, Kellen’s father — rewards his son’s rescuers with training and lasting discounts.' },
  { name: 'Mira', type: 'Person', description: 'The weaponsmith of Qualibaf, Kellen’s mother — a master of blade and steel.' },
  { name: 'Aldric Voss', type: 'Person', description: 'Guildmaster of the Adventurer’s Guild in Qualibaf, who grants the party hero status.' },
  { name: 'Elarion', type: 'Person', description: 'A silver-haired elf merchant running Qualibaf’s Arcane Emporium; knew Master Mortain and welcomes necromancer apprentices.' },
  { name: 'Master Mortain', type: 'Person', description: 'A late master necromancer who trained students in the occult arts, tied to Elarion’s Arcane Emporium.' },
  { name: 'Captain Gontran', type: 'Person', description: 'Guard captain of the South Outpost, who asks the party to investigate a wrecked merchant boat on the river.' },
  { name: 'Olbrim Goldbalm', type: 'Person', description: 'An apothecary from Tharnag, seeking a cure for a strange ailment in the mountains.' },
  { name: 'Korgan', type: 'Person', description: 'A dwarf scout of Tharnag, caught by the spiders of Filibaf Forest and freed by the party.' },
  { name: 'General Zhost', type: 'Person', description: 'The largest kobold ever known, warlord of the White Claw, who escapes despite near-defeat.' },
  { name: 'Ruga the Slave Master', type: 'Person', description: 'A monstrous kobold, twice the height of his kind, commanding slave gangs in the deep dwarven city.' },
  { name: 'Durin Stoneheart', type: 'Person', description: 'One of the three ancient dwarven founder-kings, now a spirit guarding Thorgazad’s tomb.' },
  { name: 'Balgrim Ironvein', type: 'Person', description: 'One of the three ancient dwarven founder-kings, a spirit guardian of Thorgazad’s tomb.' },
  { name: 'Thordak Ashmantle', type: 'Person', description: 'One of the three ancient dwarven founder-kings, spirit protector of the sarcophagus in Thorgazad.' },

  // ---- Factions ----
  { name: 'White Claw', type: 'Faction', description: 'A unified kobold horde led by General Zhost, holding the mountain passes and the volcano above Qualibaf.' },
  { name: 'Mountain Dwarves', type: 'Faction', description: 'The dwarven people of Tharnag and the mountain kingdoms, ancient foes of the Stone Giants.' },
  { name: 'Drow', type: 'Faction', description: 'Dark elves of the Deep Roads, now marching openly under banners — a sign of some larger design.' },

  // ---- Creatures ----
  { name: 'Varimatras', type: 'Creature', description: 'The white dragon of the volcano whose magic froze the lava flow and sank the valley into cold.' },
  { name: 'Stone Giant', type: 'Creature', description: 'A mountain of living granite with molten eyes — ancient killer of Thorb’s dwarven ancestors.' },
  { name: 'Sahuagin', type: 'Creature', description: 'Fish-like humanoids of the flooded ruins, fiercely territorial, led by an armored Baron.' },
  { name: 'Sahuagin Baron', type: 'Creature', description: 'The armored war-leader of the Sahuagin, commanding sharks and sentries from a flooded chamber.' },
  { name: 'Harpies', type: 'Creature', description: 'Pale, black-feathered hunters nesting in a ship’s masts, luring prey with an alluring, deadly song.' },
  { name: 'Giant Frog', type: 'Creature', description: 'An enormous lake amphibian that snares prey with its tongue and spits acid.' },
  { name: 'Kraken Spawn', type: 'Creature', description: 'A young tentacled horror lairing inside a sunken merchant cog — powerful and deadly.' },
  { name: 'Obsidian Oracle', type: 'Creature', description: 'A mysterious entity haunting the Obsidian Cathedral, a mini-boss of the deep places.' },
  { name: 'Magma Drake', type: 'Creature', description: 'A drake lairing near the Obsidian Plaza, a formidable mini-boss of the underground.' },

  // ---- Artifacts ----
  { name: 'White Dragon Egg', type: 'Artifact', description: 'A dragon egg recovered from the volcano that later hatches into the party’s White Dragon Wyrmling.' },

  // =====================================================================
  // THE WIDER WORLD — beyond the Parícutin valley.
  // Drawn from the original design notes (OldLore.txt). NONE of this is
  // built into the game yet — it's canon reference so new dialog can name
  // these places/people consistently if the story ever reaches them.
  // Treat as provisional; refine as areas actually get authored.
  // =====================================================================

  // ---- The continent & the seas ----
  { name: 'Erus', type: 'Place', description: 'The main continent, where the adventure takes place.' },
  { name: 'Uternia', type: 'Place', description: 'A vast ocean off the continent of Erus.' },
  { name: 'Sea of Thassa', type: 'Place', description: 'The sea dividing the Isles of Gor from Erus — walled north by the Border Mountains, open west to the ocean Uternia.' },
  { name: 'Bay of Titans', type: 'Place', description: 'A wide bay north of the Border Mountains, where calving glaciers spawn the drifting “Titans” that give it its name.' },
  { name: 'Kraken Pass', type: 'Place', description: 'A broad strait between two islands north of the Sea of Thassa — passable by ship, but a Kraken is said to wreck all who try. Leads north to the Bay of Titans.' },

  // ---- The dwarven empire (far north) ----
  { name: 'Kazordoon', type: 'Place', description: 'The dwarven capital of the continent, north of the Border Mountains, reached by a great underground river beneath the Vilcabambor glacier. Ruled with an iron fist.' },
  { name: 'Prison of Kazordoon', type: 'Place', description: 'Kazordoon’s deep prison — a warren of caverns and tunnels sealed by ancient wards. Holds a beaten Duergar people and a number of Illithid.' },
  { name: 'Emperor Kruzak Dustbeard', type: 'Person', description: 'The iron-fisted dwarven ruler of Kazordoon.' },
  { name: 'Vilcabambor', type: 'Place', description: 'The region’s greatest glacier — “the River that Moves” in old Dwarven — beneath which an underground river flows toward Kazordoon.' },

  // ---- The Isles of Gor ----
  { name: 'Isles of Gor', type: 'Place', description: 'Islands north of the Sea of Thassa under Port-Kar’s loose rule; slavery is tolerated, and they raid Erus’s north coast and war with Netenya.' },
  { name: 'Port-Kar', type: 'Place', description: 'Capital and largest city of the Isles of Gor, ruled by its Minotaurs — a legendary, scoundrel-filled port built on the slave trade.' },
  { name: 'Sardo de Numspa', type: 'Person', description: 'Master of Gor’s slavers’ guild, with a heavy hand in Port-Kar.' },

  // ---- The eastern kingdom ----
  { name: 'Netenya', type: 'Place', description: 'A great eastern city of the Kingdom, ruled by an elected council of noble families beneath a decorative monarchy.' },
  { name: 'House Gravel', type: 'Faction', description: 'An influential Netenya family; patriarch Xander covets the seat of chief chancellor. Kin: Vincent, Tovin, Mikus, Alesia.' },
  { name: 'Princess Elizabetha', type: 'Artifact', description: 'A fast interceptor warship of the Netenya navy.' },

  // ---- The frontier (border road, rivers, marsh) ----
  { name: 'Border Road', type: 'Place', description: 'A poorly-kept road tracing the Border Mountains west to east; it crosses the River Cutin by a bridge (lately destroyed, to be rebuilt).' },
  { name: 'Nebanor', type: 'Place', description: 'Half city, half watch-fort, guarding the Neten and Netenya from the Orc Plateau and the mountains. Sits where the Gelion and Geos rivers meet.' },
  { name: 'Trinalide', type: 'Place', description: 'A guard post where three waters meet — the Nacutin, the Gelion, and the southern Ougharum — and the Nacutin widens, its water turning brackish near the sea.' },
  { name: 'River Gelion', type: 'Place', description: 'A river rising on the peaks Himlad and Lothlann by the Aglon Pass; it splits Erus’s NE plains — Orc Plateau to the west, the Neten to the east.' },
  { name: 'Aglon Pass', type: 'Place', description: 'The pass crossing the Border Mountains at the River Gelion, between Mounts Himlad and Lothlann — supposedly shut for years by a great rockslide.' },
  { name: 'Orc Plateau', type: 'Place', description: 'A raised land east of Filibaf Forest to the Gelion, hemmed by the Nacutin and the Border Mountains — and teeming with orcs.' },
  { name: 'Geos Marsh', type: 'Place', description: 'A floodable marshland draining into the Sea of Thassa, home to lizardfolk and amphibious creatures; the Border Road skirts its north.' },
  { name: 'River Geos', type: 'Place', description: 'The river bordering the Neten to the north, as far as the Geos Marsh.' },
  { name: 'Tssag Tzzag', type: 'Place', description: 'A lizardfolk village on the Border Road in the Geos Marsh — usually neutral, a rare bazaar (slaves included) where “good” and “evil” races mingle.' },

  // ---- The fungus underworld (east of Tharnag) ----
  { name: 'Quercus Forest', type: 'Place', description: 'An underground giant-fungus forest east of Tharnag, grown when an Ancient Black Dragon’s acid soaked the caves beneath the Great Glacier. It now seems alive.' },
  { name: 'The Great Glacier', type: 'Place', description: 'The largest glacier of the Border Mountains, where an Ancient Black Dragon lies frozen — its presence birthed the Quercus Forest below.' },
  { name: 'The Black Lake', type: 'Place', description: 'A deeply acidic underground lake beneath the glacier, formed by the Ancient’s runoff; a ruined islet at its center draws young black dragons.' },
  { name: 'Ancient Black Dragon', type: 'Creature', description: 'A dying elder dragon frozen into the Great Glacier; its acid carved the Black Lake and seeded the Quercus Forest.' },
  { name: 'Spongy Crystals', type: 'Artifact', description: 'Crystals of the Quercus Forest, prized for granting temporary night vision.' },
  { name: 'Guk', type: 'Place', description: 'A mid-sized Froglok town in the eastern Quercus Forest — good-hearted, but cowed by the tyrant Black Brothers who demand regular offerings.' },
  { name: 'Lower Guk', type: 'Place', description: 'The Frogloks’ ancient sacred city beside Guk — long abandoned, undead-infested, its barricaded depths watched by Bahamut’s templars.' },
  { name: 'The Black Brothers', type: 'Faction', description: 'Two tyrants lording over Guk, exacting regular offerings under threat.' },
  { name: 'Oracle of Guk', type: 'Person', description: 'The venerable elder and conscience of Guk — conservative and hard to sway.' },
  { name: 'Templars of Bahamut', type: 'Faction', description: 'A holy order in Guk sworn to destroy the undead and shield the town from the evil rising in the depths.' },
  { name: 'Dimitri', type: 'Person', description: 'A Templar of Bahamut at Guk.' },
  { name: 'Démétan', type: 'Person', description: 'Démétan the Troll-cleaver, a champion of Guk.' },
];
