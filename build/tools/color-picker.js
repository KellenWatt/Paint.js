define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Color = (function () {
        function Color() {
            var _this = this;
            this.name = "color";
            this.drawOnMove = this.draw.bind(this);
            this.colorChooser = document.createElement("input");
            this.colorChooser.type = "color";
            this.colorChooser.addEventListener("change", function (e) {
                var color = e.target.value;
                _this.paint.setColors(color, color);
            });
        }
        Color.prototype.prep = function (paint) { this.paint = paint; };
        Color.prototype.draw = function () { };
        Color.prototype.finish = function () {
            this.colorChooser.click();
        };
        return Color;
    }());
    exports.default = Color;
});
