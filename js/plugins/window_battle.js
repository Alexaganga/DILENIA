Scene_Battle.prototype.actorCommandWindowRect = function() 
{
    const ww = Graphics.boxWidth;
    const wh = Window_Base.prototype.fittingHeight(1) + Window_Base.prototype.itemPadding();
    const wx = 0;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};

var origCreateActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
Scene_Battle.prototype.createActorCommandWindow = function()
{
    origCreateActorCommandWindow.call(this);
    this._actorCommandWindow.y = 0;
};

Window_ActorCommand.prototype.maxRows = function() { return 1; };

Window_ActorCommand.prototype.maxCols = function() 
{
    return this._actor ? this.maxItems() : 1;
};