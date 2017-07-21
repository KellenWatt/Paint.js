define(["require", "exports", "../definitions"], function (require, exports, definitions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Brush = (function () {
        function Brush() {
            this.name = "brush";
            this.drawOnMove = this.draw.bind(this);
        }
        Brush.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.context.save();
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Brush.prototype.draw = function () {
            this.paint.mouseMoved = true;
            var dist = Math.sqrt(Math.pow(this.paint.mouseLock.x - this.paint.mouse.x, 2)
                + Math.pow(this.paint.mouseLock.y - this.paint.mouse.y, 2));
            var angle = Math.atan2(this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y);
            for (var i = 0; i < dist; i += this.paint.weight / 8) {
                var x = this.paint.mouseLock.x + (Math.sin(angle) * i);
                var y = this.paint.mouseLock.y + (Math.cos(angle) * i);
                var radgrad = this.paint.context.createRadialGradient(x, y, this.paint.weight / 4, x, y, this.paint.weight / 2);
                radgrad.addColorStop(0, this.paint.addAlpha(this.paint.primaryColor, 1));
                radgrad.addColorStop(0.5, this.paint.addAlpha(this.paint.primaryColor, 0.5));
                radgrad.addColorStop(1, this.paint.addAlpha(this.paint.primaryColor, 0));
                this.paint.context.fillStyle = radgrad;
                this.paint.context.fillRect(x - this.paint.weight / 2, y - this.paint.weight / 2, this.paint.weight, this.paint.weight);
                this.paint.points.push(new definitions_1.Point(x, y));
            }
            this.paint.mouseLock.x = this.paint.mouse.x;
            this.paint.mouseLock.y = this.paint.mouse.y;
        };
        Brush.prototype.finish = function () {
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.paint.context.restore();
            this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
            if (this.paint.mouseMoved) {
                this.paint.currentLayer.history.pushAction("brush", this.paint.primaryColor, false, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y, this.paint.currentLayer.canvas.toDataURL(), this.paint.points);
            }
            this.paint.points = [];
        };
        return Brush;
    }());
    exports.default = Brush;
});
