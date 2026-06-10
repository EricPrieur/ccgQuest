/**
 * Map system - nodes connected by paths, each with encounters.
 */

export class MapNode {
  constructor({
    id, name, description, encounterId = '',
    connections = [], position = [0, 0], mapArea = '',
    isLocked = false, canRevisit = false, unlocks = [],
    hiddenName = '', hiddenDescription = '',
    passthroughTo = '', repeatableUntil = '',
    wip = false, discoverable = false,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.encounterId = encounterId;
    this.connections = connections;
    this.position = position;
    this.mapArea = mapArea;
    this.isLocked = isLocked;
    this.isDone = false;
    this.canRevisit = canRevisit;
    this.unlocks = unlocks;
    this.hiddenName = hiddenName;
    this.hiddenDescription = hiddenDescription;
    // When the node is done and clicked, auto-move to this node id instead
    // of retriggering the encounter (e.g. the kitchen shunts back to the
    // sewer passage once you've resolved it).
    this.passthroughTo = passthroughTo;
    // When set, the encounter repeats while canRevisit is true UNTIL the
    // node id named here is isDone — at that point this node stops
    // refiring its encounter (e.g. Sentinel Patrol stops once the Baron
    // is killed). Combined with canRevisit:true.
    this.repeatableUntil = repeatableUntil;
    // Keys of encounter choices that have been permanently exhausted on this node.
    // Used for repeat-visit encounters (Abandoned Camp: one rest, one search).
    this.exhaustedChoices = [];
    // wip: marks a node as "work in progress" — invisible + unreachable
    // unless debug mode is on. Render layer + click router gate on the
    // debugMode flag in main.js. Lets us push half-built content to main
    // without leaking it to players.
    this.wip = wip;
    // discoverable: hides the node from the map until the player is
    // within 1 hop (accessible from the current node) — even on
    // outdoor maps where everything is normally visible. Once visited,
    // the node stays visible forever. Combine with hiddenName: '???'
    // so the close-but-unexplored render reads as a mystery dot.
    this.discoverable = discoverable;
  }

  get displayName() {
    if (!this.isDone && this.hiddenName) return this.hiddenName;
    return this.name;
  }

  get displayDescription() {
    if (!this.isDone && this.hiddenDescription) return this.hiddenDescription;
    return this.description;
  }
}

export class GameMap {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.nodes = {};
    this.currentNodeId = '';
    this.mapImages = {}; // areaId -> image path
  }

  addNode(node) {
    this.nodes[node.id] = node;
  }

  getNode(id) {
    return this.nodes[id] || null;
  }

  getCurrentNode() {
    return this.getNode(this.currentNodeId);
  }

  getAccessibleNodes() {
    const current = this.getCurrentNode();
    if (!current) return [];
    return current.connections
      .map(id => this.getNode(id))
      .filter(n => n && !n.isLocked);
  }

  moveTo(nodeId) {
    const accessible = this.getAccessibleNodes();
    const node = accessible.find(n => n.id === nodeId);
    if (!node) return false;
    this.currentNodeId = nodeId;
    return true;
  }

  completeCurrentNode() {
    const node = this.getCurrentNode();
    if (!node) return;
    node.isDone = true;
    for (const unlockId of node.unlocks) {
      const target = this.getNode(unlockId);
      if (target) target.isLocked = false;
    }
  }
}

