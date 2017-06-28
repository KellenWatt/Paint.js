import PaintHistory from "./PaintHistory";

export default class Layer {
    private _id: number;
    private _name: string;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _history: PaintHistory;

    constructor(parent: HTMLElement, id: number) {
        this._id = id;
        this._name = "Layer " + this._id;

        this._canvas = document.createElement("canvas");
        this._canvas.width = parent.offsetWidth;
        this._canvas.height = parent.offsetHeight;
        this._canvas.style.position = "absolute";
        this._canvas.style.left = "0px";
        this._canvas.style.top = "0px";

        parent.insertBefore(this._canvas, parent.firstChild);

        this._context = this._canvas.getContext("2d");

        this._history = new PaintHistory(this._canvas.toDataURL());
    }

    get id() : number {
        return this._id;
    }

    get name() : string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get canvas() : HTMLCanvasElement {
        return this._canvas;
    }

    get context() : CanvasRenderingContext2D {
        return this._context;
    }

    get history() : PaintHistory {
        return this._history;
    }

    // zoom() : void {
    //
    // }

    finalize() : void {
        this._id = -1;
        this._name = null;
        this._canvas.parentNode.removeChild(this._canvas);
        this._canvas = null;
        this._context = null;
    }

    static loadObject(obj: any, workspace: HTMLElement) : Layer {
        let layer = new Layer(workspace, obj._id);
        layer._history = PaintHistory.loadObject(obj._history);
        return layer;
    }
}

export {Layer};
