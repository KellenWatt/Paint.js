define("definitions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    }());
    exports.Point = Point;
});
define("PaintHistory", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HistoryNode = (function () {
        function HistoryNode(tool, color, fill, weight, x, y, dx, dy, imageData, points) {
            this.tool = tool;
            this.color = color;
            this.fill = fill;
            this.weight = weight;
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.imageData = imageData;
            this.points = points;
        }
        return HistoryNode;
    }());
    exports.HistoryNode = HistoryNode;
    var HistoryLayer = (function () {
        function HistoryLayer() {
            this.versions = [];
            this.selectedVersion = 0;
        }
        HistoryLayer.prototype.addAction = function (node) {
            this.versions.push(node);
            if (this.versions.length > 2) {
                this.versions.shift();
            }
            this.selectedVersion = this.versions.length - 1;
        };
        HistoryLayer.prototype.currentVersion = function (version) {
            return this.versions[version];
        };
        HistoryLayer.prototype.branchCount = function () {
            return this.versions.length;
        };
        return HistoryLayer;
    }());
    exports.HistoryLayer = HistoryLayer;
    var PaintHistory = (function () {
        function PaintHistory(image) {
            this.states = [];
            this.currentLayer = 0;
            this.version = 0;
            this.inPrevState = false;
            this.states.push(new HistoryLayer());
            this.states[0].addAction(new HistoryNode(null, null, null, null, null, null, null, null, image, []));
        }
        PaintHistory.prototype.pushAction = function (tool, color, fill, weight, x, dx, y, dy, image, points) {
            if (!this.inPrevState) {
                this.states.push(new HistoryLayer());
            }
            this.currentLayer += 1;
            if (this.currentLayer == this.states.length - 1) {
                this.inPrevState = false;
            }
            this.states[this.currentLayer].addAction(new HistoryNode(tool, color, fill, weight, x, y, dx, dy, image, points));
        };
        PaintHistory.prototype.undo = function (index, version) {
            if (this.currentLayer != 0) {
                this.inPrevState = true;
                this.currentLayer = index;
                this.version = version;
            }
        };
        PaintHistory.prototype.quickUndo = function () {
            if (this.currentLayer != 0) {
                this.inPrevState = true;
                this.currentLayer -= 1;
                this.version = this.states[this.currentLayer].selectedVersion;
            }
        };
        PaintHistory.prototype.redo = function (index, version) {
            if (this.currentLayer != this.states.length - 1) {
                this.currentLayer = index;
                this.version = version;
                if (index == this.states.length - 1) {
                    this.inPrevState = false;
                }
            }
        };
        PaintHistory.prototype.quickRedo = function () {
            if (this.currentLayer != this.states.length - 1) {
                this.currentLayer += 1;
                this.version = this.states[this.currentLayer].selectedVersion;
                if (this.currentLayer == this.states.length - 1) {
                    this.inPrevState = false;
                }
            }
        };
        PaintHistory.prototype.fullHistory = function () {
            return this.states;
        };
        PaintHistory.prototype.getCurrentState = function () {
            return this.states[this.currentLayer];
        };
        PaintHistory.prototype.getImageData = function (version) {
            return this.states[this.currentLayer].currentVersion(version).imageData;
        };
        PaintHistory.loadObject = function (obj) {
            var image = obj.states[0].versions[0].imageData;
            var hist = new PaintHistory(image);
            obj.states.shift();
            for (var _i = 0, _a = obj.states; _i < _a.length; _i++) {
                var layer = _a[_i];
                var n = layer.versions[0];
                hist.pushAction(n.tool, n.color, n.fill, n.weight, n.x, n.y, n.dx, n.dy, n.imageData, n.points);
                if (layer.versions.length > 1) {
                    var m = layer.versions[1];
                    hist.states[hist.currentLayer].addAction(new HistoryNode(m.tool, m.color, m.fill, m.weight, m.x, m.y, m.dx, m.dy, m.imageData, m.points));
                }
            }
            return hist;
        };
        return PaintHistory;
    }());
    exports.default = PaintHistory;
});
define("PaintLayer", ["require", "exports", "PaintHistory"], function (require, exports, PaintHistory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Layer = (function () {
        function Layer(parent, id) {
            this._id = id;
            this._name = "Layer " + this._id;
            this._canvas = document.createElement("canvas");
            this._canvas.width = parent.offsetWidth;
            this._canvas.height = parent.offsetHeight;
            this._canvas.style.position = "absolute";
            this._canvas.style.left = "0px";
            this._canvas.style.top = "0px";
            parent.insertBefore(this._canvas, parent.firstChild);
            this._context = this._canvas.getContext("2d");
            this._history = new PaintHistory_1.default(this._canvas.toDataURL());
        }
        Object.defineProperty(Layer.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Layer.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (name) {
                this._name = name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Layer.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Layer.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Layer.prototype, "history", {
            get: function () {
                return this._history;
            },
            enumerable: true,
            configurable: true
        });
        // zoom() : void {
        //
        // }
        Layer.prototype.finalize = function () {
            this._id = -1;
            this._name = null;
            this._canvas.parentNode.removeChild(this._canvas);
            this._canvas = null;
            this._context = null;
        };
        Layer.loadObject = function (obj, workspace) {
            var layer = new Layer(workspace, obj._id);
            layer._history = PaintHistory_1.default.loadObject(obj._history);
            return layer;
        };
        return Layer;
    }());
    exports.Layer = Layer;
    exports.default = Layer;
});
define("tools/pencil", ["require", "exports", "definitions"], function (require, exports, definitions_1) {
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
define("tools/brush", ["require", "exports", "definitions"], function (require, exports, definitions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Brush = (function () {
        function Brush() {
            this.name = "brush";
            this.drawOnMove = this.draw.bind(this);
        }
        Brush.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.context.save();
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Brush.prototype.draw = function () {
            this.paint.mouseMoved = true;
            var dist = Math.sqrt(Math.pow(this.paint.mouseLock.x - this.paint.mouse.x, 2)
                + Math.pow(this.paint.mouseLock.y - this.paint.mouse.y, 2));
            var angle = Math.atan2(this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y);
            for (var i = 0; i < dist; i += this.paint.weight / 8) {
                var x = this.paint.mouseLock.x + (Math.sin(angle) * i);
                var y = this.paint.mouseLock.y + (Math.cos(angle) * i);
                var radgrad = this.paint.context.createRadialGradient(x, y, this.paint.weight / 4, x, y, this.paint.weight / 2);
                radgrad.addColorStop(0, this.paint.addAlpha(this.paint.primaryColor, 1));
                radgrad.addColorStop(0.5, this.paint.addAlpha(this.paint.primaryColor, 0.5));
                radgrad.addColorStop(1, this.paint.addAlpha(this.paint.primaryColor, 0));
                this.paint.context.fillStyle = radgrad;
                this.paint.context.fillRect(x - this.paint.weight / 2, y - this.paint.weight / 2, this.paint.weight, this.paint.weight);
                this.paint.points.push(new definitions_2.Point(x, y));
            }
            this.paint.mouseLock.x = this.paint.mouse.x;
            this.paint.mouseLock.y = this.paint.mouse.y;
        };
        Brush.prototype.finish = function () {
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.paint.context.restore();
            this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
            if (this.paint.mouseMoved) {
                this.paint.currentLayer.history.pushAction("brush", this.paint.primaryColor, false, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y, this.paint.currentLayer.canvas.toDataURL(), this.paint.points);
            }
            this.paint.points = [];
        };
        return Brush;
    }());
    exports.default = Brush;
});
define("tools/circle", ["require", "exports"], function (require, exports) {
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
define("tools/square", ["require", "exports"], function (require, exports) {
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
define("tools/line", ["require", "exports"], function (require, exports) {
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
define("tools/text", ["require", "exports"], function (require, exports) {
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
define("tools/eraser", ["require", "exports", "definitions"], function (require, exports, definitions_3) {
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
            this.paint.points.push(new definitions_3.Point(this.paint.mouse.x, this.paint.mouse.y));
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
define("tools/dropper", ["require", "exports"], function (require, exports) {
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
define("tools/color-picker", ["require", "exports"], function (require, exports) {
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
define("tools/image", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Imager = (function () {
        function Imager() {
            this.name = "image";
            this.drawOnMove = this.draw.bind(this);
        }
        Imager.prototype.prep = function (paint) {
            this.paint = paint;
            this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
        };
        Imager.prototype.draw = function () {
            this.paint.mouseMoved = true;
            this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
            this.paint.context.drawImage(this.paint.imageToolImage, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y);
        };
        Imager.prototype.finish = function () {
            this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
            this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
            if (this.paint.mouseMoved) {
                this.paint.currentLayer.history.pushAction("image", "#000000", false, this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y, this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y, this.paint.currentLayer.canvas.toDataURL(), []);
            }
        };
        return Imager;
    }());
    exports.default = Imager;
});
define("Paint", ["require", "exports", "definitions", "PaintLayer", "tools/pencil", "tools/brush", "tools/circle", "tools/square", "tools/line", "tools/text", "tools/eraser", "tools/dropper", "tools/color-picker", "tools/image"], function (require, exports, definitions_4, PaintLayer_1, pencil_1, brush_1, circle_1, square_1, line_1, text_1, eraser_1, dropper_1, color_picker_1, image_1) {
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
            this.mouse = new definitions_4.Point(0, 0);
            this.mouseLock = new definitions_4.Point(0, 0);
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
        Paint.prototype.undo = function (index, version) {
            var _this = this;
            version = typeof version === "undefined" ? 0 : version;
            if (typeof index === "undefined") {
                this.currentLayer.history.quickUndo();
            }
            else {
                this.currentLayer.history.undo(index, version);
            }
            var img = new Image();
            img.addEventListener("load", function () {
                _this.currentLayer.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                _this.currentLayer.context.drawImage(img, 0, 0);
                // do save/restore if slow.
            });
            img.src = this.currentLayer.history.getImageData(version);
        };
        Paint.prototype.redo = function (index, version) {
            var _this = this;
            version = typeof version === "undefined" ? 0 : version;
            if (typeof index === "undefined") {
                this.currentLayer.history.quickRedo();
            }
            else {
                this.currentLayer.history.redo(index, version);
            }
            var img = new Image();
            img.addEventListener("load", function () {
                _this.currentLayer.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                _this.currentLayer.context.drawImage(img, 0, 0);
            });
            img.src = this.currentLayer.history.getImageData(version);
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
                img.src = layer.history.getImageData(layer.history.version);
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
require.config({
    baseUrl: "assets/scripts/",
    paths: {
        "knockout": "./lib/knockout-3.4.2",
        "jquery": "./lib/jquery-3.2.2.min",
        "Paint": "Paint"
    },
});
