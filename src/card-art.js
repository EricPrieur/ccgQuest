/**
 * Card ID -> art image filename mapping.
 * Complete mapping from the Python game. Images loaded lazily on first use.
 */
const BASE = import.meta.env.BASE_URL || '/';

export const CARD_ART_MAP = {
  // === Starter / Common Cards ===
  wooden_sword: 'WoodenSword.jpg',
  leather_armor: 'LeatherArmor.jpg',
  scraps: 'ScrapsItem.jpg',
  wooden_axe: 'WoodenAxe.jpg',
  wooden_greatsword: 'WoodenGreatsword.jpg',
  rock_mace: 'RockMace.jpg',
  cracked_buckler: 'CrackedBuckler.jpg',
  short_bow: 'ShortBow.jpg',
  short_staff: 'ShortStaff.jpg',
  small_pouch: 'SmallPouch.jpg',
  bone_dagger: 'BoneDagger.jpg',
  dragon_tooth_dagger: 'DragonToothDagger.jpg',
  white_dragonscale_shield: 'WhiteDragonscaleShield.jpg',
  white_dragonscale_armor: 'WhiteDragonscaleArmor.jpg',
  dragon_bone_bow: 'DragonBoneBow.jpg',
  dragon_eye_mace: 'DragonEyeMace.jpg',
  white_dragon_egg: 'WhiteDragonEgg.jpg',
  white_dragon_wyrmling: 'WhiteDragonWyrmling.jpg',
  cloth_armor: 'ClothArmor.jpg',
  buckler: 'Buckler.jpg',
  sharp_rock: 'SharpRock.jpg',
  rock_barrage: 'SharpRock.jpg',
  small_boulder: 'SharpRock.jpg',
  chicken_leg: 'ChickenLeg.jpg',

  // === Paladin ===
  heroic_strike: 'HeroicStrikePaladin.jpg',
  holy_light: 'HolyLightPaladin.jpg',
  shield_of_faith: 'ShieldOfFaithPaladin.jpg',
  flash_heal: 'FlashHeal.jpg',
  consecration: 'Consecration.jpg',
  hammer_of_wrath: 'HammerofWrath.jpg',
  holy_sword: 'HolySword.jpg',
  revivify: 'Revivify.jpg',

  // === Ranger ===
  tamed_rat: 'TamedRatAbility.jpg',
  goodberries: 'GoodberriesAbility.jpg',
  goodberry: 'Goodberryitem.jpg',
  multi_shot: 'MultiShotAbility.jpg',
  aimed_shot_card: 'AimedShot2.jpg',
  careful_strike: 'CarefulStrikeAbility.jpg',
  heroic_tumble: 'HeroicTumble.jpg',
  hunters_mark: 'HunterMark.jpg',
  animal_companion: 'AnimalCompanion.jpg',
  piercing_shot: 'PiercingShot.jpg',
  explosive_shot: 'ExplosiveShot.jpg',
  elemental_weapon: 'ElementalWeaponBothElements.jpg',
  buff_elemental_weapon_fire: 'ElementalWeaponFire.jpg',
  buff_elemental_weapon_ice: 'ElementalWeaponIce.jpg',

  // === Wizard ===
  fire_burst: 'FireBurst.jpg',
  ice_bolt: 'IceBolt.jpg',
  magic_missiles: 'MagicMissile.jpg',
  arcane_shield: 'ArcaneShield.jpg',
  burning_hands: 'BurningHands.jpg',
  ice_nova: 'FrostNova.jpg',
  ice_block: 'IceBlock.jpg',
  ice_shatter: 'IceShatter.jpg',
  cold_breath: 'VarimatrasBreath.jpg',
  varimatras_bite: 'VarimatrasBiteAttack.jpg',
  varimatras_claw: 'VarimatrasClawAttack.jpg',
  varimatras_tail: 'VarimatrasTailSwipe.jpg',
  varimatras_wing: 'VarimatrasWingBuffet.jpg',
  // Varimatras Scale — player relic dropped by the dragon (eventual
  // loot). Reuses the Frost Drake Scale art to keep the dragon-scale
  // visual family consistent across both relics.
  varimatras_scale: 'FrostDrakeScale.jpg',
  arcane_beam: 'ArcaneBeam.jpg',

  // === Rogue ===
  vial_of_poison: 'VialOfPoison.jpg',
  sneak_attack: 'SneakAttack.jpg',
  pet_spider: 'PetSpider.jpg',
  fan_of_blades: 'FanofBlades.jpg',
  backstab: 'Backstab.jpg',
  poisoned_dagger: 'PoisonedDagger.jpg',
  sprint: 'Sprint.jpg',
  // Slyblade enemy-side aliases — same art as the Rogue cards above
  // since the slyblade's kit is the same six abilities a Rogue player
  // could equip. Without these, the enemy versions render as brown
  // placeholders despite the JPGs sitting right there.
  slyblade_backstab: 'Backstab.jpg',
  slyblade_poisoned_dagger: 'PoisonedDagger.jpg',
  slyblade_fan_of_blades: 'FanofBlades.jpg',
  slyblade_sprint: 'Sprint.jpg',
  slyblade_pet_spider: 'PetSpider.jpg',
  slyblade_sneak_attack: 'SneakAttack.jpg',

  // === Warrior ===
  greater_cleave: 'GreaterCleave.jpg',
  charge: 'ChargeWarriorAbility.jpg',
  reckless_strike: 'RecklessStrike.jpg',
  shield_bash: 'ShieldBash.jpg',
  thunderclap: 'Thunderclap.jpg',
  shield_wall: 'ShieldWall.jpg',
  battle_shout: 'BattleShout.jpg',
  execute: 'Execute.jpg',
  enraged_strike: 'EnragedStrike.jpg',

  // === Druid ===
  wrath: 'WrathDruid.jpg',
  regrowth: 'RegrowthDruid.jpg',
  feral_swipe: 'FeralSwipe.jpg',
  feral_swipe_legacy: 'FeralSwipe.jpg',
  cat_form_token: 'DruidFelineForm.jpg',
  bear_form_token: 'BearForm.jpg',
  feral_form: 'DruidFeralForm.jpg',
  summon_treants: 'Treant.jpg',
  feral_bite: 'FeralBite.jpg',
  starfire: 'Starfire.jpg',
  healing_touch: 'HealingTouch.jpg',
  natures_healing: 'HealingTouch.jpg',

  // === Enemy Cards - Rat ===
  bite: 'BiteRat.jpg',
  skreeeeeeeek: 'Skreeeeeeeek.jpg',
  tough_hide: 'TougHide.jpg',
  dire_rat_bite: 'BigBite.jpg',
  dire_rat_screech: 'Skreeeeeeeek.jpg',

  // === Enemy Cards - Bone Pile ===
  big_bone: 'BigBone.jpg',
  loose_bone: 'LooseBone.jpg',

  // === Enemy Cards - Slime ===
  slime_appendage: 'SlimeAppendage.jpg',
  corroded_armor: 'CorrodedArmor.jpg',
  partially_digested_bone: 'PartiallyDigestedBone.jpg',

  // === Enemy Cards - Kobold ===
  guards: 'KoboldGuard.jpg',
  hide_in_corner: 'HiddingInCorner.jpg',
  wardens_whip: 'WardensWhip.jpg',
  kobold_spear: 'KoboldSpear.jpg',
  kobold_shield: 'KoboldShield.jpg',
  spear_throw: 'KoboldSpear.jpg',
  icy_breath: 'IceEffectCard.jpg',
  shield_bash_enemy: 'KoboldShield.jpg',
  defensive_formation: 'DefensiveFormation.jpg',
  drake_rider_charge: 'KoboldDrakeRider.jpg',

  // === Enemy Cards - Stone Giant ===
  stone_giant_smash: 'StoneGiant.jpg',
  large_boulder: 'GiantBoulder.jpg',

  // === Encounter Buffs (Mountain Pass rockslide choices) ===
  buff_running: 'Running.jpg',
  buff_hiding: 'Hiding.jpg',
  buff_calculating: 'Calculating.jpg',

  // === Item-granted buff pseudo-cards (codex-only, reuse source art) ===
  buff_vial_of_poison: 'VialOfPoison.jpg',
  buff_slime_jar: 'SlimeInJar.jpg',
  buff_scroll_of_potency: 'ScrollOfPotency.jpg',
  buff_ale: 'Ale.jpg',
  buff_dwarven_brew: 'DwarvenBrew.jpg',
  buff_regrowth: 'RegrowthDruid.jpg',
  buff_elf_reinforcements: 'ElfWarrior.jpg',
  buff_blizzard: 'BlizzardEnv.jpg',
  buff_sahuagin_eye: 'SahuaginEye.jpg',
  buff_old_god_blessing: 'SahuaginEye.jpg',

  // === Enemy Cards - Spider ===
  poisoned_bite: 'PoisonedBite.jpg',
  web_spider: 'WebSpiderCard.jpg',
  web_token: 'WebSpiderCard.jpg',

  // === Enemy Cards - Sahuagin ===
  trident_throw: 'SahuaginTrident.jpg',
  trident_thrust: 'SahuaginTrident.jpg',
  sahuagin_trident: 'SahuaginTrident.jpg',
  scale_armor: 'ScaleArmor.jpg',
  fish_scale_boots: 'FishScaleBoots.jpg',
  sahuagin_eye: 'SahuaginEye.jpg',
  blood_in_the_water: 'Shark.jpg',
  whirlpool: 'Whirlpool.jpg',
  swimming_in_current: 'SwimingInCurrent.jpg',
  sahuagin_priest_staff: 'SahuaginPriestStaff.jpg',
  jar_of_piranhas: 'JarOfPirahnas.jpg',
  // Gnikan's Staff — chapter 8 frost-shaman placeholder drop.
  gnikans_staff: 'GnikansStaff.jpg',
  barnacle_encrusted_plate: 'BarnacleEncrustedPlate.jpg',
  barnacle_encrusted_plate_enemy: 'BarnacleEncrustedPlate.jpg',
  barnacle: 'Barnacle.jpg',

  // === Enemy Cards - Siege / Ogre ===
  pulling_back_the_ram: 'OgreSiegeRam.jpg',
  goblin_rocket_boots: 'GoblinRocketBoots.jpg',
  goblin_sapper_charges: 'GoblinSapperCharges.jpg',
  ogre_maul: 'OgreMaul.jpg',
  // Enemy character "Siege Ogre" — portrait reuses the ram art.
  siege_ogre: 'OgreSiegeRam.jpg',
  // Goblin Sapper creature portrait (referenced via creature_<name>
  // and the lazy fallback).
  goblin_sapper: 'GoblinSapper.jpg',

  // === Enemy Cards - Obsidian ===
  crush: 'ObsidianGolem.jpg',
  rocky_appendage: 'ObsidianSlime.jpg',
  obsidian_slime_card: 'ObsidianSlime.jpg',
  obsidian_rock: 'ObsidianRock.jpg',
  obsidian_edge: 'ObsidianEdge.jpg',
  obsidian_staff: 'ObsidianStaff.jpg',
  obsidian_spear: 'ObsidianSpear.jpg',
  obsidian_core: 'ObsidianCore.jpg',
  // CombatBuff visuals — reuse the card art so the buff icon shown on
  // the character row matches the card the player just played.
  buff_obsidian_core: 'ObsidianCore.jpg',
  obsidian_shard: 'ObsidianShard.jpg',
  obsidian_curse: 'ObsidianCurseShard.jpg',
  // Token shoved into the player deck by the Oracle's Curse. Uses
  // the same shard art as the curse-card itself so the family reads
  // consistently in hand + draw pile.
  obsidian_shard_token: 'ObsidianCurseShard.jpg',
  // Passive powers that want to "showcase" themselves like a played
  // card (center-screen pop with the arrow timing) need a CARD_ART_MAP
  // entry too — POWER_ART_MAP covers the in-combat power-card render,
  // but the showcase uses drawCard which goes through getCardArt.
  dark_vision: 'ObsidianOracle.jpg',
  lava_floor:  'MagmaFloor.jpg',
  // Blizzard — Overseer Gnikan phase-2 showcase art (reuses the
  // chapter-4 Wolf Blizzard env image so the storm feel is the same
  // across both Blizzard appearances).
  blizzard:    'BlizzardEnv.jpg',
  obsidian_shard_token: 'ObsidianCurseShard.jpg',
  obsidian_candle: 'ObsidianCandle.jpg',

  // === Enemy Cards - Magma / Volcano ===
  tail_swipe: 'MagmaDrake.jpg',
  fire_breath: 'MagmaDrake.jpg',
  molten_bite: 'MagmaDrake.jpg',
  magma_rock: 'MagmaRock.jpg',
  molten_scale_armor: 'MoltenScale.jpg',
  molten_scale_armor_loot: 'MoltenScaleArmor.jpg',
  // Magma Drake plaza-loot relic (rare). Reuses the MoltenScale art.
  molten_scale_relic: 'MoltenScale.jpg',
  magma_mephit_summon: 'MagmaMephit.jpg',
  mephit_skin_sandals: 'MephitSkinSandals.jpg',
  mephit_skin_gloves: 'MephitSkinGloves.jpg',
  magma_tablet: 'MagmaTablet.jpg',
  buff_magma_tablet: 'MagmaTablet.jpg',
  // Volcano's Blessing — granted at the Heart of the Volcano. PY uses
  // the HeartOfTheVolcanoBG.jpg for the buff icon; we reach it via a
  // relative path out of the Cards/ folder so getCardArt's hard-coded
  // assets/Cards/ prefix still resolves correctly.
  buff_volcano_blessing: '../Backgrounds/HeartOfTheVolcanoBG.jpg',

  // Map Knowledge — granted at the Map Table in the Map Room.
  // No dedicated buff art; PY uses the map_room map image, so we
  // reach into the Maps/ folder for the same image (same relative-
  // path trick as buff_volcano_blessing above).
  buff_map_knowledge: '../Maps/DwarvenCityMapRoom.jpg',

  // Dwarven Workbench card-enchant badge art (on-card icon shown
  // next to the enchant name). No dedicated icon yet; pull the
  // intact-workshop bg (DwarvenSmithyBG.jpg) via the same Cards/
  // relative-path escape that the buff entries use.
  enchant_dwarven_workbench: '../Backgrounds/DwarvenSmithyBG.jpg',

  // === Enemy Cards - Other ===
  mimic_bite: 'MimicInAntiquity.jpg',
  mimic_tongue: 'MimicTongue.jpg',
  drain_essence: 'DwarvenSpecter.jpg',
  specter_ectoplasm: 'SpecterEctoplasm.jpg',
  soul_ward: 'SoulWard.jpg',
  gravechill_shard: 'GravechillShard.jpg',
  spectral_hand: 'SpectralHand.jpg',
  pummel: 'RugaTheSlaveMaster.jpg',
  rugas_spiked_gauntlets: 'RugasSpikedGauntlets.jpg',

  // === Loot / Shop / Equipment ===
  bone_wand: 'BoneWand.jpg',
  bone_club: 'BoneClub.jpg',
  bone_mace: 'BoneMace.jpg',
  bone_staff: 'BoneStaff.jpg',
  bone_storm: 'BoneStorm.jpg',
  torch: 'Torch.jpg',
  sturdy_boots: 'SturdyBoots.jpg',
  bad_rations: 'BadRations.jpg',
  travel_rations: 'TravelRations.jpg',
  bandages: 'Bandages.jpg',
  travelers_clothing: 'TravelersClothing.jpg',
  steel_axe: 'SteelAxe.jpg',
  steel_mace: 'SteelMace.jpg',
  steel_greataxe: 'SteelGreatAxe.jpg',
  steel_sword: 'SteelSword.jpg',
  bow: 'Bow.jpg',
  greatclub: 'Greatclub.jpg',
  quarterstaff: 'Quarterstaff.jpg',
  sack: 'Sack.jpg',
  studded_leather_armor: 'StuddedLeather.jpg',
  ring_mail: 'RingMail.jpg',
  steel_dagger: 'SteelDagger.jpg',
  scroll_of_potency: 'ScrollOfPotency.jpg',
  minor_healing_potion: 'MinorHealingPotion.jpg',
  wand_of_fire: 'WandOfFire.jpg',
  chain_shirt: 'ChainShirt.jpg',
  lambas_bread: 'LambasBread.jpg',
  fresh_fish: 'FishFood.jpg',
  // Giant Frog enemy deck (River Cave Mouth lake-rock ambush).
  baby_frog_swarm:    'BabyFrogSwarm.jpg',
  frog_bite:          'GiantFrog.jpg',
  acid_spit:          'GiantFrogAcidSpit.jpg',
  giant_frog_swallow: 'GiantFrogSwallow.jpg',
  // Giant Frog loot drops.
  frog_nursery:       'BabyFrogSwarm.jpg',
  frog_skin_boots:    'FrogSkinBoots.jpg',
  toxic_frog_extract: 'ToxicFrogExtract.jpg',
  // Harpy encounter — Luring Song uses the boss portrait art; the
  // creature lookup for "Harpy" summons points at HarpySummon.jpg.
  luring_song:        'HarpyMonster.jpg',
  // Harpy loot drops.
  feather_cloak:         'FeatherCloak.jpg',
  harpy_feather:         'HarpyFeather.jpg',
  harpy_egg_omelette:    'HarpyEggOmelette.jpg',
  harpy_talon_blade:     'HarpyTalonBlade.jpg',
  harpy_screaming_charm: 'HarpyScreamingCharm.jpg',
  // Kraken Spawn — boss portrait + tentacle creature + Tentacle Grab
  // card art. Boss image is the body; tentacle image is just the limb.
  tentacle_grab:      'KrakenSpawn_TentacleAttack.jpg',
  swallowing_bite:    'KrakenSpawn.jpg',
  kraken_tentacle:    'KrakenSpawnTentacle.jpg',
  kraken_tentacle_block: 'KrakenSpawnTentacle.jpg',
  kraken_whip:           'KrakenSpawnTentacle.jpg',
  ink_cloud:             'InkCloud.jpg',
  // Kraken loot drops (pick-2 epics after the fight).
  bloody_eye_patch:        'BloodyEyePatch.jpg',
  harpoon_of_the_deep:     'HarpoonOfTheDeep.jpg',
  tentacle_whip:           'TentacleWhip.jpg',
  sailors_lucky_compass:   'SailorsLuckyCompass.jpg',
  krakens_eye_spyglass:    'KrakensEyeSpyglass.jpg',
  barnacle_covered_buckler:'BarnacleCoveredBuckler.jpg',
  slime_jar: 'SlimeInJar.jpg',
  white_wolf_cloak: 'WhiteWolfCloak.jpg',
  wolf_teeth: 'WolfTeeth.jpg',
  lucky_pebble: 'LuckyPebble.jpg',
  cave_shroom: 'CaveShroom.jpg',
  frost_drake_scale: 'FrostDrakeScale.jpg',
  white_claw: 'TheWhiteClawZhostSword.jpg',
  white_claw_reforged: 'TheWhiteClawReforged.jpg',
  white_claw_reforged_loot: 'TheWhiteClawReforged.jpg',
  zhosts_buckler: 'ZhostsBuckler.jpg',
  queens_locket: 'TheQueensLocket.jpg',
  ale: 'Ale.jpg',
  dwarven_crossbow: 'DwarvenCrossbow.jpg',
  dwarven_tower_shield: 'DwarvenTowerShield.jpg',
  dwarven_greaves: 'DwarvenGreaves.jpg',
  dwarven_brew: 'DwarvenBrew.jpg',
  whitescale_brew: 'WhitescaleBrew.jpg',
  buff_whitescale_brew: 'WhitescaleBrew.jpg',
  dwarven_warhammer: 'DwarvenWarhammer.jpg',
  ironforge_chainmail: 'IronforgeChainmail.jpg',
  dwarven_throwing_axe: 'DwarvenThrowingAxe.jpg',
  miners_pickaxe: 'MinersPickaxe.jpg',
  runeforged_buckler: 'RuneforgedBuckler.jpg',
  sly_blade: 'Slyblade.jpg',
  shadow_cloak: 'ShadowCloak.jpg',
  kobold_smoke_bomb: 'KoboldSmokeBomb.jpg',
  kobold_lockpick_set: 'KoboldLockpickSet.jpg',

  // === Ally Cards ===
  raena_card: 'RaenaAlly.jpg',
  raena_card_2: 'RaenaAlly.jpg',
  raena_card_3: 'RaenaAlly.jpg',
  thorb_card: 'ThorbAlly.jpg',
  thorb_card_2: 'ThorbAlly.jpg',
  thorb_card_3: 'ThorbAlly.jpg',
  valdrisa_card: 'ValdrisaEmberforge.jpg',
  valdrisa_card_3: 'ValdrisaEmberforge.jpg',
  pet_slime: 'SlimeSummon.jpg',
  dwarven_scout: 'DwarvenScoutAlly.jpg',
  summon_ancestor: 'DurinStoneheart.jpg',

  // === Tokens / Effects ===
  fire_token: 'FireEffectCard.jpg',
  ice_token: 'IceEffectCard.jpg',
  small_faery: 'SmallFaery.jpg',

  // === Character Class Cards (for portraits) ===
  paladin_class: 'PaladinCharacterLevel1.jpg',
  ranger_class: 'RangerCharacter.jpg',
  wizard_class: 'WizardPortrait.jpg',
  rogue_class: 'RogueCharacter.jpg',
  warrior_class: 'WarriorCharacterCard.jpg',
  druid_class: 'DruidCharacterClass.jpg',

  // === Monster portraits ===
  giant_rat: 'GiantRatMonster.jpg',
  bone_pile: 'BonePile.jpg',
  bone_pile_monster: 'BonePile.jpg',
  slime_monster: 'Slime.jpg',
  kobold_warden: 'KoboldWarden.jpg',
  kobold_drake_rider: 'KoboldDrakeRider.jpg',
  // Slyblade enemy portrait. The `sly_blade` (singular) entry above
  // points at the WEAPON card's art (Slyblade.jpg); the kobold itself
  // gets the dedicated KoboldSlyblade.jpg portrait.
  kobold_slyblade: 'KoboldSlyblade.jpg',
  // Dwarven Specter enemy portrait — chapter-7 upper-path random.
  dwarven_specter: 'DwarvenSpecter.jpg',
  // Ruga the Slave Master — Hall of Ancestors boss. The enemy
  // character is named "Ruga the Slave Master" (lowercased +
  // underscored → ruga_the_slave_master), and the encounter id is
  // ruga_slave_master. Map both to the portrait so the combat
  // splash and codex tile both resolve. Brute (Ruga's passive)
  // borrows the same art per PY game.py:810.
  ruga_slave_master: 'RugaTheSlaveMaster.jpg',
  ruga_the_slave_master: 'RugaTheSlaveMaster.jpg',
  brute: 'RugaTheSlaveMaster.jpg',
  // Ancestor Spirits — Sarcophagus boss-shell + three named
  // creatures. SummonAncestor.jpg doesn't exist yet, so the summon
  // card and the boss-shell both fall back to Durin's portrait
  // (he's the founder and named first in the dialog).
  ancestor_spirits:        'DurinStoneheart.jpg',
  the_3_ancestors:         'DurinStoneheart.jpg',
  summon_ancestor:         'DurinStoneheart.jpg',
  durin_stoneheart:        'DurinStoneheart.jpg',
  balgrim_ironvein:        'BalgrimIronvein.jpg',
  thordak_ashmantle:       'ThordakAshmantle.jpg',
  kobold_dragonshield: 'KoboldDragonShield.jpg',
  kobold_slinger: 'KoboldSlinger.jpg',
  stone_giant: 'StoneGiant.jpg',
  frost_drake: 'FrostDrake.jpg',
  dire_rat: 'DireRat.jpg',
  mimic: 'MimicInAntiquity.jpg',
  forest_spider: 'DeathjumpSpider.jpg',
  sahuagin_sentinel: 'SahuaginSentinel.jpg',
  sahuagin_priest: 'SahuaginPriest.jpg',
  sahuagin_baron: 'SahuaginBaron.jpg',
  // Piranhas Swarm boss splash needs `getCardArt('piranhas_swarm')`
  // to resolve — the entry below in POWER_ART_MAP only feeds power
  // lookups, so without this the character-splash overlay fell
  // through to a brown rectangle.
  piranhas_swarm: 'PiranhasSwarm.jpg',
  obsidian_golem: 'ObsidianGolem.jpg',
  obsidian_construct: 'ObsidianGolem.jpg',
  obsidian_slime: 'ObsidianSlime.jpg',
  kobold_drake_rider: 'KoboldDrakeRider.jpg',
  // Codex lookup uses the encounter id (plural). The singular alias
  // above is still used by the player-side Pet Spider summon.
  forest_spiders: 'DeathjumpSpider.jpg',
  obsidian_slime: 'ObsidianSlime.jpg',
  magma_drake: 'MagmaDrake.jpg',
  general_zhost: 'GeneralZhost.jpg',
  ruga: 'RugaTheSlaveMaster.jpg',
  skeletal_king: 'SkeletalKing.jpg',
  wolf: 'WolfInSnow.jpg',
  // Chapter 8 — Overseer Gnikan, kobold frost shaman boss on the
  // summit ridge. Summons Ice Elemental allies at fight start.
  overseer_gnikan: 'OverseerGnikan.jpg',

  // === Creature summons ===
  rat: 'SummonRat.jpg',
  // Ice Elemental — Gnikan's summons. Three sizes (1/1, 2/2, 3/3)
  // share the same art; the boss spawns them at fight start.
  ice_elemental: 'IceElemental.jpg',
  // tamed_rat conflicts with the player's Tamed Rat ability card (ability) — keep
  // ability art at the top of the file (line 36); the lookup uses tamed_rat for both.
  restless_bone: 'RestlessBoneSummon.jpg',
  slime: 'SlimeSummon.jpg',
  pet_slime: 'SlimeSummon.jpg',
  kobold_guard: 'KoboldGuard.jpg',
  thorb: 'ThorbAlly.jpg',
  small_spider: 'PetSpider.jpg',
  spider: 'PetSpider.jpg',
  deathjump_spider: 'DeathjumpSpider.jpg',
  // Enemy Character is named 'Deathjump Spiders' (plural) so the
  // portrait lookup needs the plural form too.
  deathjump_spiders: 'DeathjumpSpider.jpg',
  bone_amalgam: 'BoneAmalgam.jpg',
  goblin_sapper: 'GoblinSapper.jpg',
  elf_warrior: 'ElfWarrior.jpg',
  // Two normalization variants exist: the combat character panel uses
  // replace(/ /g, '_') (apostrophe kept), and the character splash uses
  // replace(/[^a-z0-9]+/g, '_') (apostrophe → underscore). Register both.
  "general_zhost's_army": 'GeneralZhost.jpg',
  general_zhost_s_army: 'GeneralZhost.jpg',
  raena: 'RaenaAlly.jpg',
  valdrisa: 'ValdrisaEmberforge.jpg',
  piranhas: 'PiranhasSwarm.jpg',
  durin_stoneheart: 'DurinStoneheart.jpg',
  balgrim_ironvein: 'BalgrimIronvein.jpg',
  thordak_ashmantle: 'ThordakAshmantle.jpg',
  misha: 'MishaCompanion.jpg',
  huffer: 'HufferCompanion.jpg',
  treant: 'Treant.jpg',
  magma_mephit: 'MagmaMephit.jpg',

  // === Perks (rendered as pseudo-cards in the codex / PERK_SELECT) ===
  // Keyed by the perk's id so drawCard(perkPseudoCard) picks the right art.
  tough:           'ToughPerk.jpg',
  prepared:        'PreparedPerk.jpg',
  flash_of_genius: 'FlashOfGeniusPerk.jpg',
  grit:            'GritPerk.jpg',
  arsenal:         'ArsenalPerk.jpg',
  talented:        'TalentedPerk.jpg',
  second_wind:     'SecondWindPerk.jpg',
  ambush:          'AmbushPerk.jpg',
  first_strike:    'FirstStrikePerk.jpg',
  armored:         'ArmoredPerk.jpg',
  power_surge:     'PowerSurgePerk.jpg',
  balanced:        'BalanceDruidPerk.jpg',
  lucky_find:      'LuckyFindPerk.jpg',
  harvest:         'HarvestDruidSpec.jpg',

  // === Enemy Encounter Portraits ===
  kobold_patrol:   'KoboldPatrolEncounter.jpg',
};

