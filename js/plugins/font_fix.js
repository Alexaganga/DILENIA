<style type="text/css">
@font-face{
font-family:'terminus';
src:local("Terminus (TTF) for Windows");
}
@font-face{
font-family:'terminusttf';
src:url(term2.ttf);
}
@font-face{
font-family:'pixel';
src:local("Pixel Operator");
}
@font-face{
font-family:'pixelttf';
src:url("PixelOperator.ttf");
}


</style>
<canvas id="canvas" width="400" height="400" onclick="render()" />
<script type="text/javascript">
var c = document.getElementById('canvas');
var ctx= c.getContext('2d');
function render(){
ctx.clearRect(0,0,c.width,c.height);
ctx.font = '18px terminus';
ctx.fillText('18px Terminus ttf, installed',10,50);
ctx.font = '18px terminusttf';
ctx.fillText('18px Terminus ttf, using css @font-face',10,100);
ctx.font = '16px pixel';
ctx.fillText('Installed and converted 16px pixeloperator.ttf',10,150);
ctx.font = '16px pixelttf';
ctx.fillText('The same pixeloperator.ttf load using css @font-face',10,200);
}
</script>