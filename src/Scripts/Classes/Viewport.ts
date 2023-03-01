
import {
   IViewport,
   IPosition,
   IPosList,
   INumber,
   IString,
   ISchema,
   ICtx,
   ICanvas,
} from "../Utils/Interfaces";

import { SpriteClass    } from "./Sprite";
import { CellClass      } from "./Cell";
import { ToolClass      } from "./Tool";
import { DrawClass      } from "./Draw";

interface IMousParams {
   eventsList: IString,
   selectCtx:  CanvasRenderingContext2D,
   viewBound:  DOMRect,
}

// =====================================================================
// ViewportClass
// =====================================================================
export class ViewportClass {

   // Classes
   private Tool:      ToolClass      = new ToolClass();
   private Draw:      DrawClass      = new DrawClass();

   // Statics
   static assignedCell: CellClass | undefined = undefined;

   // Positions
   position:         IViewport;
   center:           IPosition;
   scrClickPos:      IPosition = { x:0, y:0 };
   hoverPos:         IPosition = { x:0, y:0 };

   // Cells
   hoverCell:        CellClass | undefined = undefined;
   selectCell:       CellClass | undefined = undefined;

   // Lists
   cellsList:        Map<string, CellClass> = new Map<string, CellClass>();
   cellsInViewList:  Map<string, CellClass> = new Map<string, CellClass>();
   layersName:       IString;
   
   // Strings
   schemaKey:        string;
   hoverColor:       string;
   oldPressKey:      string | undefined = undefined;
   newPressKey:      string | undefined = undefined;
   gridColor:        string = "turquoise";

   // Numbers
   cellSize:         number;
   columns:          number;
   rows:             number;
   scrollSize:       number;
   scrollPicth:      number = 20;
   scrollMax:        number = 350;

   // Schemas
   tilesSchema:      number[][] = [];
   itemsSchema:      number[][] = [];

   // Canvas properties
   htmlVP:           HTMLElement;
   spriteSheet:      SpriteClass | undefined = undefined;
   layers:           ICanvas = {};
   ctxList:          ICtx    = {};

   // Booleans
   isAssignable:     boolean;
   isScrClicked:     boolean = false;
   isGridShown:      boolean = true;
   isDeleting:       boolean = false;

   // Mouse & Keyboard Lists
   mouseEventsList: IString = {
      down:   "mousedown",
      up:     "mouseup",
      move:   "mousemove",
      scroll: "wheel",
      leave:  "mouseleave",
   };

   keysList:        IString = {
      ctrl:    "Control",
      shift:   "Shift",
      enter:   "Enter",
      escape:  "Escape",
      sqrPow:  "²",
      short_1: "&",
      short_2: "é",
      short_3: "\"",
      short_4: "'",
   };

   constructor(
      htmlViewport: HTMLElement,
      schemaKey:    string,
      params:       any,
   ) {

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

      this.htmlVP       = htmlViewport;
      this.schemaKey    = schemaKey;
      this.cellSize     = params.cellSize;
      this.columns      = params.columns;
      this.rows         = params.rows;
      this.scrollSize   = params.cellSize,
      this.hoverColor   = params.hoverColor;
      this.isAssignable = params.isAssignable;
      this.layersName   = {
         sprite: `${params.name}-sprite`,
         select: `${params.name}-select`,
      };
   }

   reset() {

      ViewportClass.assignedCell = undefined;
      this.selectCell  = undefined;
      this.tilesSchema = [];
      this.cellsList.clear();
      this.cellsInViewList.clear();
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
   
   cycleGrid(
      list:        Map<string, CellClass>,
      callback:    Function,
      setCellPos?: boolean,
   ) {
      
      const {
         height: vpHeight,
         width:  vpWidth
      }: IViewport = this.position;

      const scrollSize: number = this.scrollSize;
      
      list.forEach(cell => {
         if(setCellPos) cell.setPosition(scrollSize);

         const { x: cellX, y: cellY }: IPosition = cell.adjustPosition(this.position, cell.position!);
         if(!this.isCellInView(cellX, cellY, vpWidth, vpHeight, -scrollSize)) return;

         callback(cell, cellX, cellY);
      });
   }

   setCellsInView() {
      this.cellsInViewList.clear();

      this.cycleGrid(this.cellsList, (cell: CellClass) => {
         this.cellsInViewList.set(cell.id, cell);
      }, true);
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

            callback(rowID, colID, newCell);

            this.cellsList.set(newCell.id, newCell);
         }
      }

