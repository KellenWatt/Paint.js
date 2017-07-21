import {Point} from "./definitions";
import Layer from "./PaintLayer";
import Pencil from "tools/pencil";
import Brush from "tools/brush";
import Circle from "tools/circle";
import Square from "tools/square";
import Line from "tools/line";
import Text from "tools/text";
import Eraser from "tools/eraser";
import Dropper from "tools/dropper";
import Color from "tools/color-picker";
import Imager from "tools/image";


export default class Paint {
    workspace: HTMLElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    currentLayer: Layer;
    layers: Layer[];
    private colors: [string, string];
    private _weight: number;
    private currentTool: string;
    private _fill: boolean;
    private image: HTMLImageElement;
    private layerCounter: number;

    colorChangeCallback?: (isPrimary: boolean, isSecondary: boolean) => void;

    mouse: Point;
    mouseLock: Point;
    mouseMoved: boolean;

    points: Point[];

    tools: {};

    readOnly: boolean;

    constructor(workspace: HTMLElement) {
        this.layers = [];
        this.layerCounter = 0;
        this.colors = ["#000000", "#000000"];
        this._weight = 10;
        this.currentTool = "pencil";
        this._fill = false;

        this.workspace = workspace;
        this.workspace.style.overflow = "none";
        // this.workspace.style.position = "relative";
        this.mouse = new Point(0, 0);
        this.mouseLock = new Point(0, 0);

        this.points = [];

        this.tools = {};
        this.tools["Empty"] = null;
        let pencil = new Pencil();
        this.tools[pencil.name] = pencil;
        let brush = new Brush();
        this.tools[brush.name] = brush;
        let circle = new Circle();
        this.tools[circle.name] = circle;
        let square = new Square();
        this.tools[square.name] = square;
        let line = new Line();
        this.tools[line.name] = line;
        let text = new Text();
        this.tools[text.name] = text;
        let eraser = new Eraser();
        this.tools[eraser.name] = eraser;
        let dropper = new Dropper();
        this.tools[dropper.name] = dropper;
        let colorPicker = new Color();
        this.tools[colorPicker.name] = colorPicker;
        let imager = new Imager();
        this.tools[imager.name] = imager;

        this.init();
    }

    get weight() : number {
        return this._weight;
    }

    set weight(wt: number) {
        this._weight = wt;
        this.context.lineWidth = wt;
        this.currentLayer.context.lineWidth = wt;
    }

    addAlpha(hex: string, alpha: number) : string {
        let red = parseInt(hex.substring(1,3), 16);
        let green = parseInt(hex.substring(3,5), 16);
        let blue = parseInt(hex.substring(5,7), 16);

        return `rgba(${red},${green},${blue},${alpha})`;
    }

    setColors(primary: string, secondary: string) : void {
        this.colors = [primary, secondary];
        if(typeof this.colorChangeCallback !== "undefined") {
            this.colorChangeCallback(true, true);
        }

        this.context.fillStyle = primary;
        this.currentLayer.context.fillStyle = primary;

        this.context.strokeStyle = secondary;
        this.currentLayer.context.strokeStyle = secondary;
    }

    get primaryColor() : string {
        return this.colors[0];
    }

    set primaryColor(color: string) {
        this.colors[0] = color;
        if(typeof this.colorChangeCallback !== "undefined") {
            this.colorChangeCallback(true, false);
        }

        this.context.fillStyle = color;
        this.currentLayer.context.fillStyle = color;
    }

    get secondaryColor() : string {
        return this.colors[1];
    }

    set secondaryColor(color: string) {
        this.colors[1] = color;
        if(typeof this.colorChangeCallback !== "undefined") {
            this.colorChangeCallback(false, true);
        }

        this.context.strokeStyle = color;
        this.currentLayer.context.strokeStyle = color;
    }

    setColorChangeCallback(cb: (p:boolean,s:boolean)=>void) : void {
        this.colorChangeCallback = cb;
    }

    addLayer() : Layer[] {
        this.layers.push(new Layer(this.workspace, ++this.layerCounter));
        return this.layers;
    }

    deleteLayer(id: number) : Layer[] {
        for(let i in this.layers) {
            if(this.layers[i].id === id) {
                this.layers[i].finalize();
                this.layers.splice(+i, 1)
                break;
            }
        }
        return this.layers;
    }

    switchLayer(id: number) : void {
        for(let layer of this.layers) {
            if(layer.id === id) {
                this.currentLayer = layer;
                break;
            }
        }
        this.currentLayer.context.fillStyle = this.context.fillStyle;
        this.currentLayer.context.strokeStyle = this.context.strokeStyle;
        this.currentLayer.context.lineWidth = this._weight;

    }

