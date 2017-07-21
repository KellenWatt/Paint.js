import {Point} from "./definitions"

export class HistoryNode implements IHistoryNode{
    public tool: string;
    public color: string;
    public fill: boolean;
    public weight: number;
    public x: number;
    public y: number;
    public dx: number;
    public dy: number;
    public miscData: string;
    public points: Point[];

    constructor(node?: Object) {
        if(typeof node === "undefined") return;
        for(let item in node) {
            this[item] = node[item];
        }
    }
}

export default class PaintHistory implements IPaintHistory{
    states: HistoryNode[];
    currentStateIndex: number;
    inPrevState: boolean;

    constructor(image: string) {
        this.states = [];
        this.currentStateIndex = 0;
        this.inPrevState = false;
        this.states.push(new HistoryNode());
    }

    push(node: Object) {
        if(this.inPrevState) {
            this.states.length = this.currentStateIndex + 1;
        }
        this.states.push(new HistoryNode(node));
        this.currentStateIndex += 1;
        this.inPrevState = (this.currentStateIndex != this.states.length-1);
    }



    undo(index?: number) : void {
        if(this.currentStateIndex != 0) {
            this.inPrevState = true;
            if(typeof index === "undefined") {
                this.currentStateIndex -= 1;
            } else {
                this.currentStateIndex = index;
            }
        }
    }

    redo(index?: number) : void{
        if(this.currentStateIndex != this.states.length - 1) {
            if(typeof index === "undefined") {
                this.currentStateIndex += 1;
            } else {
                this.currentStateIndex = index;
            }
            if(index == this.states.length - 1) {
                this.inPrevState = false;
            }
        }
    }

    getHistory() : HistoryNode[] {
        return this.states;
    }

    getCurrentState() : HistoryNode {
        return this.states[this.currentStateIndex];
    }

    getImageData() : string {
        return this.states[this.currentStateIndex].miscData;
    }

    static loadObject(obj: any) : PaintHistory {
        let image = obj.states[0].miscData;
        let hist = new PaintHistory(image);
        obj.states.shift();
        for(let node of obj.states) {
            hist.push(new HistoryNode(node));
        }

        return hist;
    }
}
