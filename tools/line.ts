import {Paint} from "Paint";
import {Point} from "../definitions";

export default class Line implements ITool {
    paint: IPaint;
    drawOnMove: () => void;
    readonly name: ToolName;

    constructor() {
        this.name = "line";
        this.drawOnMove = this.draw.bind(this);
    }

    prep(paint: IPaint) {
        this.paint = paint;
        this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
    }

    draw() : void {
        this.paint.mouseMoved = true;
        this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
        this.paint.context.beginPath();
        this.paint.context.moveTo(this.paint.mouseLock.x, this.paint.mouseLock.y);
        this.paint.context.lineTo(this.paint.mouse.x, this.paint.mouse.y);
        this.paint.context.stroke();
    }

    finish() : void {
        console.log("finishing");
        this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
        this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
        if(this.paint.mouseMoved) {
            this.paint.currentLayer.history.pushAction("line", this.paint.secondaryColor, false,
                this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y,
                this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y,
                this.paint.currentLayer.canvas.toDataURL(), []);
        }

    }
}
