interface IHistoryNode {
    tool: string,
    color: string,
    fill: boolean,
    weight: number,
    x: number,
    y: number,
    dx: number,
    dy: number,
    miscData: string,
    points: IPoint[]
}