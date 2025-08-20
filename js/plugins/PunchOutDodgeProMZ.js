/*:
 * @target MZ
 * @plugindesc v1.4 Punch-Out Hybrid Battle — real-time dodge+block+counter during enemy turn, telegraphs, fakeouts, sliding, gimmicks. (MZ)
 * @author ChatGPT
 *
 * @help
 * ─────────────────────────────────────────────────────────────────────────────
 * Punch-Out Hybrid Battle (RPG Maker MZ)
 * ─────────────────────────────────────────────────────────────────────────────
 * Core Loop:
 * • Player turn = normal RPG menus (attack/skills/items/guard/run).
 * • Enemy turn = Dodge Phase (telegraph ➜ real-time input).
 * - Press Left/Right to dodge (actor sprite slides briefly).
 * - Hold/press Block to reduce damage for that hit.
 * - On successful dodge, a Counter Window opens (Light/Heavy trigger skills).
 * • Fake-outs, delay/cancel mixups, and difficulty scaling via use-count.
 * • Enemy gimmicks:
 * - Blind overlay (obscures tells during phase).
 * - Armor phases: require N total successful dodges before counters unlock.
 *
 * IMPORTANT:
 * • This plugin applies to ALL enemy actions (single-target or AoE). For AoE,
 * each actor target gets their own QTE, sequentially as the engine invokes.
 * • Vanilla MZ only. If using VisuStella, load this AFTER their cores.
 *
 * ── GLOBAL PARAMETERS ────────────────────────────────────────────────────────
 * Configure keys, default timings, SFX, animations, screenshake, slide motion,
 * indicators, etc. in Plugin Manager.
 *
 * ── NOTETAGS ────────────────────────────────────────────────────────────────
 * Place on ENEMIES or SKILLS (skill overrides enemy). Actor/Class tags set
 * counter skills & personal animations. Numbers are integers unless noted.
 *
 * [Enemy/Skill]
 * <Telegraph: n>            # Wind-up frames before the Dodge phase begins.
 * <DodgeFrames: n>          # Active frames to react.
 * <DodgeScale: x.y>         # Multiplier for DodgeFrames (difficulty).
 * <DodgeDir: left|right|both|random>
 * <Fakeout: n%>             # Chance the shown direction flips once, mid-window.
 * <MixupDelay: n>           # Extra random delay frames (0..n added to telegraph).
 * <MixupCancel: n%>         # Chance the telegraph cancels (no attack occurs).
 * <CounterWindow: n>        # Frames to accept counter input after success.
 * <CounterStun: n>          # HUD "STUNNED!" hold frames after counter (visual).
 * <ArmorDodges: n>          # Require n total successful dodges vs this enemy
 * # before counter windows will open (per enemy).
 * <BlindOverlay: n>         # During telegraph+dodge, tint the screen (0..255).
 *
 * [Punishment / Scaling]
 * <PunishScale: x.y>        # Multiplies damage when the player fails the dodge.
 * <UseCountScale: a,b,c>    # On 2nd/3rd/... uses of this skill in battle,
 * # multiply DodgeFrames by these scalars, e.g.
 * # <UseCountScale: 0.95,0.9,0.85>
 *
 * [Per-Actor / Class — counters & animations]
 * <CounterLight: skillId>
 * <CounterHeavy: skillId>
 * <AnimDodge: animationId>    # Play on actor when a dodge succeeds.
 * <AnimBlock: animationId>    # Play when block is used.
 * <AnimCounter: animationId>  # Play when a counter skill is triggered.
 *
 * Examples:
 * Enemy/Skill:
 * <Telegraph: 24>
 * <DodgeFrames: 32>
 * <DodgeScale: 0.9>
 * <DodgeDir: random>
 * <Fakeout: 25%>
 * <MixupDelay: 8>
 * <MixupCancel: 10%>
 * <CounterWindow: 18>
 * <CounterStun: 12>
 * <ArmorDodges: 3>
 * <BlindOverlay: 96>
 * <PunishScale: 1.3>
 * <UseCountScale: 0.95,0.9,0.85>
 *
 * Actor/Class:
 * <CounterLight: 5>
 * <CounterHeavy: 6>
 * <AnimDodge: 37>
 * <AnimBlock: 21>
 * <AnimCounter: 45>
 *
 * Notes:
 * • Blocking applies a one-hit damage reduction for this action instance.
 * • Sliding animation is visual (sprite offset) and auto recenters.
 * • ArmorDodges progress is tracked per enemy instance each battle.
 * • BlindOverlay draws a semi-transparent screen tint during the phase.
 * • “STUNNED!” is a visual HUD hold; no engine stun state is applied by default.
 *
 * License: Free for commercial & non-commercial projects. Credit “ChatGPT”.
 *
 * @param Default Dodge Frames
 * @type number @min 6 @default 48
 *
 * @param Default Telegraph Frames
 * @type number @min 0 @default 18
 *
 * @param Default Counter Window
 * @type number @min 6 @default 20
 *
 * @param Fakeout Chance %
 * @type number @min 0 @max 100 @default 0
 *
 * @param Mixup Extra Delay
 * @type number @min 0 @desc Adds random 0..N frames to telegraph. @default 0
 *
 * @param Mixup Cancel %
 * @type number @min 0 @max 100 @default 0
 *
 * @param Punish Damage Scale
 * @type number @decimals 2 @min 0 @default 1.00
 *
 * @param UseCount Scalar Steps
 * @type text
 * @desc Comma list of default scalars per repeated use, e.g. 0.95,0.9
 * @default
 *
 * @param Block Damage Rate %
 * @type number @min 0 @max 100 @default 50
 *
 * @param Keys: Dodge Left
 * @type select
 * @option left @option pageup @option tab
 * @default left
 *
 * @param Keys: Dodge Right
 * @type select
 * @option right @option pagedown @option tab
 * @default right
 *
 * @param Keys: Block
 * @type select
 * @option shift @option control @option tab
 * @default shift
 *
 * @param Keys: Counter Light
 * @type select
 * @option ok @option pageup @option tab
 * @default ok
 *
 * @param Keys: Counter Heavy
 * @type select
 * @option cancel @option pagedown @option tab
 * @default cancel
 *
 * @param Default Light Counter Skill
 * @type skill @default 1
 *
 * @param Default Heavy Counter Skill
 * @type skill @default 2
 *
 * @param Slide Pixels
 * @type number @min 0 @default 36
 *
 * @param Slide Duration
 * @type number @min 1 @default 12
 *
 * @param Screenshake Power
 * @type number @min 0 @default 4
 *
 * @param Show Text Indicators
 * @type boolean @on Yes @off No @default true
 *
 * @param SFX: Telegraph
 * @type file @dir audio/se @default Ice1
 *
 * @param SFX: Success
 * @type file @dir audio/se @default Heal1
 *
 * @param SFX: Fail
 * @type file @dir audio/se @default Buzzer1
 *
 * @param SFX: Block
 * @type file @dir audio/se @default Equip1
 *
 * @param SFX: Counter
 * @type file @dir audio/se @default Attack3
 *
 * @param Anim: HitSpark (On Hit)
 * @type animation @default 0
 *
 * @param Anim: Dodge (Fallback)
 * @type animation @default 0
 *
 * @param Anim: Block (Fallback)
 * @type animation @default 0
 *
 * @param Anim: Counter (Fallback)
 * @type animation @default 0
 */