export const POWER_ART_MAP = {
  cleave: 'CleaveAbility.jpg',
  aimed_shot: 'AimedShot.jpg',
  elemental_infusion: 'ElementalInfusion.jpg',
  quick_strike: 'QuickStrike.jpg',
  battle_fury: 'BattleFuryPower.jpg',
  feral_form: 'DruidFeralForm.jpg',
  chunky_bite: 'BigBite.jpg',
  armor: 'ArmorPower.jpg',
  split: 'SplitSlime.jpg',
  dire_fury: 'DireFury.jpg',
  overwhelm: 'MimicInAntiquity.jpg',
  wolf_pack: 'WolfPackPower.jpg',
  piranhas_swarm: 'PiranhasSwarm.jpg',
  piranha: 'PiranhasSwarm.jpg',
  shark: 'Shark.jpg',
  from_the_deep: 'Shark.jpg',
  sahuagin_sentinel: 'SahuaginSentinel.jpg',
  high_priest: 'SahuaginPriest.jpg',
  massive_ogre_ram: 'OgreSiegeRam.jpg',
  goblin_sapper_squad: 'GoblinSapper.jpg',
  obsidian_construct: 'ObsidianGolem.jpg',
  obsidian_body: 'ObsidianSlime.jpg',
  lava_floor: 'MagmaFloor.jpg',
  // Blizzard — Overseer Gnikan phase-2 passive. Reuses the
  // BlizzardEnv art (same wind-and-snow vibe as the Wolf Blizzard
  // combat buff in chapter 4).
  blizzard: 'BlizzardEnv.jpg',
  dark_vision: 'ObsidianOracle.jpg',
  obsidian_oracle_body: 'ObsidianOracle.jpg',
  vanish: 'Vanish.jpg',
  // Brute is Ruga's signature passive — share his portrait so the
  // power card matches the boss. PY game.py:810 uses the same file.
  brute: 'RugaTheSlaveMaster.jpg',
  // Ethereal is the Specter's signature passive — share its portrait.
  // PY game.py:809 uses DwarvenSpecter.jpg.
  ethereal: 'DwarvenSpecter.jpg',
  kobold_backup: 'KoboldGuard.jpg',
  kobold_army: 'KoboldArmy.jpg',
  // Kobold Drake Rider's escalating-swarm variant uses the same art
  // as General Zhost's kobold_army power.
  kobold_army_swarm: 'KoboldArmy.jpg',
  amalgam: 'BonePile.jpg',
  // Ancient White — Varimatras's signature passive: incoming Ice
  // on the dragon flips to +1 Shield instead. Uses his own backdrop
  // art so the power card reads as "the dragon himself".
  ancient_white: 'VarimatrasBG.jpg',
};

