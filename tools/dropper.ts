import {Paint} from "Paint";
import {Point} from "../definitions";

export default class Dropper implements ITool {
    paint: IPaint;
    drawOnMove: () => void;
    readonly name: ToolName;

    constructor() {
        this.name = "dropper";
        this.drawOnMove = this.draw.bind(this);
    }

    prep(paint: IPaint) : void { this.paint = paint; }

    draw() : void {}

    finish() : void {
        let pix = this.paint.currentLayer.context
            .getImageData(this.paint.mouse.x, this.paint.mouse.y, 1, 1).data;

        let red = pix[0].toString(16);
        let green = pix[1].toString(16);
        let blue = pix[2].toString(16);

        if(red.length == 1) red = `0${red}`;
        if(green.length == 1) green = `0${green}`;
        if(blue.length == 1) blue = `0${blue}`;

        let colorString = `#${red}${green}${blue}`;

        this.paint.setColors(colorString, colorString);
    }
}
