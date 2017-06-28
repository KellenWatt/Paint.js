define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Square = (function () {
        function Square() {
            this.name = "square";
            this.drawOnMove = this.draw.bind(this);
        }
        Square.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.context.save();
            this.paint.context.lineJoin = "miter";
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Square.prototype.draw = function () {
            this.paint.mouseMoved = true;
            this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
            this.paint.context.beginPath();
            this.paint.context.rect(this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y);
            if (this.paint.fill) {
                this.paint.context.fill();
            }
            else {
                this.paint.context.stroke();
            }
        };
        Square.prototype.finish = function () {
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.paint.context.restore();
            this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
            if (this.paint.mouseMoved) {
                var color = this.paint.fill ? this.paint.primaryColor : this.paint.secondaryColor;
                this.paint.currentLayer.history.pushAction("square", color, this.paint.fill, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y, this.paint.currentLayer.canvas.toDataURL(), []);
            }
        };
        return Square;
    }());
    exports.default = Square;
});
