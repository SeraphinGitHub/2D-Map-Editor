
import {
   INumber,
   IPosition,
   IPosList,
} from "../Utils/Interfaces";

import { CellClass      } from "./Cell";
import { CollisionClass } from "./Collision";
import { DrawClass      } from "./Draw";

// =====================================================================
// Tool Class
// =====================================================================
export class ToolClass {

   // Classes
   private Collision:   CollisionClass = new CollisionClass();
   private Draw:        DrawClass      = new DrawClass();

   cellColliderArray:   CellClass[] = [];
   raycast:             INumber = {};
   
   // Booleans
   isActive:      boolean = false;
   isLine:        boolean = false;
   isOutArea:     boolean = false;
   isFillArea:    boolean = false;
   isCircle:      boolean = false;

   // Numbers
   lineSize:      number = 4;
   pointSize:     number = 6;
   
   // Strings
   lineColor:     string = "red";
   pointColor:    string = "blue";
   useColor:      string = "rgba( 0,  0,  0, 0.5)";
   deleteColor:   string = "rgba(50, 50, 50, 0.7)";


   setCellColliderArray(
      cell: CellClass,
      cellCollider: IPosList,
   ) {
      // **** DEBUG ****
      // this.Draw.diamond(selectCtx, cellCollider, "rgba(100, 100, 100, 0.4)");
      
      if(!this.isLine
      || !this.raycast
      || !this.Collision.line_toSquare(this.raycast, cellCollider)
      ) return;

      this.cellColliderArray.push(cell);

      // **** DEBUG ****
      // this.Draw.diamond(selectCtx, cellCollider, "blue");
   }

   cycleColliderArray(callback: Function) {
      
      this.cellColliderArray.forEach((cell: CellClass) => callback(cell));
   }

   display(selectCtx: CanvasRenderingContext2D) {

      if(this.isLine) {
         const { startX, startY, endX, endY }: INumber = this.raycast;
         const startPos: IPosition = { x: startX, y: startY };
         const endPos:   IPosition = { x: endX,   y: endY   };

         this.Draw.line(selectCtx, startPos, endPos, this.lineColor, this.lineSize);
         this.Draw.circle(selectCtx, startPos, this.pointSize, this.pointColor);
         this.Draw.circle(selectCtx, endPos,   this.pointSize, this.pointColor);
      }
   }

   drawLine(
      vpPosition: IPosition,
      startCell:  CellClass,
      endCell:    CellClass,
   ) {

      if(!this.isLine) return;
      
      const startCenter: IPosition = startCell.adjustPosition(vpPosition, startCell.center!);
      const endCenter:   IPosition = endCell.adjustPosition(vpPosition, endCell.center!);

      const { x: startX, y: startY }: IPosition = startCenter;
      const { x: endX,   y: endY   }: IPosition = endCenter;

      this.raycast = {
         startX,
         startY,
         endX,
         endY,
      }
   }
   
}