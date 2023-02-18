
import {
   IGrid,
   IString,
   ISchema,
   IPosition,
   ICtx,
   ICanvas,
   ICanvasSpecElem,
   IStrokeRect,
   IDrawImage,
   IDestinationImg,
} from "../Utils/Interfaces";

import { CellClass   } from "./Cell";
import { SpriteClass } from "./Sprite";

interface IMousParams {
   eventsList: IString,
   selectCtx:  CanvasRenderingContext2D,
   viewBound:  DOMRect,
}


// =====================================================================
// ViewportClass
// =====================================================================
export class ViewportClass {
   
   x:           number;
   y:           number;
   width:       number;
   height:      number;

   scrollPicth: number;
   scrollMax:   number;
   scrollSize:  number;

   cellSize:    number;
   columns:     number;
   rows:        number;
   tilesSchema: number[][];
   itemsSchema: number[][];
   schemaKey:   string;

   cellsList:   Map<string, CellClass>;

   sprite:      SpriteClass;
   htmlVP:      HTMLElement;
   layers:      ICanvas;
   ctxList:     ICtx;
   
   layersName:  IString;
   gridColor:   string;
   hoverColor:  string;

   mouseEventsList: IString;

   constructor(
      mapConst:     IGrid,
      sprite:       SpriteClass,
      htmlViewport: HTMLElement,
      canvasType:   ICanvasSpecElem,
      schemaKey:    string,
   ) {

      { // Variables
         this.x           = 0;
         this.y           = 0;
         this.width       = canvasType.width;
         this.height      = canvasType.height;

         this.scrollPicth = 20,
         this.scrollMax   = 350,
         this.scrollSize  = mapConst.CELL_SIZE,

         this.cellSize    = mapConst.CELL_SIZE;
         this.columns     = mapConst.COLUMNS;
         this.rows        = mapConst.ROWS;
         this.tilesSchema = mapConst.TILES_SCHEMA;
         this.itemsSchema = mapConst.ITEMS_SCHEMA;
         this.schemaKey   = schemaKey;

         this.cellsList   = new Map<string, CellClass>();

         this.sprite      = sprite;
         this.htmlVP      = htmlViewport;
         this.layers      = {};
         this.ctxList     = {};

         this.layersName = {
            sprite: canvasType.sprite,
            select: canvasType.select,
         };

         this.gridColor  = canvasType.gridColor;
         this.hoverColor = canvasType.hoverColor;

         this.mouseEventsList = {
            move:   "mousemove",
            down:   "mousedown",
            leave:  "mouseleave",
            scroll: "wheel",
         };
      }
   }
   
   init() {

      this.initGrid();
      this.initCanvas();
      this.initMouse();
      this.refreshSprites();

      // ***** Tempory *****
      this.saveSchemasToLS();
   }

   initGrid() {

      const schemasString: string | null = localStorage.getItem(this.schemaKey);

      // Render Exiting Schema
      if(schemasString !== null) {
      
         const { tilesSchema, itemsSchema }: ISchema = JSON.parse(schemasString);
         
         if(tilesSchema.length !== 0
         && itemsSchema.length !== 0) {
            
            this.tilesSchema = tilesSchema;
            this.itemsSchema = itemsSchema;
            this.renderGrid( this.setCellTile.bind(this) );
         }
      }
      
      // Render Empty Grid
      else this.renderGrid( this.setEmptySchemas.bind(this) );
   }

   saveSchemasToLS() {

      const schemasGroup = {
         tilesSchema: this.tilesSchema,
         itemsSchema: this.itemsSchema,
      }

      const groupString = JSON.stringify(schemasGroup);
      localStorage.setItem(this.schemaKey, groupString);
   }

   renderGrid(callback: Function) {

      for(let colID = 0; colID < this.columns; colID++) {
         for(let rowID = 0; rowID < this.rows; rowID++) {

            const newCell:CellClass = new CellClass(colID, rowID);
            newCell.setPosition(this.cellSize);

            callback(rowID, colID, newCell);

            this.cellsList.set(newCell.id, newCell);
         }
      }
   }

   setCellTile(
      rowID:   number,
      colID:   number,
      newCell: CellClass,
   ) {

      const index: number   = rowID *this.columns +colID;
      const tile:  number[] = this.tilesSchema[index];
      const item:  number[] = this.itemsSchema[index];

      newCell.tileIndex = tile;
      newCell.itemIndex = item;
   }

   setEmptySchemas() {

      this.tilesSchema.push([]);
      this.itemsSchema.push([]);
   }

   cycleGrid(callback: Function) {
      this.cellsList.forEach(cell => callback(cell));
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
      this.renderSprites(spriteCtx, this.gridColor, gridGap, this.drawOneSprite.bind(this)); // Render Sprites
      this.renderSprites(spriteCtx, "black", gapCover, () => {});                            // Render Black Grid
   }