(() => {
  "use strict";

  const PLUGIN = "PunchOutDodgeProMZ";
  const P = PluginManager.parameters(PLUGIN);

  const PARAMS = {
    dodgeFrames: Number(P["Default Dodge Frames"] || 48),
    telFrames: Number(P["Default Telegraph Frames"] || 18),
    counterWin: Number(P["Default Counter Window"] || 20),
    fakeout: Number(P["Fakeout Chance %"] || 0),
    mixDelay: Number(P["Mixup Extra Delay"] || 0),
    mixCancel: Number(P["Mixup Cancel %"] || 0),
    punishScale: Number(P["Punish Damage Scale"] || 1.0),
    useCountSteps: String(P["UseCount Scalar Steps"] || "").trim(),
    blockRate: Math.max(0, Math.min(100, Number(P["Block Damage Rate %"] || 50))) / 100,
    keyLeft: String(P["Keys: Dodge Left"] || "left"),
    keyRight: String(P["Keys: Dodge Right"] || "right"),
    keyBlock: String(P["Keys: Block"] || "shift"),
    keyLight: String(P["Keys: Counter Light"] || "ok"),
    keyHeavy: String(P["Keys: Counter Heavy"] || "cancel"),
    lightSkill: Number(P["Default Light Counter Skill"] || 1),
    heavySkill: Number(P["Default Heavy Counter Skill"] || 2),
    slidePixels: Number(P["Slide Pixels"] || 36),
    slideDuration: Number(P["Slide Duration"] || 12),
    shakePow: Number(P["Screenshake Power"] || 4),
    showText: (P["Show Text Indicators"] || "true") === "true",
    seTele: String(P["SFX: Telegraph"] || "Ice1"),
    seSuccess: String(P["SFX: Success"] || "Heal1"),
    seFail: String(P["SFX: Fail"] || "Buzzer1"),
    seBlock: String(P["SFX: Block"] || "Equip1"),
    seCounter: String(P["SFX: Counter"] || "Attack3"),
    animHitSpark: Number(P["Anim: HitSpark (On Hit)"] || 0),
    animDodgeFallback: Number(P["Anim: Dodge (Fallback)"] || 0),
    animBlockFallback: Number(P["Anim: Block (Fallback)"] || 0),
    animCounterFallback: Number(P["Anim: Counter (Fallback)"] || 0),
  };

  const DEFAULT_USECOUNT_STEPS = PARAMS.useCountSteps
    ? PARAMS.useCountSteps.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n))
    : [];

  const playSE = (name) => name && AudioManager.playSe({ name, pan:0, pitch:100, volume:90 });

  // ── Meta helpers ───────────────────────────────────────────────────────────
  function metaNum(obj, key, def) {
    if (!obj || !obj.meta) return def;
    let m = obj.meta[key];
    if (m == null) return def;
    if (typeof m === "string" && m.endsWith("%")) m = m.slice(0, -1);
    const n = Number(m);
    return isNaN(n) ? def : n;
  }
  function metaPct(obj, key, def) {
    const n = metaNum(obj, key, def);
    if (isNaN(n)) return def;
    return Math.max(0, Math.min(100, n));
  }
  function metaStr(obj, key, def) {
    if (!obj || !obj.meta) return def;
    const m = obj.meta[key];
    return m != null ? String(m).trim() : def;
  }
  function metaArray(obj, key) {
    if (!obj || !obj.meta || obj.meta[key] == null) return [];
    return String(obj.meta[key]).split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
  }

  function actorCounterSkillId(actor, heavy) {
    const tag = heavy ? "CounterHeavy" : "CounterLight";
    let id = metaNum(actor.actor(), tag, 0);
    if (!id && actor.currentClass()) id = metaNum(actor.currentClass(), tag, 0);
    if (!id) id = heavy ? PARAMS.heavySkill : PARAMS.lightSkill;
    return id;
  }
  function actorAnimId(actor, kind /* "AnimDodge" | "AnimBlock" | "AnimCounter" */) {
    let id = metaNum(actor.actor(), kind, 0);
    if (!id && actor.currentClass()) id = metaNum(actor.currentClass(), kind, 0);
    if (!id) {
      if (kind === "AnimDodge") return PARAMS.animDodgeFallback;
      if (kind === "AnimBlock") return PARAMS.animBlockFallback;
      if (kind === "AnimCounter") return PARAMS.animCounterFallback;
    }
    return id;
  }

  // Per-enemy runtime (armor dodges & per-skill use counts)
  const EnemyRuntime = new WeakMap(); // key: Game_Enemy
  function enemyData(en) {
    if (!EnemyRuntime.has(en)) EnemyRuntime.set(en, { armorDodges:0, useCounts:new Map() });
    return EnemyRuntime.get(en);
  }

  // ── HUD (arrow, label, timer, blind overlay) ───────────────────────────────
  class Sprite_QTEHud extends Sprite {
    constructor() {
      super(new Bitmap(1,1));
      this.anchor.set(0.5);
      this._arrow = new Sprite(new Bitmap(120,120));
      this._arrow.anchor.set(0.5);
      this.addChild(this._arrow);

      this._timer = new Sprite(new Bitmap(120,24));
      this._timer.anchor.set(0.5);
      this._timer.y = 64;
      this.addChild(this._timer);

      this._label = new Sprite(new Bitmap(200,28));
      this._label.anchor.set(0.5);
      this._label.y = -64;
      this.addChild(this._label);

      this._blind = new ScreenSprite();
      this._blind.opacity = 0;
      this._blind.visible = false;
      this.addChild(this._blind);

      this.visible = false;
      this._dir = "left";
      this._status = "neutral";
      this._stage = "idle";
    }
    set(dir, status, stage, framesLeft, blindOpacity) {
      this._dir = dir;
      this._status = status;
      this._stage = stage;
      this.visible = stage !== "idle";
      this.refresh(framesLeft, blindOpacity);
    }
    refresh(frames, blindOpacity) {
      // arrow
      const b = this._arrow.bitmap;
      b.resize(120,120); b.clear();
      const ctx = b.context;
      let col = "#2c3e50";
      if (this._status === "success") col = "#1abc9c";
      else if (this._status === "fail") col = "#e74c3c";
      else if (this._status === "block") col = "#f1c40f";
      ctx.fillStyle = col;
      ctx.beginPath();
      if (this._dir === "left") { ctx.moveTo(80,20); ctx.lineTo(40,60); ctx.lineTo(80,100); }
      else { ctx.moveTo(40,20); ctx.lineTo(80,60); ctx.lineTo(40,100); }
      ctx.closePath(); ctx.fill();
      b._baseTexture.update();

      // timer text
      const tb = this._timer.bitmap;
      tb.resize(120,24); tb.clear();
      tb.drawText((Math.max(0,frames)/60).toFixed(1)+"s",0,0,120,24,"center");

      // label
      const lb = this._label.bitmap;
      lb.resize(200,28); lb.clear();
      if (PARAMS.showText) {
        let t = "";
        if (this._stage === "telegraph") t = "GET READY!";
        else if (this._stage === "dodge") t = "DODGE!";
        else if (this._stage === "counter") t = "COUNTER!";
        else if (this._stage === "stun") t = "STUNNED!";
        lb.fontSize = 20;
        lb.drawText(t,0,0,200,28,"center");
      }

      // blind overlay
      this._blind.visible = !!blindOpacity && blindOpacity > 0;
      this._blind.opacity = Math.max(0, Math.min(255, blindOpacity || 0));
    }
  }

  // ── QTE Controller ─────────────────────────────────────────────────────────
  const QTE = {
    active:false,
    stage:"idle", // telegraph -> dodge -> counter -> stun -> done
    subject:null, action:null, target:null,
    direction:"left", shown:"left",
    telLeft:0, timeLeft:0, counterLeft:0, stunLeft:0,
    result:null, fakeout:false, fakeoutDone:false,
    blindOpacity:0, cancelTelegraph:false,
    punishScale:1.0, useSteps:[],
    armorReq:0,
    // slide anim
    slideT:0, slideDur:0, slidePx:0, slideDir:0,

    start(subject, action, target) {
      this.reset();
      this.active = true;
      this.stage = "telegraph";
      this.subject = subject;
      this.action = action;
      this.target = target;

      const item = action ? action.item() : null;
      const enemy = subject && subject.isEnemy() ? subject.enemy() : null;

      const dirTag = metaStr(item,"DodgeDir", metaStr(enemy,"DodgeDir","random")).toLowerCase();
      if (dirTag === "left" || dirTag === "right") this.direction = dirTag;
      else if (dirTag === "both" || dirTag === "random") this.direction = Math.random()<0.5 ? "left":"right";
      else this.direction = Math.random()<0.5 ? "left":"right";
      this.shown = this.direction;

      const tel = metaNum(item,"Telegraph", metaNum(enemy,"Telegraph", PARAMS.telFrames));
      const frames = metaNum(item,"DodgeFrames", metaNum(enemy,"DodgeFrames", PARAMS.dodgeFrames));
      const scale = Number(metaStr(item,"DodgeScale", metaStr(enemy,"DodgeScale","1.0")));
      const cwin = metaNum(item,"CounterWindow", metaNum(enemy,"CounterWindow", PARAMS.counterWin));
      const fake = metaPct(item,"Fakeout", metaPct(enemy,"Fakeout", PARAMS.fakeout));
      const mixD = metaNum(item,"MixupDelay", metaNum(enemy,"MixupDelay", PARAMS.mixDelay));
      const mixC = metaPct(item,"MixupCancel", metaPct(enemy,"MixupCancel", PARAMS.mixCancel));
      const blind = metaNum(item,"BlindOverlay", metaNum(enemy,"BlindOverlay", 0));
      const punish = Number(metaStr(item,"PunishScale", metaStr(enemy,"PunishScale", String(PARAMS.punishScale))));
      const armorReq = metaNum(item,"ArmorDodges", metaNum(enemy,"ArmorDodges", 0));

      // per-skill use count scaling
      this.useSteps = metaArray(item,"UseCountScale");
      if (!this.useSteps.length) this.useSteps = DEFAULT_USECOUNT_STEPS;

      const er = enemyData(this.subject);
      const itemId = item ? item.id : 0;
      const prevUses = (er.useCounts.get(itemId) || 0);
      const useScalar = prevUses > 0 && this.useSteps[prevUses-1] ? this.useSteps[prevUses-1] : 1.0;

      this.telLeft = Math.max(0, Math.floor(tel + (mixD>0 ? Math.random()*mixD : 0)));
      this.timeLeft = Math.max(1, Math.floor(frames * (scale || 1) * useScalar));
      this.counterLeft = Math.max(0, Math.floor(cwin));
      this.fakeout = fake > 0;
      this.fakeoutDone = false;
      this.blindOpacity = Math.max(0, Math.min(255, blind));
      this.cancelTelegraph = (mixC>0 && Math.random()*100 < mixC);
      this.punishScale = Math.max(0, punish);
      this.armorReq = Math.max(0, armorReq);

      if (this.telLeft > 0 && !this.cancelTelegraph) playSE(PARAMS.seTele);
    },

    reset() {
      this.active=false; this.stage="idle";
      this.subject=this.action=this.target=null;
      this.direction="left"; this.shown="left";
      this.telLeft=this.timeLeft=this.counterLeft=this.stunLeft=0;
      this.result=null; this.fakeout=false; this.fakeoutDone=false;
      this.blindOpacity=0; this.cancelTelegraph=false;
      this.punishScale=1.0; this.useSteps=[]; this.armorReq=0;
      this.slideT=0; this.slideDur=0; this.slidePx=0; this.slideDir=0;
    },

    update() {
      if (!this.active) return;

      // Telegraph (may cancel entirely)
      if (this.stage === "telegraph") {
        if (this.cancelTelegraph) {
          this.result = "success"; // treat as avoided
          this.stage = "done";
          return;
        }
        if (this.telLeft > 0) {
          this.telLeft--;
          if (this.telLeft === 0) this.stage = "dodge";
        }
        return;
      }

      // Dodge window
      if (this.stage === "dodge") {
        // One-time fakeout: mid-window flip
        if (!this.fakeoutDone && this.fakeout && this.timeLeft <= Math.floor(this.timeLeft/2)+1) {
          this.shown = this.direction === "left" ? "right" : "left";
          this.fakeoutDone = true;
        }

        if (Input.isTriggered(PARAMS.keyLeft))  return this._decide("left");
        if (Input.isTriggered(PARAMS.keyRight)) return this._decide("right");
        if (Input.isPressed(PARAMS.keyBlock) || Input.isTriggered(PARAMS.keyBlock)) {
          this._resolve("block"); return;
        }

        this.timeLeft--;
        if (this.timeLeft <= 0) { this._resolve("fail"); }
        return;
      }

      // Counter window
      if (this.stage === "counter") {
        if (Input.isTriggered(PARAMS.keyLight)) { this._counter(false); return; }
        if (Input.isTriggered(PARAMS.keyHeavy)) { this._counter(true);  return; }
        this.counterLeft--;
        if (this.counterLeft <= 0) this.finish();
        return;
      }

      // Stun hold (visual)
      if (this.stage === "stun") {
        this.stunLeft--;
        if (this.stunLeft <= 0) this.finish();
      }
    },

    _decide(side) {
      this._startSlide(side === "left" ? -1 : 1);
      if (side === this.direction) this._resolve("success");
      else this._resolve("fail");
    },

    _startSlide(dir) {
      this.slideDir = dir;
      this.slideDur = PARAMS.slideDuration;
      this.slideT = this.slideDur;
      this.slidePx = PARAMS.slidePixels * dir;
    },

    _resolve(kind) {
      this.result = kind; // success | block | fail
      if (kind === "success") {
        playSE(PARAMS.seSuccess);
        if (PARAMS.shakePow > 0) $gameScreen.startShake(PARAMS.shakePow, 5, 10);
        this._playActorAnim("AnimDodge");

        // Armor requirement gate for counter
        const er = enemyData(this.subject);
        if (this.armorReq > 0) {
          er.armorDodges = (er.armorDodges || 0) + 1;
        }
        const armorGate = this.armorReq > 0 && er.armorDodges < this.armorReq;
        this.stage = (!armorGate && this.counterLeft > 0) ? "counter" : "done";

      } else if (kind === "block") {
        playSE(PARAMS.seBlock);
        this._playActorAnim("AnimBlock");
        this.stage = "done";

      } else {
        playSE(PARAMS.seFail);
        // hitspark on actor when failed (took hit)
        if (PARAMS.animHitSpark > 0 && this.target) {
          $gameTemp.requestAnimation([this.target], PARAMS.animHitSpark);
        }
        this.stage = "done";
      }
    },

    _counter(heavy) {
      const a = this.target, e = this.subject;
      if (!a || !e) return this.finish();
      const skillId = actorCounterSkillId(a, heavy);
      if (skillId > 0) {
        playSE(PARAMS.seCounter);
        this._playActorAnim("AnimCounter");
        a.forceAction(skillId, e.index());
        BattleManager.forceAction(a);
        if (PARAMS.shakePow > 0) $gameScreen.startShake(PARAMS.shakePow, 6, 16);
      }
      if (this.stunLeft > 0) this.stage = "stun";
      else this.finish();
    },

    _playActorAnim(kind) {
      if (!this.target) return;
      const id = actorAnimId(this.target, kind);
      if (id > 0) $gameTemp.requestAnimation([this.target], id);
    },

    finish() { this.stage = "done"; },
    isDone() { return this.stage === "done"; }
  };

  // ── Spriteset helpers (HUD + slide) ────────────────────────────────────────
  const _Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
  Spriteset_Battle.prototype.createLowerLayer = function() {
    _Spriteset_Battle_createLowerLayer.call(this);
    this._qteHud = new Sprite_QTEHud();
    this._qteHud.x = Graphics.width/2;
    this._qteHud.y = Graphics.height/2;
    this.addChild(this._qteHud);
  };

  Spriteset_Battle.prototype.actorSpriteFor = function(actor) {
    if (!actor) return null;
    const arr = this._actorSprites || [];
    for (const sp of arr) if (sp._actor === actor) return sp;
    return null;
  };

  const _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
  Spriteset_Battle.prototype.update = function() {
    _Spriteset_Battle_update.call(this);

    // HUD refresh
    if (this._qteHud) {
      const framesLeft =
        QTE.stage === "dodge" ? QTE.timeLeft :
        QTE.stage === "telegraph" ? QTE.telLeft :
        QTE.stage === "counter" ? QTE.counterLeft : 0;
      this._qteHud.set(QTE.shown, QTE.result || "neutral", QTE.stage, framesLeft, QTE.blindOpacity);
      this._qteHud.visible = QTE.active && QTE.stage !== "idle";
    }

    // Sliding sprite offset (ease-out-ish)
    if (QTE.slideT > 0 && QTE.target) {
      const sp = this.actorSpriteFor(QTE.target);
      if (sp) {
        const t = Math.max(1, QTE.slideT);
        const step = Math.round(QTE.slidePx / Math.max(1, QTE.slideDur));
        sp.x += step;
        QTE.slideT--;
        if (QTE.slideT <= 0) {
          // recentre to home smoothly
          if (sp._homeX != null) sp.startMove(sp._homeX - sp.x, 0, 8);
        }
      } else {
        QTE.slideT = 0;
      }
    }
  };

  // ── Battle flow hooks ──────────────────────────────────────────────────────
  // Count skill uses (for scaling) per enemy
  const _BattleManager_startAction = BattleManager.startAction;
  BattleManager.startAction = function() {
    _BattleManager_startAction.call(this);
    const subject = this._subject;
    const action = subject ? subject.currentAction() : null;
    if (subject && subject.isEnemy() && action) {
      const item = action.item();
      if (item) {
        const er = enemyData(subject);
        const c = er.useCounts.get(item.id) || 0;
        er.useCounts.set(item.id, c+1);
      }
      // Precompute stun frames from tags (visual only)
      const itemData = action.item();
      const enemyDataObj = subject.enemy();
      QTE.stunLeft = metaNum(itemData, "CounterStun", metaNum(enemyDataObj, "CounterStun", 0));
    }
  };

  // Keep QTE ticking even when scene is busy
  const _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function() {
    if (QTE.active) QTE.update();
    _Scene_Battle_update.call(this);
  };

  // Invoke per target: run a QTE for each ACTOR target (covers single + AoE)
  const _BattleManager_invokeAction = BattleManager.invokeAction;
  BattleManager.invokeAction = function(subject, target) {
    const action = this._action;

    // Only for enemy actions vs actors
    if (subject && subject.isEnemy && subject.isEnemy() && target && target.isActor && target.isActor()) {
      // Ensure/Start QTE for THIS target if not active
      if (!QTE.active || QTE.isDone() || QTE.target !== target || QTE.subject !== subject) {
        QTE.start(subject, action, target);
      }

      // Wait until QTE resolves
      if (!QTE.isDone()) return;

      // Apply resolution
      if (QTE.result === "success") {
        this._logWindow.push("addText", `${target.name()} dodged the attack!`);
        QTE.reset();
        return; // skip damage entirely
      } else if (QTE.result === "block") {
        target._qteBlockRate = PARAMS.blockRate;
        QTE.reset();
        // proceed to damage with block reduction
        const v = _BattleManager_invokeAction.call(this, subject, target);
        return v;
      } else {
        // fail → punish damage scale
        target._qtePunishScale = QTE.punishScale;
        QTE.reset();
        const v = _BattleManager_invokeAction.call(this, subject, target);
        return v;
      }
    }

    // Non-actor targets or non-enemy subjects proceed as normal
    return _BattleManager_invokeAction.call(this, subject, target);
  };

  // Damage hooks: block & punish scaling (one-hit each)
  const _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    let v = _Game_Action_makeDamageValue.call(this, target, critical);
    if (target && target._qteBlockRate != null) {
      v = Math.floor(v * target._qteBlockRate);
      delete target._qteBlockRate;
    }
    if (target && target._qtePunishScale != null) {
      v = Math.floor(v * target._qtePunishScale);
      delete target._qtePunishScale;
    }
    return v;
  };

  // Safety cleanup at end of action
  const _BattleManager_endAction = BattleManager.endAction;
  BattleManager.endAction = function() {
    _BattleManager_endAction.call(this);
    if (QTE.active) QTE.reset();
  };

})();