      this.setCellsInView();
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


   // Render Tools && HoverCell
   refreshSelect() {

      const selectCtx = this.ctxList[this.layersName.select];
      this.clearCanvas(selectCtx);

      if(!this.hoverCell) {
         this.renderSelectedCell();
         return;
      }

      this.renderHoverCell(this.hoverCell!, this.hoverColor);
      this.renderSelectedCell();
      this.renderTools(selectCtx);
   }

   renderTools(selectCtx: CanvasRenderingContext2D) {

      if(!this.Tool.isActive || !this.selectCell || this.isAssignable || !ViewportClass.assignedCell) return;
      
      const Tool:       ToolClass = this.Tool;
      const vpPosition: IPosition = this.position;
      
      // Use Tools
      Tool.ctx = selectCtx;
      Tool.cellColliderArray = [];
      Tool.use(vpPosition, this.selectCell, this.hoverCell!);


      // Tool collision check
      this.cycleGrid(this.cellsInViewList, (cell: CellClass) => {

         const cellCollider: IPosList = cell.adjustColliderPosition(vpPosition);
         Tool.setCellColliderArray(cell, cellCollider);
      });


      // Render colliding cells
      if(!Tool.isDebug) Tool.cycleColliderArray((cell: CellClass) => {

         const { textureSize, img   }: SpriteClass = this.spriteSheet!;
         const { x: cellX, y: cellY }: IPosition   = cell.adjustPosition(vpPosition, cell.position!);
         const destination           : IViewport   = this.setSpriteDest(cellX, cellY);

         if(!this.isDeleting) {
            this.drawSprite(selectCtx, img, textureSize, destination, ViewportClass.assignedCell!.tileIndex);
            this.Draw.fillRect(selectCtx, destination, Tool.useColor);
         }
         else this.Draw.fillRect(selectCtx, destination, Tool.deleteColor);
      });


      // Display tool selection
      Tool.display();
   }

   renderSelectedCell() {

      if(!this.isAssignable || !ViewportClass.assignedCell) return;
      this.renderHoverCell(ViewportClass.assignedCell, "blue");
   }

   renderHoverCell(
      cell:      CellClass,
      color:     string,
   ) {
      
      const selectCtx = this.ctxList[this.layersName.select];
      const borderSize: number = 8;
      const fillSize:   number = 6;
      const cellSize:   number = this.scrollSize;
      
      if(!cell) return

      const { x: cellX, y: cellY }: IPosition = cell.adjustPosition(this.position, cell.position!)

      const destination = {
         x:      cellX,
         y:      cellY,
         width:  cellSize,
         height: cellSize,
      }

      // Draw HoverCell borders
      this.Draw.strokeRect(
         selectCtx,
         destination,
         "black",
         borderSize
      );
      
      // Draw HoverCell color
      this.Draw.strokeRect(
         selectCtx,
         destination,
         color,
         fillSize
      );
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

      let borderSize = 0.8;
      if(!this.isGridShown) borderSize = 0.1;

      this.cycleGrid(this.cellsInViewList, (cell: CellClass, cellX: number, cellY: number) => {
         
         const destination: IViewport = this.setSpriteDest(cellX, cellY);

         // Draw Grid Color
         this.Draw.strokeRect(
            spriteCtx,
            destination,
            this.gridColor,
            borderSize
         );

         // Draw Sprites
         drawSprite(spriteCtx, tileImg, tileSize, destination, cell.tileIndex);
         // drawOneSprite(spriteCtx, tileImg, tileSize, destination, cell.itemIndex); // ==> TO DO Later
      });
   }

