
export interface IPosition {
   x: number,
   y: number,
}

export interface ISize {
   width:  number,
   height: number,
}

export interface IString {
   [key: string]: string;
}

export interface IDOM {
   [key: string]: HTMLElement,
}

export interface IViewport {
   x:      number,
   y:      number,
   width:  number,
   height: number,
}

export interface ICanvas {
   sprite: string,
   select: string,
   height: number,
   width:  number,
}

export interface ICanvasSpec {
   [key: string]: ICanvas,
}

export interface ICanvasLayers {
   [key: string]: HTMLCanvasElement,
}

export interface ICtx {
   [key: string]: CanvasRenderingContext2D,
}

export interface IStrokeRect {
   ctx: CanvasRenderingContext2D,
   
   dX: number,
   dY: number,
   dW: number,
   dH: number,
}

export interface IDrawImage {
   ctx: CanvasRenderingContext2D,
   img: HTMLImageElement,

   sX: number,
   sY: number,
   sW: number,
   sH: number,

   dX: number,
   dY: number,
   dW: number,
   dH: number,
}