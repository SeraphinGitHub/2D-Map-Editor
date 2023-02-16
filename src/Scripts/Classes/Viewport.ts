
import {
   ICtx,
   ICanvas,
   ICanvasLayers,
   IDrawImage,
   IStrokeRect,
   IPosition,
   IString,
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

   htmlVP:     HTMLElement;
   layers:     ICanvasLayers;
   ctxList:    ICtx;
   layersName: IString;

   constructor(
      cellSize: number,
      columns:  number,
      rows:     number,
      htmlViewport: HTMLElement,
      canvasType:   ICanvas,
   ) {

      super(cellSize, columns, rows);
      
      this.x      = 0;
      this.y      = 0;
      this.width  = canvasType.width;
      this.height = canvasType.height;

      this.htmlVP   = htmlViewport;
      this.layers   = {};
      this.ctxList  = {};
      
      this.layersName  = {
         sprite: canvasType.sprite,
         select: canvasType.select,
      };
   }

   init() {

      this.initGrid();

      // Set Canvas && sizes
      for(let i in this.layersName) {
         let name = this.layersName[i];

         this.layers[name] = this.htmlVP.querySelector(`.canvas-${name}`) as HTMLCanvasElement;
         
         let canvas = this.layers[name];
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
   
   withinTheGrid(
      mousePos: IPosition,
      callback: Function
   ) {
      
      if(mousePos
      && mousePos.x > this.x
      && mousePos.x < this.width
      && mousePos.y > this.y
      && mousePos.y < this.height) {
   
         callback();
      }
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

   renderGrid(
      ctx:       CanvasRenderingContext2D,
      sprite:    SpriteClass,
      schema:    number[][],
      gridColor: string,
   ) {

      const tileSize = sprite.size;
      const tileImg  = sprite.img;
      
      this.cycleGrid((cell: CellClass) => {
   
         const [[col, row], [x, y]]: number[][] = cell.setPosition(this.cellSize);
   
         let spriteIndex: number = row *this.columns +col;
         let tile: number[] = schema[spriteIndex];
         
         const destination = {
            // dX: x -viewport.x, // ==> ScrollCam
            // dY: y -viewport.y, // ==> ScrollCam
            dX: x,
            dY: y,
            dW: this.cellSize,
            dH: this.cellSize,
         }
   
         if(tile) {
            let [spriteY, spriteX]: number[] = tile;
            let drawX: number = spriteX *tileSize;
            let drawY: number = spriteY *tileSize;
            
            this.drawImage({
               ctx,
               img: tileImg,
      
               sX: drawX,
               sY: drawY,
               sW: tileSize,
               sH: tileSize,
      
               ...destination,
            });
         }
   
         this.strokeRect({
            ctx,
            ...destination,
         }, gridColor, 2);
      });
   }
   
   refreshSprite(
      sprite: SpriteClass,
      schema: number[][],
      color:  string,
   ) {
      let ctx = this.ctxList[ this.layersName.sprite ];

      this.clearCanvas(ctx);
      this.renderGrid(
         ctx,
         sprite,
         schema,
         color,
      );
   }

   refreshSelect() {

      // clearCanvas("map-select");

      // strokeRect({
      //    ctx: ctx,
      //    dX: hoverCell.position.x,
      //    dY: hoverCell.position.y,
      //    dW: CellSize,
      //    dH: CellSize,
      // }, "blue", 4);
   }
}