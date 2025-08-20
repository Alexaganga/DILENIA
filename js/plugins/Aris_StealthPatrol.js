/*:
 * @target MZ
 * @plugindesc v1.1.0 - NPC Patrol, Stealth Detection, and Battle Outcome System.
 * @author https://mollock.itch.io/
 * @url https://mollock.itch.io/
 * @version 1.1.0
 * @command setupPatrol
 * @text Setup NPC Patrol/Stealth
 * @desc Configures an NPC's patrol route, vision, chase behavior,
 *       and how battles are initiated based on stealth interactions.
 *       (Safe to call repeatedly; configures once per event page load).
 *
 * @arg enablePath
 * @text Enable Pathing
 * @type boolean
 * @default true
 * @desc If true, the NPC will follow a path defined by PathRegion IDs.
 *
 * @arg pathRegion
 * @text PathRegion IDs
 * @type string
 * @desc Comma-separated Region IDs for the patrol path (e.g., 10 or 10,11).
 *       The NPC loops through tiles with these IDs.
 * @default 10
 *
 * @arg enableAmbush
 * @text Enable Ambush
 * @type boolean
 * @default true
 * @desc If true, NPC can ambush the player (enemies attack first)
 *       if it approaches the player from behind.
 *
 * @arg enablePreempt
 * @text Enable Preemptive Strike
 * @type boolean
 * @default true
 * @desc If true, the player can get a preemptive strike (player attacks first)
 *       by approaching an unaware NPC.
 *
 * @arg visionRange
 * @text Vision Range (Tiles)
 * @type number
 * @min 1
 * @default 6
 * @desc How many tiles ahead the NPC can see.
 *
 * @arg followSpeed
 * @text Chase Speed (1-6)
 * @type number
 * @min 1
 * @max 6
 * @default 5
 * @desc NPC's movement speed when chasing the player.
 *       (3=Normal, 4=Fast, 5=Faster).
 *
 * @arg chaseDuration
 * @text Chase Memory (Frames)
 * @type number
 * @min 0
 * @default 180
 * @desc How long (in frames) the NPC remembers/searches for the player
 *       after losing sight. 0 means instant forget.
 *
 * @arg battleTroopId
 * @text Battle Troop ID
 * @type troop_id
 * @default 0
 * @desc Troop ID for battles initiated by this NPC.
 *       Set to 0 to disable plugin-initiated battles for this NPC.
 *
 * @arg battleCanEscape
 * @text Battle: Allow Escape
 * @type boolean
 * @default true
 * @desc Can the player escape from battles initiated by this NPC?
 *
 * @arg battleCanLose
 * @text Battle: Allow Player to Lose
 * @type boolean
 * @default false
 * @desc If true, game continues after loss (e.g., run a common event).
 *       If false, player losing results in Game Over.
 *
 * @arg battleLoseCEId
 * @text Battle: Common Event on Loss
 * @type common_event_id
 * @default 0
 * @desc Common Event to run if player loses and 'Allow Player to Lose' is true.
 *
 * @arg winSwitch
 * @text Outcome: Win Self Switch
 * @desc Self Switch (A, B, C, D) to turn ON if player wins the battle.
 * @type select
 * @option None
 * @value 
 * @option A
 * @option B
 * @option C
 * @option D
 * @default 
 *
 * @arg loseSwitch
 * @text Outcome: Lose Self Switch
 * @desc Self Switch (A, B, C, D) to turn ON if player loses
 *       (and 'Allow Player to Lose' is true).
 * @type select
 * @option None
 * @value 
 * @option A
 * @option B
 * @option C
 * @option D
 * @default 
 *
 * @arg escapeSwitch
 * @text Outcome: Escape Self Switch
 * @desc Self Switch (A, B, C, D) to turn ON if player escapes the battle.
 * @type select
 * @option None
 * @value 
 * @option A
 * @option B
 * @option C
 * @option D
 * @default 
 *
 * @arg chaseSprite
 * @text Chase Mode Sprite
 * @desc Character sprite to use when NPC is chasing (optional).
 *       Leave empty to use the same sprite.
 * @type file
 * @dir img/characters
 * @default 
 *
 * @arg chaseSpriteIndex
 * @text Chase Sprite Index
 * @desc Index of the character in the chase sprite sheet (0-7).
 * @type number
 * @min 0
 * @max 7
 * @default 0
 *
 * @param BlockRegion
 * @text Vision Blocking Region ID
 * @desc Region ID that blocks NPC line of sight.
 * @type number
 * @min 1
 * @max 255
 * @default 1
 *
 * @help
 * ============================================================================
 * Aris NPC Stealth Patrol - v1.0.2
 * by https://mollock.itch.io/
 * ============================================================================
 * This plugin allows you to create NPCs with patrol behaviors, vision cones,
 * chase mechanics, and specific battle outcomes (preemptive, ambush, normal)
 * based on how the player and NPC encounter each other.
 *
 * How to Use:
 * 1. Add this plugin to your project.
 * 2. For an event you want to control with this plugin:
 *    - Set its Trigger to "Parallel Process".
 *    - Add the "Setup NPC Patrol/Stealth" plugin command to its event page.
 *    - Configure the parameters in the plugin command to define the NPC's
 *      behavior (patrol regions, vision, battle troop, etc.).
 *
 * Features:
 * - Path Patrolling: NPCs can patrol a route defined by Region IDs.
 * - Line of Sight Vision: NPCs detect the player if they are within their
 *   frontal vision cone, range, and no obstacles block sight.
 * - Automatic Chase: Upon seeing the player, NPCs can interrupt their
 *   patrol to chase the player.
 * - Battle Outcomes:
 *   - Ambush (Surprise): If an NPC catches the player from behind.
 *   - Preemptive Strike: If the player approaches an unaware NPC.
 *   - Normal Battle: Standard encounter.
 * - Configurable Battle Properties: Troop ID, escape option, lose condition.
 * - Post-Battle Outcomes: Set Self Switches based on win, lose, or escape.
 *
 * Notes:
 * - It's recommended to use this plugin with events set to "Parallel Process"
 *   for continuous behavior updates.
 * - The "Vision Blocking Region ID" parameter (global) defines which
 *   Region ID will act as a wall for NPC sight.
 * - The plugin command is safe to call repeatedly on the same event page;
 *   it will only reconfigure if arguments change or the page itself changes.
 * ============================================================================
 */