   drawSprite(
      spriteCtx:   CanvasRenderingContext2D,
      tileImg:     HTMLImageElement,
      tileSize:    number,
      destination: IViewport,
      index:       number[],
   ) {
      
      if(index.length === 0) return;
      
      const [spriteY, spriteX]: number[] = index;
      const drawX: number = spriteX *tileSize;
      const drawY: number = spriteY *tileSize;

      const source: IViewport = {
         x: drawX,
         y: drawY,
         width:  tileSize,
         height: tileSize,
      };

      this.Draw.image(
         spriteCtx,
         tileImg,
         source,
         destination,
      );
   }

   setSpriteDest(
      cellX: number,
      cellY: number,
   ) {

      let offsetIn  = 1.5;
      let offsetOut = offsetIn *2;

      if(!this.isGridShown) {
         offsetIn  = 0;
         offsetOut = 0;
      }

      return {
         x: cellX +offsetIn,
         y: cellY +offsetIn,
         width:  this.scrollSize -offsetOut,
         height: this.scrollSize -offsetOut
      } as IViewport;
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
            this.mouseMove(event, viewBound);
         break;

         case eventsList.scroll:
            this.mouseScroll(event);
         break;
         
         case eventsList.leave:
            this.mouseLeave(selectCtx);
         break;
      }
   }

   mouseClick(event: MouseEvent, eventName: string) {

      // ***** Left Click *****
      if(event.which === 1) {
         
         if(eventName === this.mouseEventsList.down) {
            this.assignTile(this.hoverCell);
            
            this.Tool.cycleColliderArray(this.assignTile.bind(this));
            this.Tool.cellColliderArray = [];
         }
         
         if(eventName === this.mouseEventsList.up) {
            // this.storeSchema();
            this.setSelectedCell();
         }
      }

      // ***** Right Click *****
      if(event.which === 3) {
         
         if(eventName === this.mouseEventsList.down) {
            this.isDeleting = true;
            this.setSelectedCell();
            this.Tool.cellColliderArray = [];
         }

         if(eventName === this.mouseEventsList.up) {
            this.isDeleting = false;
            this.selectCell = undefined;
            this.unAssignTile();
            this.deleteTile(this.hoverCell);

            this.Tool.cycleColliderArray(this.deleteTile.bind(this));
            this.Tool.cellColliderArray = [];
         }
      }

      // ***** Scroll Click *****
      if(event.which === 2) {

         if(eventName === this.mouseEventsList.down) {
            this.isScrClicked = true;
            this.scrClickPos  = this.hoverPos;
            this.zoomReset();
         }

         if(eventName === this.mouseEventsList.up) {
            this.isScrClicked = false;
         }
      };
   }

   mouseMove(
      event:     MouseEvent,
      viewBound: DOMRect,
   ) {
      
      const cell = this.getMousePosition(event, viewBound);
      this.moveGrid(cell);
      
      if((!this.isScrClicked || !cell) && cell === this.hoverCell) return;

      this.hoverCell = cell;
      this.refreshSelect();
   }

   mouseScroll(event: WheelEvent) {

      if(!this.hoverCell) return;
      
      const scrollPicth:      number    = this.scrollPicth;
      const { colID, rowID }: CellClass = this.hoverCell!;
      
      // Zoom In
      if(event.deltaY < 0) {
         this.zoom(colID, rowID, scrollPicth, this.scrollMax);
      }
      
      // Zoom Out
      else this.zoom(colID, rowID, -scrollPicth, scrollPicth);

      this.setCellsInView();
      this.refreshSprites();
      this.refreshSelect();
   }

   mouseLeave(ctx: CanvasRenderingContext2D) {
      
      this.clearCanvas(ctx);
      this.renderSelectedCell();
      this.isScrClicked = false;
   }
   

   // Mouse Behaviors
   getMousePosition(event: MouseEvent, viewBound: DOMRect) {

      // Mouse Position
      let { x: mouseX, y: mouseY }: IPosition = this.hoverPos = {
         x: Math.floor(event.clientX +this.position.x -viewBound.left) as number,
         y: Math.floor(event.clientY +this.position.y -viewBound.top ) as number,
      };

      if(this.isScrClicked) {
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
      
      return cell;
   }

   moveGrid(cell: CellClass | undefined) {

      if(!this.isScrClicked || !cell) return;

      const { x: vpX,     y: vpY     }: IViewport = this.position;
      const { x: centerX, y: centerY }: IPosition = this.center;
      const { x: mouseX,  y: mouseY  }: IPosition = this.hoverPos;
      const { x: clickX,  y: clickY  }: IPosition = this.scrClickPos;

      const { x: vpOffsetX, y: vpOffsetY} = {
         x: vpX +centerX,
         y: vpY +centerY,
      }

      const { x: mouseOffsetX, y: mouseOffsetY} = {
         x: mouseX -clickX,
         y: mouseY -clickY,
      }

      this.position.x -= this.moveAxis(vpOffsetX, mouseOffsetX, this.columns)!;
      this.position.y -= this.moveAxis(vpOffsetY, mouseOffsetY, this.rows)!;

      this.setCellsInView();
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

      if(this.newPressKey !== this.keysList.ctrl) return;

      this.isScrClicked = false;
      this.scrollSize   = this.cellSize;

      this.toGridCenter();
      this.setCellsInView();
      this.refreshSprites();
   }

   toGridCenter() {
      this.position.x = Math.floor((this.columns *this.scrollSize -this.position.width)  /2);
      this.position.y = Math.floor((this.rows    *this.scrollSize -this.position.height) /2);
   }

   setSelectedCell() {

      if(!this.hoverCell && !this.isAssignable) return;

      if(!this.selectCell) this.selectCell = this.hoverCell;
      else this.selectCell = undefined;

      this.refreshSelect();
   }

   assignTile(cell: CellClass | undefined) {

      if(!cell) return;
      
      // Change Sheet tile type
      if(ViewportClass.assignedCell !== cell && this.isAssignable) {
         ViewportClass.assignedCell = cell;
      }

      // No tile type selected
      if(!ViewportClass.assignedCell) return;
      
      let   [ hoverX,  hoverY  ] = cell.tileIndex;
      const [ selectX, selectY ] = ViewportClass.assignedCell.tileIndex;

      if(hoverX === selectX && hoverY === selectY) return
      
      cell.tileIndex          = ViewportClass.assignedCell.tileIndex;
      const index: number     = this.getSchemaIndex(cell);
      this.tilesSchema[index] = cell.tileIndex;

      this.refreshSprites();
   }

   unAssignTile() {

      if(this.isAssignable) ViewportClass.assignedCell = undefined;
      this.refreshSelect();
   }

   deleteTile(cell: CellClass | undefined) {
      
      if(this.isAssignable || !cell) return;

      cell.tileIndex = [];
      const index: number     = this.getSchemaIndex(cell);
      this.tilesSchema[index] = cell.tileIndex;

      this.refreshSprites();
   }


   // Keyboard Events
   handlePressedKeys() {
      
      // Combinations
      if(this.oldPressKey !== this.newPressKey) switch(`${this.oldPressKey} + ${this.newPressKey}`) {

         case `${this.keysList.ctrl} + ${this.keysList.sqrPow}`:
            this.Tool.isDebug = !this.Tool.isDebug;
         break;
      }
      
      // Single key
      else switch(this.newPressKey) {

         case this.keysList.escape:
            this.Tool.isActive = !this.Tool.isActive;
            this.Tool.cellColliderArray = [];
         break;

         case this.keysList.sqrPow:
            this.toggleGrid();
         break;

         case this.keysList.short_1:
            this.activateTool();
            this.Tool.isLine = true;
         break;

         case this.keysList.short_2:
            this.activateTool();
            this.Tool.isOutArea = true;
         break;

         case this.keysList.short_3:
            this.activateTool();
            this.Tool.isFillArea = true;
         break;

         case this.keysList.short_4:
            this.activateTool();
            this.Tool.isCircle = true;
         break;
      }
   }

   toggleGrid() {
      
      this.isGridShown = !this.isGridShown;
      this.refreshSprites();
   }

   activateTool() {
      
      if(!ViewportClass.assignedCell) return;

      this.selectCell      = undefined;
      this.Tool.isActive   = true;
      
      this.Tool.isLine     = false;
      this.Tool.isOutArea  = false;
      this.Tool.isFillArea = false;
      this.Tool.isCircle   = false;
   }

}