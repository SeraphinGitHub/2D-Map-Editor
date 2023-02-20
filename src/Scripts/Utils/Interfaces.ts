
export interface IConstantes {
   [key: string]: IGrid,
}

export interface IGrid {
   CELL_SIZE:    number,
   COLUMNS:      number,
   ROWS:         number,
   TILES_SCHEMA: number[][],
   ITEMS_SCHEMA: number[][],
}

export interface INumber {
   [key: string]: number,
}

export interface IString {
   [key: string]: string;
}

export interface ISchema {
   [key: string]: number[][]
}

export interface IPosition {
   x: number,
   y: number,
}

export interface ISize {
   width:  number,
   height: number,
}

export interface IViewport extends IPosition, ISize {}

export interface IDOM {
   [key: string]: HTMLElement,
}

export interface ICanvas {
   [key: string]: HTMLCanvasElement,
}

export interface ICanvasSpec {
   [key: string]: ICanvasSpecElem,
}

export interface ICanvasSpecElem extends ISize {
   sprite:     string,
   select:     string,
   gridColor:  string,
   hoverColor: string,
}

export interface ICtx {
   [key: string]: CanvasRenderingContext2D,
}

export interface IDestinationImg {

   dX: number,
   dY: number,
   dW: number,
   dH: number,
}

export interface IStrokeRect extends IDestinationImg {
   ctx: CanvasRenderingContext2D,
}

export interface IDrawImage extends IDestinationImg {
   ctx: CanvasRenderingContext2D,
   img: HTMLImageElement,

   sX: number,
   sY: number,
   sW: number,
   sH: number,
}
