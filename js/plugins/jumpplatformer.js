/*:
 * @target MZ
 * @plugindesc (v1.4) Mario-style jump with gravity, SE, and custom jump/fall sprites. Addon for rmmz_movement.js. Place BELOW it. 
 * @author
 *
 * @param JumpKey
 * @type select
 * @option OK (Z/Space/Enter)
 * @value ok
 * @option Shift
 * @value shift
 * @option Control
 * @value control
 * @option Tab
 * @value tab
 * @desc Which button triggers the jump.
 * @default ok
 *
 * @param JumpStrength
 * @type number
 * @min 1
 * @decimals 1
 * @desc Initial upward velocity of the jump. Higher = higher jump.
 * @default 5
 *
 * @param Gravity
 * @type number
 * @min 0.1
 * @decimals 2
 * @desc Gravity pulling the player down each frame.
 * @default 0.35
 *
 * @param JumpSE
 * @type struct<SE>
 * @desc Sound effect played when the jump begins.
 * @default {"name":"Jump1","volume":"90","pitch":"100","pan":"0"}
 *
 * @param JumpSprite
 * @type file
 * @dir img/characters/
 * @desc Character spritesheet to use while moving upward (jumping).
 * Leave empty to keep the normal sprite.
 * @default
 *
 * @param FallSprite
 * @type file
 * @dir img/characters/
 * @desc Character spritesheet to use while moving downward (falling).
 * Leave empty to keep the normal sprite.
 * @default
 *
 * @help
 * === Mario Jump Addon for rmmz_movement.js ===
 * 
 * - Place BELOW rmmz_movement.js in Plugin Manager.
 * - Press the chosen key (default = OK / Z / Space / Enter) to jump.
 * - Player rises and falls with a Mario-like arc (gravity).
 * - A sound effect plays when jumping.
 * - While airborne, the character sprite is swapped:
 *    * JumpSprite = used when velocity > 0 (going up).
 *    * FallSprite = used when velocity < 0 (falling).
 * - When landing, the player’s normal sprite is restored.
 *
 * Notes:
 * - JumpSprite and FallSprite should be in /img/characters/.
 * - They must be formatted like normal character sheets.
 */

/*~struct~SE:
 * @param name
 * @type file
 * @dir audio/se/
 * @desc Filename of the sound effect (without extension).
 * @default Jump1
 *
 * @param volume
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param pitch
 * @type number
 * @default 100
 *
 * @param pan
 * @type number
 * @default 0
 */

(() => {
  const script = document.currentScript;
  const pluginName = script.src.match(/([^/]+)\.js$/)[1];
  const params = PluginManager.parameters(pluginName);

  const JUMP_KEY = String(params["JumpKey"] || "ok");
  const JUMP_STRENGTH = Number(params["JumpStrength"] || 5);
  const GRAVITY = Number(params["Gravity"] || 0.35);

  const JumpSE = JSON.parse(params["JumpSE"] || "{}");
  const JumpSprite = String(params["JumpSprite"] || "");
  const FallSprite = String(params["FallSprite"] || "");

  // ----------------------------------------------------
  // Game_Player extensions
  // ----------------------------------------------------
  const _Game_Player_initMembers = Game_Player.prototype.initMembers;
  Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
    this._mj_jump = false;
    this._mj_jumpVelocity = 0;
    this._mj_jumpY = 0;
    this._mj_originalName = "";
    this._mj_originalIndex = 0;
  };

  // Offset sprite vertically
  const _Game_Player_screenY = Game_Player.prototype.screenY;
  Game_Player.prototype.screenY = function() {
    return _Game_Player_screenY.call(this) - Math.round(this._mj_jumpY || 0);
  };

  // Start a jump
  Game_Player.prototype.mj_startJump = function() {
    if (this._mj_jump || !this.canMove()) return;
    this._mj_jump = true;
    this._mj_jumpVelocity = JUMP_STRENGTH;
    this._mj_jumpY = 0;

    // save original sprite so we can restore it
    this._mj_originalName = this.characterName();
    this._mj_originalIndex = this.characterIndex();

    // play SE
    if (JumpSE.name) {
      AudioManager.playSe({
        name: String(JumpSE.name),
        volume: Number(JumpSE.volume || 90),
        pitch: Number(JumpSE.pitch || 100),
        pan: Number(JumpSE.pan || 0)
      });
    }
  };

  // Update jump physics
  Game_Player.prototype.mj_updateJump = function() {
    if (!this._mj_jump) return;

    this._mj_jumpY += this._mj_jumpVelocity;
    this._mj_jumpVelocity -= GRAVITY;

    // Swap sprite depending on direction
    if (this._mj_jumpVelocity > 0 && JumpSprite) {
      this.setImage(JumpSprite, 0);
    } else if (this._mj_jumpVelocity < 0 && FallSprite) {
      this.setImage(FallSprite, 0);
    }

    // Landed
    if (this._mj_jumpY <= 0) {
      this._mj_jumpY = 0;
      this._mj_jump = false;
      this._mj_jumpVelocity = 0;
      // restore original sprite
      if (this._mj_originalName) {
        this.setImage(this._mj_originalName, this._mj_originalIndex);
      }
    }
  };

  // Restrict movement while jumping
  const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function() {
    if (this._mj_jump) {
      const dir8 = Input.dir8;
      if (dir8 === 4 || dir8 === 6) {
        if (typeof this._moveByInput === "function") {
          this._moveByInput(dir8);
        } else {
          _Game_Player_moveByInput.call(this);
        }
      }
      return;
    }
    _Game_Player_moveByInput.call(this);
  };

  // Hook into update
  const _Game_Player_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function(sceneActive) {
    _Game_Player_update.call(this, sceneActive);
    if (!this._mj_jump && this.canMove() && Input.isTriggered(JUMP_KEY)) {
      this.mj_startJump();
    }
    this.mj_updateJump();
  };

  console.info(`${pluginName}: loaded — Key=${JUMP_KEY}, Strength=${JUMP_STRENGTH}, Gravity=${GRAVITY}, JumpSprite=${JumpSprite}, FallSprite=${FallSprite}`);
})();
