define(["require", "exports", "../definitions"], function (require, exports, definitions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Eraser = (function () {
        function Eraser() {
            this.name = "eraser";
            this.drawOnMove = this.draw.bind(this);
        }
        Eraser.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.currentLayer.context.save();
            this.paint.currentLayer.context.lineJoin = "round";
            this.paint.currentLayer.context.lineCap = "round";
            this.paint.currentLayer.context.globalCompositeOperation = "destination-out";
            this.paint.currentLayer.context.beginPath();
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Eraser.prototype.draw = function () {
            this.paint.mouseMoved = true;
            this.paint.currentLayer.context.lineTo(this.paint.mouse.x, this.paint.mouse.y);
            this.paint.currentLayer.context.stroke();
            this.paint.points.push(new definitions_1.Point(this.paint.mouse.x, this.paint.mouse.y));
        };
        Eraser.prototype.finish = function () {
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.paint.currentLayer.context.restore();
            if (this.paint.mouseMoved) {
                this.paint.currentLayer.history.pushAction("eraser", this.paint.primaryColor, this.paint.fill, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y, this.paint.currentLayer.canvas.toDataURL(), this.paint.points);
            }
            this.paint.points = [];
        };
        return Eraser;
    }());
    exports.default = Eraser;
});
