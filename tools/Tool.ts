abstract class Tool implements ITool {
    paint: IPaint;
    name: string;

    boundDraw: () => void;

    constructor(paint: IPaint) {
        this.paint = paint;
        this.boundDraw = this.draw.bind(this);
    }

    abstract prep() : void;

    abstract draw() : void;

    abstract finish() : void;

}