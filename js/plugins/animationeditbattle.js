/*:
 * @target MZ
 * @plugindesc [v3.0] Controla la duración de frames en animaciones SV de actores. Totalmente compatible y prioritario. [por ChatGPT]
 * @author ChatGPT
 *
 * @param walk
 * @text Walk
 * @desc Duraciones para "walk" (ej: 8,8,8,8,8,8)
 * @default 
 *
 * @param idle
 * @text Idle
 * @desc Duraciones para "idle" (también llamado wait) (ej: 30,30,30,30)
 * @default 
 *
 * @param attack
 * @text Attack
 * @desc Duraciones para "attack" (ej: 4,4,4,6,6,10)
 * @default 
 *
 * @param thrust
 * @text Thrust
 * @desc Duraciones para "thrust"
 * @default 
 *
 * @param swing
 * @text Swing
 * @desc Duraciones para "swing"
 * @default 
 *
 * @param skill
 * @text Skill
 * @desc Duraciones para "skill"
 * @default 
 *
 * @param spell
 * @text Spell
 * @desc Duraciones para "spell"
 * @default 
 *
 * @param guard
 * @text Guard
 * @desc Duraciones para "guard"
 * @default 
 *
 * @param damage
 * @text Damage
 * @desc Duraciones para "damage"
 * @default 
 *
 * @help
 * ============================================================================
 * SVFrameDurations_ForceOverride.js
 * ----------------------------------------------------------------------------
 * Este plugin permite controlar cuánto dura cada frame en las animaciones SV
 * de los ACTORES, sin conflictos con otros plugins como VisuStella.
 *
 * ✔ Compatible con cualquier sistema de batalla.
 * ✔ Se impone incluso si otros plugins pisan el control de animación.
 * ✔ Solo afecta a actores en batalla (no enemigos).
 * ✔ Usa parámetros configurables desde el editor de plugins.
 * ============================================================================
 */

(() => {
  const pluginName = "SVFrameDurations_ForceOverride";
  const params = PluginManager.parameters(pluginName);

  const parseDurations = (str) =>
    str.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));

  const FrameDurations = {};
  for (const key in params) {
    if (params[key]) {
      FrameDurations[key.toLowerCase()] = parseDurations(params[key]);
    }
  }

  const _Sprite_Actor_updateMotion = Sprite_Actor.prototype.updateMotion;
  Sprite_Actor.prototype.updateMotion = function() {
    if (!this._actor || !this._motion || !this._motion.name) {
      _Sprite_Actor_updateMotion.call(this);
      return;
    }

    const motionName = this._motion.name.toLowerCase();
    const durations = FrameDurations[motionName];

    if (durations && durations.length > 0) {
      this._customMotionCounter = this._customMotionCounter || 0;
      this._customFrameIndex = this._customFrameIndex || 0;

      this._customMotionCounter++;

      const currentDuration = durations[this._pattern] || this.motionSpeed();

      if (this._customMotionCounter >= currentDuration) {
        this._customMotionCounter = 0;
        this._pattern++;

        const frameCount = this._motion.frames;

        if (this._pattern >= frameCount) {
          if (this._motion.loop) {
            this._pattern = 0;
          } else {
            this.refreshMotion();
            return;
          }
        }
      }

      // Asegura que se actualicen los frames
      this.updateFrame();
    } else {
      // Usa comportamiento por defecto si no hay duración definida
      _Sprite_Actor_updateMotion.call(this);
    }
  };
})();