   renderSprites(
      spriteCtx: CanvasRenderingContext2D,
      color:     string,
      size:      number,
      callback: Function,
   ) {

      const tileSize  = this.sprite.size;
      const tileImg   = this.sprite.img;
      const cellSize  = this.scrollSize;
      
      this.cycleGrid((cell: CellClass) => {
   
         const [[x, y]]: number[][] = cell.setPosition(cellSize);
         
         const destination = {
            // dX: x -viewport.x, // ==> ScrollCam
            // dY: y -viewport.y, // ==> ScrollCam
            dX: x,
            dY: y,
            dW: cellSize,
            dH: cellSize,
         }

         // Draw Sprites
         callback(cell.tileIndex, spriteCtx, tileImg, tileSize, destination);
         callback(cell.itemIndex, spriteCtx, tileImg, tileSize, destination);
         
         // Draw Grid Color
         this.strokeRect({
            ctx: spriteCtx,
            ...destination,
         }, color, size);
      });
   }

   drawOneSprite(
      index:       number[],
      spriteCtx:   CanvasRenderingContext2D,
      tileImg:     HTMLImageElement,
      tileSize:    number,
      destination: IDestinationImg,
   ) {
      
      if(index.length === 0) return;
      
      const [spriteY, spriteX]: number[] = index;
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

   // Select Grid
   refreshHoverCell(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {

      this.clearCanvas(selectCtx);
      this.renderHoverCell(event, viewBound, selectCtx);
   }

   renderHoverCell(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {
      
      const mousePos:  IPosition = this.getMousePos(event, viewBound);
      const hoverCell: CellClass = this.getHoverCell(mousePos)!;
      
      const borderSize: number = 8;
      const fillSize:   number = 6;

      const destination = {
         dX:  hoverCell.position.x,
         dY:  hoverCell.position.y,
         dW:  this.scrollSize,
         dH:  this.scrollSize,
      }

      // Draw HoverCell borders
      this.strokeRect({
         ctx: selectCtx,
         ...destination,
      }, "black", borderSize);
      
      // Draw HoverCell color
      this.strokeRect({
         ctx: selectCtx,
         ...destination,
      }, this.hoverColor, fillSize);
   }

   getMousePos(event: MouseEvent, viewBound: DOMRect) {
      return {
         x: Math.floor(event.clientX -viewBound.left) as number,
         y: Math.floor(event.clientY -viewBound.top ) as number,
      };
   }
   
   getHoverCell(mousePos: IPosition) {
      
      const cellSize: number = this.scrollSize;

      const cellPos: IPosition = {
         x: mousePos.x - (mousePos.x % cellSize),
         y: mousePos.y - (mousePos.y % cellSize),
      };
   
      const cellID: string  = `${cellPos.x /cellSize}-${cellPos.y /cellSize}`;
      const cell: CellClass = this.cellsList.get(cellID)!;

      return cell;
   }

   // Mouse Events
   mouseMove(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {

      this.refreshHoverCell(event, viewBound, selectCtx);
   }
   
   mouseScroll(
      event:     WheelEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {
      
      // Zoom
      if(event.deltaY < 0) {

         if(this.scrollSize >= this.scrollMax) return;
         this.scrollSize += this.scrollPicth;
      }
   
      // Unzoom
      else {

         if(this.scrollSize <= this.scrollPicth) return;
         this.scrollSize -= this.scrollPicth;
      }

      this.refreshSprites();
      this.refreshHoverCell(event, viewBound, selectCtx);
   }
   
   mouseClick(event: MouseEvent) {

      // Left Click
      if(event.which === 1) {

         this.saveSchemasToLS();
      }

      // Right Click
      if(event.which === 3) {

      }

      // Scroll Click
      if(event.which === 2) {

         this.scrollSize = this.cellSize;
         this.refreshSprites();
      }
   }

   mouseLeave(ctx: CanvasRenderingContext2D) {
      this.clearCanvas(ctx);
   }

   initMouse() {

      const htmlVP: HTMLElement = this.htmlVP;
      const eventsList: IString = this.mouseEventsList;

      const selectName   = this.layersName.select   as string;
      const selectCtx    = this.ctxList[selectName] as CanvasRenderingContext2D;
      const selectCanvas = this.layers [selectName] as HTMLCanvasElement;
      const viewBound    = selectCanvas.getBoundingClientRect() as DOMRect;

      const params = {
         eventsList,
         selectCtx,
         viewBound,
      }

      for(let i in eventsList) {
         let eventName: string = eventsList[i];
         htmlVP.addEventListener(eventName, (event) => this.handleMouse(params, eventName, event));
      }
   }

   handleMouse(
      params:    IMousParams,
      eventName: string,
      event:     any,
   ) {
      
      const { eventsList, selectCtx, viewBound } = params;

      switch(eventName) {

         case eventsList.move:
            this.mouseMove(event, viewBound, selectCtx);
         break;

         case eventsList.down:
            this.mouseClick(event);
         break;

         case eventsList.leave:
            this.mouseLeave(selectCtx);
         break;

         case eventsList.scroll:
            this.mouseScroll(event, viewBound, selectCtx);
         break;
      }
   }

}