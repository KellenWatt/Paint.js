import {Paint} from "Paint";
import {Point} from "../definitions";

export default class Square implements ITool {
    paint: IPaint;
    drawOnMove: () => void;
    readonly name: ToolName;

    constructor() {
        this.name = "square";
        this.drawOnMove = this.draw.bind(this);
    }

    prep(paint: IPaint) {
        this.paint = paint;
        this.paint.context.save();
        this.paint.context.lineJoin = "miter";
        this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
    }

    draw() : void {
        this.paint.mouseMoved = true;

        this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
        this.paint.context.beginPath();
        this.paint.context.rect(this.paint.mouseLock.x, this.paint.mouseLock.y,
                          this.paint.mouse.x - this.paint.mouseLock.x,
                          this.paint.mouse.y - this.paint.mouseLock.y)
        if(this.paint.fill) {
            this.paint.context.fill();
        } else {
            this.paint.context.stroke();
        }
    }

    finish() : void {
        this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
        this.paint.context.restore();
        this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
        if(this.paint.mouseMoved) {
            let color = this.paint.fill ? this.paint.primaryColor : this.paint.secondaryColor;
            this.paint.currentLayer.history.pushAction("square", color, this.paint.fill,
                this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y,
                this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y,
                this.paint.currentLayer.canvas.toDataURL(), []);
        }
    }
}
