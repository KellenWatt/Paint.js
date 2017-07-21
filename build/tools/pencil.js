define(["require", "exports", "../definitions"], function (require, exports, definitions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Pencil = (function () {
        function Pencil() {
            this.name = "pencil";
            this.drawOnMove = this.draw.bind(this);
        }
        Pencil.prototype.prep = function (paint) {
            this.paint = paint;
            if (this.paint.fill) {
                this.paint.context.save();
                this.paint.context.lineWidth = 1;
            }
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Pencil.prototype.draw = function () {
            this.paint.mouseMoved = true;
            this.paint.context.lineTo(this.paint.mouse.x, this.paint.mouse.y);
            this.paint.context.stroke();
            this.paint.points.push(new definitions_1.Point(this.paint.mouse.x, this.paint.mouse.y));
        };
        Pencil.prototype.finish = function () {
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            if (this.paint.fill) {
                var context = this.paint.currentLayer.context;
                context.beginPath();
                context.moveTo(this.paint.points[0].x, this.paint.points[0].y);
                for (var _i = 0, _a = this.paint.points; _i < _a.length; _i++) {
                    var p = _a[_i];
                    context.lineTo(p.x, p.y);
                }
                context.fill();
                this.paint.context.restore();
            }
            else {
                this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
            }
            if (this.paint.mouseMoved) {
                var color = this.paint.fill ? this.paint.primaryColor : this.paint.secondaryColor;
                var dx = this.paint.mouse.x - this.paint.mouseLock.x;
                var dy = this.paint.mouse.y - this.paint.mouseLock.y;
                this.paint.currentLayer.history.pushAction(this.name, color, this.paint.fill, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, dx, dy, this.paint.currentLayer.canvas.toDataURL(), this.paint.points);
            }
            this.paint.points = [];
        };
        return Pencil;
    }());
    exports.default = Pencil;
});
