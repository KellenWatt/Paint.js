import {Paint} from "Paint";
import {Point} from "../definitions";

export default class Eraser implements ITool {
    paint: IPaint;
    drawOnMove: () => void;
    readonly name: ToolName;

    constructor() {
        this.name = "eraser";
        this.drawOnMove = this.draw.bind(this);
    }

    prep(paint: IPaint) : void {
        this.paint = paint;
        this.paint.currentLayer.context.save();
        this.paint.currentLayer.context.lineJoin = "round";
        this.paint.currentLayer.context.lineCap = "round";
        this.paint.currentLayer.context.globalCompositeOperation = "destination-out";
        this.paint.currentLayer.context.beginPath();
        this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
    }

    draw() : void {
        this.paint.mouseMoved = true;
        this.paint.currentLayer.context.lineTo(this.paint.mouse.x, this.paint.mouse.y);
        this.paint.currentLayer.context.stroke();
        this.paint.points.push(new Point(this.paint.mouse.x, this.paint.mouse.y));
    }

    finish() : void {
        this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
        this.paint.currentLayer.context.restore();

        if(this.paint.mouseMoved) {
            this.paint.currentLayer.history.pushAction("eraser", this.paint.primaryColor, this.paint.fill,
                this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y,
                this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y,
                this.paint.currentLayer.canvas.toDataURL(), this.paint.points);
        }
        this.paint.points = [];
    }
}
