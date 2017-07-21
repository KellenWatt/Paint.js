interface IPaintHistory {
    states: IHistoryNode[];
    currentStateIndex: number;
    inPrevState: boolean;
    push: (obj: Object) => void;
    undo: (index?: number) => void;
    redo: (index?: number) => void;
    getHistory: () => IHistoryNode[];
    getCurrentState: () => IHistoryNode;
}