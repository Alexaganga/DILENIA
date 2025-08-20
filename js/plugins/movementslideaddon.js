/*:
 * @target MZ
 * @plugindesc Addon for rmmz_movement.js — player walks a bit more after stopping (momentum effect).
 * @author
 *
 * @param InertiaFrames
 * @type number
 * @min 0
 * @desc Number of extra frames to keep moving after releasing input.
 * @default 8
 *
 * @help
 * Place BELOW rmmz_movement.js in the plugin list.
 * 
 * After you release the movement key, the player continues moving in the last
 * direction for a few frames (momentum effect). Followers will copy naturally.
 */

(() => {
    const pluginName = "MomentumAddon";
    const parameters = PluginManager.parameters(pluginName);
    const inertiaFrames = Number(parameters["InertiaFrames"] || 8);

    const _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this._inertiaCount = 0;
        this._lastDir8 = 0;   // store last 8-dir input
    };

    const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        const dir8 = Input.dir8; // raw input from rmmz_movement.js
        if (dir8 > 0) {
            this._lastDir8 = dir8;
        }
        const wasPressing = this._movePressing;

        _Game_Player_moveByInput.call(this);

        // Detect release: before pressing, now not pressing
        if (wasPressing && !this._movePressing) {
            this._inertiaCount = inertiaFrames;
        }
    };

    const _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);

        if (this._inertiaCount > 0 && !this._movePressing && this.canMove()) {
            // use same internal move function as plugin
            this._moveByInput(this._lastDir8);
            this._inertiaCount--;
        }
    };
})();
