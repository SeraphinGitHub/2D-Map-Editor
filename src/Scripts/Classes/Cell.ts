
import {
   INumber,
   IPosition,
   IViewport,
} from "../Utils/Interfaces";

// =====================================================================
// CellClass
// =====================================================================
export class CellClass {

   id:        string;
   colID:     number;
   rowID:     number;
   size:      number | undefined;

   position:  IPosition;
   center:    IPosition;
   tileIndex: number[];
   itemIndex: number[];
   state:     number;

   constructor(
      colID: number,
      rowID: number,
   ) {

      this.id        = `${colID}-${rowID}`;
      this.colID     = colID;
      this.rowID     = rowID;
      this.size      = undefined;
      
      this.tileIndex = [];
      this.itemIndex = [];
      this.state     = 1;

      this.position  = {
         x: 0,
         y: 0,
      };

      this.center    = {
         x: 0,
         y: 0,
      };
   }

   setPosition(cellSize: number) {
      
      this.size = cellSize;

      let position: number[] = [
         this.position.x = this.colID *cellSize, // posX
         this.position.y = this.rowID *cellSize, // posY
      ];

      let center: number[] = this.setCenter(cellSize, position);

      return [position, center];
   }

   setCenter(
      cellSize:     number,
      [posX, posY]: number[],
   ) {

      let center = [
         this.center.x = Math.floor(posX + cellSize /2), // centerX
         this.center.y = Math.floor(posY + cellSize /2), // centerY
      ];

      return center;
   }

   cellCollider() {

      if(this.size === undefined) return;
      
      return {

         top: {
            x: this.center.x,
            y: this.position.y,
         },

         right: {
            x: this.position.x +this.size,
            y: this.center.y,
         },

         bottom: {
            x: this.center.x,
            y: this.position.y +this.size,
         },

         left: {
            x: this.position.x,
            y: this.center.y,
         },
      }
   }

   line_toLine(
      lineA: INumber,
      lineB: INumber
   ) {

      const vectorA: IPosition = {
         x: lineA.endX -lineA.startX,
         y: lineA.endY -lineA.startY,
      }
   
      const vectorB: IPosition = {
         x: lineB.endX -lineB.startX,
         y: lineB.endY -lineB.startY,
      }
   
      const vectorC: IPosition = {
         x: lineA.startX -lineB.startX,
         y: lineA.startY -lineB.startY,
      }  
   
      let vectorValueA: number = vectorA.x *vectorC.y - vectorA.y *vectorC.x;
      let vectorValueB: number = vectorB.x *vectorC.y - vectorB.y *vectorC.x;
      let denominator:  number = vectorB.y *vectorA.x - vectorB.x *vectorA.y;
      
      const thousandth: number = 1000;
      let rangeA: number = Math.floor(vectorValueA /denominator *thousandth) /thousandth;
      let rangeB: number = Math.floor(vectorValueB /denominator *thousandth) /thousandth;
      
      if(rangeA >= 0 && rangeA <= 1
      && rangeB >= 0 && rangeB <= 1) {
         return true;
      }
      
      return false;
   }

   line_toSquare(line: INumber) {

      let rectCorner = this.cellCollider();

      if(rectCorner === undefined) return;
      
      const rectSide = {

         left: {
            startX: rectCorner.bottom.x,
            startY: rectCorner.bottom.y,
            endX:   rectCorner.top.x,
            endY:   rectCorner.top.y,
         },

         right: {
            startX: rectCorner.right.x,
            startY: rectCorner.right.y,
            endX:   rectCorner.bottom.x,
            endY:   rectCorner.bottom.y,
         },

         top: {
            startX: rectCorner.top.x,
            startY: rectCorner.top.y,
            endX:   rectCorner.right.x,
            endY:   rectCorner.right.y,
         },

         bottom: {
            startX: rectCorner.bottom.x,
            startY: rectCorner.bottom.y,
            endX:   rectCorner.left.x,
            endY:   rectCorner.left.y,
         },
      };

      let topSide:    boolean = this.line_toLine(line, rectSide.top   );
      let rightSide:  boolean = this.line_toLine(line, rectSide.right );
      let bottomSide: boolean = this.line_toLine(line, rectSide.bottom);
      let leftSide:   boolean = this.line_toLine(line, rectSide.left  );
         
      if(leftSide
      || rightSide
      || topSide
      || bottomSide) {
         return true;
      }
      
      return false;
   }


   drawPathLine(ctx: CanvasRenderingContext2D, hoverCell: CellClass, VPposition: IViewport) {

      const { x: vpX, y: vpY } = VPposition;

      ctx.strokeStyle = "yellow";
      ctx.beginPath();

      ctx.moveTo(
         this.center.x -vpX,
         this.center.y -vpY
      );

      ctx.lineTo(
         hoverCell.center.x -vpX,
         hoverCell.center.y -vpY
      );

      ctx.lineWidth = 4;
      ctx.stroke();
   }


   // drawWallCollider(ctx, isDiamond, showWallCol) {

   //    if(showWallCol) {
   //       let rectCorner = this.cellCollider(isDiamond);     

   //       ctx.fillStyle = "red";
   //       ctx.beginPath();
   
   //       ctx.moveTo(rectCorner.top.x, rectCorner.top.y);
   //       ctx.lineTo(rectCorner.right.x, rectCorner.right.y);
   //       ctx.lineTo(rectCorner.bottom.x, rectCorner.bottom.y);
   //       ctx.lineTo(rectCorner.left.x, rectCorner.left.y);
   
   //       ctx.fill();
   //    }
   // }
}