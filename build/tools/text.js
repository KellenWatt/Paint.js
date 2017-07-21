define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Text = (function () {
        function Text() {
            this.name = "text";
            this.drawOnMove = this.draw.bind(this);
            this.textbox = document.createElement("textarea");
            this.textbox.style.position = "absolute";
        }
        Text.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.context.save();
            this.paint.context.lineWidth = 1;
            this.paint.context.strokeStyle = "#222";
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Text.prototype.draw = function () {
            this.paint.mouseMoved = true;
            this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
            this.paint.context.beginPath();
            this.paint.context.rect(this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y);
            this.paint.context.stroke();
        };
        Text.prototype.finish = function () {
            var _this = this;
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.textbox.style.left = this.paint.mouseLock.x + "px";
            this.textbox.style.top = this.paint.mouseLock.y + "px";
            this.textbox.style.width = this.paint.mouse.x - this.paint.mouseLock.x + "px";
            this.textbox.style.height = this.paint.mouse.y - this.paint.mouseLock.y + "px";
            this.paint.workspace.appendChild(this.textbox);
            this.textbox.focus();
            this.textbox.addEventListener("blur", function () {
                _this.paint.currentLayer.context.fillText(_this.textbox.value, _this.paint.mouseLock.x, _this.paint.mouseLock.y, _this.paint.mouse.x - _this.paint.mouseLock.x);
                _this.textbox.value = "";
                _this.textbox.remove();
                if (_this.paint.mouseMoved) {
                    _this.paint.currentLayer.history.pushAction("text", _this.paint.primaryColor, false, _this.paint.weight, _this.paint.mouseLock.x, _this.paint.mouseLock.y, _this.paint.mouse.x - _this.paint.mouseLock.x, _this.paint.mouse.y - _this.paint.mouseLock.y, _this.paint.currentLayer.canvas.toDataURL(), []);
                }
            });
            this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
            this.paint.context.restore();
        };
        return Text;
    }());
    exports.default = Text;
});