// Lazy-loading image cache
const imageCache = {};
const loadingSet = new Set();

export function getCardArt(cardId) {
  if (imageCache[cardId]) return imageCache[cardId];
  let filename = CARD_ART_MAP[cardId];
  // ccgQuest+ perks stamp their id with a "_p<N>" suffix (tough →
  // tough_p1). Fall back to the base id so the suffix variant reuses
  // the original art instead of rendering a brown placeholder.
  if (!filename) {
    const m = cardId && cardId.match(/^(.*)_p(\d+)$/);
    if (m) filename = CARD_ART_MAP[m[1]];
  }
  if (!filename) return null;
  if (loadingSet.has(cardId)) return null;

  loadingSet.add(cardId);
  const img = new Image();
  img.onload = () => {
    imageCache[cardId] = img;
    loadingSet.delete(cardId);
  };
  img.onerror = () => loadingSet.delete(cardId);
  img.src = `${BASE}assets/Cards/${filename}`;
  return null;
}

export function getPowerArt(powerId) {
  const key = `power_${powerId}`;
  if (imageCache[key]) return imageCache[key];
  const filename = POWER_ART_MAP[powerId];
  if (!filename) return null;
  if (loadingSet.has(key)) return null;

  loadingSet.add(key);
  const img = new Image();
  img.onload = () => {
    imageCache[key] = img;
    loadingSet.delete(key);
  };
  img.onerror = () => loadingSet.delete(key);
  img.src = `${BASE}assets/Cards/${filename}`;
  return null;
}

