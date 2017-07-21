import PaintHistory from "./PaintHistory";

export default class Layer {
    public id: number;
    public name: string;
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public history: IPaintHistory;

    constructor(parent: HTMLElement, id: number) {
        this.id = id;
        this.name = "Layer " + this.id;

        this.canvas = document.createElement("canvas");
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
        this.canvas.style.position = "absolute";
        this.canvas.style.left = "0px";
        this.canvas.style.top = "0px";

        parent.insertBefore(this.canvas, parent.firstChild);

        this.context = this.canvas.getContext("2d");

        this.history = new PaintHistory(this.canvas.toDataURL());
    }

    // zoom() : void {
    //
    // }

    finalize() : void {
        this.id = -1;
        this.name = null;
        this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = null;
        this.context = null;
    }

    static loadObject(obj: any, workspace: HTMLElement) : Layer {
        let layer = new Layer(workspace, obj.id);
        layer.history = PaintHistory.loadObject(obj.history);
        return layer;
    }
}

export {Layer};
