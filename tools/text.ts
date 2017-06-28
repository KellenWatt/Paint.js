import {Paint} from "Paint";
import {Point} from "../definitions";

export default class Text implements ITool {
    paint: IPaint;
    drawOnMove: () => void;
    readonly name: ToolName;

    textbox: HTMLTextAreaElement;

    constructor() {
        this.name = "text";
        this.drawOnMove = this.draw.bind(this);

        this.textbox = document.createElement("textarea");
        this.textbox.style.position = "absolute";
    }

    prep(paint: IPaint) : void {
        this.paint = paint;
        this.paint.context.save();
        this.paint.context.lineWidth = 1;
        this.paint.context.strokeStyle = "#222";
        this.paint.canvas.addEventListener("mousemove", this.drawOnMove);
    }

    draw() : void {
        this.paint.mouseMoved = true;
        this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
        this.paint.context.beginPath();
        this.paint.context.rect(this.paint.mouseLock.x, this.paint.mouseLock.y,
                                this.paint.mouse.x - this.paint.mouseLock.x,
                                this.paint.mouse.y - this.paint.mouseLock.y);
        this.paint.context.stroke();
    }

    finish() : void {
        this.paint.canvas.removeEventListener("mousemove", this.drawOnMove);

        this.textbox.style.left = `${this.paint.mouseLock.x}px`;
        this.textbox.style.top = `${this.paint.mouseLock.y}px`;
        this.textbox.style.width = `${this.paint.mouse.x - this.paint.mouseLock.x}px`;
        this.textbox.style.height = `${this.paint.mouse.y - this.paint.mouseLock.y}px`;

        this.paint.workspace.appendChild(this.textbox);
        this.textbox.focus();
        this.textbox.addEventListener("blur", () => {
            this.paint.currentLayer.context.fillText(this.textbox.value,
                this.paint.mouseLock.x, this.paint.mouseLock.y,
                this.paint.mouse.x - this.paint.mouseLock.x,);
            this.textbox.value = "";
            this.textbox.remove();

            if(this.paint.mouseMoved) {
                this.paint.currentLayer.history.pushAction("text", this.paint.primaryColor, false,
                    this.paint.weight, this.paint.mouseLock.x, this.paint.mouseLock.y,
                    this.paint.mouse.x - this.paint.mouseLock.x, this.paint.mouse.y - this.paint.mouseLock.y,
                    this.paint.currentLayer.canvas.toDataURL(), []);
            }
        });

        this.paint.context.clearRect(0, 0, this.paint.canvas.width, this.paint.canvas.height);
        this.paint.context.restore();
    }
}
