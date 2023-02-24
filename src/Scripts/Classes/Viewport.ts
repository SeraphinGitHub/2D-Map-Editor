
import {
   IViewport,
   IString,
   ISchema,
   IPosition,
   ICtx,
   ICanvas,
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

   static assignedCell: CellClass | undefined

   position:    IViewport;
   center:      IPosition;
   scrClickPos: IPosition;
   hoverPos:    IPosition;
   hoverCell:   CellClass | undefined;
   clickCell:   CellClass | undefined;
   pressedKey:  string    | undefined;
   
   cellSize:    number;
   columns:     number;
   rows:        number;
   cellsList:   Map<string, CellClass>;

   scrollPicth: number;
   scrollMax:   number;
   scrollSize:  number;

   schemaKey:   string;
   tilesSchema: number[][];
   itemsSchema: number[][];

   layers:      ICanvas;
   ctxList:     ICtx;
   spriteSheet: SpriteClass | undefined;
   htmlVP:      HTMLElement;
   hoverColor:  string;

   isAssignable:    boolean;
   isClicked:       boolean;
   isGridShown:     boolean;
   isToolDrawLine:  boolean;

   tempCellIDArray: string[]; 

   layersName:      IString;
   mouseEventsList: IString;
   keysList:        IString;

   constructor(
      params:       any,
      htmlViewport: HTMLElement,
      schemaKey:    string,
   ) {

      { // Variables
         ViewportClass.assignedCell = undefined;

         this.position = {
            x:      0,
            y:      0,
            width:  params.width,
            height: params.height,
         }

         this.center   = {
            x: params.width  /2,
            y: params.height /2,
         }

         this.scrClickPos = { x:0, y:0 };
         this.hoverPos    = { x:0, y:0 };
         this.hoverCell   = undefined;
         this.clickCell   = undefined;
         this.pressedKey  = undefined;

         this.cellSize    = params.cellSize;
         this.columns     = params.columns;
         this.rows        = params.rows;
         this.cellsList   = new Map<string, CellClass>();

         this.scrollPicth = 20,
         this.scrollMax   = 350,
         this.scrollSize  = params.cellSize,

         this.schemaKey   = schemaKey;
         this.tilesSchema = [];
         this.itemsSchema = [];

         this.layers      = {};
         this.ctxList     = {};
         this.spriteSheet = undefined;
         this.htmlVP      = htmlViewport;
         this.hoverColor  = params.hoverColor;

         this.isAssignable = params.isAssignable;
         this.isClicked    = false;
         this.isGridShown  = true;
         this.isToolDrawLine = false;

         this.tempCellIDArray = [];

         this.layersName   = {
            sprite: `${params.name}-sprite`,
            select: `${params.name}-select`,
         };
         
         this.mouseEventsList = {
            down:   "mousedown",
            up:     "mouseup",
            move:   "mousemove",
            scroll: "wheel",
            leave:  "mouseleave",
         };

         this.keysList = {
            ctrl:   "Control",
            shift:  "Shift",
            enter:  "Enter",
            escape: "Escape",
            bnd_1:  "&",
            bnd_2:  "é",
            bnd_3:  "\"",
            bnd_4:  "'",
         };
      }
   }

   init() {

      this.initCanvas();
      this.initGrid();
      this.initMouse();
      this.refreshSprites();

      // ***** Tempory *****
      // this.storeSchema();
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

   storeSchema() {

      const schemasGroup = {
         tilesSchema: this.tilesSchema,
         itemsSchema: this.itemsSchema,
      }

      const groupString = JSON.stringify(schemasGroup);
      localStorage.setItem(this.schemaKey, groupString);
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


   // Render Grid
   initGrid() {

      this.toGridCenter();

      const storedSchemasStr: string | null = localStorage.getItem(this.schemaKey);

      if(storedSchemasStr !== null) {
         this.renderStoredSchema(storedSchemasStr);
         return;
      }
      
      this.renderEmptySchema();
   }

   getSchemaIndex(cell: CellClass) {

      return cell.rowID *this.columns +cell.colID as number;
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

   renderEmptySchema() {
      
      this.renderGrid(() => {
         this.tilesSchema.push([]);
         // this.itemsSchema.push([]); // ==> TO DO Later
      });
   }

   renderStoredSchema(storedSchemasStr: string) {

      const { tilesSchema, itemsSchema }: ISchema = JSON.parse(storedSchemasStr);
         
      if(tilesSchema.length === 0
      || itemsSchema.length === 0) {
         return;
      }

      this.tilesSchema = tilesSchema;
      // this.itemsSchema = itemsSchema; // ==> TO DO Later

      this.renderSchema(() => {});
   }

   renderSchema(generate: Function) {
      
      this.renderGrid((
         rowID:   number,
         colID:   number,
         newCell: CellClass,
      ) => {
         
         const index: number   = this.getSchemaIndex(newCell);
         const tile:  number[] = this.tilesSchema[index];
         // const item:  number[] = this.itemsSchema[index]; // ==> TO DO Later
         
         newCell.tileIndex = tile;
         // newCell.itemIndex = item; // ==> TO DO Later
         
         generate(newCell, colID, rowID);
      });
   }

   generateSchema() {
   
      this.renderSchema((
         newCell: CellClass,
         colID:   number,
         rowID:   number,
      ) => {
         newCell.tileIndex = [rowID, colID];
      });

      this.refreshSprites();
   }


   // Render Sprites && Blue Grid
   refreshSprites() {
      
      const spriteCtx   = this.ctxList[this.layersName.sprite];
      const spriteSheet = this.spriteSheet;

      this.clearCanvas(spriteCtx);
      
      if(spriteSheet !== undefined) {
         const { textureSize, img } = spriteSheet;
         this.renderSprites(spriteCtx, this.drawSprite.bind(this), textureSize, img);
         return;
      } 

      this.renderSprites(spriteCtx, () => {});
   }

   renderSprites(
      spriteCtx:  CanvasRenderingContext2D,
      drawSprite: Function,
      tileSize?:  number,
      tileImg?:   HTMLImageElement,
   ) {
      
      const {
         x:      vpX,
         y:      vpY,
         height: vpHeight,
         width:  vpWidth,
      } = this.position;

      let offsetIn      = 1.5;
      let offsetOut     = offsetIn *2;
      let borderSize    = 0.8;

      const borderColor = "turquoise";
      const cellSize    = this.scrollSize;

      // Hide Grid
      if(!this.isGridShown) {
         offsetIn   = 0;
         offsetOut  = 0;
         borderSize = 0.1;
      }

      this.cycleGrid((cell: CellClass) => {

         const [[cellX, cellY]]: number[][] = cell.setPosition(cellSize);
         const x = cellX -vpX;
         const y = cellY -vpY;

         if(!this.isCellInView(x, y, vpWidth, vpHeight, -cellSize)) return;
         
         const destination = {
            dX: x +offsetIn,
            dY: y +offsetIn,
            dW: cellSize -offsetOut,
            dH: cellSize -offsetOut
         }

         // Draw Grid Color
         this.strokeRect({
            ctx: spriteCtx,
            ...destination,
         }, borderColor, borderSize);

         // Draw Sprites
         drawSprite(spriteCtx, tileImg, tileSize, destination, cell.tileIndex);
         // drawOneSprite(spriteCtx, tileImg, tileSize, destination, cell.itemIndex); // ==> TO DO Later
      });
   }

   drawSprite(
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
      this.renderSelectedCell(selectCtx);

      if(this.hoverCell === undefined) return;

      this.toolDrawLine(); // ****************

      this.renderHoverCell(selectCtx, this.hoverCell, this.hoverColor);
   }

   renderSelectedCell(ctx: CanvasRenderingContext2D) {

      if(!this.isAssignable) return;
      this.renderHoverCell(ctx, ViewportClass.assignedCell, "blue");
   }

   renderHoverCell(
      selectCtx: CanvasRenderingContext2D,
      cell:      any,
      color:     string,
   ) {
      
      const borderSize: number = 8;
      const fillSize:   number = 6;
      const cellSize:   number = this.scrollSize;
      
      if(cell === undefined) return

      const { x: cellX, y: cellY } = cell.position;
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
      }, color, fillSize);
   }


   // Mouse Behaviors
   mouseClick(event: MouseEvent, eventName: string) {

      // Left Click
      if(event.which === 1) {

         if(eventName === this.mouseEventsList.down) {
            // this.storeSchema();
            this.assignTile();
            this.setClickCell();
         }
      }

      // Right Click
      if(event.which === 3) this.deleteTile();

      // Scroll Click
      if(event.which === 2) {

         if(eventName === this.mouseEventsList.down) {
            this.isClicked   = true;
            this.scrClickPos = this.hoverPos;
            this.zoomReset();
         }

         if(eventName === this.mouseEventsList.up) {
            this.isClicked = false;
         }
      };
   }

   mouseMove(
      event:     MouseEvent,
      viewBound: DOMRect,
      selectCtx: CanvasRenderingContext2D,
   ) {
      
      this.getMousePosition(event, viewBound);
      this.moveGrid();
      this.refreshHoverCell(selectCtx);
   }

   mouseScroll(
      event:     WheelEvent,
      selectCtx: CanvasRenderingContext2D,
   ) {

      if(this.hoverCell === undefined) return;
      
      const scrollPicth:      number    = this.scrollPicth;
      const { colID, rowID }: CellClass = this.hoverCell!;
      
      // Zoom In
      if(event.deltaY < 0) {
         this.zoom(colID, rowID, scrollPicth, this.scrollMax);
      }
      
      // Zoom Out
      else this.zoom(colID, rowID, -scrollPicth, scrollPicth);

      this.refreshSprites();
      this.refreshHoverCell(selectCtx);
   }

   mouseLeave(ctx: CanvasRenderingContext2D) {
      
      this.clearCanvas(ctx);
      this.renderSelectedCell(ctx);
      this.isClicked = false;
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

         case eventsList.down:
            this.mouseClick(event, eventName);
         break;

         case eventsList.up:
            this.mouseClick(event, eventName);
         break;

         case eventsList.move:
            this.mouseMove(event, viewBound, selectCtx);
         break;

         case eventsList.scroll:
            this.mouseScroll(event, selectCtx);
         break;
         
         case eventsList.leave:
            this.mouseLeave(selectCtx);
         break;
      }
   }

   getMousePosition(event: MouseEvent, viewBound: DOMRect) {

      // Mouse Position
      let mousePos;
      let { x: mouseX, y: mouseY }: IPosition = mousePos = {
         x: Math.floor(event.clientX +this.position.x -viewBound.left) as number,
         y: Math.floor(event.clientY +this.position.y -viewBound.top ) as number,
      };

      if(this.isClicked) {
         mouseX = this.scrClickPos.x;   
         mouseY = this.scrClickPos.y;
      }
      
      // Cell Position
      const cellSize: number = this.scrollSize;
      const { x: colID, y: rowID }: IPosition = {
         x: (mouseX - Math.abs(mouseX % cellSize)) /cellSize,
         y: (mouseY - Math.abs(mouseY % cellSize)) /cellSize,
      };

      let cell: CellClass | undefined;

      if(this.isCellInView(colID, rowID, this.columns, this.rows, 0)) {
         const cellID: string = `${colID}-${rowID}`;      
         cell = this.cellsList.get(cellID);
      }
      else cell = undefined;

      this.hoverPos  = mousePos;
      this.hoverCell = cell;
   }

   setClickCell() {

      if(this.hoverCell === undefined) return;
      this.clickCell = this.hoverCell;
   }

   moveGrid() {

      if(!this.isClicked || this.hoverCell === undefined) return;

      const { x: vpX,     y: vpY     }: IViewport = this.position;
      const { x: centerX, y: centerY }: IPosition = this.center;
      const { x: mouseX,  y: mouseY  }: IPosition = this.hoverPos;
      const { x: clickX,  y: clickY  }: IPosition = this.scrClickPos;

      const { x: mouseOffsetX, y: mouseOffsetY} = {
         x: mouseX -clickX,
         y: mouseY -clickY,
      }

      const { x: vpOffsetX, y: vpOffsetY} = {
         x: vpX +centerX,
         y: vpY +centerY,
      }

      this.position.x -= this.moveAxis(vpOffsetX, mouseOffsetX, this.columns)!;
      this.position.y -= this.moveAxis(vpOffsetY, mouseOffsetY, this.rows)!;

      this.refreshSprites();
   }

   moveAxis(
      vpOffset:    number,
      mouseOffset: number,
      limit:       number,
   ) {

      if(mouseOffset > 0 && vpOffset < 0
      || mouseOffset < 0 && vpOffset > limit *this.scrollSize) {

         return 0;
      }

      return mouseOffset;
   }

   zoom(
      colID:    number,
      rowID:    number,
      picth:    number,
      maxPicth: number,
   ) {

      const scrollRange = maxPicth -this.scrollSize;
      const minLimit    = picth > 0 && scrollRange <= 0;
      const maxLimit    = picth < 0 && scrollRange >= 0;

      if(minLimit || maxLimit) return;
      
      this.scrollSize += picth;
      this.position.x += picth *(colID +1/2);
      this.position.y += picth *(rowID +1/2);
   }

   zoomReset() {

      if(this.pressedKey !== this.keysList.ctrl) return;

      this.isClicked  = false;
      this.scrollSize = this.cellSize;
      this.toGridCenter();
      this.refreshSprites();
   }

   toGridCenter() {
      this.position.x = Math.floor((this.columns *this.scrollSize -this.position.width)  /2);
      this.position.y = Math.floor((this.rows    *this.scrollSize -this.position.height) /2);
   }

   assignTile() {
      
      const hoverCell = this.hoverCell;
      if(hoverCell === undefined) return;
      
      if(ViewportClass.assignedCell !== hoverCell && this.isAssignable) {
         ViewportClass.assignedCell = hoverCell;
      }

      if(ViewportClass.assignedCell === undefined) return;
      
      let   [ hoverX,  hoverY  ] = hoverCell.tileIndex;
      const [ selectX, selectY ] = ViewportClass.assignedCell.tileIndex;

      if(hoverX === selectX && hoverY === selectY) return
      
      hoverCell.tileIndex     = ViewportClass.assignedCell.tileIndex;
      const index: number     = this.getSchemaIndex(hoverCell);
      this.tilesSchema[index] = hoverCell.tileIndex;
      
      this.refreshSprites();
   }

   deleteTile() {

      if(this.hoverCell === undefined) return;
      this.hoverCell.tileIndex = [];
      this.refreshSprites();
   }


   // Keyboard Events
   handlePressedKeys() {
      switch(this.pressedKey) {

         case this.keysList.escape:
            this.toggleGrid();
         break;

         case this.keysList.bnd_1:
            this.isToolDrawLine = !this.isToolDrawLine;
         break;
      }
   }

   toggleGrid() {
      
      this.isGridShown = !this.isGridShown;
      this.refreshSprites();
   }


   // Tools
   toolDrawLine() {
      
      if(!this.isToolDrawLine ||  this.clickCell === undefined) return;
      
      const hoverCell = this.hoverCell;
      const clickCell = this.clickCell;
      const { x: hoverX, y: hoverY } = hoverCell!.center;
      const { x: clickX, y: clickY } = clickCell.center;

      const raycast = {
         startX: clickX,
         startY: clickY,
         endX:   hoverX,
         endY:   hoverY,
      }
      
      if(!hoverCell!.line_toSquare(raycast) || hoverCell === clickCell) return;

      const selectCtx = this.ctxList[this.layersName.select];

      this.tempCellIDArray.push(hoverCell!.id);
      clickCell.drawPathLine(selectCtx, hoverCell!, this.position);
      // hoverCell.drawWall(ctx.isoSelect, true);
      // hoverCell.drawWallCollider(ctx.isoSelect, isDiamond, DebugVar.showWallCol);
   }

   
   // const drawBuiltWalls = (cell) => {
   
   //    TempWallsIDArray.forEach(id => {
   //       let tempCell = Grid.cellsList[id];
   
   //       tempCell.isBlocked = true;
   //       tempCell.blockingItem = "wall";
   //       tempCell.drawWall(ctx.isoSelect, false);
   //    });
   
   //    StartWall.drawPathWall(ctx.isoSelect, GetCell);
   //    StartWall = cell;
   // }

}