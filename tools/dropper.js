define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Dropper = (function () {
        function Dropper() {
            this.name = "dropper";
            this.drawOnMove = this.draw.bind(this);
        }
        Dropper.prototype.prep = function (paint) { this.paint = paint; };
        Dropper.prototype.draw = function () { };
        Dropper.prototype.finish = function () {
            var pix = this.paint.currentLayer.context
                .getImageData(this.paint.mouse.x, this.paint.mouse.y, 1, 1).data;
            var red = pix[0].toString(16);
            var green = pix[1].toString(16);
            var blue = pix[2].toString(16);
            if (red.length == 1)
                red = "0" + red;
            if (green.length == 1)
                green = "0" + green;
            if (blue.length == 1)
                blue = "0" + blue;
            var colorString = "#" + red + green + blue;
            this.paint.setColors(colorString, colorString);
        };
        return Dropper;
    }());
    exports.default = Dropper;
});
