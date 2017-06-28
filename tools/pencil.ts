import {Paint} from "Paint";
import {Point} from "../definitions";

export default class Pencil implements ITool {
    paint: IPaint;

    readonly name: ToolName;
    drawOnMove: () => void;

    constructor() {
        this.name = "pencil";
        this.drawOnMove = this.draw.bind(this);
    }

    prep(paint: IPaint) : void {
        this.paint = paint;
        if(this.paint.fill) {
            this.paint.context.save();
            this.paint.context.lineWidth = 1;
        }
        this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
    }

    draw() : void {
        this.paint.mouseMoved = true;
        this.paint.context.lineTo(this.paint.mouse.x, this.paint.mouse.y);
        this.paint.context.stroke();
        this.paint.points.push(new Point(this.paint.mouse.x, this.paint.mouse.y));
    }

    finish() : void {
        this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);
        if(this.paint.fill) {
            let context = this.paint.currentLayer.context;
            context.beginPath();
            context.moveTo(this.paint.points[0].x, this.paint.points[0].y);
            for(let p of this.paint.points) {
                context.lineTo(p.x, p.y);
            }
            context.fill();
            this.paint.context.restore();
        } else {
            this.paint.currentLayer.context.drawImage(this.paint.canvas, 0, 0);
        }

        if(this.paint.mouseMoved) {
            let color = this.paint.fill ? this.paint.primaryColor : this.paint.secondaryColor;
            let dx = this.paint.mouse.x - this.paint.mouseLock.x;
            let dy = this.paint.mouse.y - this.paint.mouseLock.y;
            this.paint.currentLayer.history.pushAction(this.name, color, this.paint.fill,
                this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y,
                dx, dy, this.paint.currentLayer.canvas.toDataURL(), this.paint.points);
        }

        this.paint.points = [];
    }
}