/**
 * Preload a specific list of card art ids. Use this for screens that
 * show known portraits (e.g. class select) so they're guaranteed to be
 * in the cache before the screen renders. Returns a Promise that
 * resolves when all listed ids have loaded or failed.
 */
export function preloadCardArt(ids) {
  const promises = [];
  for (const id of ids) {
    if (imageCache[id]) continue;
    const filename = CARD_ART_MAP[id];
    if (!filename) continue;
    promises.push(new Promise(resolve => {
      const img = new Image();
      img.onload = () => { imageCache[id] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = `${BASE}assets/Cards/${filename}`;
    }));
  }
  return Promise.all(promises);
}

/**
 * Eagerly preload ALL card art + power art into the image cache.
 * Returns a Promise that resolves when every image has either loaded
 * or failed (so the caller can await it during the loading screen).
 * After this runs, getCardArt / getPowerArt never return null for a
 * known id — no more purple-flash on first draw.
 */
export function preloadAllArt() {
  const promises = [];
  for (const [id, filename] of Object.entries(CARD_ART_MAP)) {
    if (imageCache[id]) continue;
    promises.push(new Promise(resolve => {
      const img = new Image();
      img.onload = () => { imageCache[id] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = `${BASE}assets/Cards/${filename}`;
    }));
  }
  for (const [id, filename] of Object.entries(POWER_ART_MAP)) {
    const key = `power_${id}`;
    if (imageCache[key]) continue;
    promises.push(new Promise(resolve => {
      const img = new Image();
      img.onload = () => { imageCache[key] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = `${BASE}assets/Cards/${filename}`;
    }));
  }
  return Promise.all(promises);
}
