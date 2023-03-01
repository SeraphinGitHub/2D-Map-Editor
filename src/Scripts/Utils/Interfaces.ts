
export interface IViewport extends IPosition, ISize {}

export interface IPosition {
   x: number,
   y: number,
}

export interface IPosList {
   [key: string]: IPosition,
}

export interface ISize {
   width:  number,
   height: number,
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

export interface IDOM {
   [key: string]: HTMLElement,
}

export interface ICanvas {
   [key: string]: HTMLCanvasElement,
}

export interface ICtx {
   [key: string]: CanvasRenderingContext2D,
}
