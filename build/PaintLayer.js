define(["require", "exports", "./PaintHistory"], function (require, exports, PaintHistory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Layer = (function () {
        function Layer(parent, id) {
            this.id = id;
            this.name = "Layer " + this.id;
            this.canvas = document.createElement("canvas");
            this.canvas.width = parent.offsetWidth;
            this.canvas.height = parent.offsetHeight;
            this.canvas.style.position = "absolute";
            this.canvas.style.left = "0px";
            this.canvas.style.top = "0px";
            parent.insertBefore(this.canvas, parent.firstChild);
            this.context = this.canvas.getContext("2d");
            this.history = new PaintHistory_1.default(this.canvas.toDataURL());
        }
        // zoom() : void {
        //
        // }
        Layer.prototype.finalize = function () {
            this.id = -1;
            this.name = null;
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
            this.context = null;
        };
        Layer.loadObject = function (obj, workspace) {
            var layer = new Layer(workspace, obj.id);
            layer.history = PaintHistory_1.default.loadObject(obj.history);
            return layer;
        };
        return Layer;
    }());
    exports.Layer = Layer;
    exports.default = Layer;
});
