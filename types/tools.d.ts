// interface IHistoryNode {
//     tool: ToolName | null,
//     color: string | null,
//     fill: boolean | null,
//     weight: number | null,
//     x: number | null,
//     y: number | null,
//     dx: number | null,
//     dy: number | null,
//     imageData: string,
//     points: IPoint[]
// }

// interface IHistoryLayer {
//     addAction: (node: IHistoryNode) => void;
//     currentVersion: (version: number) => IHistoryNode;
//     branchCount: () => number;
//     selectedVersion: number;
//     version: IHistoryNode[];
// }

// interface IPaintHistory {
//     quickUndo: () => void;
//     undo: (index: number, version: number) => void;
//     quickRedo: () => void;
//     redo: (index: number, version: number) => void;
//     pushAction: (tool: ToolName, color: string, fill: boolean, weight: number,
//                  x: number, dx: number, y: number, dy: number, image: string,
//                  points: IPoint[]) => void;
//     fullHistory: IHistoryLayer[];
//     getCurrentState: IHistoryLayer;
//     getImageData: (version: number) => string;
// }

// interface ILayer {
//     id: number;
//     name: string;
//     canvas: HTMLCanvasElement;
//     context: CanvasRenderingContext2D;
//     history: IPaintHistory;

//     zoom: () => void;
//     finalize: () => void;
// }

// interface IPaint {
//     context: CanvasRenderingContext2D;
//     canvas: HTMLCanvasElement;
//     currentLayer: ILayer;
//     mouseMoved: boolean;
//     mouseLock: IPoint;
//     mouse: IPoint;
//     primaryColor: string;
//     secondaryColor: string;
//     weight: number;
//     points: IPoint[];
//     fill: boolean;
//     imageToolImage: HTMLImageElement;
//     workspace: HTMLElement;

//     addAlpha: (string, number) => string;
//     setColors: (primary: string, secondary: string) => void;
// }

// interface IPoint {
//     x: number;
//     y: number;
// }

// interface ITool {
//     paint: IPaint;
//     readonly name: string;
//     prep: (controller: IPaint) => void;
//     draw: () => void;
//     finish: () => void;
// }

// type ToolName = string;