    get layerList() : Layer[] {
        return this.layers;
    }
    // Might need to add a getLayerNames method thing

    get tool() : string {
        return this.currentTool;
    }

    set tool(t: string) {
        this.currentTool = t;
    }

    get imageToolImage() : HTMLImageElement {
        return this.image;
    }

    set imageToolImage(img: HTMLImageElement) {
        this.image = img;
    }

    get fill() : boolean {
        return this._fill;
    }

    set fill(f: boolean) {
        this._fill = f;
    }

    get workingLayer() : Layer {
        return this.currentLayer;
    }

    get changed() : boolean {
        return this.mouseMoved;
    }

    undo(index?: number) {
        this.currentLayer.history.undo(index);
        let img = new Image();
        img.addEventListener("load", () => {
            this.currentLayer.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.currentLayer.context.drawImage(img, 0, 0);
            // do save/restore if slow.
        });
        img.src = this.currentLayer.history.getCurrentState().miscData;
    }

    redo(index?: number) {
        this.currentLayer.history.redo(index);
        let img = new Image();
        img.addEventListener("load", () => {
            this.currentLayer.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.currentLayer.context.drawImage(img, 0, 0);
        });
        img.src = this.currentLayer.history.getCurrentState().miscData;
    }

    reconstruct(json: string) : void {
        let obj = JSON.parse(json);

        for(let layer of this.layers) {
            layer.finalize();
        }

        this.layers = [];

        for(let layer of obj) {
            this.layers.push(Layer.loadObject(layer, this.workspace));
        }

        this.currentLayer = this.layers[this.layers.length -1];
        this.render();
    }

    serialize() : string {
        return JSON.stringify(this.layers);
    }

    render() : void {
        // redraw the image of each canvas
        let img = new Image();

        for(let layer of this.layers) {
            img.addEventListener("load", () => {
                layer.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                layer.context.drawImage(img, 0, 0);
            });
            img.src = layer.history.getCurrentState().miscData;
        }
    }

    collapse() : string{
        let img = document.createElement("canvas");
        img.width = this.canvas.width;
        img.height = this.canvas.height;
        let ctx = img.getContext("2d");
        for(let i=this.layers.length-1; i >= 0; i--) {
            ctx.drawImage(this.layers[i].canvas, 0, 0);
        }

        return img.toDataURL();
    }

    nuke() : Layer[] {
        for(let layer of this.layers) {
            layer.finalize();
        }
        this.layers = [];
        this.layerCounter = 0;
        this.currentLayer = this.addLayer()[0];
        return this.layers;
    }

    clearCurrentLayer() : void {
        this.currentLayer.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // mapRealToVirtual(p: Point) : Point {
    //     let x = p.x / this.scalingFactor + this.offset.x;
    //     let y = p.y / this.scalingFactor + this.offset.y;
    //
    //     return new Point(x, y);
    // }
    //
    // zoom(center: Point, scale: boolean) : void {
    //
    // }

    private init() : void {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.workspace.offsetWidth;
        this.canvas.height = this.workspace.offsetHeight;
        this.canvas.style.position = "absolute";
        this.canvas.style.left = "0";
        this.canvas.style.top = "0";
        this.workspace.appendChild(this.canvas);

        this.currentLayer = this.addLayer()[0];

        this.context = this.canvas.getContext("2d");

        this.context.lineCap = "round";
        this.context.lineJoin = "round";

        this.canvas.addEventListener("mousemove", (e) => {
            this.mouse.x = (e as MouseEvent).offsetX;
            this.mouse.y = (e as MouseEvent).offsetY;
        });

        let colorChooser = document.createElement("input");
        colorChooser.type = "color";
        colorChooser.addEventListener("change", (e) => {
            let color = (e.target as HTMLInputElement).value;
            this.setColors(color, color);
        });

        let textbox = document.createElement("textarea");
        textbox.style.position = "absolute";

        this.canvas.addEventListener("mousedown", () => {
            if(!this.readOnly) {
                this.context.beginPath();
                this.context.moveTo(this.mouse.x, this.mouse.y);
                this.mouseLock.x = this.mouse.x;
                this.mouseLock.y = this.mouse.y;
                this.mouseMoved = false;

                this.tools[this.currentTool].prep(this);
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            if(!this.readOnly) {
                this.tools[this.currentTool].finish();
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });

    }

}

export {Paint};