(() => {
  'use strict';
  
  const PLUGIN_NAME = "Aris_StealthPatrol";

  // Direction constants
  const Direction = {
    DOWN: 2,
    LEFT: 4,
    RIGHT: 6,
    UP: 8,
    ALL: [2, 4, 6, 8]
  };

  // Battle result constants
  const BattleResult = {
    WIN: 0,
    ESCAPE: 1,
    LOSE: 2
  };

  // Logging utilities
  const Logger = {
    warn: (...args) => console.warn(`[${PLUGIN_NAME}]`, ...args),
    error: (...args) => console.error(`[${PLUGIN_NAME}]`, ...args)
  };

  // Parse plugin parameters
  const params = PluginManager.parameters(PLUGIN_NAME);
  const BLOCK_REGION_ID = Number(params.BlockRegion) || 1;

  // ===================================================================
  // Utility Functions
  // ===================================================================

  const Utils = {
    /**
     * Gets direction constant from coordinate delta
     */
    directionFromDelta(dx, dy) {
      if (dx === 0 && dy === 1) return Direction.DOWN;
      if (dx === -1 && dy === 0) return Direction.LEFT;
      if (dx === 1 && dy === 0) return Direction.RIGHT;
      if (dx === 0 && dy === -1) return Direction.UP;
      return null;
    },

    /**
     * Checks if two characters are orthogonally adjacent
     */
    areCharsAdjacent(pos1, pos2) {
      return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y) === 1;
    },

    /**
     * Checks if a character is looking at another character's tile
     */
    isCharLookingAtChar(lookerPos, lookerDir, targetPos) {
      const expectedDir = this.directionFromDelta(
        targetPos.x - lookerPos.x,
        targetPos.y - lookerPos.y
      );
      return expectedDir !== null && lookerDir === expectedDir;
    },

    /**
     * Calculates the tile behind a character based on their facing direction
     */
    getTileBehindChar(charPos, charDir) {
      const tile = { x: charPos.x, y: charPos.y };
      switch (charDir) {
        case Direction.DOWN: tile.y -= 1; break;
        case Direction.UP: tile.y += 1; break;
        case Direction.LEFT: tile.x += 1; break;
        case Direction.RIGHT: tile.x -= 1; break;
      }
      return tile;
    },

    /**
     * Checks if target's back is facing attacker
     */
    isTargetBackFacingAttacker(targetPos, targetDir, attackerPos) {
      const tileBehind = this.getTileBehindChar(targetPos, targetDir);
      return tileBehind.x === attackerPos.x && tileBehind.y === attackerPos.y;
    },

    /**
     * Checks if NPC is facing towards a delta position (vision cone)
     */
    isNpcFacingTowardsDelta(npcDir, dx, dy) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      
      switch (npcDir) {
        case Direction.DOWN: return dy > 0 && absDx <= absDy;
        case Direction.LEFT: return dx < 0 && absDy <= absDx;
        case Direction.RIGHT: return dx > 0 && absDy <= absDx;
        case Direction.UP: return dy < 0 && absDx <= absDy;
        default: return false;
      }
    },

    /**
     * Gets Manhattan distance between two positions
     */
    getManhattanDistance(pos1, pos2) {
      return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
    }
  };

  // ===================================================================
  // Config Manager - Handles NPC configuration
  // ===================================================================

  class ConfigManager {
    static parseConfig(args) {
      return {
        enablePath: args.enablePath === "true",
        pathRegionIds: this.parseRegionIds(args.pathRegion),
        enableAmbush: args.enableAmbush === "true",
        enablePreempt: args.enablePreempt === "true",
        visionRange: Number(args.visionRange) || 6,
        followSpeed: Number(args.followSpeed) || 5,
        chaseDuration: args.chaseDuration === undefined ? 180 : Number(args.chaseDuration),
        battleTroopId: Number(args.battleTroopId) || 0,
        battleCanEscape: args.battleCanEscape === "true",
        battleCanLose: args.battleCanLose === "true",
        battleLoseCEId: Number(args.battleLoseCEId) || 0,
        winSwitch: args.winSwitch || null,
        loseSwitch: args.loseSwitch || null,
        escapeSwitch: args.escapeSwitch || null,
        chaseSprite: args.chaseSprite || "",
        chaseSpriteIndex: Number(args.chaseSpriteIndex) || 0
      };
    }

    static parseRegionIds(regionString) {
      return regionString
        .split(",")
        .map(n => Number(n.trim()))
        .filter(id => !isNaN(id) && id > 0);
    }

    static needsReconfiguration(event, currentPageIndex, newArgsString) {
      return !event._spConfigured || 
             event._spLastPageIndexForConfig !== currentPageIndex || 
             event._spLastArgsForConfig !== newArgsString;
    }
  }

  // ===================================================================
  // Vision System - Handles line of sight and detection
  // ===================================================================

  class VisionSystem {
    /**
     * Checks if player is currently visible to NPC
     */
    static isPlayerVisible(npc) {
      const dx = $gamePlayer.x - npc.x;
      const dy = $gamePlayer.y - npc.y;
      const distance = Math.abs(dx) + Math.abs(dy);

      // Same tile is always visible
      if (distance === 0) return true;
      
      // Check range
      if (distance > npc._spConfig.visionRange) return false;

      // Check vision cone
      if (!Utils.isNpcFacingTowardsDelta(npc.direction(), dx, dy)) return false;

      // Check line of sight
      return !this.isLineOfSightBlocked(npc, dx, dy);
    }

    /**
     * Checks if line of sight is blocked by obstacles
     */
    static isLineOfSightBlocked(npc, deltaX, deltaY) {
      const targetX = npc.x + deltaX;
      const targetY = npc.y + deltaY;
      const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      
      if (steps <= 1) return false;

      for (let i = 1; i < steps; i++) {
        const progress = i / steps;
        const checkX = Math.round(npc.x + deltaX * progress);
        const checkY = Math.round(npc.y + deltaY * progress);
        
        // Skip start and end positions
        if ((checkX === npc.x && checkY === npc.y) || 
            (checkX === targetX && checkY === targetY)) continue;
        
        if ($gameMap.regionId(checkX, checkY) === BLOCK_REGION_ID) return true;
      }
      
      return false;
    }
  }

  // ===================================================================
  // Path System - Handles patrol path generation and following
  // ===================================================================

  class PathSystem {
    /**
     * Builds patrol path from region IDs using nearest-neighbor algorithm
     */
    static buildPath(regionIds, startX, startY) {
      const availableTiles = this.getRegionTiles(regionIds);
      
      if (availableTiles.length === 0) {
        return [{ x: startX, y: startY }];
      }

      return this.createNearestNeighborPath(availableTiles, startX, startY);
    }

    /**
     * Gets all tiles with specified region IDs
     */
    static getRegionTiles(regionIds) {
      const tiles = [];
      const width = $gameMap.width();
      const height = $gameMap.height();
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (regionIds.includes($gameMap.regionId(x, y))) {
            tiles.push({ x, y });
          }
        }
      }
      
      return tiles;
    }

    /**
     * Creates path using nearest-neighbor algorithm
     */
    static createNearestNeighborPath(tiles, startX, startY) {
      const path = [];
      const remaining = [...tiles];
      
      // Find closest initial tile
      let current = this.extractClosestTile(remaining, startX, startY);
      path.push(current);
      
      // Build path by always choosing nearest unvisited tile
      while (remaining.length > 0) {
        const next = this.extractClosestTile(remaining, current.x, current.y);
        if (!next) break;
        
        path.push(next);
        current = next;
      }
      
      return path;
    }

    /**
     * Extracts and returns closest tile from array
     */
    static extractClosestTile(tiles, x, y) {
      if (tiles.length === 0) return null;
      
      let minDist = Infinity;
      let closestIdx = -1;
      
      for (let i = 0; i < tiles.length; i++) {
        const dist = Math.abs(tiles[i].x - x) + Math.abs(tiles[i].y - y);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      
      return closestIdx !== -1 ? tiles.splice(closestIdx, 1)[0] : null;
    }

    /**
     * Finds closest path node to current position
     */
    static findClosestNodeIndex(path, x, y) {
      let minDist = Infinity;
      let closestIdx = 0;
      
      for (let i = 0; i < path.length; i++) {
        const dist = Math.abs(path[i].x - x) + Math.abs(path[i].y - y);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      
      return closestIdx;
    }
  }

  // ===================================================================
  // Battle System - Handles battle initiation and outcomes
  // ===================================================================

  class BattleSystem {
    /**
     * Determines battle type based on proximity and facing
     */
    static getProximityBattleType(npc) {
      const player = $gamePlayer;
      const playerPos = { x: player.x, y: player.y };
      const npcPos = { x: npc.x, y: npc.y };

      // Only for adjacent encounters
      if (playerPos.x === npcPos.x && playerPos.y === npcPos.y) return null;
      if (!Utils.areCharsAdjacent(playerPos, npcPos)) return null;

      const playerDir = player.direction();
      const npcDir = npc.direction();
      const playerLooksAtNpc = Utils.isCharLookingAtChar(playerPos, playerDir, npcPos);
      const npcLooksAtPlayer = Utils.isCharLookingAtChar(npcPos, npcDir, playerPos);

      if (!playerLooksAtNpc && !npcLooksAtPlayer) return null;

      // Player approaches unaware NPC
      if (playerLooksAtNpc && !npcLooksAtPlayer && npc._spConfig.enablePreempt) {
        // Prevent preemptive if NPC is chasing
        if (!npc._spChase) {
          return "preemptive";
        }
      }

      // NPC approaches player from behind
      if (npcLooksAtPlayer && !playerLooksAtNpc && 
          Utils.isTargetBackFacingAttacker(playerPos, playerDir, npcPos) && 
          npc._spConfig.enableAmbush) {
        return "ambush";
      }

      // Standard encounter
      if (playerLooksAtNpc || npcLooksAtPlayer) {
        return "normal";
      }

      return null;
    }

    /**
     * Initiates battle with configured parameters
     */
    static initiateBattle(npc) {
      const config = npc._spConfig;
      const eventId = npc.eventId();

      if (!config || config.battleTroopId <= 0) {
        Logger.warn(`Event ${eventId}: No battle troop configured`);
        npc._spEngagingBattle = false;
        npc._spReady = false;
        return;
      }

      npc._spEngagingBattle = true;
      npc._spSeen = true;

      // Store battle type flags
      const preemptive = BattleManager._preemptive === true;
      const surprise = BattleManager._surprise === true;

      // Setup battle
      BattleManager.setup(config.battleTroopId, config.battleCanEscape, config.battleCanLose);
      BattleManager._preemptive = preemptive;
      BattleManager._surprise = surprise;

      // Setup battle callback
      BattleManager.setEventCallback((result) => {
        this.handleBattleOutcome(npc, result);
      });

      SceneManager.push(Scene_Battle);
    }

    /**
     * Handles post-battle outcomes
     */
    static handleBattleOutcome(npc, battleResult) {
      const config = npc._spConfig;
      const eventId = npc.eventId();
      const mapId = $gameMap.mapId();
      
      let switchToSet = null;
      let needsRefresh = false;

      // Determine which switch to set based on outcome
      switch (battleResult) {
        case BattleResult.WIN:
          switchToSet = config.winSwitch;
          break;
        case BattleResult.ESCAPE:
          switchToSet = config.escapeSwitch;
          break;
        case BattleResult.LOSE:
          switchToSet = config.loseSwitch;
          if (config.battleCanLose && config.battleLoseCEId > 0) {
            $gameTemp.reserveCommonEvent(config.battleLoseCEId);
          }
          break;
      }

      // Set self switch if configured
      if (switchToSet && ['A', 'B', 'C', 'D'].includes(switchToSet.toUpperCase())) {
        const key = [mapId, eventId, switchToSet.toUpperCase()];
        $gameSelfSwitches.setValue(key, true);
        needsRefresh = true;
      }

      // Reset battle state
      npc._spEngagingBattle = false;
      npc._spReady = false;

      if (needsRefresh) {
        npc.refresh();
      }
    }
  }

  // ===================================================================
  // Movement Behaviors
  // ===================================================================

  const MovementBehaviors = {
    /**
     * Patrol movement behavior
     */
    patrol(npc) {
      if (!npc._spPath || npc._spPath.length === 0 || npc.isMoving()) return;

      const path = npc._spPath;
      let currentIdx = npc._spCurrentPathIndex;

      // If returning from chase, find nearest path node
      if (npc._spReturnToPath) {
        currentIdx = PathSystem.findClosestNodeIndex(path, npc.x, npc.y);
        npc._spCurrentPathIndex = currentIdx;
        npc._spReturnToPath = false;
      }

      // Validate path index
      if (currentIdx < 0 || currentIdx >= path.length) {
        npc._spCurrentPathIndex = 0;
        return;
      }

      const targetNode = path[currentIdx];
      if (!targetNode) {
        Logger.error(`Event ${npc.eventId()}: Invalid patrol node`);
        npc._spReady = false;
        return;
      }

      // Check if reached current node
      if (npc.x === targetNode.x && npc.y === targetNode.y) {
        // Move to next node
        npc._spCurrentPathIndex = (currentIdx + 1) % path.length;
        
        // Face next node
        const nextNode = path[npc._spCurrentPathIndex];
        if (nextNode) {
          const dir = npc.findDirectionTo(nextNode.x, nextNode.y);
          if (dir > 0) npc.setDirection(dir);
        }
      } else {
        // Move towards current node
        const dir = npc.findDirectionTo(targetNode.x, targetNode.y);
        if (dir > 0) {
          npc.moveStraight(dir);
        } else {
          // Skip if stuck
          npc._spCurrentPathIndex = (currentIdx + 1) % path.length;
        }
      }
    },

    /**
     * Chase player behavior
     */
    chase(npc) {
      if (npc.isMoving() || npc._spEngagingBattle) return;

      let targetX = npc._spLastPlayerX;
      let targetY = npc._spLastPlayerY;

      if (targetX === null || targetY === null) {
        npc._spChase = false;
        npc._spSeen = false;
        npc.setMoveSpeed(npc._spOrigSpeed);
        npc._spRestoreOriginalSprite();
        return;
      }

      // If at last known position
      if (npc.x === targetX && npc.y === targetY) {
        if (npc._spChaseTimer > 0 && !(npc.x === $gamePlayer.x && npc.y === $gamePlayer.y)) {
          // Search behavior
          if (Math.random() < 0.4) {
            const randomDir = Direction.ALL[Math.floor(Math.random() * 4)];
            if (npc.canPass(npc.x, npc.y, randomDir)) {
              npc.moveStraight(randomDir);
            } else {
              npc.turnRandom();
            }
          } else {
            npc.turnRandom();
          }
        }
        return;
      }

      // Update target if player is visible
      if (VisionSystem.isPlayerVisible(npc)) {
        npc._spLastPlayerX = $gamePlayer.x;
        npc._spLastPlayerY = $gamePlayer.y;
        targetX = npc._spLastPlayerX;
        targetY = npc._spLastPlayerY;
      }

      // Move towards target
      const dir = npc.findDirectionTo(targetX, targetY);
      if (dir > 0) {
        npc.moveStraight(dir);
      } else if (npc._spChaseTimer > $gameSystem.frameRate() / 2 && Math.random() < 0.1) {
        npc.turnRandom();
      }
    }
  };

  // ===================================================================
  // Plugin Command Registration
  // ===================================================================

  PluginManager.registerCommand(PLUGIN_NAME, "setupPatrol", function(args) {
    const eventId = this.eventId();
    const gameCharacter = this.character(0);
    
    if (!gameCharacter || !(gameCharacter instanceof Game_Event)) {
      Logger.error(`Event ID ${eventId}: Could not get Game_Event`);
      return;
    }

    const event = gameCharacter;
    const currentPageIndex = event._pageIndex;
    const newArgsString = JSON.stringify(args);

    // Check if reconfiguration is needed
    if (!ConfigManager.needsReconfiguration(event, currentPageIndex, newArgsString)) {
      return;
    }

    // Configure event
    event._spConfig = ConfigManager.parseConfig(args);
    event._spLastPageIndexForConfig = currentPageIndex;
    event._spLastArgsForConfig = newArgsString;
    event._spConfigured = true;
    event._spReady = false;
  });

  // ===================================================================
  // Game_Event Extensions
  // ===================================================================

  const _Game_Event_setupPage = Game_Event.prototype.setupPage;
  Game_Event.prototype.setupPage = function() {
    const wasConfigured = this._spConfigured;
    _Game_Event_setupPage.call(this);
    
    if (wasConfigured) {
      // Check if new page has the plugin command
      const hasPluginCommand = this.list() && this.list().some(cmd => 
        cmd.code === 357 && 
        cmd.parameters[0] === PLUGIN_NAME && 
        cmd.parameters[1] === "setupPatrol"
      );

      if (!hasPluginCommand) {
        this._spResetState();
      } else {
        this._spReady = false;
      }
    }
  };

  const _Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
  Game_Event.prototype.updateSelfMovement = function() {
    if (this._spEngagingBattle || !this._spConfigured) {
      _Game_Event_updateSelfMovement.apply(this, arguments);
      return;
    }

    // Skip if another event is running
    if ($gameMap.isEventRunning() && 
        $gameMap._interpreter &&
        $gameMap._interpreter.eventId() !== this.eventId()) {
      _Game_Event_updateSelfMovement.apply(this, arguments);
      return;
    }

    // Initialize if needed
    if (!this._spReady) {
      this._spInitialize();
      if (!this._spReady) {
        _Game_Event_updateSelfMovement.apply(this, arguments);
        return;
      }
    }

    // Update stealth patrol behavior
    this._spUpdateBehavior();
  };

  const _Game_Event_checkEventTriggerTouch = Game_Event.prototype.checkEventTriggerTouch;
  Game_Event.prototype.checkEventTriggerTouch = function(x, y) {
    if (this._spConfigured && this._spEngagingBattle) {
      return;
    }
    _Game_Event_checkEventTriggerTouch.call(this, x, y);
  };

  // ===================================================================
  // Game_Event Stealth Patrol Methods
  // ===================================================================

  Game_Event.prototype._spResetState = function() {
    this._spConfigured = false;
    this._spConfig = null;
    this._spPath = null;
    this._spChase = false;
    this._spSeen = false;
    this._spEngagingBattle = false;
    this._spReady = false;
    this._spLastPageIndexForConfig = -1;
    this._spLastArgsForConfig = null;
    this._spOriginalImage = null;
    this._spOriginalImageIndex = 0;
  };

  Game_Event.prototype._spInitialize = function() {
    // Initialize state variables
    this._spSeen = false;
    this._spChase = false;
    this._spEngagingBattle = false;
    this._spOrigSpeed = this.moveSpeed();
    this._spOrigFreq = this.moveFrequency();
    this._spChaseTimer = 0;
    this._spLastPlayerX = null;
    this._spLastPlayerY = null;
    this._spPath = null;
    this._spCurrentPathIndex = 0;
    this._spIsControllingMovement = false;
    this._spOriginalImage = null;
    this._spOriginalImageIndex = 0;
    this._spReturnToPath = false;

    // Setup patrol path if enabled
    if (this._spConfig.enablePath) {
      this._spSetupPatrolPath();
    } else {
      this._spPath = [];
    }

    this._spReady = !this._spConfig.enablePath || (this._spPath && this._spPath.length > 0);
  };

  Game_Event.prototype._spSetupPatrolPath = function() {
    const regionIds = this._spConfig.pathRegionIds;
    
    if (!regionIds || regionIds.length === 0) {
      this._spPath = [{ x: this.x, y: this.y }];
      return;
    }

    this._spPath = PathSystem.buildPath(regionIds, this.x, this.y);
    
    if (!this._spPath || this._spPath.length === 0) {
      this._spPath = [{ x: this.x, y: this.y }];
    }

    // Set initial path index
    if (this._spPath.length > 0) {
      const closestIdx = PathSystem.findClosestNodeIndex(this._spPath, this.x, this.y);
      this._spCurrentPathIndex = closestIdx;
      
      // If on the closest node, move to next
      if (this.x === this._spPath[closestIdx].x && 
          this.y === this._spPath[closestIdx].y) {
        this._spCurrentPathIndex = (closestIdx + 1) % this._spPath.length;
      }
    }
  };

  Game_Event.prototype._spUpdateBehavior = function() {
    let battleType = null;

    // Check proximity battle before movement
    if (!this._spEngagingBattle) {
      battleType = this._spCheckProximityBattle();
      if (battleType) {
        this._spStartBattle(battleType);
        return;
      }
    }

    // Skip if move route is being forced by something else
    if (this.isMoveRouteForcing() && !this._spIsControllingMovement) {
      _Game_Event_updateSelfMovement.apply(this, arguments);
      return;
    }

    this._spIsControllingMovement = false;

    // Update vision and chase state
    this._spUpdateVisionState();

    // Execute movement behavior
    if (this._spChase) {
      this._spIsControllingMovement = true;
      MovementBehaviors.chase(this);
    } else if (this._spConfig.enablePath && this._spPath && this._spPath.length > 0) {
      this._spIsControllingMovement = true;
      MovementBehaviors.patrol(this);
    } else {
      _Game_Event_updateSelfMovement.apply(this, arguments);
    }

    // Check proximity battle after movement
    if (!this._spEngagingBattle && !this.isMoving()) {
      battleType = this._spCheckProximityBattle();
      if (battleType) {
        // Override preemptive if NPC initiated the encounter
        if (battleType === "preemptive" && this._spIsControllingMovement) {
          battleType = "normal";
        }
        this._spStartBattle(battleType);
      }
    }
  };

  Game_Event.prototype._spUpdateVisionState = function() {
    const playerVisible = VisionSystem.isPlayerVisible(this);

    if (playerVisible) {
      this._spSeen = true;
      
      if (!this._spChase) {
        this._spChase = true;
        this.setMoveSpeed(this._spConfig.followSpeed);
        this._spSetChaseSprite();
      }
      
      this._spChaseTimer = this._spConfig.chaseDuration;
      this._spLastPlayerX = $gamePlayer.x;
      this._spLastPlayerY = $gamePlayer.y;
    } else {
      if (this._spChase) {
        // Handle chase memory
        if (this._spConfig.chaseDuration === 0) {
          this._spChaseTimer = 0;
        } else if (this._spChaseTimer > 0) {
          this._spChaseTimer--;
        }
        
        if (this._spChaseTimer === 0) {
          this._spChase = false;
          this._spSeen = false;
          this.setMoveSpeed(this._spOrigSpeed);
          this._spRestoreOriginalSprite();
          this._spReturnToPath = true;
        }
      } else {
        this._spSeen = false;
      }
    }
  };

  Game_Event.prototype._spCheckProximityBattle = function() {
    const player = $gamePlayer;
    
    // Same tile check
    if (this.x === player.x && this.y === player.y) {
      if (this._spConfig.enableAmbush && 
          Utils.isTargetBackFacingAttacker(
            { x: player.x, y: player.y }, 
            player.direction(), 
            { x: this.x, y: this.y }
          )) {
        return "ambush";
      }
      // Prevent preemptive if NPC is chasing
      if (this._spConfig.enablePreempt && !this._spChase) {
        return "preemptive";
      }
      return "normal";
    }
    
    // Adjacent tile check
    return BattleSystem.getProximityBattleType(this);
  };

  Game_Event.prototype._spStartBattle = function(battleType) {
    BattleManager._preemptive = (battleType === "preemptive");
    BattleManager._surprise = (battleType === "ambush");
    this.turnTowardPlayer();
    BattleSystem.initiateBattle(this);
  };

  Game_Event.prototype._spSetChaseSprite = function() {
    if (!this._spConfig.chaseSprite) return;
    
    // Store original sprite info if not already stored
    if (!this._spOriginalImage) {
      this._spOriginalImage = this._characterName;
      this._spOriginalImageIndex = this._characterIndex;
    }
    
    // Set chase sprite
    this.setImage(this._spConfig.chaseSprite, this._spConfig.chaseSpriteIndex);
  };

  Game_Event.prototype._spRestoreOriginalSprite = function() {
    if (this._spOriginalImage) {
      this.setImage(this._spOriginalImage, this._spOriginalImageIndex);
      this._spOriginalImage = null;
      this._spOriginalImageIndex = 0;
    }
  };

  // ===================================================================
  // Game_Map Extensions
  // ===================================================================

  const _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
  Game_Map.prototype.setupEvents = function() {
    // Reset stealth patrol state for all events
    this.events().forEach(event => {
      if (event._spConfigured) {
        event._spReady = false;
      }
    });
    
    _Game_Map_setupEvents.call(this);
  };

})();