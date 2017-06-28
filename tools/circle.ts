import {Paint} from "Paint";
import {Point} from "../definitions";

export default class Circle implements ITool {
    paint: IPaint;
    drawOnMove: () => void;
    readonly name: ToolName;

    constructor() {
        this.name = "circle";
        this.drawOnMove = this.draw.bind(this);
    }

    prep(paint: IPaint) : void {
        this.paint = paint;
        this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
    }

    draw() : void {
        this.paint.mouseMoved = true;
        let radius = Math.sqrt(Math.pow(this.paint.mouse.x - this.paint.mouseLock.x, 2)
                             + Math.pow(this.paint.mouse.y - this.paint.mouseLock.y, 2));
        this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
        this.paint.context.beginPath();
        this.paint.context.arc(this.paint.mouseLock.x, this.paint.mouseLock.y,
                               radius, 0, 2*Math.PI);
        if(this.paint.fill) {
            this.paint.context.fill();
        } else {
            this.paint.context.stroke();
        }
    }

    finish() : void {
        this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
        this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
        if(this.paint.mouseMoved) {
            let color = this.paint.fill ? this.paint.primaryColor : this.paint.secondaryColor;
            this.paint.currentLayer.history.pushAction("circle", color, this.paint.fill,
                this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y,
                this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y,
                this.paint.currentLayer.canvas.toDataURL(), []);
        }
    }
}
