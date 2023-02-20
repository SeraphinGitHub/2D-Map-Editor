
import {
   IGrid,
   IString,
   ISchema,
   IPosition,
   IViewport,
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

   position:    IViewport;
   mousePos:    IPosition;

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

         this.position = {
            x:      0,
            y:      0,
            width:  canvasType.width,
            height: canvasType.height,
         }

         this.mousePos = {
            x: 0,
            y: 0,
         };

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
            enter:  "mouseenter",
            leave:  "mouseleave",
            move:   "mousemove",
            down:   "mousedown",
            scroll: "wheel",
         };
      }
   }
   
   init() {
      
      // this.centerVP();
      this.initGrid();
      this.initCanvas();
      this.initMouse();
      this.refreshSprites();

      // ***** Tempory *****
      // this.saveSchemasToLS();
   }

   centerVP() {
      this.position.x = Math.floor((this.columns *this.cellSize -this.position.width)  *0.5);
      this.position.y = Math.floor((this.rows    *this.cellSize -this.position.height) *0.5);
   }

   isCellInView(
      cellX:    number,
      cellY:    number,
      cellSize: number,
      vpX:      number,
      vpY:      number,
      vpWidth:  number,
      vpHeight: number,
   ) {

      // Cell outside of the grid
      return(
         cellX -vpX < vpWidth
      && cellY -vpY < vpHeight
      && cellX -vpX > -cellSize
      && cellY -vpY > -cellSize)

   }

   saveSchemasToLS() {

      const schemasGroup = {
         tilesSchema: this.tilesSchema,
         itemsSchema: this.itemsSchema,
      }

      const groupString = JSON.stringify(schemasGroup);
      localStorage.setItem(this.schemaKey, groupString);
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
         canvas.height = this.position.height;
         canvas.width  = this.position.width;
         
         // Set Contexts
         this.ctxList[name] = canvas.getContext("2d") as CanvasRenderingContext2D;
      }
   }
   
   clearCanvas(ctx: CanvasRenderingContext2D)  {
      ctx.clearRect(0, 0, this.position.width, this.position.height);
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


   // Render Grid
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


   // Render Sprites && Blue Grid
   refreshSprites() {
      
      const spriteCtx = this.ctxList[this.layersName.sprite];
      const gridGap   = 3;
      const gapCover  = gridGap /2;

      // Clear Sprite Grid
      this.clearCanvas(spriteCtx);
      
      // Render Sprites & Blue Grid
      this.renderSprites(spriteCtx, this.gridColor, gridGap, this.drawOneSprite.bind(this));
      
      // Render Black Grid
      this.renderSprites(spriteCtx, "black", gapCover, () => {});
   }

   renderSprites(
      spriteCtx:     CanvasRenderingContext2D,
      color:         string,
      size:          number,
      drawOneSprite: Function,
   ) {

      const tileSize   = this.sprite.size;
      const tileImg    = this.sprite.img;
      const cellSize   = this.scrollSize;
      
      const {
         x:      vpX,
         y:      vpY,
         height: vpHeight,
         width:  vpWidth,
      } = this.position;

      this.cycleGrid((cell: CellClass) => {
         const [[cellX, cellY]]: number[][] = cell.setPosition(cellSize);

         if(!this.isCellInView(cellX, cellY, cellSize, vpX, vpY, vpWidth, vpHeight)) return;
         
         const destination = {
            dX: cellX -vpX,
            dY: cellY -vpY,
            dW: cellSize,
            dH: cellSize,
         }

         // Draw Sprites
         drawOneSprite(spriteCtx, tileImg, tileSize, destination, cell.tileIndex);
         drawOneSprite(spriteCtx, tileImg, tileSize, destination, cell.itemIndex);
         
         // Draw Grid Color
         this.strokeRect({
            ctx: spriteCtx,
            ...destination,
         }, color, size);
      });
   }

   drawOneSprite(
      spriteCtx:   CanvasRenderingContext2D,
      tileImg:     HTMLImageElement,
      tileSize:    number,
      destination: IDestinationImg,
      index:       number[],
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


   // Render HoverCell
   refreshHoverCell(
      selectCtx: CanvasRenderingContext2D,
   ) {

      this.clearCanvas(selectCtx);
      this.renderHoverCell(selectCtx);
   }
   
   getMousePos(event: MouseEvent, viewBound: DOMRect) {
      return {
         x: Math.floor(event.clientX +this.position.x -viewBound.left) as number,
         y: Math.floor(event.clientY +this.position.y -viewBound.top ) as number,
      };
   }
   
   getHoverCell() {
      
      const cellSize: number = this.scrollSize;
      const { x: mouseX, y: mouseY }: IPosition = this.mousePos;

      const { x: cellX,  y: cellY }:  IPosition = {
         x: mouseX - (mouseX % cellSize),
         y: mouseY - (mouseY % cellSize),
      };
      
      const cellID: string  = `${cellX /cellSize}-${cellY /cellSize}`;
      let cell: CellClass | undefined;

      this.cellsList.get(cellID) !== undefined
      ? cell = this.cellsList.get(cellID)
      : cell = undefined;
      
      if(cell) return cell.position;
   }

   renderHoverCell(
      selectCtx: CanvasRenderingContext2D,
   ) {
      
      const borderSize: number = 8;
      const fillSize:   number = 6;
      const cellSize:   number = this.scrollSize;
      
      const hoverCell: IPosition | undefined = this.getHoverCell();
      if(hoverCell === undefined) return;
      const { x: cellX, y: cellY } = hoverCell;

      const {
         x:      vpX,
         y:      vpY,
         height: vpHeight,
         width:  vpWidth,
      }:IViewport = this.position;

      if(!this.isCellInView(cellX, cellY, cellSize, vpX, vpY, vpWidth, vpHeight)) return;

      const destination = {
         dX: cellX -vpX,
         dY: cellY -vpY,
         dW: cellSize,
         dH: cellSize,
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


   // Mouse Events
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

         case eventsList.enter:  this.mouseEnter();
         break;
         
         case eventsList.leave:  this.mouseLeave(selectCtx);
         break;

         case eventsList.move:   this.mouseMove(event, viewBound, selectCtx);
         break;

         case eventsList.down:   this.mouseClick(event);
         break;

         case eventsList.scroll: this.mouseScroll(event, selectCtx);
         break;
      }
   }

   mouseEnter() {
      console.log("Mouse Enter !"); // ******************************************************      
   }

   mouseLeave(ctx: CanvasRenderingContext2D) {
      this.clearCanvas(ctx);
   }

   mouseMove(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {

      this.mousePos = this.getMousePos(event, viewBound);
      this.refreshHoverCell(selectCtx);
   }
   
   mouseClick(event: MouseEvent) {

      // Left Click
      if(event.which === 1) {

         // this.saveSchemasToLS();
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

   mouseScroll(
      event:     WheelEvent,
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

      // const hoverCell: IPosition | undefined = this.getHoverCell();
      // if(hoverCell === undefined) return;
      // const { x: cellX, y: cellY } = hoverCell;
      
      // this.position.x = cellX;
      // this.position.y = cellY;

      this.refreshSprites();
      this.refreshHoverCell(selectCtx);
   }



   TestScollCam() {

      const pitch = 10;

      const movements = {
         up:    false,
         down:  false,
         left:  false,
         right: false,
      }

      window.addEventListener("keydown", (event) => {

         if(event.key === "z") movements.up    = true;
         if(event.key === "s") movements.down  = true;
         if(event.key === "q") movements.left  = true;
         if(event.key === "d") movements.right = true;

         if(movements.up)    this.position.y += pitch;
         if(movements.down)  this.position.y -= pitch;
         if(movements.left)  this.position.x += pitch;
         if(movements.right) this.position.x -= pitch;
         
         this.refreshSprites();
      });

      window.addEventListener("keydown", (event) => {

         if(event.key === "z") movements.up    = false;
         if(event.key === "s") movements.down  = false;
         if(event.key === "q") movements.left  = false;
         if(event.key === "d") movements.right = false;
      });
   }
}