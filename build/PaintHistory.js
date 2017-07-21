define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HistoryNode = (function () {
        function HistoryNode(node) {
            if (typeof node === "undefined")
                return;
            for (var item in node) {
                this[item] = node[item];
            }
        }
        return HistoryNode;
    }());
    exports.HistoryNode = HistoryNode;
    var PaintHistory = (function () {
        function PaintHistory(image) {
            this.states = [];
            this.currentStateIndex = 0;
            this.inPrevState = false;
            this.states.push(new HistoryNode());
        }
        PaintHistory.prototype.push = function (node) {
            if (this.inPrevState) {
                this.states.length = this.currentStateIndex + 1;
            }
            this.states.push(new HistoryNode(node));
            this.currentStateIndex += 1;
            this.inPrevState = (this.currentStateIndex != this.states.length - 1);
        };
        PaintHistory.prototype.undo = function (index) {
            if (this.currentStateIndex != 0) {
                this.inPrevState = true;
                if (typeof index === "undefined") {
                    this.currentStateIndex -= 1;
                }
                else {
                    this.currentStateIndex = index;
                }
            }
        };
        PaintHistory.prototype.redo = function (index) {
            if (this.currentStateIndex != this.states.length - 1) {
                if (typeof index === "undefined") {
                    this.currentStateIndex += 1;
                }
                else {
                    this.currentStateIndex = index;
                }
                if (index == this.states.length - 1) {
                    this.inPrevState = false;
                }
            }
        };
        PaintHistory.prototype.getHistory = function () {
            return this.states;
        };
        PaintHistory.prototype.getCurrentState = function () {
            return this.states[this.currentStateIndex];
        };
        PaintHistory.prototype.getImageData = function () {
            return this.states[this.currentStateIndex].miscData;
        };
        PaintHistory.loadObject = function (obj) {
            var image = obj.states[0].miscData;
            var hist = new PaintHistory(image);
            obj.states.shift();
            for (var _i = 0, _a = obj.states; _i < _a.length; _i++) {
                var node = _a[_i];
                hist.push(new HistoryNode(node));
            }
            return hist;
        };
        return PaintHistory;
    }());
    exports.default = PaintHistory;
});
