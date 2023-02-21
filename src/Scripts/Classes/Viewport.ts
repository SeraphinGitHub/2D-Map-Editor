
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
   center:      IPosition;
   clickPos:    IPosition;
   hoverPos:    IPosition;
   hoverCell:   CellClass | undefined;
   
   isClicked:   boolean;

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

         this.center   = {
            x: canvasType.width  /2,
            y: canvasType.height /2,
         }

         this.clickPos  = {
            x: 0,
            y: 0,
         };
         
         this.hoverPos = {
            x: 0,
            y: 0,
         };

         this.hoverCell   = undefined;

         this.isClicked   = false;

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
            up:     "mouseup",
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
      // this.saveSchemasToLS();
   }

   toGridCenter() {
      this.position.x = Math.floor((this.columns *this.cellSize -this.position.width)  /2);
      this.position.y = Math.floor((this.rows    *this.cellSize -this.position.height) /2);
   }

   isCellInView(
      x:      number,
      y:      number,
      width:  number,
      height: number,
      size:   number,
   ) {

      // Cell inside of the grid
      return(
         x <= width
      && y <= height
      && x >= size
      && y >= size)
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

      const tileSize = this.sprite.size;
      const tileImg  = this.sprite.img;
      const cellSize = this.scrollSize;
      
      const {
         x:      vpX,
         y:      vpY,
         height: vpHeight,
         width:  vpWidth,
      }: IViewport = this.position;

      this.cycleGrid((cell: CellClass) => {
         const [[cellX, cellY]]: number[][] = cell.setPosition(cellSize);
         
         const x = cellX -vpX;
         const y = cellY -vpY;

         if(!this.isCellInView(x, y, vpWidth, vpHeight, -cellSize)) return;
         
         const destination = {
            dX: x,
            dY: y,
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
      
      if(this.hoverCell === undefined) return;

      this.renderHoverCell(selectCtx);
   }

   renderHoverCell(
      selectCtx: CanvasRenderingContext2D,
   ) {
      
      const borderSize: number = 8;
      const fillSize:   number = 6;
      const cellSize:   number = this.scrollSize;
      
      if(this.hoverCell === undefined) return

      const { x: cellX, y: cellY } = this.hoverCell.position;
      const { x: vpX,   y: vpY   } = this.position;

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


   // Mouse Behaviors
   mouseEnter() {
      console.log("Mouse Enter !"); // ******************************************************      
   }

   mouseLeave(ctx: CanvasRenderingContext2D) {
      
      this.clearCanvas(ctx);
      this.isClicked = false;
   }

   mouseMove(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {

      this.moveGrid();
      
      this.getMousePosition(event, viewBound);
      this.refreshHoverCell(selectCtx);
      this.refreshSprites();
   }
   
   mouseClick(event: MouseEvent, eventName: string) {

      // Left Click
      if(event.which === 1) {

         if(eventName === this.mouseEventsList.down) {
            // this.saveSchemasToLS();
            this.isClicked = true;
            this.clickPos = this.hoverPos;
         }

         if(eventName === this.mouseEventsList.up) {
            this.isClicked = false;
         }
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
      
      const scrollPicth: number = this.scrollPicth;

      const { x: mouseX,  y: mouseY  } = this.hoverPos;
      const { x: centerX, y: centerY } = this.center;

      // ***** TEST *****
      const { x: offX, y: offY} = {
         x: mouseX -centerX +scrollPicth,
         y: mouseY -centerY +scrollPicth,
      }
      // ***** TEST *****
      
      
      // Zoom
      if(event.deltaY < 0) {
         
         if(this.scrollSize >= this.scrollMax) return;
         this.scrollSize += scrollPicth;
         
         // ***** TEST *****
         this.position.x += offX;
         this.position.y += offY;
         // ***** TEST *****
      }
      
      // Unzoom
      else {
         
         if(this.scrollSize <= scrollPicth) return;
         this.scrollSize -= scrollPicth;
         
         // ***** TEST *****
         this.position.x -= offX;
         this.position.y -= offY;
         // ***** TEST *****
      }

      this.refreshSprites();
      this.refreshHoverCell(selectCtx);
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

         case eventsList.enter:
            this.mouseEnter();
         break;
         
         case eventsList.leave:
            this.mouseLeave(selectCtx);
         break;

         case eventsList.move:
            this.mouseMove(event, viewBound, selectCtx);
         break;

         case eventsList.down:
            this.mouseClick(event, eventName);
         break;

         case eventsList.up:
            this.mouseClick(event, eventName);
         break;

         case eventsList.scroll:
            this.mouseScroll(event, selectCtx);
         break;
      }
   }

   getMousePosition(event: MouseEvent, viewBound: DOMRect) {

      let mousePos: IPosition;
      let cell:     CellClass | undefined;

      const cellSize: number = this.scrollSize;
      
      // Mouse Position
      const { x: mouseX, y: mouseY }  = mousePos = {
         x: Math.floor(event.clientX +this.position.x -viewBound.left) as number,
         y: Math.floor(event.clientY +this.position.y -viewBound.top ) as number,
      };

      // Cell Position
      const { x: colID,  y: rowID  }: IPosition = {
         x: (mouseX - Math.abs(mouseX % cellSize)) /cellSize,
         y: (mouseY - Math.abs(mouseY % cellSize)) /cellSize,
      };

      if(!this.isCellInView(colID, rowID, this.columns, this.rows, 0)) {
         cell = undefined;
      }

      else {
         const cellID: string  = `${colID}-${rowID}`;      
         cell = this.cellsList.get(cellID);
      }

      this.hoverPos  = mousePos;
      this.hoverCell = cell;
   }

   moveGrid() {

      if(!this.isClicked) return;

      const { x: vpX,     y: vpY     }: IViewport = this.position;
      const { x: centerX, y: centerY }: IPosition = this.center;
      const { x: mouseX,  y: mouseY  }: IPosition = this.hoverPos;
      const { x: clickX,  y: clickY  }: IPosition = this.clickPos;

      const { x: mouseOffsetX, y: mouseOffsetY} = {
         x: mouseX -clickX,
         y: mouseY -clickY,
      }

      const { x: vpOffsetX, y: vpOffsetY} = {
         x: centerX +vpX,
         y: centerY +vpY,
      }

      this.moveX(vpOffsetX, mouseOffsetX);
      this.moveY(vpOffsetY, mouseOffsetY);
   }

   moveX(
      vpOffsetX:    number,
      mouseOffsetX: number,
   ) {

      if(mouseOffsetX > 0
      && vpOffsetX    < 0) {
         return
      }
      
      if(mouseOffsetX < 0
      && vpOffsetX    > this.columns *this.scrollSize) {
         return
      }

      this.position.x -= mouseOffsetX;
   }

   moveY(
      vpOffsetY:    number,
      mouseOffsetY: number,
   ) {

      if(mouseOffsetY > 0
      && vpOffsetY    < 0) {
         return
      }
      
      if(mouseOffsetY < 0
      && vpOffsetY    > this.rows *this.scrollSize) {
         return
      }

      this.position.y -= mouseOffsetY;
   }
}