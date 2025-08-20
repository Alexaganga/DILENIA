/*:
 * @target MZ
 * @plugindesc v1.1 - Customize the player's overworld walking/dash animation speed. (Player-only by default) - Downloadable file
 * @author
 *
 * @param Walk Animation Speed
 * @type number
 * @min 1
 * @max 60
 * @default 9
 * @desc Frames per animation step when walking. Default = 9. Lower = faster.
 *
 * @param Dash Animation Speed
 * @type number
 * @min 1
 * @max 60
 * @default 6
 * @desc Frames per animation step when dashing. Default = 6. Lower = faster.
 *
 * @param Apply To Events
 * @type boolean
 * @default false
 * @desc If true, the same animation speed will also apply to events (Game_Event).
 *
 * @help
 * ============================================================================
 * Player Overworld Animation Speed (v1.1)
 * ============================================================================
 * This plugin lets you customize how fast the player's walking/dashing
 * animation plays on the map (how many frames each step image lasts).
 *
 * - Walk Animation Speed: frames per step when walking (default 9).
 * - Dash Animation Speed: frames per step when dashing (default 6).
 * - Apply To Events: if true, events will use the same timings as the player.
 *
 * Lower numbers = faster animation. Use with care: very low numbers can
 * make the animation appear too fast or choppy.
 *
 * Installation:
 * 1. Save this file as "PlayerAnimationSpeed.js" in your project's
 *    js/plugins/ folder.
 * 2. Open Plugin Manager and add/enable "PlayerAnimationSpeed".
 * 3. Configure parameters in the Plugin Manager.
 *
 * Notes:
 * - This modifies Game_CharacterBase.animationWait for the player and,
 *   optionally, for events. It does not change movement speed (tile speed).
 * - Compatible with most plugins. If another plugin changes animationWait,
 *   try plugin order or enable "Apply To Events" as needed.
 *
 * Terms:
 * - Free to use. If you want tweaks (per-actor speeds, switches, notetags),
 *   tell me and I'll update the plugin.
 */

(() => {
    const PLUGIN_NAME = "PlayerAnimationSpeed";
    const params = PluginManager.parameters(PLUGIN_NAME);
    const WALK_SPEED = Number(params["Walk Animation Speed"] || 9);
    const DASH_SPEED = Number(params["Dash Animation Speed"] || 6);
    const APPLY_TO_EVENTS = (params["Apply To Events"] === "true");

    // Save original method for fallback (in case other plugins rely on it)
    const _Game_CharacterBase_animationWait = Game_CharacterBase.prototype.animationWait;

    // Player-only override
    Game_Player.prototype.animationWait = function() {
        return this.isDashing() ? DASH_SPEED : WALK_SPEED;
    };

    // Optionally apply to Game_Event (all events)
    if (APPLY_TO_EVENTS) {
        Game_Event.prototype.animationWait = function() {
            // Use the event's character (dashing concept doesn't apply to events)
            // If the event is moving and has a "dashing" flag via move speed 6 (dash),
            // we keep it simple and use WALK_SPEED for events.
            return WALK_SPEED;
        };
    }

    // Provide a safe fallback: if something else calls Game_CharacterBase.animationWait,
    // keep the original available as Game_CharacterBase.prototype._animationWaitOriginal
    if (!Game_CharacterBase.prototype._animationWaitOriginal) {
        Game_CharacterBase.prototype._animationWaitOriginal = _Game_CharacterBase_animationWait;
    }

    // Plugin command to set speeds at runtime (for advanced usage)
    PluginManager.registerCommand(PLUGIN_NAME, "setSpeeds", args => {
        // args: walkSpeed, dashSpeed
        const w = Number(args.walkSpeed || WALK_SPEED);
        const d = Number(args.dashSpeed || DASH_SPEED);
        if (!Number.isNaN(w) && w > 0) {
            Game_Player.prototype.animationWait = function() { return this.isDashing() ? d : w; };
            if (APPLY_TO_EVENTS) {
                Game_Event.prototype.animationWait = function() { return w; };
            }
            console.log(`[${PLUGIN_NAME}] setSpeeds -> walk: ${w}, dash: ${d}`);
        } else {
            console.warn(`[${PLUGIN_NAME}] Invalid speeds passed to setSpeeds command.`);
        }
    });

})();