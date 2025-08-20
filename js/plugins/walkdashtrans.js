/*:
 * @target MZ
 * @plugindesc v1.0 - Smooth transition for player movement and animation between walking and dashing on the map. 
 * @author
 *
 * @param Walk Speed
 * @type number
 * @min 1
 * @max 6
 * @default 4
 * @desc Movement speed when walking (default 4).
 *
 * @param Dash Speed
 * @type number
 * @min 1
 * @max 6
 * @default 5
 * @desc Movement speed when dashing (default 5).
 *
 * @param Walk Animation Speed
 * @type number
 * @min 1
 * @max 60
 * @default 9
 * @desc Frames per animation step when walking. Default = 9.
 *
 * @param Dash Animation Speed
 * @type number
 * @min 1
 * @max 60
 * @default 6
 * @desc Frames per animation step when dashing. Default = 6.
 *
 * @param Transition Frames
 * @type number
 * @min 1
 * @max 120
 * @default 20
 * @desc Number of frames it takes to blend between walking and dashing (movement + animation).
 *
 * @help
 * ============================================================================
 * Smooth Walk/Dash Movement + Animation
 * ============================================================================
 * This plugin makes both the **movement speed** and the **animation speed**
 * of the player gradually transition between walking and dashing instead of
 * snapping instantly.
 *
 * Example:
 * - Walk speed = 4, Dash speed = 5, Transition Frames = 20
 * - When you press dash, it takes about 20 frames (~1/3 sec) to accelerate.
 * - Same when you stop dashing: decelerates smoothly back to walking.
 *
 * ---------------------------------------------------------------------------
 * 📌 Usage:
 * - Install this plugin, set Walk/Dash speed, animation speeds, and
 *   Transition Frames in the Plugin Manager.
 *
 * ---------------------------------------------------------------------------
 * 📝 Notes:
 * - This only affects the player, not NPCs/events.
 * - Does not change tile grid movement logic (still moves per-tile), but
 *   makes the movement speed calculation feel smooth.
 *
 * ============================================================================
 */

(() => {
    const PLUGIN_NAME = "SmoothWalkDash";
    const params = PluginManager.parameters(PLUGIN_NAME);

    const WALK_SPEED = Number(params["Walk Speed"] || 4);
    const DASH_SPEED = Number(params["Dash Speed"] || 5);
    const WALK_ANIM = Number(params["Walk Animation Speed"] || 9);
    const DASH_ANIM = Number(params["Dash Animation Speed"] || 6);
    const TRANSITION_FRAMES = Number(params["Transition Frames"] || 20);

    // Initialize smoothing
    Game_Player.prototype.initSmoothWalkDash = function() {
        this._currentMoveSpeed = WALK_SPEED;
        this._targetMoveSpeed = WALK_SPEED;
        this._currentAnimSpeed = WALK_ANIM;
        this._targetAnimSpeed = WALK_ANIM;
    };

    const _Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        _Game_Player_initialize.call(this);
        this.initSmoothWalkDash();
    };

    const _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        this.updateSmoothWalkDash();
    };

    Game_Player.prototype.updateSmoothWalkDash = function() {
        // Target speeds depend on dashing state
        this._targetMoveSpeed = this.isDashing() ? DASH_SPEED : WALK_SPEED;
        this._targetAnimSpeed = this.isDashing() ? DASH_ANIM : WALK_ANIM;

        // Smooth blend for movement
        if (this._currentMoveSpeed !== this._targetMoveSpeed) {
            const diff = this._targetMoveSpeed - this._currentMoveSpeed;
            this._currentMoveSpeed += diff / TRANSITION_FRAMES;
            if (Math.abs(diff) < 0.01) this._currentMoveSpeed = this._targetMoveSpeed;
        }

        // Smooth blend for animation
        if (this._currentAnimSpeed !== this._targetAnimSpeed) {
            const diff = this._targetAnimSpeed - this._currentAnimSpeed;
            this._currentAnimSpeed += diff / TRANSITION_FRAMES;
            if (Math.abs(diff) < 0.01) this._currentAnimSpeed = this._targetAnimSpeed;
        }
    };

    // Override movement speed function
    Game_Player.prototype.realMoveSpeed = function() {
        return this._currentMoveSpeed;
    };

    // Override animation speed function
    Game_Player.prototype.animationWait = function() {
        return this._currentAnimSpeed;
    };
})();
