
import {
   IPosition,
   IString,
   ICtx,
   ICanvas,
   ICanvasSpecElem,
   IStrokeRect,
   IDrawImage,
   IDestinationImg,
} from "../Utils/Interfaces";

import { GridClass   } from "./Grid";
import { CellClass   } from "./Cell";
import { SpriteClass } from "./Sprite";


// =====================================================================
// ViewportClass
// =====================================================================
export class ViewportClass extends GridClass {

   x:      number;
   y:      number;
   width:  number;
   height: number;

   schema:  number[][];
   sprite:  SpriteClass;
   htmlVP:  HTMLElement;
   layers:  ICanvas;
   ctxList: ICtx;
   
   layersName:    IString;
   gridColor:     string;
   hoverColor:    string;

   constructor(
      cellSize: number,
      columns:  number,
      rows:     number,
      schema:   number[][],
      sprite:   SpriteClass,
      htmlViewport: HTMLElement,
      canvasType:   ICanvasSpecElem,
   ) {
      super(cellSize, columns, rows);
      
      this.x       = 0;
      this.y       = 0;
      this.width   = canvasType.width;
      this.height  = canvasType.height;

      this.schema  = schema;
      this.sprite  = sprite;
      this.htmlVP  = htmlViewport;
      this.layers  = {};
      this.ctxList = {};

      this.layersName  = {
         sprite: canvasType.sprite,
         select: canvasType.select,
      };

      this.gridColor  = canvasType.gridColor;
      this.hoverColor = canvasType.hoverColor;
   }

   init() {
      this.initGrid();
      this.initCanvas();
      this.initMouseEvents();
      this.refreshSprites();
   }

   initCanvas() {

      // Set Canvas && sizes
      for(let i in this.layersName) {
         let name = this.layersName[i];

         this.layers[name] = this.htmlVP.querySelector(`.canvas-${name}`) as HTMLCanvasElement;
         
         let canvas    = this.layers[name];
         canvas.height = this.height;
         canvas.width  = this.width;
         
         // Set Contexts
         this.ctxList[name] = canvas.getContext("2d") as CanvasRenderingContext2D;
      }
   }
   
   clearCanvas(ctx: CanvasRenderingContext2D)  {
      ctx.clearRect(this.x, this.y, this.width, this.height);
   }

   cycleGrid(callback: Function) {
      this.cellsList.forEach(cell => callback(cell));
   }

   drawImage(param: IDrawImage) {

      param.ctx.drawImage(
         param.img,
         param.sX, param.sY, param.sW, param.sH,
         param.dX, param.dY, param.dW, param.dH,
      );
   }
   
   strokeRect(
      param:     IStrokeRect,
      color:     string,
      lineWidth: number
   ) {
   
      param.ctx.strokeStyle = color;
      param.ctx.lineWidth   = lineWidth;
   
      param.ctx.strokeRect(
         param.dX, param.dY, param.dW, param.dH,
      );
   }

   // Sprites Grid
   refreshSprites() {

      const spriteCtx = this.ctxList[this.layersName.sprite];
      const gridGap   = 3;
      const gapCover  = gridGap /2;

      // Clear Sprite Grid
      this.clearCanvas(spriteCtx);
      
      // Render Sprites Grid
      this.renderSprites(spriteCtx, this.gridColor, gridGap, this.drawSprites.bind(this)); // Render Sprites
      this.renderSprites(spriteCtx, "black", gapCover, () => {});                          // Render Black Grid
   }

   renderSprites(
      spriteCtx: CanvasRenderingContext2D,
      color:     string,
      size:      number,
      callback: Function,
   ) {

      const tileSize  = this.sprite.size;
      const tileImg   = this.sprite.img;
      const cellSize  = this.cellSize;

      this.cycleGrid((cell: CellClass) => {
   
         const [[col, row], [x, y]]: number[][] = cell.setPosition(cellSize);
         
         const destination = {
            // dX: x -viewport.x, // ==> ScrollCam
            // dY: y -viewport.y, // ==> ScrollCam
            dX: x,
            dY: y,
            dW: cellSize,
            dH: cellSize,
         }

         callback(row, col, spriteCtx, tileImg, tileSize, destination);

         this.strokeRect({
            ctx: spriteCtx,
            ...destination,
         }, color, size);
      });
   }

