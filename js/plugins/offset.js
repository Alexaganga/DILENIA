/*:
 * @target MZ
 * @plugindesc [v1.1.0] Map-only sprite Y offset (configurable in Plugin Manager). Applies to player, followers and/or events. 
 * @author
 *
 * @param Offset Y
 * @type number
 * @min -999
 * @max 999
 * @default 4
 * @desc Vertical offset in pixels. Positive = move down, negative = move up.
 *
 * @param Affect Player
 * @type boolean
 * @default true
 * @desc Apply offset to the player character on the map?
 *
 * @param Affect Followers
 * @type boolean
 * @default true
 * @desc Apply offset to party followers on the map?
 *
 * @param Affect Events
 * @type boolean
 * @default true
 * @desc Apply offset to map events?
 *
 * @param Debug
 * @type boolean
 * @default false
 * @desc If true, prints plugin parameter values and errors to the console.
 *
 * @help
 * MapSpriteOffset.js
 * - Offsets only map sprites (player, followers, events) by the configured number of pixels.
 * - Battle sprites are untouched.
 * - If another plugin also overrides Sprite_Character.prototype.updatePosition
 *   without calling the original, order matters in Plugin Manager.
 *
 * Troubleshooting:
 * - If nothing changes, enable Debug and check the console (F8) for logs.
 * - If another plugin still "wins", move this plugin below/above it in Plugin Manager.
 */

(() => {
  // Try to detect plugin name from current script so PluginManager.parameters works
  const script = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  const pluginName = (script && script.src)
    ? script.src.split('/').pop().replace(/\.js$/i, '')
    : 'MapSpriteOffset';

  const params = PluginManager.parameters(pluginName) || {};
  const OFFSET_Y = Number(params['Offset Y'] || 0);
  const AFFECT_PLAYER = params['Affect Player'] === 'true';
  const AFFECT_FOLLOWERS = params['Affect Followers'] === 'true';
  const AFFECT_EVENTS = params['Affect Events'] === 'true';
  const DEBUG = params['Debug'] === 'true';

  if (DEBUG) console.log(`[${pluginName}] loaded. OffsetY=${OFFSET_Y} player=${AFFECT_PLAYER} followers=${AFFECT_FOLLOWERS} events=${AFFECT_EVENTS}`);

  // Keep a reference to the original method
  const _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
  Sprite_Character.prototype.updatePosition = function() {
    // call original (this sets this.x / this.y based on character screen position)
    _Sprite_Character_updatePosition.call(this);

    if (!this._character) return; // safety
    if (!OFFSET_Y) return; // nothing to do

    const chara = this._character;

    try {
      // Player
      if (chara === $gamePlayer && AFFECT_PLAYER) {
        this.y += OFFSET_Y;
        return;
      }
      // Single follower (each follower is Game_Follower)
      if (typeof Game_Follower !== 'undefined' && chara instanceof Game_Follower && AFFECT_FOLLOWERS) {
        this.y += OFFSET_Y;
        return;
      }
      // Events
      if (chara instanceof Game_Event && AFFECT_EVENTS) {
        this.y += OFFSET_Y;
        return;
      }
    } catch (err) {
      if (DEBUG) console.error(`[${pluginName}] error applying offset:`, err);
    }
  };
})();
