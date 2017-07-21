define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Circle = (function () {
        function Circle() {
            this.name = "circle";
            this.drawOnMove = this.draw.bind(this);
        }
        Circle.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Circle.prototype.draw = function () {
            this.paint.mouseMoved = true;
            var radius = Math.sqrt(Math.pow(this.paint.mouse.x - this.paint.mouseLock.x, 2)
                + Math.pow(this.paint.mouse.y - this.paint.mouseLock.y, 2));
            this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
            this.paint.context.beginPath();
            this.paint.context.arc(this.paint.mouseLock.x, this.paint.mouseLock.y, radius, 0, 2 * Math.PI);
            if (this.paint.fill) {
                this.paint.context.fill();
            }
            else {
                this.paint.context.stroke();
            }
        };
        Circle.prototype.finish = function () {
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
            if (this.paint.mouseMoved) {
                var color = this.paint.fill ? this.paint.primaryColor : this.paint.secondaryColor;
                this.paint.currentLayer.history.pushAction("circle", color, this.paint.fill, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y, this.paint.currentLayer.canvas.toDataURL(), []);
            }
        };
        return Circle;
    }());
    exports.default = Circle;
});
