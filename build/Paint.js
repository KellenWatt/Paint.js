define(["require", "exports", "./definitions", "./PaintLayer", "tools/pencil", "tools/brush", "tools/circle", "tools/square", "tools/line", "tools/text", "tools/eraser", "tools/dropper", "tools/color-picker", "tools/image"], function (require, exports, definitions_1, PaintLayer_1, pencil_1, brush_1, circle_1, square_1, line_1, text_1, eraser_1, dropper_1, color_picker_1, image_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Paint = (function () {
        function Paint(workspace) {
            this.layers = [];
            this.layerCounter = 0;
            this.colors = ["#000000", "#000000"];
            this._weight = 10;
            this.currentTool = "pencil";
            this._fill = false;
            this.workspace = workspace;
            this.workspace.style.overflow = "none";
            // this.workspace.style.position = "relative";
            this.mouse = new definitions_1.Point(0, 0);
            this.mouseLock = new definitions_1.Point(0, 0);
            this.points = [];
            this.tools = {};
            this.tools["Empty"] = null;
            var pencil = new pencil_1.default();
            this.tools[pencil.name] = pencil;
            var brush = new brush_1.default();
            this.tools[brush.name] = brush;
            var circle = new circle_1.default();
            this.tools[circle.name] = circle;
            var square = new square_1.default();
            this.tools[square.name] = square;
            var line = new line_1.default();
            this.tools[line.name] = line;
            var text = new text_1.default();
            this.tools[text.name] = text;
            var eraser = new eraser_1.default();
            this.tools[eraser.name] = eraser;
            var dropper = new dropper_1.default();
            this.tools[dropper.name] = dropper;
            var colorPicker = new color_picker_1.default();
            this.tools[colorPicker.name] = colorPicker;
            var imager = new image_1.default();
            this.tools[imager.name] = imager;
            this.init();
        }
        Object.defineProperty(Paint.prototype, "weight", {
            get: function () {
                return this._weight;
            },
            set: function (wt) {
                this._weight = wt;
                this.context.lineWidth = wt;
                this.currentLayer.context.lineWidth = wt;
            },
            enumerable: true,
            configurable: true
        });
        Paint.prototype.addAlpha = function (hex, alpha) {
            var red = parseInt(hex.substring(1, 3), 16);
            var green = parseInt(hex.substring(3, 5), 16);
            var blue = parseInt(hex.substring(5, 7), 16);
            return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
        };
        Paint.prototype.setColors = function (primary, secondary) {
            this.colors = [primary, secondary];
            if (typeof this.colorChangeCallback !== "undefined") {
                this.colorChangeCallback(true, true);
            }
            this.context.fillStyle = primary;
            this.currentLayer.context.fillStyle = primary;
            this.context.strokeStyle = secondary;
            this.currentLayer.context.strokeStyle = secondary;
        };
        Object.defineProperty(Paint.prototype, "primaryColor", {
            get: function () {
                return this.colors[0];
            },
            set: function (color) {
                this.colors[0] = color;
                if (typeof this.colorChangeCallback !== "undefined") {
                    this.colorChangeCallback(true, false);
                }
                this.context.fillStyle = color;
                this.currentLayer.context.fillStyle = color;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "secondaryColor", {
            get: function () {
                return this.colors[1];
            },
            set: function (color) {
                this.colors[1] = color;
                if (typeof this.colorChangeCallback !== "undefined") {
                    this.colorChangeCallback(false, true);
                }
                this.context.strokeStyle = color;
                this.currentLayer.context.strokeStyle = color;
            },
            enumerable: true,
            configurable: true
        });
        Paint.prototype.setColorChangeCallback = function (cb) {
            this.colorChangeCallback = cb;
        };
        Paint.prototype.addLayer = function () {
            this.layers.push(new PaintLayer_1.default(this.workspace, ++this.layerCounter));
            return this.layers;
        };
        Paint.prototype.deleteLayer = function (id) {
            for (var i in this.layers) {
                if (this.layers[i].id === id) {
                    this.layers[i].finalize();
                    this.layers.splice(+i, 1);
                    break;
                }
            }
            return this.layers;
        };
        Paint.prototype.switchLayer = function (id) {
            for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                if (layer.id === id) {
                    this.currentLayer = layer;
                    break;
                }
            }
            this.currentLayer.context.fillStyle = this.context.fillStyle;
            this.currentLayer.context.strokeStyle = this.context.strokeStyle;
            this.currentLayer.context.lineWidth = this._weight;
        };
        Object.defineProperty(Paint.prototype, "layerList", {
            get: function () {
                return this.layers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "tool", {
            // Might need to add a getLayerNames method thing
            get: function () {
                return this.currentTool;
            },
            set: function (t) {
                this.currentTool = t;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "imageToolImage", {
            get: function () {
                return this.image;
            },
            set: function (img) {
                this.image = img;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "fill", {
            get: function () {
                return this._fill;
            },
            set: function (f) {
                this._fill = f;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "workingLayer", {
            get: function () {
                return this.currentLayer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "changed", {
            get: function () {
                return this.mouseMoved;
            },
            enumerable: true,
            configurable: true
        });
        Paint.prototype.undo = function (index) {
            var _this = this;
            this.currentLayer.history.undo(index);
            var img = new Image();
            img.addEventListener("load", function () {
                _this.currentLayer.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                _this.currentLayer.context.drawImage(img, 0, 0);
                // do save/restore if slow.
            });
            img.src = this.currentLayer.history.getCurrentState().miscData;
        };
        Paint.prototype.redo = function (index) {
            var _this = this;
            this.currentLayer.history.redo(index);
            var img = new Image();
            img.addEventListener("load", function () {
                _this.currentLayer.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                _this.currentLayer.context.drawImage(img, 0, 0);
            });
            img.src = this.currentLayer.history.getCurrentState().miscData;
        };
        Paint.prototype.reconstruct = function (json) {
            var obj = JSON.parse(json);
            for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                layer.finalize();
            }
            this.layers = [];
            for (var _b = 0, obj_1 = obj; _b < obj_1.length; _b++) {
                var layer = obj_1[_b];
                this.layers.push(PaintLayer_1.default.loadObject(layer, this.workspace));
            }
            this.currentLayer = this.layers[this.layers.length - 1];
            this.render();
        };
        Paint.prototype.serialize = function () {
            return JSON.stringify(this.layers);
        };
        Paint.prototype.render = function () {
            var _this = this;
            // redraw the image of each canvas
            var img = new Image();
            var _loop_1 = function (layer) {
                img.addEventListener("load", function () {
                    layer.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                    layer.context.drawImage(img, 0, 0);
                });
                img.src = layer.history.getCurrentState().miscData;
            };
            for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                _loop_1(layer);
            }
        };
        Paint.prototype.collapse = function () {
            var img = document.createElement("canvas");
            img.width = this.canvas.width;
            img.height = this.canvas.height;
            var ctx = img.getContext("2d");
            for (var i = this.layers.length - 1; i >= 0; i--) {
                ctx.drawImage(this.layers[i].canvas, 0, 0);
            }
            return img.toDataURL();
        };
        Paint.prototype.nuke = function () {
            for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                layer.finalize();
            }
            this.layers = [];
            this.layerCounter = 0;
            this.currentLayer = this.addLayer()[0];
            return this.layers;
        };
        Paint.prototype.clearCurrentLayer = function () {
            this.currentLayer.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        // mapRealToVirtual(p: Point) : Point {
        //     let x = p.x / this.scalingFactor + this.offset.x;
        //     let y = p.y / this.scalingFactor + this.offset.y;
        //
        //     return new Point(x, y);
        // }
        //
        // zoom(center: Point, scale: boolean) : void {
        //
        // }
        Paint.prototype.init = function () {
            var _this = this;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.workspace.offsetWidth;
            this.canvas.height = this.workspace.offsetHeight;
            this.canvas.style.position = "absolute";
            this.canvas.style.left = "0";
            this.canvas.style.top = "0";
            this.workspace.appendChild(this.canvas);
            this.currentLayer = this.addLayer()[0];
            this.context = this.canvas.getContext("2d");
            this.context.lineCap = "round";
            this.context.lineJoin = "round";
            this.canvas.addEventListener("mousemove", function (e) {
                _this.mouse.x = e.offsetX;
                _this.mouse.y = e.offsetY;
            });
            var colorChooser = document.createElement("input");
            colorChooser.type = "color";
            colorChooser.addEventListener("change", function (e) {
                var color = e.target.value;
                _this.setColors(color, color);
            });
            var textbox = document.createElement("textarea");
            textbox.style.position = "absolute";
            this.canvas.addEventListener("mousedown", function () {
                if (!_this.readOnly) {
                    _this.context.beginPath();
                    _this.context.moveTo(_this.mouse.x, _this.mouse.y);
                    _this.mouseLock.x = _this.mouse.x;
                    _this.mouseLock.y = _this.mouse.y;
                    _this.mouseMoved = false;
                    _this.tools[_this.currentTool].prep(_this);
                }
            });
            this.canvas.addEventListener("mouseup", function () {
                if (!_this.readOnly) {
                    _this.tools[_this.currentTool].finish();
                    _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                }
            });
        };
        return Paint;
    }());
    exports.Paint = Paint;
    exports.default = Paint;
});
