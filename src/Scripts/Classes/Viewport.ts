
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
import { CollisionClass } from "./Collision";
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
   private Collision: CollisionClass = new CollisionClass();
   private Tool:      ToolClass      = new ToolClass();
   private Draw:      DrawClass      = new DrawClass();

   // Statics
   static assignedCell: CellClass | undefined = undefined;

   // Positions
   position:    IViewport;
   center:      IPosition;
   scrClickPos: IPosition = { x:0, y:0 };
   hoverPos:    IPosition = { x:0, y:0 };

   // Cells
   hoverCell:   CellClass | undefined = undefined;
   clickCell:   CellClass | undefined = undefined;

   // Lists
   cellsList:   Map<string, CellClass> = new Map<string, CellClass>();
   layersName:  IString;
   
   // Strings
   schemaKey:   string;
   hoverColor:  string;
   pressedKey:  string | undefined = undefined;

   // Numbers
   cellSize:    number;
   columns:     number;
   rows:        number;
   scrollSize:  number;
   scrollPicth: number = 20;
   scrollMax:   number = 350;

   // Schemas
   tilesSchema: number[][] = [];
   itemsSchema: number[][] = [];

   // Canvas properties
   htmlVP:      HTMLElement;
   spriteSheet: SpriteClass | undefined = undefined;
   layers:      ICanvas = {};
   ctxList:     ICtx    = {};

   // Booleans
   isAssignable:    boolean;
   isClicked:       boolean = false;
   isGridShown:     boolean = true;

   // Mouse & Keyboard Lists
   mouseEventsList: IString = {
      down:   "mousedown",
      up:     "mouseup",
      move:   "mousemove",
      scroll: "wheel",
      leave:  "mouseleave",
   };

   keysList:        IString = {
      ctrl:   "Control",
      shift:  "Shift",
      enter:  "Enter",
      escape: "Escape",
      sqrPow: "²",
      bnd_1:  "&",
      bnd_2:  "é",
      bnd_3:  "\"",
      bnd_4:  "'",
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

   init() {

      this.initCanvas();
      this.initGrid();
      this.initMouse();
      this.refreshSprites();

      // ***** Tempory *****
      // this.storeSchema();
   }

   adjustPosition(paramPos: IPosition) {

      const { x: vpX,    y: vpY    }: IPosition = this.position;
      const { x: paramX, y: paramY }: IPosition = paramPos;

      return {
         x: paramX -vpX,
         y: paramY -vpY,
      }
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
         height: vpHeight,
         width:  vpWidth,
      }: IViewport = this.position;

      const borderColor = "turquoise";
      const cellSize    = this.scrollSize;

      let offsetIn      = 1.5;
      let offsetOut     = offsetIn *2;
      let borderSize    = 0.8;

      // Hide Grid
      if(!this.isGridShown) {
         offsetIn   = 0;
         offsetOut  = 0;
         borderSize = 0.1;
      }

      this.cycleGrid((cell: CellClass) => {
         const { x: cellX,   y: cellY }: IPosition = this.adjustPosition(cell.position!);
         
         if(!this.isCellInView(cellX, cellY, vpWidth, vpHeight, -cellSize)) return;
         
         const destination = {
            x: cellX +offsetIn,
            y: cellY +offsetIn,
            width:  cellSize -offsetOut,
            height: cellSize -offsetOut
         }

         // Draw Grid Color
         this.Draw.strokeRect(
            spriteCtx,
            destination,
            borderColor,
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


   // Render HoverCell
   refreshHoverCell(
      selectCtx: CanvasRenderingContext2D,
   ) {

      this.clearCanvas(selectCtx);
      this.renderSelectedCell(selectCtx);

      if(!this.hoverCell) return;
      this.renderHoverCell(selectCtx, this.hoverCell!, this.hoverColor);
      
      if(!this.Tool.isActive || !this.clickCell || this.isAssignable) return;
      
      this.Tool.hoverCellsIDArray = [];
      this.Tool.drawLine(selectCtx, this.clickCell, this.hoverCell, this.adjustPosition.bind(this));

      


      const {
         height: vpHeight,
         width:  vpWidth,
      }: IViewport = this.position;

      this.cycleGrid((cell: CellClass) => {

         const { x: cellX,   y: cellY     }: IPosition = this.adjustPosition(cell.position!);
         const { top, right, bottom, left }: IPosList  = cell.collider!;

         const cellCollider: IPosList = {
            top:    this.adjustPosition(top),
            right:  this.adjustPosition(right),
            bottom: this.adjustPosition(bottom),
            left:   this.adjustPosition(left),
         }

         if(!this.isCellInView(cellX, cellY, vpWidth, vpHeight, -this.scrollSize)) return;

         // this.Draw.diamond(selectCtx, cellCollider, "rgba(100, 100, 100, 0.4)");
         
         if(!this.Tool.raycast || !this.Collision.line_toSquare(this.Tool.raycast, cellCollider)) return;
         // this.Draw.diamond(selectCtx, cellCollider, "blue");
         this.Tool.hoverCellsIDArray.push(cell);
      });

      this.Tool.hoverCellsIDArray.forEach(cell => {

         const { top, right, bottom, left }: IPosList  = cell!.collider!;

         const cellCollider: IPosList = {
            top:    this.adjustPosition(top),
            right:  this.adjustPosition(right),
            bottom: this.adjustPosition(bottom),
            left:   this.adjustPosition(left),
         }
         
         this.Draw.diamond(selectCtx, cellCollider, "blue");
      });
   }

   renderSelectedCell(ctx: CanvasRenderingContext2D) {

      if(!this.isAssignable || !ViewportClass.assignedCell) return;
      this.renderHoverCell(ctx, ViewportClass.assignedCell, "blue");
   }

   renderHoverCell(
      selectCtx: CanvasRenderingContext2D,
      cell:      CellClass,
      color:     string,
   ) {
      
      const borderSize: number = 8;
      const fillSize:   number = 6;
      const cellSize:   number = this.scrollSize;
      
      if(!cell) return

      const { x: cellX, y: cellY }: IPosition = this.adjustPosition(cell.position!)

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


   // Mouse Behaviors
   mouseClick(event: MouseEvent, eventName: string) {

      // ***** Left Click *****
      if(event.which === 1) {

         if(eventName === this.mouseEventsList.down) {
            // this.storeSchema();
            this.assignTile();
            this.setClickCell();
         }
      }

      // ***** Right Click *****
      if(event.which === 3) {

         if(eventName === this.mouseEventsList.down) {
            this.clickCell = undefined;
            if(!this.Tool.isActive) this.deleteTile();
         }
         
         if(eventName === this.mouseEventsList.up) {
            this.Tool.isActive = false;
         }
      }

      // ***** Scroll Click *****
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

      if(!this.hoverCell) return;
      
      const scrollPicth:      number    = this.scrollPicth;
      const { colID, rowID }: CellClass = this.hoverCell!;
      
      // Zoom In
      if(event.deltaY < 0) {
         this.zoom(colID, rowID, scrollPicth, this.scrollMax);
      }
      
      // Zoom Out
      else this.zoom(colID, rowID, -scrollPicth, scrollPicth);

      this.cycleGrid((cell: CellClass) => cell.setPosition(this.scrollSize));

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

      if(!this.hoverCell) return;
      this.clickCell = this.hoverCell;
   }

   moveGrid() {

      if(!this.isClicked || !this.hoverCell) return;

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
      
      this.Tool.updateRaycast(this.position);

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
      if(!hoverCell) return;
      
      if(ViewportClass.assignedCell !== hoverCell && this.isAssignable) {
         ViewportClass.assignedCell = hoverCell;
      }

      if(!ViewportClass.assignedCell) return;
      
      let   [ hoverX,  hoverY  ] = hoverCell.tileIndex;
      const [ selectX, selectY ] = ViewportClass.assignedCell.tileIndex;

      if(hoverX === selectX && hoverY === selectY) return
      
      hoverCell.tileIndex     = ViewportClass.assignedCell.tileIndex;
      const index: number     = this.getSchemaIndex(hoverCell);
      this.tilesSchema[index] = hoverCell.tileIndex;
      
      this.refreshSprites();
   }

   deleteTile() {

      if(!this.hoverCell) return;
      this.hoverCell.tileIndex = [];
      this.refreshSprites();
   }


   // Keyboard Events
   handlePressedKeys() {
      switch(this.pressedKey) {

         case this.keysList.escape:
            this.Tool.isActive = !this.Tool.isActive;
         break;

         case this.keysList.sqrPow:
            this.toggleGrid();
         break;

         case this.keysList.bnd_1:
            this.clickCell     = undefined;
            this.Tool.isActive = !this.Tool.isActive;
            this.Tool.isLine   = true;
         break;

         case this.keysList.bnd_2:
            this.clickCell      = undefined;
            this.Tool.isActive  = !this.Tool.isActive;
            this.Tool.isOutArea = true;
         break;

         case this.keysList.bnd_3:
            this.clickCell       = undefined;
            this.Tool.isActive   = !this.Tool.isActive;
            this.Tool.isFillArea = true;
         break;

         case this.keysList.bnd_4:
            this.clickCell     = undefined;
            this.Tool.isActive = !this.Tool.isActive;
            this.Tool.isCircle = true;
         break;
      }
   }

   toggleGrid() {
      
      this.isGridShown = !this.isGridShown;
      this.refreshSprites();
   }
}