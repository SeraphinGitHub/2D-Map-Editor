
import {
   IViewport,
   ICanvasLayers,
   ICtx,
   IStrokeRect,
   IDrawImage,
   IPosition,
} from "../Utils/Interfaces";

import {
   CELL_SIZE,
   COLUMNS,
   ROWS,
   SCROLL_PITCH,
   MIN_ZOOM,
   MAX_ZOOM,
   TILES_MAP,
   ITEMS_MAP,
} from "../Utils/Constantes";

import { SpriteClass } from "./Classes/Sprite";
import { GridClass   } from "./Classes/Grid";
import { CellClass   } from "./Classes/Cell";


// ================================================================================================
// Global Variables
// ================================================================================================
const Viewport: IViewport = {
   x:      0,
   y:      0,
   width:  0,
   height: 0,
};

const CanvasLayers: ICanvasLayers = {};
const Ctx: ICtx = {};

let TileSprite: SpriteClass;
let CellSize:   number = CELL_SIZE;
let GridList:   Map<string, CellClass> | null;


// ================================================================================================
// Viewport
// ================================================================================================
document.body.oncontextmenu = (event: MouseEvent) => {
   event.preventDefault();
   event.stopPropagation();
}

const setViewport = (VPsize: {height: number, width: number}) => {
   
   Viewport.x      = Math.floor(VPsize.width  /2);
   Viewport.y      = Math.floor(VPsize.height /2);
   Viewport.height = VPsize.height;
   Viewport.width  = VPsize.width;
}

const setCanvas = (document: Document) => {

   const layers: string[] = [
      "map",
      "select",
   ];

   layers.forEach(layer => {

      CanvasLayers[layer] = document.querySelector(`.canvas-${layer}`) as HTMLCanvasElement;
      let canvas = CanvasLayers[layer];

      canvas.height = Viewport.height;
      canvas.width  = Viewport.width;

      Ctx[layer] = canvas.getContext("2d") as CanvasRenderingContext2D;
   });
}

const clearCanvas = (ctx: CanvasRenderingContext2D) => {

   ctx.clearRect(0, 0, Viewport.width, Viewport.height);
}


// ================================================================================================
// Grid
// ================================================================================================
const cycleGrid = (callback: Function) => {

   GridList?.forEach(cell => callback(cell));
}

const withinTheGrid = (mousePos: IPosition, callback: Function) => {
   
   if(mousePos
   && mousePos.x > 0
   && mousePos.x < Viewport.width
   && mousePos.y > 0
   && mousePos.y < Viewport.height) {

      callback();
   }
}


// ================================================================================================
// Mouse Events
// ================================================================================================
const mouse_Move = (event: MouseEvent) => {
   
   clearCanvas(Ctx.select);
   let mousePos = getMousePos(event);
   
   withinTheGrid(mousePos, () => {
      let hoverCell = getHoverCell(mousePos);
      
      strokeRect({
         ctx: Ctx.select,
         dX: hoverCell.position.x,
         dY: hoverCell.position.y,
         dW: CellSize,
         dH: CellSize,
      }, "blue", 4);
   });
}

const mouse_Scroll = (event: WheelEvent) => {
   
   // Zoom
   if(event.deltaY < 0) {
      if(CellSize < MAX_ZOOM) CellSize += SCROLL_PITCH;
   }

   // Unzoom
   else if(CellSize !== MIN_ZOOM) CellSize -= SCROLL_PITCH;

   refreshMap();
}

const mouse_Click = (event: MouseEvent) => {

   if(event.which === 2) {
      CellSize = CELL_SIZE;
      refreshMap();
   }
}

const getMousePos = (event: MouseEvent) => {

   let screenBound = CanvasLayers.select.getBoundingClientRect() as DOMRect;

   return {
      x: Math.floor(event.clientX -screenBound.left) as number,
      y: Math.floor(event.clientY -screenBound.top ) as number,
   };
}

const getHoverCell = (mousePos: IPosition) => {

   const position: IPosition = {
      x: mousePos.x - (mousePos.x % CellSize),
      y: mousePos.y - (mousePos.y % CellSize),
   };

   const center: IPosition = {
      x: Math.floor(position.x +CellSize /2),
      y: Math.floor(position.y +CellSize /2),
   };

   return {
      position,
      center,
   }
}


// ================================================================================================
// Draw
// ================================================================================================
const drawImage = (param: IDrawImage) => {

   param.ctx.drawImage(
      param.img,
      param.sX, param.sY, param.sW, param.sH,
      param.dX, param.dY, param.dW, param.dH,
   );
}

const strokeRect = (
   param:     IStrokeRect,
   color:     string,
   lineWidth: number
) => {

   param.ctx.strokeStyle = color;
   param.ctx.lineWidth   = lineWidth;

   param.ctx.strokeRect(
      param.dX, param.dY, param.dW, param.dH,
   );
}

const renderMap = () => {

   cycleGrid((cell: CellClass) => {

      // if(cell.size !== CellSize) cell.size = CellSize;

      let spriteIndex  = cell.j *COLUMNS +cell.i;
      let spriteArray  = TILES_MAP[spriteIndex];
      let tileToDraw_X = spriteArray[0] *TileSprite.size;
      let tileToDraw_Y = spriteArray[1] *TileSprite.size;

      const destination = {
         // dX: cell.i *CellSize -viewport.x, // ==> ScrollCam
         // dY: cell.j *CellSize -viewport.y, // ==> ScrollCam
         dX: cell.i *CellSize,
         dY: cell.j *CellSize,
         dW: CellSize,
         dH: CellSize,
      }

      drawImage({
         ctx: Ctx.map,
         img: TileSprite.img,

         sX: tileToDraw_X,
         sY: tileToDraw_Y,
         sW: TileSprite.size,
         sH: TileSprite.size,

         ...destination,
      });

      strokeRect({
         ctx: Ctx.map,
         ...destination,
      }, "red", 2);
   });
}

const refreshMap = () => {

   clearCanvas(Ctx.map);
   renderMap();
}


// ================================================================================================
// Exports
// ================================================================================================
const methods = {
   
   init(
      document: Document,
      VPsize:  {height: number, width: number}
   ) {
      
      setViewport(VPsize);
      setCanvas(document);
      
      TileSprite = new SpriteClass(200, "./TestTilesBlock.png");
      GridList   = new GridClass(CELL_SIZE, COLUMNS, ROWS).init();

      refreshMap();

      window.addEventListener("wheel",     (event) => mouse_Scroll(event));
      window.addEventListener("mousedown", (event) => mouse_Click (event));
      window.addEventListener("mousemove", (event) => mouse_Move  (event));
   },
}

export default methods;
