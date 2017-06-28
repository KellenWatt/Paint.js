define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Line = (function () {
        function Line() {
            this.name = "line";
            this.drawOnMove = this.draw.bind(this);
        }
        Line.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Line.prototype.draw = function () {
            this.paint.mouseMoved = true;
            this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
            this.paint.context.beginPath();
            this.paint.context.moveTo(this.paint.mouseLock.x, this.paint.mouseLock.y);
            this.paint.context.lineTo(this.paint.mouse.x, this.paint.mouse.y);
            this.paint.context.stroke();
        };
        Line.prototype.finish = function () {
            console.log("finishing");
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
            if (this.paint.mouseMoved) {
                this.paint.currentLayer.history.pushAction("line", this.paint.secondaryColor, false, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y, this.paint.currentLayer.canvas.toDataURL(), []);
            }
        };
        return Line;
    }());
    exports.default = Line;
});