// === Prison Cell Map ===
export function createPrisonCellMap() {
  const map = new GameMap('prison_cell', 'Prison Cell');
  map.mapImages = {
    prison_cell: 'Maps/PrisonCellMap.jpg',
    sewers: 'Maps/SewerMap.jpg',
    upper_prison: 'Maps/KoboldCastlePrisonMap.jpg',
  };

  const nodes = [
    { id: 'bed', name: 'Bed', description: 'A filthy straw mattress where you woke up. The rats are gone now.', encounterId: 'giant_rat', connections: ['door', 'bone_pile'], position: [720, 280], mapArea: 'prison_cell' },
    { id: 'door', name: 'The Door', description: 'A heavy iron door. Locked tight.', encounterId: 'locked_door', connections: ['bed'], position: [512, 160], mapArea: 'prison_cell', canRevisit: true },
    { id: 'bone_pile', name: 'Bone Pile', description: 'A pile of old bones in the corner.', encounterId: 'bone_pile', connections: ['bed', 'crack'], position: [300, 720], mapArea: 'prison_cell', unlocks: ['crack'] },
    { id: 'crack', name: 'The Crack', description: 'A narrow crack in the floor.', encounterId: 'crack', connections: ['bone_pile'], position: [180, 580], mapArea: 'prison_cell', isLocked: true, canRevisit: true },
    { id: 'splash_point', name: 'Splash Point', description: 'Where you fell into the foul sewer water.', encounterId: 'splash_point', connections: ['dead_end', 'sewer_junction'], position: [728, 110], mapArea: 'sewers', isLocked: true, unlocks: ['dead_end', 'sewer_junction'] },
    { id: 'dead_end', name: 'Dead End', description: 'A sturdy metal gate blocks the way.', encounterId: 'dead_end', connections: ['splash_point', 'tight_opening'], position: [1050, 250], mapArea: 'sewers', isLocked: true, unlocks: ['tight_opening'], hiddenName: 'Deeper Sewer', hiddenDescription: 'The tunnel slopes upward into darkness.' },
    { id: 'tight_opening', name: 'Tight Opening', description: 'A narrow gap carved through rock by slime acid.', encounterId: 'tight_opening', connections: ['dead_end', 'lost_shrine'], position: [1220, 380], mapArea: 'sewers', isLocked: true, canRevisit: true, hiddenName: 'Deeper Sewer', hiddenDescription: 'The tunnel continues into darkness.' },
    // Lost Shrine — single-shot. The encounter grants a class-specific
    // ability card via the ABILITY_SELECT flow; re-firing would let the
    // player stack extra ability picks. canRevisit removed accordingly.
    { id: 'lost_shrine', name: 'Lost Shrine', description: 'A forgotten shrine glowing with faint golden light.', encounterId: 'lost_shrine', connections: ['tight_opening'], position: [1320, 220], mapArea: 'sewers', isLocked: true, hiddenName: '???', hiddenDescription: 'Something glows faintly beyond the gap.' },
    { id: 'sewer_junction', name: 'Sewer Junction', description: 'A junction where passages branch.', encounterId: 'sewer_junction', connections: ['splash_point', 'deeper_sewer', 'less_deep_sewer'], position: [500, 420], mapArea: 'sewers', isLocked: true, unlocks: ['deeper_sewer', 'less_deep_sewer'], hiddenName: 'Deeper Sewer', hiddenDescription: 'The tunnel descends deeper into darkness.' },
    { id: 'deeper_sewer', name: 'Abandoned Camp', description: 'An old campsite left behind by adventurers.', encounterId: 'abandoned_camp', connections: ['sewer_junction'], position: [728, 420], mapArea: 'sewers', isLocked: true, canRevisit: true, hiddenName: 'Dark Passage', hiddenDescription: 'A passage descending into total darkness.' },
    // Upward Passage: dialog only fires the first time. After that, the node
    // is a silent move-through and `passthroughTo: 'kitchen'` means clicking
    // it while already standing on it shortcuts straight up to the Kitchen.
    { id: 'less_deep_sewer', name: 'Upward Passage', description: 'The tunnel slopes upward. Light from above.', encounterId: 'upward_passage', connections: ['sewer_junction', 'kitchen'], position: [200, 420], mapArea: 'sewers', isLocked: true, canRevisit: false, passthroughTo: 'kitchen', hiddenName: 'Upward Passage', hiddenDescription: 'A passage that seems to lead upward.' },
    // Kitchen: one-shot encounter. Once the player has made their choice
    // (attack / talk / sneak), the node is "done" but still clickable — it
    // auto-routes the player back down to the sewer via `passthroughTo`.
    { id: 'kitchen', name: 'Kitchen', description: 'A warm kitchen where a reptilian cook works.', encounterId: 'kitchen', connections: ['less_deep_sewer', 'prison_entrance'], position: [180, 350], mapArea: 'upper_prison', isLocked: true, canRevisit: false, passthroughTo: 'less_deep_sewer', hiddenName: '???', hiddenDescription: 'You sense warmth and the smell of cooking from above.' },
    // Prison Entrance: one-shot (no revisit) — the warden is defeated once.
    { id: 'prison_entrance', name: 'Prison Entrance', description: 'The main entrance to the prison complex.', encounterId: 'prison_entrance', connections: ['kitchen', 'leave_prison', 'prison_wing'], position: [580, 350], mapArea: 'upper_prison', isLocked: true, canRevisit: false, unlocks: ['leave_prison', 'prison_wing'], hiddenName: 'Passage Beyond', hiddenDescription: 'A corridor leading somewhere beyond the kitchen.' },
    { id: 'leave_prison', name: 'Leave the Prison', description: 'A heavy door leading outside. Daylight through the gap.', encounterId: 'leave_prison', connections: ['prison_entrance'], position: [550, 150], mapArea: 'upper_prison', isLocked: true, canRevisit: true, hiddenName: 'Heavy Door', hiddenDescription: 'A heavy door. It seems important.' },
    // Prison Wing: one-shot — the investigate choice unlocks corner_cell and
    // the node is done. Clicking it again moves silently.
    { id: 'prison_wing', name: 'Prison Wing', description: 'A corridor lined with prison cells.', encounterId: 'prison_wing', connections: ['prison_entrance', 'corner_cell'], position: [1000, 450], mapArea: 'upper_prison', isLocked: true, canRevisit: false, hiddenName: 'Locked Door', hiddenDescription: 'A locked iron door. You hear sounds from beyond.' },
    // Corner Cell: one-shot — fight the Dire Rat, get Thorb card. Once done
    // it's just a silent node; leave_prison reads `corner_cell.isDone` as the
    // thorb-rescued flag.
    { id: 'corner_cell', name: 'Corner Cell', description: 'A cell at the far corner. Someone is fighting inside.', encounterId: 'corner_cell', connections: ['prison_wing'], position: [1100, 220], mapArea: 'upper_prison', isLocked: true, canRevisit: false, hiddenName: '???', hiddenDescription: 'Something is at the end of the corridor.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'bed';
  return map;
}

// === Mountain Path Map ===
export function createMountainPathMap() {
  const map = new GameMap('mountain_path', 'Mountain Path');
  map.mapImages = {
    mountain_path: 'Maps/Chapter2MountainPathMap.jpg',
  };

  const nodes = [
    { id: 'mountain_camp', name: 'Mountain Camp', description: 'A sheltered campsite on the mountainside.', encounterId: 'mountain_camp', connections: ['mountain_pass'], position: [512, 150], mapArea: 'mountain_path', unlocks: ['mountain_pass'] },
    { id: 'mountain_pass', name: 'Mountain Pass', description: 'A narrow pass through the peaks.', encounterId: 'mountain_pass', connections: ['mountain_camp', 'calm_stream'], unlocks: ['calm_stream'], position: [780, 200], mapArea: 'mountain_path', isLocked: true, hiddenName: '???', hiddenDescription: 'A path deeper into the mountains.' },
    { id: 'calm_stream', name: 'Calm Stream', description: 'A peaceful mountain stream.', encounterId: 'calm_stream', connections: ['mountain_pass', 'general_zhost'], unlocks: ['general_zhost'], position: [700, 310], mapArea: 'mountain_path', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Something lies further down the mountain path.' },
    { id: 'general_zhost', name: "General Zhost's Army", description: 'A Kobold army camps near the river crossing.', encounterId: 'general_zhost', connections: ['calm_stream', 'calm_grove'], unlocks: ['calm_grove'], position: [780, 500], mapArea: 'mountain_path', isLocked: true, hiddenName: '???', hiddenDescription: 'A wide river crossing, somewhere ahead.' },
    { id: 'calm_grove', name: 'Calm Grove', description: 'A hidden grove where Raena and the surviving elves rest.', encounterId: 'calm_grove', connections: ['general_zhost', 'to_the_plains'], unlocks: ['to_the_plains'], position: [400, 450], mapArea: 'mountain_path', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Dense forest to the west.' },
    { id: 'to_the_plains', name: 'To the Plains', description: 'The edge of the forest, overlooking the Plains of No Hope.', encounterId: 'to_the_plains', connections: ['calm_grove'], position: [200, 450], mapArea: 'mountain_path', isLocked: true, hiddenName: '???', hiddenDescription: 'The forest thins to the southwest.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'mountain_camp';
  return map;
}

// === Plains Map ===
export function createPlainsMap() {
  const map = new GameMap('plains', 'The Plains of No Hope');
  map.mapImages = {
    plains: 'Maps/PlainsOfNoHopeMap.jpg',
  };

  const nodes = [
    { id: 'plains_of_no_hope', name: 'Plains of No Hope', description: 'A desolate expanse stretching to the horizon.', encounterId: '', connections: ['bone_valley'], position: [195, 95], mapArea: 'plains', canRevisit: true },
    { id: 'bone_valley', name: 'Bone Valley', description: 'A valley littered with ancient bones.', encounterId: 'bone_valley', connections: ['plains_of_no_hope', 'wolf_blizzard'], position: [300, 350], mapArea: 'plains', unlocks: ['wolf_blizzard'], hiddenName: '???' },
    { id: 'wolf_blizzard', name: 'Wolf Blizzard', description: 'A blinding blizzard howls through the pass.', encounterId: 'wolf_blizzard', connections: ['bone_valley'], position: [530, 520], mapArea: 'plains', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'plains_of_no_hope';
  return map;
}

// === Cave Map ===
export function createCaveMap() {
  const map = new GameMap('cave', 'The Cave');
  map.mapImages = {
    cave: 'Maps/UndergroundCaveMap.jpg',
  };

  const nodes = [
    { id: 'cave_entrance', name: 'Cave Entrance', description: 'The mouth of a dark underground cave.', encounterId: 'cave_entrance', connections: ['cave_ledge'], position: [750, 920], mapArea: 'cave', unlocks: ['cave_ledge'] },
    { id: 'cave_ledge', name: 'Cave Ledge', description: 'A narrow ledge above the cavern floor.', encounterId: 'cave_ledge', connections: ['cave_entrance', 'cave_river_landing'], position: [610, 910], mapArea: 'cave', isLocked: true, unlocks: ['cave_river_landing'], hiddenName: '???' },
    { id: 'cave_river_landing', name: 'Cave River Landing', description: 'A rocky landing beside an underground river.', encounterId: 'cave_river_landing', connections: ['cave_ledge', 'cave_river_path'], position: [490, 800], mapArea: 'cave', isLocked: true, unlocks: ['cave_river_path'], hiddenName: '???' },
    { id: 'cave_river_path', name: 'Cave River Path', description: 'A path along the underground river.', encounterId: 'underground_river', connections: ['cave_river_landing'], position: [270, 580], mapArea: 'cave', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'cave_entrance';
  return map;
}

// === Ruins Basin Map ===
export function createRuinsBasinMap() {
  const map = new GameMap('ruins_basin', 'The Ruins Basin');
  map.mapImages = {
    ruins_basin: 'Maps/EndofRiverBasinStartOfRuins.jpg',
    flood_temple: 'Maps/FloodTemple.jpg',
    flooded_altar: 'Maps/SacredAreaFloodedTemple.jpg',
    temple_exit: 'Maps/TempleTowardTheExit.jpg',
    arriving_city: 'Maps/ArrivingAtTheCity.jpg',
    flood_temple_boss_wing: 'Maps/FloodTempleBossWing.jpg',
    qualibaf: 'Maps/QualibafMap.jpg',
  };

  const nodes = [
    // After the first dive the player can hop straight back across the
    // basin to the temple entrance; the pool/sentinel/exit chain stays
    // walkable for anyone who wants the long way around.
    { id: 'piranha_pool', name: 'Piranha Pool', description: 'Dark water churns with hungry fish.', encounterId: 'piranha_pool', connections: ['pool_edge'], position: [512, 500], mapArea: 'ruins_basin', passthroughTo: 'flooded_entrance' },
    { id: 'pool_edge', name: 'Pool Edge', description: 'The edge of the pool, a sentinel watches.', encounterId: 'sahuagin_sentinel', connections: ['pool_south'], position: [760, 380], mapArea: 'ruins_basin' },
    { id: 'pool_south', name: 'Pool South', description: 'The southern edge of the basin.', encounterId: 'pool_south', connections: ['pool_edge', 'pool_exit'], position: [798, 686], mapArea: 'ruins_basin', unlocks: ['pool_exit'] },
    { id: 'pool_exit', name: "Pool's Exit", description: 'A patrolling sentinel blocks the corridor.', encounterId: 'pool_exit', connections: ['pool_south', 'flooded_entrance'], position: [520, 910], mapArea: 'ruins_basin', isLocked: true, unlocks: ['flooded_entrance'], passthroughTo: 'flooded_entrance' },
    // Flooded entrance hops back to Pool's Exit so the cross-area pair
    // is symmetric (pool_exit ↔ flooded_entrance). Earlier this hopped
    // to piranha_pool to "skip the cleared corridor", but pool_exit's
    // own forward-teleport chained into that backward-teleport and
    // dumped the player back at piranha_pool right after the sentinel
    // fight — fixed by repointing here and the suppressFloodPair guard
    // in arriveAtNode is no longer needed (kept for safety).
    { id: 'flooded_entrance', name: 'Flooded Entrance', description: 'The entrance to a flooded temple.', encounterId: '', connections: ['pool_exit', 'temple_right', 'temple_left', 'flooded_atrium'], position: [512, 120], mapArea: 'flood_temple', canRevisit: true, passthroughTo: 'pool_exit' },
    { id: 'temple_right', name: 'Conservatory Wing', description: 'A well-conserved area of the temple. Some light shows through cracks in the ceiling.', encounterId: 'conservatory_wing', connections: ['flooded_entrance', 'temple_depths', 'altar_entrance', 'flooded_atrium'], position: [902, 492], mapArea: 'flood_temple', passthroughTo: 'altar_entrance', unlocks: ['altar_entrance'] },
    // Atrium: new mid-room node not in the PY map. A direct link from
    // the flooded entrance straight down to the temple depths so the
    // player has a center-line path in addition to the flanks. Also
    // bridges the two side-wings (Conservatory + Dark Corridor) so
    // players can cut across the room without backtracking.
    { id: 'flooded_atrium', name: 'Flooded Atrium', description: 'A vast central chamber, half-submerged.', encounterId: '', connections: ['flooded_entrance', 'temple_depths', 'temple_left', 'temple_right'], position: [512, 500], mapArea: 'flood_temple', canRevisit: true },
    { id: 'temple_depths', name: 'Flooded Passage', description: 'Deep within the flooded temple.', encounterId: 'flooded_passage', connections: ['temple_right', 'temple_left', 'passage_entrance', 'flooded_atrium'], position: [512, 883], mapArea: 'flood_temple', passthroughTo: 'passage_entrance' },
    { id: 'temple_left', name: 'Dark Corridor', description: 'A wide corridor that leads deeper into the temple. This area looks dangerous.', encounterId: 'dark_corridor', connections: ['flooded_entrance', 'temple_depths', 'boss_wing_sentinel', 'flooded_atrium'], position: [160, 450], mapArea: 'flood_temple', passthroughTo: 'boss_wing_sentinel' },
    // --- Flood Temple Boss Wing (revealed by Dark Corridor descend) ---
    // Mirrors PY: same map, separate map_area. PY has three nodes
    // (sentinel sighting / sentinel combat / priest combat); JS port
    // wires the sighting node here and stubs the deeper rooms as
    // simple passages until the dedicated combats land.
    // Deeper Corridor — no encounter; the dark_corridor descend
    // teleports here directly. Acts as a bidirectional teleport
    // pair with temple_left thereafter. Reaching it unlocks the
    // Sentinel Patrol so the player can press deeper.
    { id: 'boss_wing_sentinel', name: 'Deeper Corridor', description: 'A flooded corridor descending into the dark wing of the temple.', encounterId: '', connections: ['boss_wing_entrance', 'temple_left'], unlocks: ['boss_wing_entrance'], position: [502, 960], mapArea: 'flood_temple_boss_wing', isLocked: true, canRevisit: true, passthroughTo: 'temple_left' },
    { id: 'boss_wing_entrance', name: 'Sentinel Patrol', description: 'A Sahuagin sentinel blocks the way deeper into the temple wing.', encounterId: 'boss_wing_sentinel_combat', connections: ['boss_wing_sentinel', 'boss_wing_priest'], unlocks: ['boss_wing_priest'], position: [312, 720], mapArea: 'flood_temple_boss_wing', isLocked: true, hiddenName: 'Deeper Corridor', canRevisit: true, repeatableUntil: 'boss_wing_priest' },
    { id: 'boss_wing_priest', name: 'Flooded Chamber', description: 'A grand chamber at the heart of the temple wing. Dark power radiates from within.', encounterId: 'boss_wing_priest_combat', connections: ['boss_wing_entrance'], position: [502, 310], mapArea: 'flood_temple_boss_wing', isLocked: true, hiddenName: '???' },
    // --- Flooded Altar (revealed via Conservatory Wing) ---
    { id: 'altar_entrance', name: 'Sacred Chamber', description: 'A vast chamber. The air is thick with brine and decay.', encounterId: '', connections: ['temple_right', 'flooded_altar'], unlocks: ['flooded_altar'], position: [200, 500], mapArea: 'flooded_altar', isLocked: true, canRevisit: true, passthroughTo: 'temple_right' },
    { id: 'flooded_altar', name: 'Flooded Altar', description: 'A sacred area within the temple. Dark shapes move beneath the water.', encounterId: 'flooded_altar', connections: ['altar_entrance', 'old_god_statue'], unlocks: ['old_god_statue'], position: [750, 500], mapArea: 'flooded_altar', isLocked: true },
    // Old God Statue — single-shot. The prayer encounter grants the
    // permanent Old God's Blessing buff + a Sahuagin Eye relic on
    // completion; re-firing the dialog would let the player double up.
    { id: 'old_god_statue', name: 'Statue of an Old God', description: 'An ancient statue stands half-submerged, its hands outstretched.', encounterId: 'old_god_statue', connections: ['flooded_altar'], position: [890, 512], mapArea: 'flooded_altar', isLocked: true },
    { id: 'passage_entrance', name: 'Passage Entrance', description: 'The entrance to a passage beyond the temple.', encounterId: '', connections: ['temple_depths', 'passage_ambush'], position: [512, 150], mapArea: 'temple_exit', canRevisit: true, passthroughTo: 'temple_depths' },
    // Passage Ambush — repeatable combat. The sahuagin keep prowling
    // this corridor regardless of how many fall, so each return trip
    // rolls a fresh fight.
    { id: 'passage_ambush', name: 'Passage Ambush', description: 'A shadowed gallery.', encounterId: 'passage_ambush', connections: ['passage_entrance', 'cave_exit'], position: [512, 500], mapArea: 'temple_exit', hiddenName: 'Shadowed Gallery', canRevisit: true },
    // Cave Exit is a one-shot narrative beat that ends with the
    // party stepping out onto the mountain overlook (different
    // map_area). passthroughTo makes a click after first completion
    // auto-route to the overlook so the player doesn't have to
    // manually click out of the cave.
    { id: 'cave_exit', name: 'Cave Exit', description: 'A passage leading out.', encounterId: 'cave_exit', connections: ['passage_ambush', 'mountain_overlook'], position: [512, 850], mapArea: 'temple_exit', hiddenName: 'Passage', passthroughTo: 'mountain_overlook' },
    { id: 'mountain_overlook', name: 'Mountain Overlook', description: 'A vista overlooking the land below.', encounterId: '', connections: ['cave_exit', 'river_crossing'], position: [212, 670], mapArea: 'arriving_city', canRevisit: true, passthroughTo: 'cave_exit' },
    { id: 'river_crossing', name: 'River Crossing', description: 'A crossing over the river.', encounterId: 'river_crossing', connections: ['mountain_overlook', 'east_side'], position: [322, 510], mapArea: 'arriving_city' },
    // East Side — waypoint between river_crossing and south_gate. With
    // debug OFF the encounter no-ops (silent passthrough). With debug ON
    // the sign dialog fires, pointing to South Outpost down the new
    // river_path branch. River Path + South Trail are wip:true so they
    // only surface when debug is on.
    // East Side, River Path, South Trail — one-shot encounters: the
    // sign dialog and the river-walk dialog each fire on first arrival
    // only (no canRevisit, so subsequent walk-throughs stay silent
    // while the node remains navigable).
    { id: 'east_side', name: 'East Side', description: 'A path running east of the river.', encounterId: 'east_side', connections: ['river_crossing', 'south_gate', 'river_path'], position: [490, 380], mapArea: 'arriving_city' },
    { id: 'river_path', name: 'River Path', description: 'A trail winding south along the river bank.', encounterId: '', connections: ['east_side', 'south_trail'], position: [459, 630], mapArea: 'arriving_city', canRevisit: true },
    // South Trail — last node on this map before the cross-map jump to
    // South of Qualibaf. Its encounter plays the "follow the river south"
    // dialog (with a tongue-in-cheek meta beat from Raena/Thorb pre-
    // dragon), then teleports to the south_of_qualibaf map entry.
    { id: 'south_trail', name: 'South Trail', description: 'A trail leading east along the river toward the southern outpost.', encounterId: 'south_trail', connections: ['river_path'], position: [870, 810], mapArea: 'arriving_city' },
    { id: 'south_gate', name: 'South Gate', description: 'The southern gate of Qualibaf.', encounterId: 'south_gate', connections: ['east_side', 'city_south_gate'], position: [662, 260], mapArea: 'arriving_city', passthroughTo: 'city_south_gate' },
    { id: 'city_south_gate', name: 'City South Gate', description: 'Inside the southern gate of Qualibaf.', encounterId: '', connections: ['city_square', 'weaponsmith', 'armorsmith', 'general_store', 'inn', 'church', 'guild_hall', 'antiquity_shop', 'arcane_emporium', 'city_north_gate'], position: [512, 900], mapArea: 'qualibaf', canRevisit: true, passthroughTo: 'south_gate' },
    { id: 'city_square', name: 'City Square', description: 'The central square of Qualibaf.', encounterId: 'city_square', connections: ['city_south_gate', 'weaponsmith', 'armorsmith', 'general_store', 'inn', 'church', 'guild_hall', 'antiquity_shop', 'arcane_emporium', 'city_north_gate'], position: [512, 500], mapArea: 'qualibaf', canRevisit: true },
    { id: 'weaponsmith', name: 'Weaponsmith', description: 'A weaponsmith shop.', encounterId: 'weaponsmith', connections: ['city_south_gate', 'city_square'], position: [340, 390], mapArea: 'qualibaf', canRevisit: true },
    { id: 'armorsmith', name: 'Armorsmith', description: 'An armorsmith shop.', encounterId: 'armorsmith', connections: ['city_south_gate', 'city_square'], position: [324, 470], mapArea: 'qualibaf', canRevisit: true },
    { id: 'general_store', name: 'General Store', description: 'A general goods store.', encounterId: 'general_store', connections: ['city_south_gate', 'city_square'], position: [650, 610], mapArea: 'qualibaf', canRevisit: true },
    { id: 'inn', name: 'Inn', description: 'A cozy inn.', encounterId: 'inn', connections: ['city_south_gate', 'city_square'], position: [684, 430], mapArea: 'qualibaf', canRevisit: true },
    { id: 'church', name: 'Church', description: 'A place of worship.', encounterId: 'church', connections: ['city_south_gate', 'city_square'], position: [820, 350], mapArea: 'qualibaf', canRevisit: true },
    // Guild Hall — Aldric's briefing is single-shot. On completion it
    // unlocks the city's North Gate (declared via `unlocks` so the
    // hydration pass on a fresh map can recover the unlock state too).
    { id: 'guild_hall', name: 'Guild Hall', description: "The Adventurer's Guild hall. A place to find work and information.", encounterId: 'guild_hall', connections: ['city_south_gate', 'city_square'], position: [520, 401], mapArea: 'qualibaf', unlocks: ['city_north_gate'] },
    { id: 'antiquity_shop', name: 'Antiquity Shop', description: 'A dusty shop filled with ancient relics and curious artifacts.', encounterId: 'antiquity_shop', connections: ['city_south_gate', 'city_square'], position: [420, 270], mapArea: 'qualibaf', canRevisit: true },
    { id: 'arcane_emporium', name: 'Arcane Emporium', description: 'A shop of arcane goods.', encounterId: 'arcane_emporium', connections: ['city_south_gate', 'city_square'], position: [260, 710], mapArea: 'qualibaf', canRevisit: true },
    { id: 'city_north_gate', name: 'City North Gate', description: 'The northern gate of Qualibaf.', encounterId: 'city_north_gate', connections: ['city_south_gate', 'city_square'], position: [512, 100], mapArea: 'qualibaf', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'piranha_pool';
  return map;
}

// === South of Qualibaf Map ===
// WIP placeholder map reached via the East Side / River Path / South
// Trail branch off the arriving_city map. Entry node sits at the top
// of the layout so the player arrives "from the north" walking down.
// No background image yet — the canvas just renders the node graph.
export function createSouthOfQualibafMap() {
  const map = new GameMap('south_of_qualibaf', 'South of Qualibaf');
  map.mapImages = {
    south_of_qualibaf: 'Maps/SouthOfQualibaf.jpg',
  };

  const nodes = [
    { id: 'outpost_approach', name: 'Outpost Approach', description: 'The trail descends toward the South Outpost.', encounterId: '', connections: ['outpost'], position: [872, 370], mapArea: 'south_of_qualibaf', canRevisit: true },
    // South Outpost — first visit fires the outpost_meeting encounter
    // (Gontran the Guard) which then teleports into the south_outpost
    // map. Subsequent visits hop straight into south_outpost via the
    // post-isDone gate dispatch.
    { id: 'outpost', name: 'South Outpost', description: 'A small fortified tower rises out of the plain.', encounterId: 'outpost_meeting', connections: ['outpost_approach', 'south_bend'], position: [802, 470], mapArea: 'south_of_qualibaf' },
    // South Bend — the road south of the outpost. Discoverable too:
    // hidden until the party walks out of the outpost via the south
    // gate (transitionToSouthBend then reveals it). South Bend also
    // links back to outpost so the player can re-enter the city by
    // the south door (special-cased in transitionToSouthOutpost: when
    // arriving from south_bend, land at river_trail instead of
    // north_path_entry).
    { id: 'south_bend', name: 'South Bend', description: 'The road continues south past the outpost walls, hugging the river.', encounterId: '', connections: ['cozy_spot', 'outpost'], position: [700, 560], mapArea: 'south_of_qualibaf', canRevisit: true, discoverable: true, hiddenName: '???' },
    // Cozy Spot — fishing dialog. Discoverable: invisible until the
    // party is at South Bend (one hop), shown as ??? when close, named
    // after a first visit. Fishing is a recharge-per-attempt minigame
    // with cumulative 10% chance.
    { id: 'cozy_spot', name: 'Cozy Spot', description: 'A flat, mossy stone juts over the river — perfect for sitting, or for fishing.', encounterId: 'cozy_spot', connections: ['south_bend', 'river_trail_south'], position: [830, 660], mapArea: 'south_of_qualibaf', canRevisit: true, discoverable: true, hiddenName: '???' },
    // River Trail South — placeholder next-step node beyond Cozy Spot.
    // Same discoverable rules so the player only sees it once they
    // reach Cozy Spot.
    { id: 'river_trail_south', name: 'River Trail South', description: 'The trail bends back along the water, heading deeper south.', encounterId: '', connections: ['cozy_spot'], position: [1050, 760], mapArea: 'south_of_qualibaf', canRevisit: true, discoverable: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'outpost_approach';
  return map;
}

// === South Outpost Map ===
// Detailed map of the outpost grounds reached after the Gontran the
// Guard dialog. WIP — currently a single north-path entry node that
// teleports back to the outpost on south_of_qualibaf so the player
// can come and go while the rest of the area (merchant boat crash,
// cave entrance) is being built out.
export function createSouthOutpostMap() {
  const map = new GameMap('south_outpost', 'South Outpost');
  map.mapImages = {
    south_outpost: 'Maps/SouthOutpostMap.jpg',
  };

  // south_outpost lives in CITY_FREE_MOVE_AREAS in main.js, so the
  // `connections` field is only used as a structural hint — the render
  // skips edge lines and the click router relaxes the adjacency check,
  // letting the player one-click between any two nodes here.
  const nodes = [
    { id: 'north_path_entry', name: 'North Path', description: 'The trail back north toward the outpost gate.', encounterId: '', connections: [], position: [912, 300], mapArea: 'south_outpost', canRevisit: true },
    // Watchtower — Gontran posted at the top. Each click fires the
    // watchtower_check dialog (canRevisit) so the player can drop in
    // any time before / after the merchant boat investigation.
    { id: 'watchtower', name: 'Watchtower', description: 'A wooden ladder climbs to Gontran\'s post atop the tower.', encounterId: 'watchtower_check', connections: [], position: [492, 220], mapArea: 'south_outpost', canRevisit: true },
    // Supply Pile — Gontran offered the storehouse on the way out.
    // One-shot loot picker (two sequential picks: weapon/armor then
    // supplies/rations). Card ids are rolled per visit in
    // startNodeEncounter so the offering re-rolls between runs.
    { id: 'supply_pile', name: 'Supply Pile', description: 'A pile of crates and barrels by the inner wall.', encounterId: 'supply_pile', connections: [], position: [302, 760], mapArea: 'south_outpost' },
    // Resting Tent — one-time short rest for +5 HP. Latches via
    // outpostTentRested (save-persisted) so the dialog only fires
    // until the player accepts the rest; "Move on" leaves the tent
    // available for a later visit.
    { id: 'outpost_tent', name: 'Resting Tent', description: 'A small canvas tent pitched inside the palisade — bedroll, water flask, room for one.', encounterId: 'outpost_tent', connections: [], position: [752, 750], mapArea: 'south_outpost', canRevisit: true },
    // River Trail — south of the outpost, still on this map for now.
    // No encounter yet; the merchant boat investigation hooks in here
    // on the next pass.
    { id: 'river_trail', name: 'River Trail', description: 'The road slips out the south gate and tracks the river bank toward the wreck.', encounterId: '', connections: [], position: [482, 960], mapArea: 'south_outpost', canRevisit: true },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'north_path_entry';
  return map;
}

// === River Cave Mouth Map ===
// Reached by walking onto river_trail_south on south_of_qualibaf —
// the road empties out onto a wide mountain lake with a stranded
// merchant ship in the middle. WIP: currently a single lake-shore
// entry node that fires the arrival dialog, then sits there waiting
// for the next-pass investigation content.
export function createRiverCaveMouthMap() {
  const map = new GameMap('river_cave_mouth', 'River Cave Mouth');
  map.mapImages = {
    river_cave_mouth: 'Maps/RiverCaveMouth.jpg',
    // Boarding the cog swaps mapArea to 'shipwreck_deck' so the canvas
    // background changes from the lake view to the deck plan.
    shipwreck_deck: 'Maps/ShipwreckDeckMap.jpg',
  };

  // Linear shore-to-rocks chain across the lake. Player walks two
  // shore nodes toward the cave (lake_path_1 is silent, lake_path_2
  // fires the birds + Raena-points + Thorb-assault dialog), then
  // hops four water/reef nodes across to the far side, ending on
  // South Hill on the opposite shore. Every node past lake_shore is
  // discoverable — invisible until the party is one hop away — so the
  // lake reads as a fog-of-war exploration rather than a laid-out
  // path. All wip until the assault content lands in the next pass.
  const nodes = [
    { id: 'lake_shore', name: 'Lake Shore', description: 'The river widens here, opening onto a still mountain lake. A merchant ship sits stranded in the middle.', encounterId: 'river_cave_mouth_entry', connections: ['lake_path_1'], position: [682, 200], mapArea: 'river_cave_mouth', canRevisit: true },
    { id: 'lake_path_1', name: 'Lake Path', description: 'The trail hugs the shore, closing the distance to the wreck.', encounterId: '', connections: ['lake_shore', 'lake_path_2'], position: [590, 330], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_path_2', name: 'Vantage Point', description: 'A vantage point — close enough to see the gouges down the cog\'s hull, and the dark birds circling the mast.', encounterId: 'lake_path_2', connections: ['lake_path_1', 'lake_rock_1'], position: [750, 380], mapArea: 'river_cave_mouth', discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_1', name: 'First Rock', description: 'A flat-topped stone breaks the surface — easy hop from shore.', encounterId: '', connections: ['lake_path_2', 'lake_rock_2'], position: [820, 440], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_2', name: 'Second Rock', description: 'Another slab. The channel deepens here — the next jump is longer.', encounterId: '', connections: ['lake_rock_1', 'lake_rock_3'], position: [720, 460], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_3', name: 'Third Rock', description: 'The reef chain breaks. From here it\'s a short swim to the last stone.', encounterId: '', connections: ['lake_rock_2', 'lake_rock_4'], position: [790, 530], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'lake_rock_4', name: 'Far Rock', description: 'The last stone before the far shore. The merchant cog sits just upstream of you now.', encounterId: '', connections: ['lake_rock_3', 'south_hill'], position: [720, 550], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???' },
    // South Hill — first node on the far shore. Fires the "birds have
    // LEGS?" reconnaissance beat from the brush. Connects forward to
    // ship_approach (the boarding beat on the lake) which in turn
    // crosses into the shipwreck_deck mapArea at wreckage.
    { id: 'south_hill', name: 'South Hill', description: 'A low scrub-covered hill with a view straight down onto the listing cog.', encounterId: 'south_hill', connections: ['lake_rock_4', 'ship_approach'], position: [630, 610], mapArea: 'river_cave_mouth', discoverable: true, hiddenName: '???' },
    // Ship Approach + Wreckage form a paired teleport across mapAreas.
    // Walking onto ship_approach (from south_hill) auto-jumps to
    // wreckage (lake → deck). After the harpy dialog, any path back
    // INTO wreckage — including clicking the back-direction from
    // ship_passage — bounces the party out to ship_approach (outside
    // the wreck). The passthroughTo "same-from" guard keeps the pair
    // from ping-ponging.
    { id: 'ship_approach', name: 'Ship Approach', description: 'A scramble through reeds and shallow water — close enough now to grab the cog\'s anchor chain.', encounterId: '', connections: ['south_hill', 'wreckage'], position: [580, 510], mapArea: 'river_cave_mouth', canRevisit: true, discoverable: true, hiddenName: '???', passthroughTo: 'wreckage' },
    { id: 'wreckage', name: 'Wreckage', description: 'The cog\'s deck — listing hard to one side, ropes flapping, no crew in sight.', encounterId: 'wreckage_arrival', connections: ['ship_approach', 'ship_passage'], position: [622, 760], mapArea: 'shipwreck_deck', discoverable: true, hiddenName: '???', passthroughTo: 'ship_approach' },
    { id: 'ship_passage', name: 'Forecastle Passage', description: 'A narrow walkway under the leaning forecastle. Doors thrown open.', encounterId: '', connections: ['wreckage', 'ship_hold'], position: [800, 460], mapArea: 'shipwreck_deck', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'ship_hold', name: 'Top of the Deck', description: 'A ladder drops below. The list of the ship makes the floor feel wrong.', encounterId: '', connections: ['ship_passage', 'ship_chest'], position: [850, 330], mapArea: 'shipwreck_deck', canRevisit: true, discoverable: true, hiddenName: '???' },
    { id: 'ship_chest', name: 'Deck Chest', description: 'A heavy iron-banded chest wedged against the rail — somehow untouched by the harpies.', encounterId: 'ship_chest', connections: ['ship_hold'], position: [940, 370], mapArea: 'shipwreck_deck', discoverable: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'lake_shore';
  return map;
}

// === North Qualibaf Map ===
export function createNorthQualibafMap() {
  const map = new GameMap('north_qualibaf', 'North of Qualibaf');
  map.mapImages = {
    north_qualibaf: 'Maps/NorthGateQualibafExternalMap.jpg',
  };

  const nodes = [
    { id: 'north_gate_return', name: 'North Gate Return', description: 'Outside the northern gate of Qualibaf.', encounterId: '', connections: ['north_crossroad'], position: [480, 947], mapArea: 'north_qualibaf', canRevisit: true },
    { id: 'north_crossroad', name: 'North Crossroad', description: 'A crossroad north of the city.', encounterId: 'north_crossroad', connections: ['north_gate_return', 'filibaf_entrance'], position: [580, 170], mapArea: 'north_qualibaf', unlocks: ['filibaf_entrance'] },
    { id: 'filibaf_entrance', name: 'Filibaf Entrance', description: 'The entrance to Filibaf Forest.', encounterId: 'filibaf_entrance', connections: ['north_crossroad'], position: [825, 160], mapArea: 'north_qualibaf', isLocked: true, canRevisit: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'north_gate_return';
  return map;
}

// === Filibaf Forest Map ===
export function createFilibafForestMap() {
  const map = new GameMap('filibaf_forest', 'Filibaf Forest');
  map.mapImages = {
    filibaf_forest: 'Maps/FilibafForestMap.jpg',
  };

  const nodes = [
    { id: 'forest_edge', name: 'Forest Edge', description: 'The edge of Filibaf Forest.', encounterId: '', connections: ['forest_shadows'], position: [512, 850], mapArea: 'filibaf_forest', canRevisit: true, unlocks: ['forest_shadows'] },
    { id: 'forest_shadows', name: 'Forest Shadows', description: 'Deep shadows among the trees.', encounterId: 'forest_shadows', connections: ['forest_edge', 'forest_ambush_left', 'forest_ambush_right'], position: [512, 600], mapArea: 'filibaf_forest', isLocked: true, unlocks: ['forest_ambush_left', 'forest_ambush_right'], hiddenName: '???' },
    { id: 'forest_ambush_left', name: 'Forest Ambush Left', description: 'A narrow path to the left.', encounterId: 'forest_ambush_left', connections: ['forest_shadows', 'forest_return_left'], position: [300, 400], mapArea: 'filibaf_forest', isLocked: true, unlocks: ['forest_return_left'], hiddenName: '???' },
    { id: 'forest_ambush_right', name: 'Forest Ambush Right', description: 'A narrow path to the right.', encounterId: 'forest_ambush_right', connections: ['forest_shadows', 'forest_return_right'], position: [700, 400], mapArea: 'filibaf_forest', isLocked: true, unlocks: ['forest_return_right'], hiddenName: '???' },
    { id: 'forest_return_left', name: 'Forest Return Left', description: 'A clearing on the left path.', encounterId: '', connections: ['forest_ambush_left'], position: [250, 150], mapArea: 'filibaf_forest', isLocked: true, hiddenName: '???' },
    { id: 'forest_return_right', name: 'Forest Return Right', description: 'A clearing on the right path.', encounterId: '', connections: ['forest_ambush_right'], position: [750, 150], mapArea: 'filibaf_forest', isLocked: true, hiddenName: '???' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'forest_edge';
  return map;
}

// === Tharnag Map ===
export function createTharnagMap() {
  const map = new GameMap('tharnag', 'Tharnag');
  map.mapImages = {
    tharnag: 'Maps/TharnagMap.jpg',
  };

  const nodes = [
    { id: 'tharnag_entry', name: 'Tharnag Entry', description: 'The approach to Tharnag.', encounterId: 'tharnag_arrival', connections: ['siege_gauntlet_1'], position: [930, 940], mapArea: 'tharnag', canRevisit: true },
    { id: 'siege_gauntlet_1', name: 'Siege Gauntlet 1', description: 'The first siege line.', encounterId: 'siege_gauntlet_1', connections: ['tharnag_entry', 'siege_gauntlet_2'], position: [550, 780], mapArea: 'tharnag', isLocked: true, unlocks: ['siege_gauntlet_2'], hiddenName: 'Siege Line' },
    { id: 'siege_gauntlet_2', name: 'Siege Gauntlet 2', description: 'The second siege line.', encounterId: 'siege_gauntlet_2', connections: ['siege_gauntlet_1', 'siege_gauntlet_3'], position: [440, 700], mapArea: 'tharnag', isLocked: true, unlocks: ['siege_gauntlet_3'], hiddenName: 'Siege Line' },
    { id: 'siege_gauntlet_3', name: 'Siege Gauntlet 3', description: 'The third siege line.', encounterId: 'siege_gauntlet_3', connections: ['siege_gauntlet_2', 'siege_gauntlet_dialog', 'north_pass'], position: [450, 570], mapArea: 'tharnag', isLocked: true, unlocks: ['siege_gauntlet_dialog'], hiddenName: 'Siege Line' },
    { id: 'siege_gauntlet_dialog', name: 'Siege Gauntlet Dialog', description: 'Beyond the siege lines.', encounterId: 'siege_gauntlet_dialog', connections: ['siege_gauntlet_3', 'tharnag_side_door'], position: [640, 580], mapArea: 'tharnag', isLocked: true, unlocks: ['tharnag_side_door'], hiddenName: '???' },
    { id: 'tharnag_side_door', name: 'Tharnag Side Door', description: 'A side entrance to Tharnag.', encounterId: 'tharnag_side_door', connections: ['siege_gauntlet_dialog'], position: [790, 450], mapArea: 'tharnag', isLocked: true, canRevisit: true, hiddenName: '???' },
    // Main Door — sits west of the Side Door. Cross-map back into
    // Tharnag's Grand Hall Main Entrance via the teleport pair in
    // arriveAtNode. Branches up the cliff into the Stairs of the
    // Infinite side quest. No direct link to the Side Door — the two
    // exterior gates are intentionally separate paths.
    { id: 'tharnag_main_door', name: 'Tharnag Main Door', description: 'The great front doors of Tharnag, scarred and propped open. A switchback road climbs up the cliff above.', encounterId: '', connections: ['mountain_path'], position: [540, 410], mapArea: 'tharnag', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A massive set of doors stands in the cliff face.' },
    // Post-dragon Stairs of the Infinite chain — unlocked once
    // mithrilRemediesVisited fires (the dialog tells the party to
    // climb the stairs after Olbrim). All three nodes start locked
    // and chain unlock via the standard `unlocks` field. The third
    // node (climbing_stairs) will cross-map to the upper-mountain
    // map once that art lands; for now it just sits as a placeholder.
    { id: 'mountain_path', name: 'Mountain Path', description: 'A narrow switchback path climbs the cliff face toward an old stairway carved into the rock.', encounterId: '', connections: ['tharnag_main_door', 'bottom_stairs'], position: [360, 450], mapArea: 'tharnag', canRevisit: true, isLocked: true, unlocks: ['bottom_stairs'], hiddenName: '???', hiddenDescription: 'A mountain path winds up the cliff.' },
    { id: 'bottom_stairs', name: 'Bottom of the Infinite Stairs', description: 'The mountain path ends at the foot of a colossal stairway. The dwarves call it the Stairs of the Infinite.', encounterId: '', connections: ['mountain_path', 'climbing_stairs'], position: [280, 360], mapArea: 'tharnag', canRevisit: true, isLocked: true, unlocks: ['climbing_stairs'], hiddenName: '???', hiddenDescription: 'A colossal stairway climbs the mountain.' },
    { id: 'climbing_stairs', name: 'Climbing the Stairs', description: 'You set foot on the Stairs of the Infinite. The climb begins.', encounterId: '', connections: ['bottom_stairs'], position: [420, 200], mapArea: 'tharnag', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'The stairway disappears into the mist.' },
    // North Pass — unlocked after the throne audience. Clicking it
    // hops to the Obsidian Wastes map (wastes_entry). Mirrors PY
    // map.py:1088-1099 + game.py:2322-2341.
    { id: 'north_pass', name: 'North Pass', description: 'A narrow mountain pass leading north to the Obsidian Wastes.', encounterId: '', connections: ['siege_gauntlet_3'], position: [60, 320], mapArea: 'tharnag', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A path continues north through the mountains.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tharnag_entry';
  return map;
}

// === Volcano Map ===
export function createVolcanoMap() {
  const map = new GameMap('volcano', 'Qualibaf Volcano');
  map.mapImages = {
    volcano: 'Maps/QualibafVolcano.jpg',
  };

  // Names + descriptions mirror PY map.py:create_volcano_map. Nodes
  // step up the slope: approach -> east -> crossing -> base, each one
  // unlocking the next. Drake-rider risk fires on every step past the
  // approach (handled in arriveAtNode). Volcano approach revisits warp
  // back to the Northern Wastes.
  const nodes = [
    { id: 'volcano_approach', name: 'Volcano Approach', description: "The frozen lava fields give way to the volcano's base.", encounterId: 'volcano_arrival', connections: ['volcano_east_path'], position: [642, 940], mapArea: 'volcano', canRevisit: true, unlocks: ['volcano_east_path'] },
    { id: 'volcano_east_path', name: 'Eastern Path', description: 'A winding path through frozen lava flows on the east side.', encounterId: '', connections: ['volcano_approach', 'volcano_lava_crossing'], position: [750, 790], mapArea: 'volcano', isLocked: true, canRevisit: true, unlocks: ['volcano_lava_crossing'] },
    { id: 'volcano_lava_crossing', name: 'Lava Crossing', description: 'Rivers of half-frozen lava crisscross the path ahead.', encounterId: '', connections: ['volcano_east_path', 'volcano_base'], position: [800, 630], mapArea: 'volcano', isLocked: true, canRevisit: true, unlocks: ['volcano_base'] },
    { id: 'volcano_base', name: 'Volcano Base', description: 'The mountain rises sheer above you. Kobold patrols are everywhere.', encounterId: 'volcano_choice', connections: ['volcano_lava_crossing'], position: [770, 540], mapArea: 'volcano', isLocked: true, canRevisit: true },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'volcano_approach';
  return map;
}

// === Lower Caverns Map (Chapter 7 — lower path) ===
// Mirrors PY map.py:create_lower_caverns_map. Three-node tunnel
// descent from the volcano base: entrance -> winding descent ->
// chamber opening. Player arrives at cavern_entrance which fires the
// lower_caverns_arrival narrative.
export function createLowerCavernsMap() {
  const map = new GameMap('lower_caverns', 'Tunnel to Lower Chamber');
  map.mapImages = {
    lower_caverns: 'Maps/VolcanoTunnelToLowerChamber.jpg',
  };

  const nodes = [
    // cavern_entrance: arrival dialog fires once (canRevisit:false so
    // the dialog doesn't replay). After done, walking back onto it
    // teleports the party back to the volcano map (handled in
    // arriveAtNode). Same pattern on chamber_entry below.
    { id: 'cavern_entrance', name: 'Cavern Entrance', description: 'A narrow opening in the rock leads down into darkness. Warm air rises from below.', encounterId: 'lower_caverns_arrival', connections: ['cavern_descent'], unlocks: ['cavern_descent'], position: [790, 740], mapArea: 'lower_caverns', hiddenName: '???', hiddenDescription: 'A passage leads back.' },
    { id: 'cavern_descent', name: 'Winding Descent', description: 'The tunnel spirals downward, carved by ancient lava flows. Obsidian veins glitter in the walls.', encounterId: '', connections: ['cavern_entrance', 'cavern_exit'], unlocks: ['cavern_entrance', 'cavern_exit'], isLocked: true, canRevisit: true, position: [550, 510], mapArea: 'lower_caverns', hiddenName: '???', hiddenDescription: 'The tunnel continues deeper.' },
    { id: 'cavern_exit', name: 'Chamber Opening', description: 'The tunnel widens dramatically. A vast cavern opens up ahead, glowing with inner heat.', encounterId: '', connections: ['cavern_descent'], isLocked: true, canRevisit: true, position: [280, 330], mapArea: 'lower_caverns', hiddenName: '???', hiddenDescription: 'Something glows in the distance.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'cavern_entrance';
  return map;
}

// === Lava Chamber Map (Chapter 7 — lower path, second area) ===
// Mirrors PY map.py:create_lava_chamber_map. Five-node climb from
// the lower-caverns exit up through molten rivers to the obsidian
// tunnels above. Both the bottom entry (chamber_entry) AND the top
// entry (upper_passage) carry the same arrival encounter id so the
// "first visit" dialog fires exactly once regardless of direction.
export function createLavaChamberMap() {
  const map = new GameMap('lava_chamber', 'Lava Lower Chamber');
  map.mapImages = {
    lava_chamber: 'Maps/VolcanoLavvaLowerChamber.jpg',
  };

  // Symmetric unlocks: every inner node lists BOTH neighbors in its
  // unlocks array so the path opens in either direction as the player
  // walks through. Means a future top-entry at upper_passage chains
  // back down through thermal_vent → magma_shelf → lava_bridge →
  // chamber_entry the same way the bottom-entry chains up. The
  // arrival encounter id is stamped on both terminal nodes so the
  // first-visit dialog fires exactly once regardless of direction
  // (completedEncounters force-isDone catches the second-time entry).
  const nodes = [
    // chamber_entry / upper_passage: terminal arrival nodes. The
    // dialog fires once (canRevisit:false), then subsequent arrivals
    // teleport the party back to the previous map (see arriveAtNode).
    { id: 'chamber_entry', name: 'Chamber Entry', description: 'You emerge into a massive underground cavern. Rivers of sluggish lava cast an orange glow over everything.', encounterId: 'lava_chamber_arrival', connections: ['lava_bridge'], unlocks: ['lava_bridge'], position: [1080, 750], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'lava_bridge', name: 'Lava Bridge', description: 'A natural stone bridge spans a river of slowly moving magma.', encounterId: '', connections: ['chamber_entry', 'magma_shelf'], unlocks: ['chamber_entry', 'magma_shelf'], isLocked: true, canRevisit: true, position: [960, 500], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'A crossing of some kind.' },
    { id: 'magma_shelf', name: 'Magma Shelf', description: 'A wide ledge of cooled obsidian overlooks the churning magma below.', encounterId: '', connections: ['lava_bridge', 'thermal_vent'], unlocks: ['lava_bridge', 'thermal_vent'], isLocked: true, canRevisit: true, position: [570, 420], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'A dark shelf above the glow.' },
    { id: 'thermal_vent', name: 'Thermal Vent', description: 'Superheated air blasts upward through cracks in the floor. The walls are streaked with mineral deposits.', encounterId: '', connections: ['magma_shelf', 'upper_passage'], unlocks: ['magma_shelf', 'upper_passage'], isLocked: true, canRevisit: true, position: [630, 250], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'Heat shimmers in the air ahead.' },
    { id: 'upper_passage', name: 'Upper Passage', description: 'The path climbs steeply, leaving the magma behind. Cooler obsidian tunnels branch ahead.', encounterId: 'lava_chamber_arrival', connections: ['thermal_vent'], unlocks: ['thermal_vent'], isLocked: true, canRevisit: false, position: [670, 50], mapArea: 'lava_chamber', hiddenName: '???', hiddenDescription: 'The path leads upward.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'chamber_entry';
  return map;
}

// === Obsidian Tunnels Map (Chapter 7 — branching hub above the
// lava chamber). Mirrors PY map.py:create_obsidian_tunnels_map.
// Tree layout: tunnel_entry (bottom) → obsidian_ledge →
// tunnel_junction (4-way) → { north_tunnel, west_tunnel,
// southeast_tunnel → pillar_passage }. The three terminal arms
// (north/west/pillar) each connect to a future chapter 7+ area
// (Temple District, Obsidian Forge, etc.). All four terminal nodes
// carry the same arrival encounter id so the first-visit dialog
// plays once regardless of which entry the player uses.
// Inner-node unlocks list both connections so the chain opens in
// either direction (matches the lava_chamber pattern).
export function createObsidianTunnelsMap() {
  const map = new GameMap('obsidian_tunnels', 'Obsidian Tunnels');
  map.mapImages = {
    obsidian_tunnels: 'Maps/VolcanoObsidianTunnel.jpg',
  };

  const nodes = [
    { id: 'tunnel_entry',     name: 'Tunnel Entry',       description: 'The obsidian tunnels stretch before you, smooth walls reflecting your torchlight in dark mirrors.', encounterId: 'obsidian_tunnels_arrival', connections: ['obsidian_ledge'], unlocks: ['obsidian_ledge'], position: [420, 740], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'obsidian_ledge',   name: 'Obsidian Ledge',     description: 'A narrow ledge of razor-sharp obsidian juts over a deep chasm. One wrong step and it\'s a long way down.', encounterId: '', connections: ['tunnel_entry', 'tunnel_junction'], unlocks: ['tunnel_entry', 'tunnel_junction'], isLocked: true, canRevisit: true, position: [620, 590], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A narrow ledge ahead.' },
    { id: 'tunnel_junction',  name: 'Tunnel Junction',    description: 'The tunnel splits into a wide crossroads. Faded carvings mark the walls in three directions.', encounterId: '', connections: ['obsidian_ledge', 'north_tunnel', 'southeast_tunnel', 'west_tunnel'], unlocks: ['obsidian_ledge', 'north_tunnel', 'southeast_tunnel', 'west_tunnel'], isLocked: true, canRevisit: true, position: [810, 430], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'The tunnel branches ahead.' },
    { id: 'north_tunnel',     name: 'North Passage',      description: 'A wide, well-traveled passage heading north. The air hums with distant activity.', encounterId: 'obsidian_tunnels_arrival', connections: ['tunnel_junction'], unlocks: ['tunnel_junction'], isLocked: true, canRevisit: false, position: [880, 180], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage heading north.' },
    { id: 'southeast_tunnel', name: 'Southeast Passage',  description: 'A narrow tunnel sloping downward to the southeast. The walls are scorched black.', encounterId: '', connections: ['tunnel_junction', 'pillar_passage'], unlocks: ['tunnel_junction', 'pillar_passage'], isLocked: true, canRevisit: true, position: [950, 340], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage heading southeast.' },
    { id: 'pillar_passage',   name: 'Behind the Pillar',  description: 'A hidden passage behind a massive obsidian pillar. The air here is thick with heat from somewhere below.', encounterId: 'obsidian_tunnels_arrival', connections: ['southeast_tunnel'], unlocks: ['southeast_tunnel'], isLocked: true, position: [1310, 450], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'Something behind the pillar.' },
    { id: 'west_tunnel',      name: 'West Passage',       description: 'A corridor heading west, lined with ancient carvings. A faint scent of old incense drifts from the darkness.', encounterId: 'obsidian_tunnels_arrival', connections: ['tunnel_junction'], unlocks: ['tunnel_junction'], isLocked: true, position: [440, 360], mapArea: 'obsidian_tunnels', hiddenName: '???', hiddenDescription: 'A passage heading west.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnel_entry';
  return map;
}

// === Temple District Map (Chapter 7 — west branch from
// west_tunnel). Mirrors PY map.py:create_temple_district_map.
// Inner Road is the 4-way hub. temple_left_passage leads to the
// future Obsidian Cathedral; temple_deep_chamber is the volcano_heart
// encounter (not yet wired). For now they settle silently on arrival.
export function createTempleDistrictMap() {
  const map = new GameMap('temple_district', 'Temple District');
  map.mapImages = {
    temple_district: 'Maps/ObsidianTempleDistrict.jpg',
  };

  const nodes = [
    { id: 'temple_entry',         name: 'Temple Entry',     description: 'The tunnel opens into a vast chamber lined with crumbling stone columns. The air is heavy with the scent of old incense.', encounterId: 'temple_district_arrival', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], position: [650, 760], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A chamber opens here.' },
    { id: 'temple_inner_road',    name: 'Inner Road',        description: 'A wide road of polished obsidian stretches through the heart of the district. Passages branch off in several directions.', encounterId: '', connections: ['temple_entry', 'temple_side_passage', 'temple_left_passage', 'temple_deep_chamber'], unlocks: ['temple_entry', 'temple_side_passage', 'temple_left_passage', 'temple_deep_chamber'], isLocked: true, canRevisit: true, position: [690, 520], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A wide road ahead.' },
    { id: 'temple_side_passage',  name: 'Side Passage',     description: 'A narrow passage branches off to the right, partially concealed by fallen masonry.', encounterId: 'temple_district_arrival_side', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], isLocked: true, canRevisit: false, position: [1180, 540], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A passage to the right.' },
    { id: 'temple_left_passage',  name: 'Gate to Cathedral', description: 'A grand archway leads to what was once a cathedral. Faded murals of forgotten deities line the walls.', encounterId: '', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], isLocked: true, canRevisit: true, position: [300, 550], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A passage to the left.' },
    { id: 'temple_deep_chamber',  name: 'Deep Chamber',     description: 'The deepest part of the temple district. Strange symbols glow faintly on the obsidian walls.', encounterId: 'volcano_heart', connections: ['temple_inner_road'], unlocks: ['temple_inner_road'], isLocked: true, canRevisit: true, position: [790, 360], mapArea: 'temple_district', hiddenName: '???', hiddenDescription: 'A faint glow in the distance.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'temple_entry';
  return map;
}

// === Obsidian Cathedral Map (Chapter 7 — accessed from the temple
// district's left passage). Mirrors PY map.py:create_obsidian_cathedral_map.
// Three-node lane: cathedral_entry (arrival dialog) → cathedral_ruins
// (Obsidian Oracle mini-boss) → cathedral_shrine (pray for a tier 2
// ability OR rest for 8 HP).
export function createObsidianCathedralMap() {
  const map = new GameMap('obsidian_cathedral', 'Obsidian Cathedral');
  map.mapImages = {
    obsidian_cathedral: 'Maps/ObsidianCathedral.jpg',
  };

  const nodes = [
    { id: 'cathedral_entry',  name: 'Cathedral Entry',  description: 'The archway opens into a vast ruined cathedral. Broken pillars rise into darkness above.', encounterId: 'cathedral_arrival', connections: ['cathedral_ruins'], unlocks: ['cathedral_ruins'], position: [970, 750], mapArea: 'obsidian_cathedral' },
    { id: 'cathedral_ruins',  name: 'Cathedral Ruins',  description: 'The remains of the cathedral nave. Shattered pews and fallen stones litter the floor.', encounterId: 'obsidian_oracle', connections: ['cathedral_entry', 'cathedral_shrine'], unlocks: ['cathedral_shrine'], isLocked: true, position: [650, 570], mapArea: 'obsidian_cathedral', hiddenName: '???', hiddenDescription: 'Ruins stretch ahead.' },
    { id: 'cathedral_shrine', name: 'Ancient Shrine',   description: 'At the far end of the cathedral, a shrine stands untouched by time. Strange power radiates from it.', encounterId: 'cathedral_shrine', connections: ['cathedral_ruins'], isLocked: true, canRevisit: true, position: [920, 440], mapArea: 'obsidian_cathedral', hiddenName: '???', hiddenDescription: 'Something glows at the end of the cathedral.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'cathedral_entry';
  return map;
}

// === Obsidian Plaza Map (Chapter 7 — north passage hub). Mirrors
// PY map.py:create_obsidian_plaza_map. Two entry points feed into the
// same map: north_tunnel (obsidian_tunnels) lands on plaza_entry, and
// the temple_side_passage (temple_district) lands on plaza_west. Both
// of those nodes share the same `obsidian_plaza_arrival` encounter id
// so the first visit (from either side) plays the dialog once; the
// global completedEncounters force-isDone rule blocks the re-fire.
// plaza_center is the one-time Magma Drake mini-boss fight.
export function createObsidianPlazaMap() {
  const map = new GameMap('obsidian_plaza', 'Obsidian Plaza');
  map.mapImages = {
    obsidian_plaza: 'Maps/ObsidianPlaza.jpg',
  };

  const nodes = [
    { id: 'plaza_entry',     name: 'Plaza Entry',      description: 'The tunnel opens into a vast underground plaza. Obsidian pillars rise to a ceiling lost in shadow.', encounterId: 'obsidian_plaza_arrival', connections: ['plaza_center'], unlocks: ['plaza_center'], position: [520, 730], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'plaza_center',    name: 'Center Plaza',     description: 'The heart of the plaza. A crumbling fountain of obsidian stands at the center, long dry.', encounterId: 'magma_drake', connections: ['plaza_entry', 'plaza_west', 'plaza_north', 'plaza_northwest'], unlocks: ['plaza_west', 'plaza_north', 'plaza_northwest'], isLocked: true, position: [720, 420], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'The center of the plaza.' },
    { id: 'plaza_west',      name: 'Western Passage',  description: 'A passage heading west toward the Temple District. Faded carvings mark the archway.', encounterId: 'obsidian_plaza_arrival_west', connections: ['plaza_center'], unlocks: ['plaza_center'], isLocked: true, position: [240, 550], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A passage to the west.' },
    { id: 'plaza_north',     name: 'Northern Corridor', description: 'A wide corridor stretches north into darkness. The air grows colder.', encounterId: '', connections: ['plaza_center'], unlocks: ['plaza_center'], isLocked: true, canRevisit: true, position: [730, 190], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A corridor heading north.' },
    { id: 'plaza_northwest', name: 'Northwest Passage', description: 'A narrow passage winds northwest. Strange sounds echo from within.', encounterId: 'obsidian_plaza_arrival_nw', connections: ['plaza_center'], unlocks: ['plaza_center'], isLocked: true, canRevisit: false, position: [160, 400], mapArea: 'obsidian_plaza', hiddenName: '???', hiddenDescription: 'A passage heading northwest.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'plaza_entry';
  return map;
}

// === Obsidian Streets Map (Chapter 7 — reached via the plaza's
// Northern Corridor). Mirrors PY map.py:create_obsidian_streets_map.
// Linear flow: streets_entry → streets_market → streets_residential
// → streets_upper. streets_upper will lead to the Upper Bridge in a
// future pass (left as a locked dead-end here).
export function createObsidianStreetsMap() {
  const map = new GameMap('obsidian_streets', 'Obsidian Streets');
  map.mapImages = {
    obsidian_streets: 'Maps/ObsidianStreets.jpg',
  };

  const nodes = [
    { id: 'streets_entry',       name: 'Streets Entry',       description: 'The corridor opens into a network of narrow obsidian streets. Buildings carved from the rock line both sides.', encounterId: 'obsidian_streets_arrival', connections: ['streets_market'], unlocks: ['streets_market'], position: [920, 740], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'A passage opens here.' },
    { id: 'streets_market',      name: 'Quiet Crossroads',    description: 'A small intersection where several streets meet. Faded signs hang above doorways long sealed shut.', encounterId: '', connections: ['streets_entry', 'streets_residential'], unlocks: ['streets_residential'], isLocked: true, canRevisit: true, position: [760, 560], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'Open space ahead.' },
    { id: 'streets_residential', name: 'Residential Quarter', description: 'Rows of small dwellings carved into the obsidian walls. Some still have furnishings inside.', encounterId: '', connections: ['streets_market', 'streets_upper'], unlocks: ['streets_upper'], isLocked: true, canRevisit: true, position: [640, 490], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'Dwellings line the walls.' },
    { id: 'streets_upper',       name: 'To the Bridge',       description: 'The streets climb upward, opening to a vast underground bridge spanning a chasm of darkness.', encounterId: 'obsidian_streets_arrival_upper', connections: ['streets_residential'], isLocked: true, canRevisit: false, position: [580, 360], mapArea: 'obsidian_streets', hiddenName: '???', hiddenDescription: 'The streets rise ahead.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'streets_entry';
  return map;
}

// === Obsidian Market Map (Chapter 7 — reached via the plaza's
// Northern Corridor). Mirrors PY map.py:create_obsidian_market_map.
// Flow: market_entry → market_street (4-way hub) → market_stalls
// (search-for-loot) + market_square → market_deep (rest).
export function createObsidianMarketMap() {
  const map = new GameMap('obsidian_market', 'Obsidian Market');
  map.mapImages = {
    obsidian_market: 'Maps/ObsidianMarket.jpg',
  };

  const nodes = [
    { id: 'market_entry',  name: 'Market Entry',  description: 'The corridor opens into a vast marketplace. Stalls and shops stretch in every direction.', encounterId: 'obsidian_market_arrival', connections: ['market_street'], unlocks: ['market_street'], position: [560, 740], mapArea: 'obsidian_market' },
    { id: 'market_street', name: 'Market Street', description: 'A wide street flanked by merchant stalls. The obsidian cobblestones are worn smooth by countless footsteps.', encounterId: '', connections: ['market_entry', 'market_stalls', 'market_square'], unlocks: ['market_stalls', 'market_square'], isLocked: true, canRevisit: true, position: [750, 620], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'A wide street ahead.' },
    { id: 'market_stalls', name: 'Market Stalls', description: 'Rows of abandoned stalls, some still bearing goods covered in dust.', encounterId: 'market_stalls', connections: ['market_street'], unlocks: ['market_street'], isLocked: true, canRevisit: true, position: [570, 450], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'Stalls line the passage.' },
    { id: 'market_square', name: 'Market Square', description: 'The central square of the market. A dry fountain sits at its center, surrounded by larger shops.', encounterId: '', connections: ['market_street', 'market_deep'], unlocks: ['market_deep'], isLocked: true, canRevisit: true, position: [1130, 550], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'An open space ahead.' },
    { id: 'market_deep',   name: 'Deep Market',   description: 'The far end of the market. Larger warehouses and sealed vaults line the walls.', encounterId: 'deep_market_rest', connections: ['market_square'], isLocked: true, canRevisit: true, position: [1240, 460], mapArea: 'obsidian_market', hiddenName: '???', hiddenDescription: 'Something larger lies beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'market_entry';
  return map;
}

// === Upper Bridge Map (Chapter 7 — reached via the obsidian streets'
// streets_upper exit). Mirrors PY map.py:create_upper_bridge_map.
// Flow: bridge_down_city (entry from streets) → bridge_entry
// (General Zhost's Revenge boss fight) → bridge_middle →
// bridge_far_side → bridge_to_volcano (point-of-no-return bridge
// crossing dialog). bridge_to_dwarven is a future side exit.
export function createUpperBridgeMap() {
  const map = new GameMap('upper_bridge', 'The Upper Bridge');
  map.mapImages = {
    upper_bridge: 'Maps/UpperBridgeMap.jpg',
  };

  const nodes = [
    { id: 'bridge_down_city',  name: 'Down to Obsidian City', description: 'A stairway descends back toward the streets of the underground city below.', encounterId: 'upper_bridge_arrival', connections: ['bridge_entry'], unlocks: ['bridge_entry'], canRevisit: false, position: [120, 620], mapArea: 'upper_bridge' },
    { id: 'bridge_entry',      name: 'Bridge Entry',          description: 'The streets open onto a massive obsidian bridge. It spans a seemingly bottomless chasm, disappearing into darkness on the far side.', encounterId: 'zhost_revenge', connections: ['bridge_down_city', 'bridge_middle', 'bridge_to_dwarven'], unlocks: ['bridge_down_city', 'bridge_middle', 'bridge_to_dwarven'], isLocked: true, canRevisit: false, position: [370, 490], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'The bridge stretches ahead.' },
    { id: 'bridge_to_dwarven', name: 'Up to Dwarven City',    description: 'A passage leads back toward the upper levels of an ancient dwarven settlement.', encounterId: 'upper_bridge_arrival', connections: ['bridge_entry'], isLocked: true, canRevisit: false, position: [480, 740], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'A passage leads somewhere.' },
    { id: 'bridge_middle',     name: 'Bridge Midpoint',       description: 'The center of the bridge. Wind howls up from the chasm below. The far side is barely visible through the gloom.', encounterId: '', connections: ['bridge_entry', 'bridge_far_side'], unlocks: ['bridge_far_side'], isLocked: true, canRevisit: true, position: [780, 380], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'The bridge stretches on.' },
    { id: 'bridge_far_side',   name: 'Far Side',              description: 'The far end of the bridge. A great obsidian gate looms ahead, partially open.', encounterId: '', connections: ['bridge_middle', 'bridge_to_volcano'], unlocks: ['bridge_to_volcano'], isLocked: true, canRevisit: true, position: [1000, 310], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'Something looms on the far side.' },
    { id: 'bridge_to_volcano', name: 'To Upper Volcano',      description: "A steep path climbs upward toward the volcano's upper chambers.", encounterId: 'bridge_crossing', connections: ['bridge_far_side'], isLocked: true, canRevisit: true, position: [590, 90], mapArea: 'upper_bridge', hiddenName: '???', hiddenDescription: 'A path leads upward.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'bridge_down_city';
  return map;
}

// === Volcano Stairs Maps (Chapter 8 — post-bridge climb into the
// upper volcano). Three back-to-back maps form a linear ascent:
// stairs_1 → stairs_2 → stairs_3. Each map has 5 nodes wired
// linearly entry → 3 middle → exit. The exit node of map N
// auto-transitions to the entry of map N+1 (cross-map gate in
// main.js arriveAtNode, same pattern as streets_upper →
// bridge_down_city). No encounters yet — placeholder lanes that
// the next content pass will populate.
function buildVolcanoStairsMap(id, label, imageKey, imageFile, entryId, middleIds, exitId, entryName, exitName, positions) {
  const map = new GameMap(id, label);
  map.mapImages = { [imageKey]: imageFile };
  // positions: [entry, mid_a, mid_b, mid_c, exit] — per-map override
  // so each stairway's dots can be tuned against its own background.
  const nodes = [
    {
      id: entryId,
      name: entryName,
      description: `The stair levels out for a breath before the climb resumes.`,
      encounterId: '',
      connections: [middleIds[0]],
      unlocks: [middleIds[0]],
      canRevisit: true,
      position: positions[0],
      mapArea: id,
    },
    {
      id: middleIds[0],
      name: 'Ascending Steps',
      description: 'Volcanic stone steps wind upward, glowing faintly at the edges.',
      encounterId: '',
      connections: [entryId, middleIds[1]],
      unlocks: [middleIds[1]],
      isLocked: true,
      canRevisit: true,
      position: positions[1],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'Steps climb ahead.',
    },
    {
      id: middleIds[1],
      name: 'Landing',
      description: 'A narrow landing carved from black rock. Heat radiates from below.',
      encounterId: '',
      connections: [middleIds[0], middleIds[2]],
      unlocks: [middleIds[2]],
      isLocked: true,
      canRevisit: true,
      position: positions[2],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'A landing waits.',
    },
    {
      id: middleIds[2],
      name: 'Higher Steps',
      description: 'The stair steepens. Below, the molten chasm stretches out of sight.',
      encounterId: '',
      connections: [middleIds[1], exitId],
      unlocks: [exitId],
      isLocked: true,
      canRevisit: true,
      position: positions[3],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'The stair climbs higher.',
    },
    {
      id: exitId,
      name: exitName,
      description: 'The stair continues beyond into the next stretch of the climb.',
      encounterId: '',
      connections: [middleIds[2]],
      isLocked: true,
      canRevisit: true,
      position: positions[4],
      mapArea: id,
      hiddenName: '???',
      hiddenDescription: 'The stair continues upward.',
    },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = entryId;
  return map;
}

// Default fallback positions for the stairs maps when no per-map
// override has been authored yet. Hand-tuned via the debug node-
// position editor (ctrl-click + arrow keys).
const _STAIRS_DEFAULT_POSITIONS = [
  [180, 820], [380, 640], [560, 470], [740, 300], [920, 140],
];

export function createVolcanoStairs1Map() {
  return buildVolcanoStairsMap(
    'volcano_stairs_1', 'Volcano Stairs - Lower',
    'volcano_stairs_1', 'Maps/VolcanoStairs1.jpg',
    'stairs1_entry', ['stairs1_a', 'stairs1_b', 'stairs1_c'], 'stairs1_exit',
    'Stair Foot', 'Upward Bend',
    // User-tuned via the debug node-position editor.
    [
      [380, 910],  // Stair Foot
      [211, 660],  // Ascending Steps
      [800, 420],  // Landing
      [340, 160],  // Higher Steps
      [590, 70],   // Upward Bend
    ],
  );
}

export function createVolcanoStairs2Map() {
  return buildVolcanoStairsMap(
    'volcano_stairs_2', 'Volcano Stairs - Middle',
    'volcano_stairs_2', 'Maps/VolcanoStairs2.jpg',
    'stairs2_entry', ['stairs2_a', 'stairs2_b', 'stairs2_c'], 'stairs2_exit',
    'Mid-Stair Landing', 'Higher Path',
    // User-tuned via the debug node-position editor.
    [
      [640, 930],  // Mid-Stair Landing
      [240, 700],  // Ascending Steps
      [660, 460],  // Landing
      [450, 390],  // Higher Steps
      [640, 310],  // Higher Path
    ],
  );
}

export function createVolcanoStairs3Map() {
  return buildVolcanoStairsMap(
    'volcano_stairs_3', 'Volcano Stairs - Upper',
    'volcano_stairs_3', 'Maps/VolcanoStairs3.jpg',
    'stairs3_entry', ['stairs3_a', 'stairs3_b', 'stairs3_c'], 'stairs3_exit',
    'Upper Stair Landing', 'To Summit Ridge',
    // User-tuned via the debug node-position editor.
    [
      [930, 870],  // Upper Stair Landing
      [370, 790],  // Ascending Steps
      [880, 450],  // Landing
      [490, 240],  // Higher Steps
      [560, 150],  // To Summit Ridge
    ],
  );
}

// === Volcano Summit Ridge Map (Chapter 8 — exit of the stairs
// climb). Player walks onto a clifftop plateau. 4 nodes: 1 entry
// (back-teleport to stairs3_exit), 2 stair-path movement nodes,
// 1 ridge encounter node. Encounter TBD.
export function createVolcanoSummitRidgeMap() {
  const map = new GameMap('volcano_summit_ridge', 'Volcano Summit Ridge');
  map.mapImages = { volcano_summit_ridge: 'Maps/Volcano_SummitRidge.jpg' };
  // Fully open plateau — every node unlocked from the start (NO_FOG_MAPS
  // already removes the fog overlay, and now there's nothing keeping
  // the player from clicking forward as soon as they arrive). Click
  // adjacency still forces them along the chain entry → a → b → ridge.
  const nodes = [
    // Entry — drops in from the stairs (image's stair landing at the
    // bottom-right). Click-on-self back-teleports to stairs3_exit.
    { id: 'summit_entry',     name: 'Stair Top',     description: 'The stair levels out onto a wind-swept ridge.', encounterId: 'stair_top_arrival', connections: ['summit_path_a'], unlocks: ['summit_path_a'], canRevisit: false, position: [1160, 750], mapArea: 'volcano_summit_ridge' },
    { id: 'summit_path_a',    name: 'Ridge Stairs',  description: 'Rough-cut steps lead upward along the clifftop.', encounterId: '', connections: ['summit_entry', 'summit_path_b'], unlocks: ['summit_path_b'], canRevisit: true, position: [900, 430], mapArea: 'volcano_summit_ridge' },
    { id: 'summit_path_b',    name: 'Higher Steps',  description: 'The path narrows. The sheer drop yawns to the left.', encounterId: '', connections: ['summit_path_a', 'summit_ridge'], unlocks: ['summit_ridge'], canRevisit: true, position: [1170, 220], mapArea: 'volcano_summit_ridge' },
    // Boss node on the ridge — Overseer Gnikan, kobold frost shaman.
    // canRevisit=true so the player can walk back here post-dragon to
    // fire the ridge_post_dragon_offer "leave?" dialog (the dragonSlain
    // gate in startNodeEncounter swaps the Gnikan fight for the
    // farewell prompt).
    { id: 'summit_ridge',     name: 'The Ridge',     description: 'A bare obsidian ridge above the volcano. A lone figure waits at the far end.', encounterId: 'overseer_gnikan', connections: ['summit_path_b'], canRevisit: true, position: [690, 130], mapArea: 'volcano_summit_ridge' },
  ];
  for (const data of nodes) map.addNode(new MapNode(data));
  map.currentNodeId = 'summit_entry';
  return map;
}

// === Obsidian Forge Map (Chapter 7 — southeast branch from
// pillar_passage). Mirrors PY map.py:create_obsidian_forge_map.
// Three-node lane: forge_entry → forge_passage → the_obsidian_forge.
// forge_entry is the only entry slot (no future side-routes here);
// the_obsidian_forge is the inner shrine, encounter to be wired
// later. forge_passage is the rolling random-encounter node.
export function createObsidianForgeMap() {
  const map = new GameMap('obsidian_forge', 'The Obsidian Forge');
  map.mapImages = {
    obsidian_forge: 'Maps/TheObsidianForge.jpg',
  };

  const nodes = [
    { id: 'forge_entry',        name: 'Forge Entry',     description: 'The tunnel opens into a scorching chamber. The walls glow with residual heat from ancient forges.', encounterId: 'obsidian_forge_arrival', connections: ['forge_passage'], unlocks: ['forge_passage'], position: [210, 310], mapArea: 'obsidian_forge' },
    { id: 'forge_passage',      name: 'Molten Corridor', description: 'A wide corridor lined with dormant furnaces. Slag and cooled metal litter the floor.', encounterId: '', connections: ['forge_entry', 'the_obsidian_forge'], unlocks: ['forge_entry', 'the_obsidian_forge'], isLocked: true, canRevisit: true, position: [400, 590], mapArea: 'obsidian_forge', hiddenName: '???', hiddenDescription: 'A corridor stretches ahead.' },
    { id: 'the_obsidian_forge', name: 'The Obsidian Forge', description: 'A massive forge dominates the chamber, its anvil carved from a single block of obsidian. Even dormant, the air shimmers with heat.', encounterId: 'obsidian_forge', connections: ['forge_passage'], unlocks: ['forge_passage'], isLocked: true, canRevisit: true, position: [830, 420], mapArea: 'obsidian_forge', hiddenName: '???', hiddenDescription: 'An intense heat radiates from ahead.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'forge_entry';
  return map;
}

// === Obsidian Wastes Map ===
// Base map only carries the entry + exit. The labyrinth in between
// is generated procedurally via generateLabyrinthNodes(map, seed) on
// the first arrival, then re-generated from the same seed on load.
// Mirrors PY map.py:create_obsidian_wastes_map.
export function createObsidianWastesMap() {
  const map = new GameMap('obsidian_wastes', 'Obsidian Wastes');
  map.mapImages = {
    obsidian_wastes: 'Maps/ObsidianWastesMap.jpg',
  };

  const nodes = [
    // Encounter is single-shot — once the arrival dialog plays, the
    // node becomes a cross-map teleporter back to Tharnag's North
    // Pass (handled in handleMapClick via isCrossMapGate +
    // arriveAtNode's wastes_entry-revisit branch). canRevisit stays
    // false so the dialog never re-fires.
    { id: 'wastes_entry', name: 'Edge of the Wastes', description: 'The frozen lava fields begin here, stretching endlessly northward.', encounterId: 'obsidian_wastes_arrival', connections: [], position: [500, 950], mapArea: 'obsidian_wastes' },
    // Northern Wastes — rest-stop encounter is single-shot. After it
    // plays once, the node becomes a cross-map teleporter to the
    // Qualibaf Volcano (handled in handleMapClick via isCrossMapGate +
    // arriveAtNode's wastes_north revisit branch). canRevisit stays
    // false so the rest dialog never repeats.
    { id: 'wastes_north', name: 'Northern Wastes', description: 'The Volcano looms closer. Thorgazad must be near.', encounterId: 'wastes_north', connections: [], position: [410, 220], mapArea: 'obsidian_wastes', isLocked: true, hiddenName: '???', hiddenDescription: 'Something ahead, near the Volcano.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'wastes_entry';
  return map;
}

// Procedural labyrinth generation between wastes_entry and
// wastes_north. Mirrors PY map.py:generate_labyrinth_nodes — same
// shape, same seeded RNG behavior so the generated layout is
// deterministic per playthrough.
const LABYRINTH_NAMES = [
  'Obsidian Tunnel', 'Lava Crust Passage', 'Glass Cavern',
  'Molten Corridor', 'Basalt Chamber', 'Cinder Path',
  'Volcanic Vent', 'Sulfur Grotto', 'Magma Seam',
  'Scorched Gallery', 'Ember Crossing', 'Ash-Choked Passage',
  'Obsidian Ridge', 'Crystal Vein', 'Slag Heap',
  'Smoke-Filled Chamber', 'Cooled Flow', 'Black Glass Trail',
  'Fissure Path', 'Pyroclast Tunnel',
];
const LABYRINTH_DESCRIPTIONS = [
  'Sharp obsidian formations crunch underfoot. The haze is thick here.',
  'The ground is warm beneath your feet. Faint red light pulses from cracks below.',
  'Walls of jagged black glass rise on either side, distorting your reflection.',
  'Sulfurous fumes sting your eyes. The path narrows between volcanic boulders.',
  'A vast cavern of cooled lava, its ceiling lost in darkness above.',
  'The obsidian here is smooth as a mirror, treacherous to walk on.',
  'Thin wisps of steam rise from vents in the rock floor.',
  'Broken columns of basalt stand like petrified trees in the fog.',
  'The air shimmers with heat. Pools of molten rock glow dimly nearby.',
  'A narrow passage between towering obsidian walls. Every sound echoes.',
  'The ground slopes unpredictably. Loose volcanic gravel slides beneath your boots.',
  'Crystals of yellow sulfur crust the walls, casting a sickly glow.',
  'A wide chamber where the lava cooled in strange rippling waves.',
  'The fog is so thick you can barely see your own hands.',
  'Scorched rock formations twist into bizarre, almost organic shapes.',
  'A thin crust of obsidian over hollow ground — every step feels precarious.',
  'The path forks around a massive volcanic boulder, then rejoins.',
  'Ash drifts like black snow from somewhere above.',
  'A field of obsidian shards, sharp as broken glass, blocks easy passage.',
  'The remnants of an ancient lava tube, its walls smooth and dark.',
];

// Tiny seeded PRNG so layouts are deterministic for a given seed.
// Mulberry32 — fast, non-crypto, fine for layout reproducibility.
function _seededRng(seed) {
  let s = (seed >>> 0) || 1;
  return function() {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function _rngInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function _rngChoice(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function _rngShuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function _rngSample(rng, arr, k) {
  return _rngShuffle(rng, arr.slice()).slice(0, k);
}

export function generateLabyrinthNodes(gameMap, seed) {
  const rng = _seededRng(seed);
  // 7 inner tiers of 3-5 nodes each.
  const tierSizes = Array.from({ length: 7 }, () => _rngInt(rng, 3, 5));
  const names = _rngShuffle(rng, LABYRINTH_NAMES.slice());
  const descs = _rngShuffle(rng, LABYRINTH_DESCRIPTIONS.slice());

  const tiers = [['wastes_entry']];
  for (let t = 1; t <= tierSizes.length; t++) {
    const ids = [];
    for (let i = 0; i < tierSizes[t - 1]; i++) ids.push(`lab_${t}_${i}`);
    tiers.push(ids);
  }
  tiers.push(['wastes_north']);

  // Random positions, min 80px spacing.
  const allLab = {};
  const used = [];
  let nameIdx = 0;
  for (let t = 1; t < tiers.length - 1; t++) {
    for (const nodeId of tiers[t]) {
      let x = 0, y = 0;
      for (let attempt = 0; attempt < 50; attempt++) {
        x = _rngInt(rng, 100, 900);
        y = _rngInt(rng, 120, 850);
        let close = false;
        for (const [px, py] of used) {
          if (Math.abs(x - px) < 80 && Math.abs(y - py) < 80) { close = true; break; }
        }
        if (!close) break;
      }
      used.push([x, y]);
      allLab[nodeId] = {
        name: names[nameIdx % names.length],
        description: descs[nameIdx % descs.length],
        position: [x, y],
      };
      nameIdx++;
    }
  }

  // Build connection graph.
  const allNodeIds = [].concat(...tiers);
  const connections = {};
  for (const nid of allNodeIds) connections[nid] = [];

  for (let t = 0; t < tiers.length - 1; t++) {
    const cur = tiers[t];
    const next = tiers[t + 1];
    // Every next-tier node has at least one incoming forward edge.
    for (const nextNid of next) {
      const parent = _rngChoice(rng, cur);
      if (!connections[parent].includes(nextNid)) connections[parent].push(nextNid);
    }
    // wastes_entry caps at 3 forward connections.
    if (t === 0) {
      const fwd = connections['wastes_entry'].filter(c => next.includes(c));
      if (fwd.length > 3) {
        const keep = _rngSample(rng, fwd, 3);
        connections['wastes_entry'] = connections['wastes_entry'].filter(c => !fwd.includes(c) || keep.includes(c));
      }
    }
    // Each current-tier node aims for 2 forward connections.
    for (const curNid of cur) {
      const existing = connections[curNid].filter(c => next.includes(c));
      const need = 2 - existing.length;
      if (need > 0) {
        const candidates = next.filter(n => !connections[curNid].includes(n));
        for (let i = 0; i < Math.min(need, candidates.length); i++) {
          const pick = _rngChoice(rng, candidates);
          connections[curNid].push(pick);
          candidates.splice(candidates.indexOf(pick), 1);
        }
      }
    }
  }

  // Cap forward connections (wastes_entry: 3, others: 2).
  for (let t = 0; t < tiers.length - 1; t++) {
    const cur = tiers[t];
    const next = tiers[t + 1];
    for (const curNid of cur) {
      const maxFwd = curNid === 'wastes_entry' ? 3 : 2;
      const fwd = connections[curNid].filter(c => next.includes(c));
      if (fwd.length > maxFwd) {
        const keep = _rngSample(rng, fwd, maxFwd);
        connections[curNid] = connections[curNid].filter(c => !fwd.includes(c) || keep.includes(c));
      }
    }
  }

  // Add 1 backward (or sideways) connection per lab node.
  for (let t = 1; t < tiers.length - 1; t++) {
    for (const curNid of tiers[t]) {
      let back = 1;
      if (t >= 3 && rng() < 0.25) back = 2;
      const targetTier = tiers[Math.max(0, t - back)];
      const target = _rngChoice(rng, targetTier);
      if (!connections[curNid].includes(target)) connections[curNid].push(target);
    }
  }

  // Normalize the graph: every edge becomes bidirectional. PY parity
  // shipped the one-way graph (forward fan-out + one back-edge per
  // node), which left many connections un-walkable in reverse — the
  // player would see a link line to a node they couldn't actually
  // click. Mirroring every edge guarantees the player can always
  // retrace, and the fog/accessibility check (which uses the current
  // node's `connections`) now matches the visible line graph.
  for (const a of allNodeIds) {
    for (const b of connections[a]) {
      if (!connections[b].includes(a)) connections[b].push(a);
    }
  }

  // Shuffle each connection list so the player can't tell forward from back.
  for (const nid of Object.keys(connections)) _rngShuffle(rng, connections[nid]);

  // Add the lab nodes to the map.
  for (const [nodeId, info] of Object.entries(allLab)) {
    gameMap.addNode(new MapNode({
      id: nodeId,
      name: info.name,
      description: info.description,
      connections: connections[nodeId].slice(),
      position: info.position,
      mapArea: 'obsidian_wastes',
      isLocked: true,
      canRevisit: true,
      hiddenName: '???',
      hiddenDescription: 'Darkness ahead.',
    }));
  }

  // Update entry + north connections.
  const entry = gameMap.getNode('wastes_entry');
  if (entry) {
    entry.connections = connections['wastes_entry'].slice();
    entry.unlocks = entry.connections.filter(c => c.startsWith('lab_'));
  }
  const north = gameMap.getNode('wastes_north');
  if (north) north.connections = connections['wastes_north'].slice();

  // Each lab node unlocks its connections on visit.
  for (const nodeId of Object.keys(allLab)) {
    const n = gameMap.getNode(nodeId);
    if (n) n.unlocks = n.connections.slice();
  }
}

// === Tharnag Interior Map ===
// Mirrors PY map.py:create_tharnag_interior_map. The Grand Hall lane
// (side entry → lower → mid → upper stairs) is wired now; the
// Artisan Hall and beyond are stubbed for future work — their nodes
// stay in the data so encounters keep resolving by id, but they're
// not connected to the navigable path yet.
export function createTharnagInteriorMap() {
  const map = new GameMap('tharnag_interior', 'Tharnag Interior');
  map.mapImages = {
    grand_hall: 'Maps/TharnagGrandHall.jpg',
    grand_staircase: 'Maps/TharnagGrandStairCase.jpg',
    throne_room: 'Maps/TharnagThroneRoom.jpg',
    personal_quarters: 'Maps/TharnagPersonalQuarter.jpg',
    artisan_hall: 'Maps/ArtisanHallMap.jpg',
  };

  const nodes = [
    // Grand Hall lane — side entry fires once (canRevisit:false), the
    // stairs above it are pure navigation nodes (no encounters yet).
    { id: 'grand_hall_side_entry', name: 'Grand Hall Side Entry', description: 'The side door opens into the vast Grand Hall of Tharnag.', encounterId: 'grand_hall_arrival', connections: ['grand_hall_lower_stairs'], position: [940, 620], mapArea: 'grand_hall', canRevisit: false },
    { id: 'grand_hall_lower_stairs', name: 'Lower Stairs', description: 'Wide stone stairs carved into the mountain rock.', encounterId: '', connections: ['grand_hall_side_entry', 'grand_hall_mid_stairs', 'artisan_hall_entry', 'grand_hall_main_entrance'], position: [580, 660], mapArea: 'grand_hall', canRevisit: true },
    // Main Entrance — the city's front door out to the mountain.
    // WIP / debug-only for now; clicking it cross-maps to the
    // Tharnag exterior at the new Main Door node west of the
    // Side Door (eventual gateway to the Stairs of the Infinite
    // side-quest line).
    { id: 'grand_hall_main_entrance', name: 'Main Entrance', description: 'The grand front doors of Tharnag — the path out to the mountain road.', encounterId: '', connections: ['grand_hall_lower_stairs'], position: [420, 970], mapArea: 'grand_hall', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A massive set of doors leads out of the city.' },
    { id: 'grand_hall_mid_stairs', name: 'Middle Stairs', description: 'The stairs continue upward past towering pillars.', encounterId: '', connections: ['grand_hall_lower_stairs', 'grand_hall_upper_stairs'], position: [690, 520], mapArea: 'grand_hall', canRevisit: true },
    { id: 'grand_hall_upper_stairs', name: 'Upper Stairs', description: 'The top of the grand stairway. A massive archway leads deeper into Tharnag.', encounterId: '', connections: ['grand_hall_mid_stairs', 'staircase_entry'], position: [740, 420], mapArea: 'grand_hall', canRevisit: true, passthroughTo: 'staircase_entry' },
    // Grand Staircase area — Thorb's homecoming dialog at the entry,
    // then a top + landing bridge into the throne room.
    { id: 'staircase_entry', name: 'Grand Staircase', description: 'A monumental staircase hewn from the living rock, lit by rivers of molten forge-light.', encounterId: 'grand_staircase_arrival', connections: ['grand_hall_upper_stairs', 'staircase_top'], position: [100, 970], mapArea: 'grand_staircase', canRevisit: false, passthroughTo: 'grand_hall_upper_stairs' },
    { id: 'staircase_top', name: 'Top of the Staircase', description: 'The stairs open onto a broad landing. To the left, a passage leads to the Throne Room.', encounterId: '', connections: ['staircase_entry', 'staircase_landing', 'quarters_hallway'], position: [650, 640], mapArea: 'grand_staircase', canRevisit: true },
    // To the Throne Room ↔ Throne Room — teleport pair across the
    // staircase / throne_room area boundary. Walking onto the landing
    // from the staircase auto-hops into the throne room and fires the
    // arrival dialog on first visit; walking back out of the throne
    // room hops you onto the landing. The teleport guard suppresses
    // the bounce when fromNodeId already matches the paired node, so
    // the encounter-complete re-fire doesn't ping-pong forever.
    { id: 'staircase_landing', name: 'To the Throne Room', description: 'A wide landing where the passage turns toward the Throne Room.', encounterId: '', connections: ['staircase_top', 'throne_room_to_grand_stairway'], position: [400, 580], mapArea: 'grand_staircase', canRevisit: true, passthroughTo: 'throne_room_to_grand_stairway' },
    { id: 'throne_room_entry', name: 'Throne Room', description: 'Massive iron doors stand open, revealing the Throne Room of Tharnag.', encounterId: 'throne_room_arrival', connections: ['throne', 'temple_moradin_door', 'throne_room_to_grand_stairway'], position: [500, 950], mapArea: 'throne_room', canRevisit: false },
    { id: 'throne', name: 'The Throne', description: "The ancient stone throne of Tharnag's king sits upon a raised dais.", encounterId: 'throne_audience', connections: ['throne_room_entry'], position: [510, 820], mapArea: 'throne_room', canRevisit: false },
    // Throne Room exit node — pairs with `staircase_landing` (in the
    // Grand Staircase area) as a teleport gate. Walking onto either
    // half auto-hops to the other; the anti-bounce check on the
    // passthrough chase keeps the player from ping-ponging.
    { id: 'throne_room_to_grand_stairway', name: 'To the Grand Stairway', description: 'A wide landing opens toward the grand staircase out of the throne room.', encounterId: '', connections: ['throne_room_entry'], position: [860, 930], mapArea: 'throne_room', canRevisit: true, passthroughTo: 'staircase_landing' },
    // Temple of Moradin doorway — post-dragon side quest. Locked
    // until dragonSlain (hydrate unlocks + _stateRevealed). Walking
    // here cross-maps to the Temple of Moradin via the teleport pair
    // in arriveAtNode (temple_moradin_door ↔ temple_moradin_entry).
    { id: 'temple_moradin_door', name: 'To the Temple of Moradin', description: 'A side passage opens toward an old temple devoted to Moradin.', encounterId: '', connections: ['throne_room_entry'], position: [110, 920], mapArea: 'throne_room', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A passage leads off the throne room.', passthroughTo: 'temple_moradin_entry' },
    // Personal Quarters lane — locked until the throne audience
    // completes (handled by the throne_audience completion hook in
    // main.js, which flips quarters_hallway.isLocked off and reveals
    // its hidden name). Mirrors PY map.py:1493-1535. Hallway is a
    // bridge node into the quarters; the quarters entry is a hub with
    // bed (rest) + chest (Queen's Locket) leaves.
    { id: 'quarters_hallway', name: 'Hallway to Quarters', description: 'A torchlit corridor leading to the personal quarters.', encounterId: '', connections: ['staircase_top', 'personal_quarters_entry'], position: [900, 640], mapArea: 'grand_staircase', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leading somewhere.', passthroughTo: 'personal_quarters_entry' },
    { id: 'personal_quarters_entry', name: 'Personal Quarters', description: "A private chamber prepared for Thorb's companions.", encounterId: '', connections: ['quarters_hallway', 'quarters_bed', 'quarters_chest'], position: [520, 920], mapArea: 'personal_quarters', canRevisit: true, passthroughTo: 'quarters_hallway' },
    { id: 'quarters_bed', name: 'Bed', description: 'A sturdy dwarven bed with thick furs. It looks incredibly inviting after the long journey.', encounterId: 'quarters_rest', connections: ['personal_quarters_entry', 'quarters_chest'], position: [520, 260], mapArea: 'personal_quarters', canRevisit: true },
    { id: 'quarters_chest', name: 'Chest with Personal Belongings', description: 'A wooden chest containing personal items left for the party.', encounterId: 'quarters_chest', connections: ['personal_quarters_entry', 'quarters_bed'], position: [940, 540], mapArea: 'personal_quarters', canRevisit: false },
    // Artisan Hall lane — unlocked by the throne audience completion.
    // The entry sits on the Grand Hall side as a hidden gate; once
    // open, it's a single navigation hop into the Artisan Hall hub
    // which then connects city-style to the tavern + smithy.
    // Mirrors PY map.py:1375-1418.
    { id: 'artisan_hall_entry', name: 'To the Artisan Hall', description: "A wide passage leads to the Artisan Hall where Tharnag's craftsmen work.", encounterId: '', connections: ['grand_hall_lower_stairs', 'artisan_hall'], position: [350, 500], mapArea: 'grand_hall', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leads somewhere deeper into Tharnag.', passthroughTo: 'artisan_hall' },
    { id: 'artisan_hall', name: 'Artisan Hall', description: "The great workshop of Tharnag's master craftsmen.", encounterId: '', connections: ['artisan_hall_entry', 'dwarven_tavern', 'dwarven_smithy', 'mithril_remedies'], position: [770, 870], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???', passthroughTo: 'artisan_hall_entry' },
    { id: 'dwarven_tavern', name: 'Dwarven Tavern', description: 'A warm tavern filled with the smell of ale and roasting meat.', encounterId: 'dwarven_tavern', connections: ['artisan_hall', 'dwarven_smithy'], position: [400, 500], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???' },
    { id: 'dwarven_smithy', name: 'Dwarven Smithy', description: 'A massive forge where master smiths craft the finest dwarven arms and armor.', encounterId: 'dwarven_smithy', connections: ['artisan_hall', 'dwarven_tavern'], position: [400, 800], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???' },
    // Mithril Remedies — Olbrim Goldbalm's apothecary in Tharnag's
    // Artisan Hall. Unlock gate: throne audience complete (the side
    // quest fires while the party is still in Tharnag, regardless of
    // dragonSlain). Still wip:true for now — invisible in non-debug
    // — because the downstream chain (Stairs of the Infinite → Last
    // Watch → Valley → Cave → Nest) is unfinished. Flip wip off when
    // the chain ships.
    { id: 'mithril_remedies', name: 'Mithril Remedies', description: "Olbrim Goldbalm's apothecary, tucked between the tavern and the smithy.", encounterId: 'mithril_remedies', connections: ['artisan_hall', 'dwarven_tavern', 'dwarven_smithy'], position: [550, 710], mapArea: 'artisan_hall', canRevisit: true, isLocked: true, hiddenName: '???', hiddenDescription: 'A small workshop tucked between the others.', wip: true },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'grand_hall_side_entry';
  return map;
}

// === Entry Corridor Map ===
export function createEntryCorridorMap() {
  const map = new GameMap('entry_corridor', 'Entry Corridor');
  map.mapImages = {
    entry_corridor: 'Maps/DwarvenCityEntryCorridorMap.jpg',
  };

  const nodes = [
    // Entry point from the volcano choice (upper path). Dialog is
    // one-shot — canRevisit:false so the arrival speech doesn't replay
    // every time the player walks back through.
    { id: 'corridor_entrance', name: 'Corridor Entrance', description: 'The entrance to the dwarven city corridor.', encounterId: 'entry_corridor_arrival', connections: ['corridor_ruins'], position: [720, 720], mapArea: 'entry_corridor', canRevisit: false, unlocks: ['corridor_ruins'], hiddenName: '???', hiddenDescription: 'A way out leads here.' },
    // Random-encounter movement node — stays ??? until walked so the
    // fog matches the lower-volcano feel.
    { id: 'corridor_ruins', name: 'Corridor Ruins', description: 'Crumbling ruins along the corridor.', encounterId: '', connections: ['corridor_entrance', 'corridor_gate_approach'], position: [650, 500], mapArea: 'entry_corridor', isLocked: true, canRevisit: true, unlocks: ['corridor_gate_approach'], hiddenName: '???', hiddenDescription: 'Something lies ahead.' },
    // Entry point from the Hall of Ancestors (backwards traversal).
    // canRevisit:true so the gate dialog replays when re-entering
    // from the upper city side.
    { id: 'corridor_gate_approach', name: 'Corridor Gate Approach', description: 'Approaching the corridor gate.', encounterId: 'corridor_gate_approach', connections: ['corridor_ruins'], position: [590, 360], mapArea: 'entry_corridor', isLocked: true, canRevisit: false, hiddenName: '???', hiddenDescription: 'A gate looms ahead.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'corridor_entrance';
  return map;
}

// === Gate Area Map ===
export function createGateAreaMap() {
  const map = new GameMap('gate_area', 'Gate Area');
  map.mapImages = {
    gate_area: 'Maps/DwarvenCityGateArea.jpg',
  };

  const nodes = [
    // Entry point from the entry_corridor map (forward).
    { id: 'gate_back_to_corridor', name: 'Gate Back to Corridor', description: 'The path back to the entry corridor.', encounterId: '', connections: ['gate_entrance'], position: [610, 750], mapArea: 'gate_area', canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leads back the way you came.' },
    // Middle hub — neighbors should stay ??? until walked.
    { id: 'gate_entrance', name: 'Gate Entrance', description: 'The main gate entrance.', encounterId: '', connections: ['gate_back_to_corridor', 'gate_guardroom', 'gate_passage'], position: [880, 660], mapArea: 'gate_area', canRevisit: true, unlocks: ['gate_guardroom', 'gate_passage'], hiddenName: '???', hiddenDescription: 'A passage continues ahead.' },
    { id: 'gate_guardroom', name: 'Gate Guardroom', description: 'A guardroom beside the gate.', encounterId: 'gate_guardroom', connections: ['gate_entrance'], position: [780, 550], mapArea: 'gate_area', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A side chamber.' },
    // Entry point from the Hall of Ancestors (backwards traversal).
    // Entry point from the Hall of Ancestors (backwards traversal).
    // PY parity: node name "Into Thorgazad", flavor about the warm
    // air rising from below.
    { id: 'gate_passage', name: 'Into Thorgazad', description: 'A broad stairway descends into the ancient dwarven city. Warm air rises from below.', encounterId: 'gate_passage', connections: ['gate_entrance'], position: [1000, 560], mapArea: 'gate_area', isLocked: true, canRevisit: false, hiddenName: '???', hiddenDescription: 'Something lies beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'gate_back_to_corridor';
  return map;
}

// === Hall of Ancestors Map ===
export function createHallOfAncestorsMap() {
  const map = new GameMap('hall_of_ancestors', 'Hall of Ancestors');
  map.mapImages = {
    hall_of_ancestors: 'Maps/DwarvenCityHallofAncestors.jpg',
  };

  // PY parity: Hall is the central hub with 3 unlockable exits +
  // 2 entry points (hall_entry from the Gate, ancestors_artisan_district
  // from the artisan side backwards). The Sky Shaft is Ruga's arena —
  // one-shot fight (canRevisit:false).
  const nodes = [
    { id: 'ancestors_entry', name: 'Hall Entry', description: 'The stairway from the northern gate opens into the vast Hall of Ancestors.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [606, 760], mapArea: 'hall_of_ancestors', canRevisit: true, unlocks: ['ancestors_sky_shaft'], hiddenName: '???', hiddenDescription: 'A stairway descends from the gate.' },
    { id: 'ancestors_sky_shaft', name: 'The Sky Shaft', description: 'The center of the hall, bathed in true sunlight from a shaft cut through the mountain above.', encounterId: 'ruga_slave_master', connections: ['ancestors_entry', 'ancestors_monument_alley', 'ancestors_artisan_district', 'ancestors_kings_district'], position: [740, 680], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: false, unlocks: ['ancestors_monument_alley', 'ancestors_artisan_district', 'ancestors_kings_district'], hiddenName: '???', hiddenDescription: 'A shaft of light filters down from above.' },
    { id: 'ancestors_monument_alley', name: 'To Monument Alley', description: 'A wide passage lined with toppled statues leads west.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [150, 620], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'An alley leads to the west.' },
    // Entry point from the Artisan District (backwards traversal).
    { id: 'ancestors_artisan_district', name: 'To the Artisan District', description: 'The eastern passage reeks of old soot and cold metal.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [1250, 620], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leads to the east.' },
    // PY had this node — JS was missing it. Climbs north toward the
    // upper city / Grand Stairs.
    { id: 'ancestors_kings_district', name: "To the King's District", description: 'A grand stairway climbs north toward the upper city. Firelight flickers above.', encounterId: '', connections: ['ancestors_sky_shaft'], position: [730, 590], mapArea: 'hall_of_ancestors', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A grand stairway climbs north.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'ancestors_entry';
  return map;
}

// === Monument Alley Map ===
export function createMonumentAlleyMap() {
  const map = new GameMap('monument_alley', 'Monument Alley');
  map.mapImages = {
    monument_alley: 'Maps/DwarvenCityMonumentAlley.jpg',
  };

  // Mirrors PY map.py:create_monument_alley_map. Six nodes in a
  // diamond: entry → south_hub branches to left/right far →
  // converge at north_hub → tomb. Random encounters fire on the
  // middle nodes (monument_south_hub, monument_left_far,
  // monument_right_far, monument_north_hub) via the dwarven-city
  // pool. monument_tomb hands off to the Tomb of the Ancestor map.
  const nodes = [
    // One-shot arrival dialog — canRevisit:false so the corridor
    // intro doesn't replay every time the party comes back from
    // the Hall. Also serves as the back-teleport node (click-on-
    // self after first visit hops back to ancestors_monument_alley).
    { id: 'monument_entry', name: 'Monument Alley Entry', description: 'The wide passage from the Hall of Ancestors opens into a long corridor lined with carved monuments.', encounterId: 'monument_alley_entry', connections: ['monument_south_hub'], position: [720, 750], mapArea: 'monument_alley', canRevisit: false, unlocks: ['monument_south_hub'] },
    { id: 'monument_south_hub', name: 'The Central Monument', description: 'A massive statue of a dwarven king sits at the center, dividing the path into two.', encounterId: '', connections: ['monument_entry', 'monument_left_far', 'monument_right_far'], position: [720, 650], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_left_far', 'monument_right_far'], hiddenName: '???', hiddenDescription: 'A central monument waits ahead.' },
    { id: 'monument_left_far', name: 'Hall of Oaths', description: 'The western alcove deepens into a chamber where ancient oaths were sworn in stone.', encounterId: '', connections: ['monument_south_hub', 'monument_north_hub'], position: [440, 440], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_north_hub'], hiddenName: '???', hiddenDescription: 'A western alcove.' },
    { id: 'monument_right_far', name: 'Chronicle Wall', description: 'A massive wall of carved text stretches floor to ceiling — the Chronicle of Thorgazad.', encounterId: '', connections: ['monument_south_hub', 'monument_north_hub'], position: [1000, 440], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_north_hub'], hiddenName: '???', hiddenDescription: 'An eastern alcove.' },
    { id: 'monument_north_hub', name: "The Ancestor's Threshold", description: 'The two paths converge before a sealed stone door. The air feels heavy here.', encounterId: '', connections: ['monument_left_far', 'monument_right_far', 'monument_tomb'], position: [720, 280], mapArea: 'monument_alley', isLocked: true, canRevisit: true, unlocks: ['monument_tomb'], hiddenName: '???', hiddenDescription: 'Paths converge ahead.' },
    { id: 'monument_tomb', name: 'Tomb of the Ancestor', description: 'A sealed stone door bearing the sigil of the first dwarven king of Thorgazad.', encounterId: '', connections: ['monument_north_hub'], position: [720, 190], mapArea: 'monument_alley', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A sealed stone door.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'monument_entry';
  return map;
}

// === Tomb of Ancestor Map ===
export function createTombOfAncestorMap() {
  const map = new GameMap('tomb_of_ancestor', 'Tomb of the Ancestor');
  map.mapImages = {
    tomb_of_ancestor: 'Maps/DwarvenCityTombOfAncestor.jpg',
  };

  const nodes = [
    // canRevisit:false so the antechamber intro plays once. The
    // node still doubles as the back-portal to Monument Alley
    // (handled in main.js arriveAtNode).
    { id: 'tomb_entry', name: 'Tomb Antechamber', description: 'A dark antechamber beyond the sealed door. The air is cold and still.', encounterId: 'tomb_of_ancestor_entry', connections: ['tomb_sarcophagus'], position: [680, 740], mapArea: 'tomb_of_ancestor', canRevisit: false, unlocks: ['tomb_sarcophagus'] },
    // canRevisit:true — if the player "Leaves them in peace"
    // without triggering the fight, they can come back and pick the
    // fight on a future visit. The startNodeEncounter hook checks
    // `ancestorSpiritsDefeated` to suppress the encounter once the
    // fight has actually been won.
    { id: 'tomb_sarcophagus', name: 'The Sarcophagus', description: "The final resting place of Durin Stoneheart, founder of Thorgazad.", encounterId: 'tomb_sarcophagus', connections: ['tomb_entry'], position: [677, 570], mapArea: 'tomb_of_ancestor', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A sarcophagus rests within.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tomb_entry';
  return map;
}

// === Grand Stairs Map ===
export function createGrandStairsMap() {
  // Mirrors PY map.py:create_grand_stairs_map — stairway to the
  // King's District. Entry from the Hall of Ancestors via
  // ancestors_kings_district → stairs_entry. Names + descriptions
  // match PY exactly: Base of the Stairs, Lower Landing (king
  // reliefs), Upper Landing (warmer + firelight), To the Throne
  // Hall (top exit).
  const map = new GameMap('grand_stairs', 'The Grand Stairs');
  map.mapImages = {
    grand_stairs: 'Maps/DwarvenCityGrandStairs.jpg',
  };

  const nodes = [
    // One-shot arrival dialog — canRevisit:false so the climb up
    // from the Hall doesn't replay the firelight/kobold-voices
    // intro every time the party comes back through.
    { id: 'stairs_entry', name: 'Base of the Stairs', description: 'A grand stairway flanked by massive pillars climbs into the darkness above.', encounterId: 'grand_stairs_entry', connections: ['stairs_lower'], position: [400, 720], mapArea: 'grand_stairs', canRevisit: false, unlocks: ['stairs_lower'] },
    { id: 'stairs_lower', name: 'Lower Landing', description: 'A wide landing where the stairs turn. Carved reliefs depict the coronation of dwarven kings.', encounterId: '', connections: ['stairs_entry', 'stairs_upper'], position: [760, 540], mapArea: 'grand_stairs', isLocked: true, canRevisit: true, unlocks: ['stairs_upper'], hiddenName: '???', hiddenDescription: 'A landing waits ahead.' },
    { id: 'stairs_upper', name: 'Upper Landing', description: 'The air grows warmer here. The faint glow of firelight spills down from above.', encounterId: '', connections: ['stairs_lower', 'stairs_to_throne'], position: [970, 400], mapArea: 'grand_stairs', isLocked: true, canRevisit: true, unlocks: ['stairs_to_throne'], hiddenName: '???', hiddenDescription: 'The stair climbs higher.' },
    { id: 'stairs_to_throne', name: 'To the Throne Hall', description: 'The top of the stairs opens into the King\'s District. A grand archway leads to the throne hall.', encounterId: '', connections: ['stairs_upper'], position: [1130, 280], mapArea: 'grand_stairs', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Something looms beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'stairs_entry';
  return map;
}

// === Dwarven Throne Room Map ===
export function createDwarvenThroneRoomMap() {
  const map = new GameMap('dwarven_throne_room', 'Dwarven Throne Room');
  map.mapImages = {
    dwarven_throne_room: 'Maps/DwarvenCityThroneRoom.jpg',
  };

  // PY parity (map.py:2593). Unlock chain: entry → dais →
  // to_map_room. Fog labels until visited.
  const nodes = [
    { id: 'throne_entry', name: 'Throne Room Entry', description: 'The grand archway opens into the ruined throne room of Thorgazad.', encounterId: 'dwarven_throne_room_entry', connections: ['throne_dais'], position: [720, 720], mapArea: 'dwarven_throne_room', canRevisit: true, unlocks: ['throne_dais'] },
    { id: 'throne_dais', name: 'The Throne', description: "The stone throne of Thorgazad's kings sits upon a raised dais, cracked but standing.", encounterId: 'throne_specter', connections: ['throne_entry', 'throne_to_map_room'], position: [750, 550], mapArea: 'dwarven_throne_room', isLocked: true, canRevisit: false, unlocks: ['throne_to_map_room'], hiddenName: '???', hiddenDescription: 'A raised dais looms ahead.' },
    { id: 'throne_to_map_room', name: 'To the Map Room', description: 'A hidden passage behind the throne leads to a chamber beyond.', encounterId: '', connections: ['throne_dais'], position: [600, 470], mapArea: 'dwarven_throne_room', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Something beyond the throne.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'throne_entry';
  return map;
}

// === Tunnel to Bridge Map ===
// PY parity (map.py:2811-2851). Three nodes — entry → mid → exit.
// Entry triggers the obsidian-tunnel dialog (artisan exit → here);
// exit teleports to the Upper Bridge map (bridge_to_dwarven).
export function createTunnelToBridgeMap() {
  const map = new GameMap('tunnel_to_bridge', 'Obsidian Tunnel');
  map.mapImages = {
    tunnel_to_bridge: 'Maps/DwarvenCityTunnelToBridge.jpg',
  };
  const nodes = [
    { id: 'bridge_tunnel_entry', name: 'Tunnel Entrance', description: 'The passage descends into a dark tunnel. Veins of obsidian glint in the walls.', encounterId: 'tunnel_to_bridge_entry', connections: ['bridge_tunnel_mid'], unlocks: ['bridge_tunnel_mid'], canRevisit: false, position: [720, 700], mapArea: 'tunnel_to_bridge', hiddenName: '???', hiddenDescription: 'A dark passage descends.' },
    { id: 'bridge_tunnel_mid', name: 'Obsidian Corridor', description: 'The tunnel grows darker. Obsidian veins thicken in the walls, drinking the torchlight.', encounterId: '', connections: ['bridge_tunnel_entry', 'bridge_tunnel_exit'], unlocks: ['bridge_tunnel_exit'], isLocked: true, canRevisit: true, position: [820, 480], mapArea: 'tunnel_to_bridge', hiddenName: '???', hiddenDescription: 'The tunnel stretches on.' },
    { id: 'bridge_tunnel_exit', name: 'To the Bridge', description: 'The tunnel opens ahead. You can hear wind howling through a vast open space.', encounterId: '', connections: ['bridge_tunnel_mid'], isLocked: true, canRevisit: true, position: [810, 330], mapArea: 'tunnel_to_bridge', hiddenName: '???', hiddenDescription: 'Wind howls from beyond.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'bridge_tunnel_entry';
  return map;
}

// === Map Room Map ===
export function createMapRoomMap() {
  const map = new GameMap('map_room', 'Map Room');
  map.mapImages = {
    map_room: 'Maps/DwarvenCityMapRoom.jpg',
  };

  // PY parity (map.py:2637-2666). 2 nodes: entry + map table. ???
  // fog on the table until first visit.
  const nodes = [
    { id: 'map_room_entry', name: 'Map Room Entry', description: 'A hidden chamber behind the throne, dominated by a massive stone map table.', encounterId: 'map_room_entry', connections: ['map_table'], position: [500, 700], mapArea: 'map_room', canRevisit: false, unlocks: ['map_table'] },
    { id: 'map_table', name: 'The Map Table', description: 'A great stone table carved with a detailed map of the entire volcano and the city beneath it.', encounterId: 'map_table', connections: ['map_room_entry'], position: [720, 450], mapArea: 'map_room', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A massive stone table.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'map_room_entry';
  return map;
}

// === Deeper Tunnels Map ===
export function createDeeperTunnelsMap() {
  const map = new GameMap('deeper_tunnels', 'Deeper Tunnels');
  map.mapImages = {
    deeper_tunnels: 'Maps/DwarvenCityDeeperTunnels.jpg',
  };

  // Mirrors PY map.py:create_deeper_tunnels_map — 4 nodes: entry
  // (back-portal to Hall), two middle movement nodes that roll the
  // dwarven-city random encounter pool, and exit (forward to
  // Artisan District). canRevisit:false on entry so the intro
  // dialog plays once and the node can be used as a back-portal
  // after.
  const nodes = [
    { id: 'tunnels_entry', name: 'Tunnel Entrance', description: 'The eastern passage from the Hall of Ancestors descends into a long, torch-lit tunnel.', encounterId: 'deeper_tunnels_entry', connections: ['tunnels_mid_1'], position: [760, 700], mapArea: 'deeper_tunnels', canRevisit: false, unlocks: ['tunnels_mid_1'], hiddenName: '???', hiddenDescription: 'A torch-lit passage descends.' },
    { id: 'tunnels_mid_1', name: 'Carved Passage', description: 'The tunnel narrows. Dwarven carvings line the walls, half-obscured by soot and kobold scratches.', encounterId: '', connections: ['tunnels_entry', 'tunnels_mid_2'], position: [750, 570], mapArea: 'deeper_tunnels', isLocked: true, canRevisit: true, unlocks: ['tunnels_mid_2'], hiddenName: '???', hiddenDescription: 'The tunnel narrows.' },
    { id: 'tunnels_mid_2', name: 'Torch Gallery', description: 'Old torch sconces still burn with a faint magical flame. The air smells of soot and hot metal.', encounterId: '', connections: ['tunnels_mid_1', 'tunnels_exit'], position: [740, 460], mapArea: 'deeper_tunnels', isLocked: true, canRevisit: true, unlocks: ['tunnels_exit'], hiddenName: '???', hiddenDescription: 'A torchlit gallery ahead.' },
    { id: 'tunnels_exit', name: 'To the Artisan District', description: 'The tunnel opens ahead. The orange glow of furnaces spills through the archway.', encounterId: '', connections: ['tunnels_mid_2'], position: [760, 360], mapArea: 'deeper_tunnels', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'Light spills from beyond.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'tunnels_entry';
  return map;
}

// === Artisan District Map ===
export function createArtisanDistrictMap() {
  const map = new GameMap('artisan_district', 'Artisan District');
  map.mapImages = {
    artisan_district: 'Maps/DwarvenCityArtisanDistrict.jpg',
  };

  // PY parity: 7 nodes — entry → lower → upper → walkway → overlook,
  // which then unlocks both artisan_exit (back out) and the sealed
  // artisan_workshop (the forge). All middle nodes are random-
  // encounter candidates via DWARVEN_CITY_RANDOM_NODES.
  const nodes = [
    { id: 'artisan_entry', name: 'District Entry', description: 'The tunnel opens into a vast cavern of workshops and forges, lit by rivers of lava below.', encounterId: 'artisan_district_entry', connections: ['artisan_lower_shops'], position: [1340, 760], mapArea: 'artisan_district', canRevisit: false, unlocks: ['artisan_lower_shops'], hiddenName: '???', hiddenDescription: 'A wide cavern opens here.' },
    { id: 'artisan_lower_shops', name: 'Lower Workshops', description: 'Rows of abandoned workshops line the lower level. Anvils, quenching troughs, and scattered tools.', encounterId: '', connections: ['artisan_entry', 'artisan_upper_shops'], position: [1020, 640], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_upper_shops'], hiddenName: '???', hiddenDescription: 'A lower row of abandoned workshops.' },
    { id: 'artisan_upper_shops', name: 'Upper Workshops', description: 'The upper level workshops. Finer work was done here — jewelry, enchanting, runecraft.', encounterId: '', connections: ['artisan_lower_shops', 'artisan_walkway'], position: [330, 410], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_walkway'], hiddenName: '???', hiddenDescription: 'An upper row of finer workshops.' },
    { id: 'artisan_walkway', name: 'Iron Walkway', description: 'A narrow iron walkway spans the gap between workshop platforms. Lava glows far below.', encounterId: '', connections: ['artisan_upper_shops', 'artisan_overlook'], position: [620, 380], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_overlook'], hiddenName: '???', hiddenDescription: 'A narrow iron walkway.' },
    { id: 'artisan_overlook', name: 'Forge Overlook', description: 'A raised platform overlooking the entire district. The central forge sits cold and dark below.', encounterId: '', connections: ['artisan_walkway', 'artisan_exit', 'artisan_workshop'], position: [890, 260], mapArea: 'artisan_district', isLocked: true, canRevisit: true, unlocks: ['artisan_exit', 'artisan_workshop'], hiddenName: '???', hiddenDescription: 'A raised platform above the district.' },
    { id: 'artisan_workshop', name: 'Intact Workshop', description: 'A sealed workshop door, untouched by kobold hands. Dwarven runes glow faintly around the frame.', encounterId: 'artisan_workshop', connections: ['artisan_overlook'], position: [580, 200], mapArea: 'artisan_district', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A sealed dwarven workshop.' },
    { id: 'artisan_exit', name: 'District Exit', description: 'A passage leads out of the Artisan District toward other parts of the city.', encounterId: '', connections: ['artisan_overlook'], position: [1240, 220], mapArea: 'artisan_district', isLocked: true, canRevisit: true, hiddenName: '???', hiddenDescription: 'A passage leading onward.' },
  ];

  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'artisan_entry';
  return map;
}

// Top of the Infinite Stairs — windswept plateau above Tharnag. Reached
// by climbing past `climbing_stairs` on the exterior map; the arrival
// node fires the "we made it; let's rest at the outpost" dialog. The
// path winds across the ridge to the Skyforge Outpost gate, which
// cross-maps into the outpost interior.
export function createTopOfInfiniteStairsMap() {
  const map = new GameMap('top_of_infinite_stairs', 'Top of the Infinite Stairs');
  map.mapImages = {
    top_of_infinite_stairs: 'Maps/TopOfStairsOfInfinite.jpg',
  };
  const nodes = [
    { id: 'top_stairs_arrival', name: 'Top of the Stairs', description: 'The Stairs of the Infinite open onto a windswept plateau.', encounterId: 'top_stairs_arrival', connections: ['top_stairs_ridge'], position: [780, 750], mapArea: 'top_of_infinite_stairs', canRevisit: false, passthroughTo: 'climbing_stairs' },
    { id: 'top_stairs_ridge', name: 'Mountain Trail', description: 'A narrow trail picks its way along the ridge.', encounterId: '', connections: ['top_stairs_arrival', 'top_stairs_overlook'], position: [910, 570], mapArea: 'top_of_infinite_stairs', canRevisit: true },
    { id: 'top_stairs_overlook', name: 'Cliffside Overlook', description: 'The trail rounds a shoulder of stone; the kingdom spreads out below.', encounterId: '', connections: ['top_stairs_ridge', 'top_stairs_approach'], position: [960, 370], mapArea: 'top_of_infinite_stairs', canRevisit: true },
    { id: 'top_stairs_approach', name: 'Outpost Approach', description: 'Dwarven banners snap against a low watchtower up ahead.', encounterId: '', connections: ['top_stairs_overlook', 'top_stairs_to_outpost'], position: [1080, 230], mapArea: 'top_of_infinite_stairs', canRevisit: true },
    { id: 'top_stairs_to_outpost', name: 'The Last Watch Gate', description: 'Iron-banded gates marked with the hammer of Moradin. A weather-beaten sign reads THE LAST WATCH.', encounterId: '', connections: ['top_stairs_approach'], position: [770, 100], mapArea: 'top_of_infinite_stairs', canRevisit: true, passthroughTo: 'last_watch_entry' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'top_stairs_arrival';
  return map;
}

// The Last Watch — dwarven garrison at the highest altitude in
// Tharnag's reach, named for being the final outpost before the
// kingdom's edge. Exterior courtyard map. The bottom gate links back
// to the ridge; the courtyard fires the Guard Captain audience
// (one-shot dialog + Rest/Leave choice). After resting at the keep
// the path Down to the Valley unlocks.
export function createLastWatchMap() {
  const map = new GameMap('last_watch', 'The Last Watch');
  map.mapImages = {
    last_watch: 'Maps/TheLastWatch.jpg',
  };
  const nodes = [
    { id: 'last_watch_entry', name: 'Watch Gate', description: 'You step through the gates of the Last Watch — the highest outpost in Tharnag.', encounterId: '', connections: ['last_watch_courtyard'], position: [920, 660], mapArea: 'last_watch', canRevisit: true, passthroughTo: 'top_stairs_to_outpost' },
    // The courtyard is just a junction now — the dialog + rest happen
    // at the Watch Keep node. Connects out to the keep AND down to the
    // valley descent (which itself gates on isWellRested at click time
    // with the "Go Rest in the Keep" toast).
    { id: 'last_watch_courtyard', name: 'Watch Courtyard', description: 'A windswept courtyard. The keep stands at the far side; a switchback path drops away to the south.', encounterId: '', connections: ['last_watch_entry', 'last_watch_keep', 'last_watch_to_valley'], position: [480, 430], mapArea: 'last_watch', canRevisit: true },
    // Watch Keep — Guard Captain audience + Rest/Leave choice. First
    // visit runs the full dialog (createLastWatchAudienceEncounter);
    // subsequent visits route to the revisit factory (choice only).
    { id: 'last_watch_keep', name: 'Watch Keep', description: 'The interior of the keep. The captain of the watch greets you here.', encounterId: 'last_watch_audience', connections: ['last_watch_courtyard'], position: [560, 340], mapArea: 'last_watch', canRevisit: true },
    // Down to the Valley — always visible. Walking onto it walks to
    // the Valley Path node on the same map; the well-rested gate is
    // enforced at click time on last_watch_to_valley (toasts "Go Rest
    // in the Keep" otherwise).
    { id: 'last_watch_to_valley', name: 'Down to the Valley', description: 'A switchback path drops away into the valley far below.', encounterId: '', connections: ['last_watch_courtyard', 'last_watch_valley_path'], position: [100, 450], mapArea: 'last_watch', canRevisit: true },
    // Valley Path — placeholder node sitting next to Down to the
    // Valley. Future content cross-maps from here into the actual
    // valley map; for now it just sits open with TODO positioning
    // (user will tune coords). Same map area as the rest of the Last
    // Watch so the player doesn't see "all nodes vanish" when the
    // descent fires (which is what happens when the cross-map jump
    // lands on a near-empty target map).
    { id: 'last_watch_valley_path', name: 'Valley Path', description: 'The path opens into the valley proper.', encounterId: '', connections: ['last_watch_to_valley'], position: [70, 350], mapArea: 'last_watch', canRevisit: true, passthroughTo: 'high_valley_1_entry' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'last_watch_entry';
  return map;
}

// High Valley — first of two valley maps below the Last Watch. Four
// nodes laid along a winding mountain trail. The entry pairs back to
// the Last Watch (Valley Path); the exit cross-maps to the second
// half (createHighValley2Map). Placeholder positions — user will
// tune.
export function createHighValley1Map() {
  const map = new GameMap('high_valley_1', 'High Valley');
  map.mapImages = {
    high_valley_1: 'Maps/HighValley1.jpg',
  };
  const nodes = [
    { id: 'high_valley_1_entry', name: 'Valley Floor', description: 'The trail flattens into the valley proper.', encounterId: '', connections: ['high_valley_1_b'], position: [90, 720], mapArea: 'high_valley_1', canRevisit: true, passthroughTo: 'last_watch_valley_path' },
    { id: 'high_valley_1_b',     name: 'Stone Cairn',  description: 'A stack of stones marks the trail.',           encounterId: '', connections: ['high_valley_1_entry', 'high_valley_1_c'], position: [740, 700], mapArea: 'high_valley_1', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something on the trail ahead.' },
    { id: 'high_valley_1_c',     name: 'Ridge Bend',   description: 'The path bends along a rocky ridge.',          encounterId: '', connections: ['high_valley_1_b', 'high_valley_1_exit'],    position: [820, 560], mapArea: 'high_valley_1', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The trail bends out of sight.' },
    { id: 'high_valley_1_exit',  name: 'Onward',       description: 'The valley narrows ahead.',                    encounterId: '', connections: ['high_valley_1_c'],                          position: [610, 510], mapArea: 'high_valley_1', canRevisit: true, passthroughTo: 'high_valley_2_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'The valley narrows ahead.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'high_valley_1_entry';
  return map;
}

// High Valley — second of two valley maps. Four nodes: entry, the
// Frostbloom patch (the rare flower Olbrim was after), then two
// more nodes after the patch leading deeper in. Placeholder
// positions — user will tune.
export function createHighValley2Map() {
  const map = new GameMap('high_valley_2', 'High Valley');
  map.mapImages = {
    high_valley_2: 'Maps/HighValley2.jpg',
  };
  const nodes = [
    { id: 'high_valley_2_entry',     name: 'Upper Valley', description: 'The trail opens into a quiet upper valley.', encounterId: '', connections: ['high_valley_2_frostbloom'], position: [750, 750], mapArea: 'high_valley_2', canRevisit: true, passthroughTo: 'high_valley_1_exit' },
    // Frostbloom patch — the rare flower Olbrim was after. Encounter
    // hook left blank for now; future content fills in the find.
    { id: 'high_valley_2_frostbloom', name: 'Frostbloom Patch', description: 'A scattering of pale blue flowers blooms among the rocks.', encounterId: '', connections: ['high_valley_2_entry', 'high_valley_2_c'], position: [930, 570], mapArea: 'high_valley_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something pale catches the light ahead.' },
    { id: 'high_valley_2_c',         name: 'Cold Spring', description: 'A spring trickles out of the rock face — startlingly cold.', encounterId: '', connections: ['high_valley_2_frostbloom', 'high_valley_2_d'], position: [800, 520], mapArea: 'high_valley_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A glint of water on the rocks.' },
    { id: 'high_valley_2_d',         name: 'Deeper Path', description: 'The valley narrows further, the air thinner still.', encounterId: '', connections: ['high_valley_2_c', 'high_valley_2_cave_entrance'], position: [660, 500], mapArea: 'high_valley_2', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'The valley narrows further.' },
    // Cave Entrance — cross-maps into the Mountain Cave map at the
    // foot of the cliff face.
    { id: 'high_valley_2_cave_entrance', name: 'Cave Entrance', description: 'A dark opening yawns at the base of the cliff face.', encounterId: '', connections: ['high_valley_2_d'], position: [750, 420], mapArea: 'high_valley_2', canRevisit: true, passthroughTo: 'mountain_cave_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'A dark opening in the cliff face.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'high_valley_2_entry';
  return map;
}

// High Valley Mountain Cave — interior cave reached from the High
// Valley 2 trail. Three nodes: the entry (pairs back to the valley),
// the Circular Ruins in the middle, and the Ice Waterfall which will
// cross-map to the next area when it's built. Placeholder positions
// — tune to taste.
export function createMountainCaveMap() {
  const map = new GameMap('mountain_cave', 'Mountain Cave');
  map.mapImages = {
    mountain_cave: 'Maps/HighValleyMountainCave.jpg',
  };
  const nodes = [
    { id: 'mountain_cave_entry',         name: 'Cave Entrance',  description: 'You step in out of the wind. Dwarven runes are scratched into the stone above the doorway.', encounterId: '', connections: ['mountain_cave_ruins'], position: [900, 40], mapArea: 'mountain_cave', canRevisit: true, passthroughTo: 'high_valley_2_cave_entrance' },
    { id: 'mountain_cave_ruins',         name: 'Circular Ruins', description: 'The cave opens around a ring of broken stone — a circular ruin half-swallowed by ice.',           encounterId: '', connections: ['mountain_cave_entry', 'mountain_cave_ice_waterfall'], position: [750, 400], mapArea: 'mountain_cave', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Stone shapes loom in the gloom ahead.' },
    { id: 'mountain_cave_ice_waterfall', name: 'Ice Waterfall',  description: 'A frozen waterfall sheets the back wall. A narrow passage threads through the ice beyond.',  encounterId: '', connections: ['mountain_cave_ruins'], position: [340, 220], mapArea: 'mountain_cave', canRevisit: true, passthroughTo: 'roc_nest_far_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'Pale light glints further in.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'mountain_cave_entry';
  return map;
}

// Roc Nest From Far — open ridge approach to the Roc's nest, glimpsed
// at distance. Entry pairs back to the Mountain Cave Ice Waterfall;
// four more nodes wind across the ridge toward the final approach.
// The last node will cross-map into the nest interior when that map
// exists. Placeholder positions — tune to taste.
export function createRocNestFromFarMap() {
  const map = new GameMap('roc_nest_far', 'Roc Nest Approach');
  map.mapImages = {
    roc_nest_far: 'Maps/RocNestFromFar.jpg',
  };
  const nodes = [
    { id: 'roc_nest_far_entry', name: 'Ridge Trail',     description: 'You step out of the cave onto a high mountain ridge. Far ahead, something massive crowns the peak.', encounterId: '', connections: ['roc_nest_far_b'], position: [450, 760], mapArea: 'roc_nest_far', canRevisit: true, passthroughTo: 'mountain_cave_ice_waterfall' },
    { id: 'roc_nest_far_b',     name: 'Windward Pass',   description: 'The wind picks up. Loose feathers — far too large for any hawk — drift across the trail.',           encounterId: '', connections: ['roc_nest_far_entry', 'roc_nest_far_c'], position: [600, 660], mapArea: 'roc_nest_far', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something blows on the wind ahead.' },
    { id: 'roc_nest_far_c',     name: 'Bone Field',       description: 'The path crosses a slope littered with bleached bones — old kills, picked clean.',                   encounterId: '', connections: ['roc_nest_far_b', 'roc_nest_far_d'],     position: [630, 470], mapArea: 'roc_nest_far', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'White shapes scattered on the slope.' },
    { id: 'roc_nest_far_d',     name: 'Final Approach',  description: 'The nest looms close now — woven from whole tree trunks. Something stirs inside.',                     encounterId: '', connections: ['roc_nest_far_c', 'roc_nest_far_exit'],  position: [180, 280], mapArea: 'roc_nest_far', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'A massive shape crowns the ridge.' },
    // Exit — cross-maps into the nest interior.
    { id: 'roc_nest_far_exit',  name: 'Into the Nest',   description: 'The lip of the nest. There is no walking up here unseen.',                                            encounterId: '', connections: ['roc_nest_far_d'],                          position: [350, 240], mapArea: 'roc_nest_far', canRevisit: true, passthroughTo: 'nest_interior_entry', discoverable: true, hiddenName: '???', hiddenDescription: 'The lip of the nest itself.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'roc_nest_far_entry';
  return map;
}

// Nest Interior — inside the Roc's nest. Two nodes for now: the
// entry (pairs back to the Roc Nest Approach map) and the middle of
// the nest. Future content fills in the actual confrontation.
export function createNestInteriorMap() {
  const map = new GameMap('nest_interior', "The Roc's Nest");
  map.mapImages = {
    nest_interior: 'Maps/NestInterior.jpg',
  };
  const nodes = [
    { id: 'nest_interior_entry',  name: 'Edge of the Nest', description: 'You crest the rim. The nest spreads out like a small clearing, woven from whole tree trunks.', encounterId: '', connections: ['nest_interior_middle'], position: [260, 520], mapArea: 'nest_interior', canRevisit: true, passthroughTo: 'roc_nest_far_exit' },
    { id: 'nest_interior_middle', name: 'Middle of the Nest', description: 'Bones and broken armor crunch underfoot. Something dark stirs deeper in the nest.',         encounterId: '', connections: ['nest_interior_entry'],  position: [700, 440], mapArea: 'nest_interior', canRevisit: true, discoverable: true, hiddenName: '???', hiddenDescription: 'Something stirs deeper inside.' },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'nest_interior_entry';
  return map;
}

// Temple of Moradin — post-dragon side quest side-map reached from the
// Tharnag throne room. Two nodes: the entry (teleport pair back to the
// throne) and the altar (prayer encounter — 200 gp for a Tier 2 class
// ability, mirrors the Cathedral Shrine pattern in PY).
export function createTempleOfMoradinMap() {
  const map = new GameMap('temple_of_moradin', 'Temple of Moradin');
  map.mapImages = {
    temple_of_moradin: 'Maps/TempleofMoradin.jpg',
  };
  const nodes = [
    { id: 'temple_moradin_entry', name: 'To the Throne Room', description: 'The doorway leads back to the throne room of Tharnag.', encounterId: '', connections: ['temple_moradin_altar'], position: [1230, 760], mapArea: 'temple_of_moradin', canRevisit: true, passthroughTo: 'temple_moradin_door' },
    { id: 'temple_moradin_altar', name: 'Altar of Moradin', description: 'A massive stone altar carved with the runes of Moradin, the dwarven all-father.', encounterId: 'temple_moradin_altar', connections: ['temple_moradin_entry'], position: [720, 550], mapArea: 'temple_of_moradin', canRevisit: true },
  ];
  for (const data of nodes) {
    map.addNode(new MapNode(data));
  }
  map.currentNodeId = 'temple_moradin_entry';
  return map;
}