   drawSprites(
      row: number,
      col: number,
      spriteCtx:   CanvasRenderingContext2D,
      tileImg:     HTMLImageElement,
      tileSize:    number,
      destination: IDestinationImg,
   ) {
      const spriteIndex: number = row *this.columns +col;
      const tile: number[]      = this.schema[spriteIndex];
      
      if(tile) {
         const [spriteY, spriteX]: number[] = tile;
         const drawX: number = spriteX *tileSize;
         const drawY: number = spriteY *tileSize;
         
         this.drawImage({
            ctx: spriteCtx,
            img: tileImg,
   
            sX: drawX,
            sY: drawY,
            sW: tileSize,
            sH: tileSize,
   
            ...destination,
         });
      }
   }

   // Select Grid  &  Hover Cell 
   getMousePos(event: MouseEvent, viewBound: DOMRect) {
      return {
         x: Math.floor(event.clientX -viewBound.left) as number,
         y: Math.floor(event.clientY -viewBound.top ) as number,
      };
   }
   
   getHoverCell(mousePos: IPosition) {  // **** TO DO (try recast) ****
      
      // **** TO DO (try recast) ****
      // this.tileIndex = [];    <== using this (CellClass)
      // this.itemIndex = [];
      // **** TO DO (try recast) ****

      const cellSize: number = this.cellSize;

      const cellPos: IPosition = {
         x: mousePos.x - (mousePos.x % cellSize),
         y: mousePos.y - (mousePos.y % cellSize),
      };
   
      const cellID: string  = `${cellPos.x /cellSize}-${cellPos.y /cellSize}`;
      const cell: CellClass = this.cellsList.get(cellID)!;

      return cell;
   }

   refreshSelect(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {

      // Clear Select Grid
      this.clearCanvas(selectCtx);
   
      const cellSize:  number    = this.cellSize;
      const mousePos:  IPosition = this.getMousePos(event, viewBound);
      const hoverCell: CellClass = this.getHoverCell(mousePos)!;
      
      const destination = {
         dX:  hoverCell.position.x,
         dY:  hoverCell.position.y,
         dW:  cellSize,
         dH:  cellSize,
      }

      const borderSize: number = 8;
      const fillSize:   number = 6;

      // Render Hover Cell
      this.renderSelect(selectCtx, destination, "black", borderSize);       // Render border color
      this.renderSelect(selectCtx, destination, this.hoverColor, fillSize); // Render fill color
   }

   renderSelect(
      selectCtx:   CanvasRenderingContext2D,
      destination: IDestinationImg,
      color: string,
      size:  number,
   ) {

      this.strokeRect({
         ctx: selectCtx,
         ...destination,
      }, color, size);
   }
   
   // Mouse Events
   mouseMove(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {

      this.refreshSelect(event, viewBound, selectCtx);
   }
   
   mouseScroll(event: WheelEvent) {
      
      // // Zoom
      // if(event.deltaY < 0) {
      //    if(CellSize < MAX_ZOOM) CellSize += SCROLL_PITCH;
      // }
   
      // // Unzoom
      // else if(CellSize > MIN_ZOOM) CellSize -= SCROLL_PITCH;
      
      // refreshMap();
   }
   
   mouseClick(event: MouseEvent) {
   
      // if(event.which === 2) {
      //    CellSize = MAP_CELL_SIZE;
      //    refreshMap();
      // }
   }

   mouseLeave(ctx: CanvasRenderingContext2D) {
      this.clearCanvas(ctx);
   }

   initMouseEvents() {
      
      const selectName   = this.layersName.select;
      const selectCtx    = this.ctxList[selectName];
      const selectCanvas = this.layers [selectName];
      const viewBound    = selectCanvas.getBoundingClientRect();

      this.htmlVP.addEventListener("mouseleave", ()      => this.mouseLeave (selectCtx));
      this.htmlVP.addEventListener("mousemove",  (event) => this.mouseMove  (event, viewBound, selectCtx));
      this.htmlVP.addEventListener("mousedown",  (event) => this.mouseClick (event));
      this.htmlVP.addEventListener("wheel",      (event) => this.mouseScroll(event));
   }
}