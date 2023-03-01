
import {
   IPosition,
   IPosList,
   INumber,
} from "../Utils/Interfaces";

import { CellClass      } from "./Cell";
import { CollisionClass } from "./Collision";
import { DrawClass      } from "./Draw";

// =====================================================================
// Tool Class
// =====================================================================
export class ToolClass {

   ctx: CanvasRenderingContext2D | undefined = undefined;

   // Classes
   private Collision:  CollisionClass = new CollisionClass();
   private Draw:       DrawClass      = new DrawClass();
   
   vpPosition: IPosition | undefined  = undefined;
   startCell:  CellClass | undefined  = undefined;
   endCell:    CellClass | undefined  = undefined;

   cellColliderArray: CellClass[] = [];
   raycast:           INumber     = {};
   areaPointList:     IPosList    = {};

   
   // Booleans
   isActive:      boolean = false;
   isDebug:       boolean = false;
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
   debCollColor:  string = "rgba(100, 100, 100, 0.4)";
   debCellColor:  string = "blue";


   use(
      vpPosition: IPosition,
      startCell:  CellClass,
      endCell:    CellClass,
   ) {

      this.vpPosition = vpPosition;
      this.startCell  = startCell;
      this.endCell    = endCell;

      this.useLine();
      this.useOutArea();
   }

   display() {

      this.displayLine();
      this.displayOutArea();
   }


   // Collider Array
   setCellColliderArray(
      cell: CellClass,
      cellCollider: IPosList,
   ) {
      if(this.isDebug) this.Draw.diamond(this.ctx!, cellCollider, this.debCollColor); // **** DEBUG ****
      
      if(!this.lineCollideCell   (cellCollider)
      && !this.outAreaCollideCell(cellCollider)) {
         return;
      }
      
      this.cellColliderArray.push(cell);
      
      if(this.isDebug) this.Draw.diamond(this.ctx!, cellCollider, this.debCellColor); // **** DEBUG ****
   }

   cycleColliderArray(callback: Function) {
      
      this.cellColliderArray.forEach((cell: CellClass) => callback(cell));
   }


   // Draw Functions
   drawLine(
      startPos: IPosition,
      endPos:   IPosition
   ) {
      this.Draw.line(this.ctx!, startPos, endPos, this.lineColor, this.lineSize);
   }

   drawCircle(position: IPosition) {
      this.Draw.circle(this.ctx!, position, this.pointSize, this.pointColor);
   }


   // Line
   useLine() {

      if(!this.isLine) return;
      
      const startCenter: IPosition = this.startCell!.adjustPosition(this.vpPosition!, this.startCell!.center!);
      const endCenter:   IPosition = this.endCell!.adjustPosition(this.vpPosition!, this.endCell!.center!);

      const { x: startX, y: startY }: IPosition = startCenter;
      const { x: endX,   y: endY   }: IPosition = endCenter;

      this.raycast = {
         startX,
         startY,
         endX,
         endY,
      }
   }

   lineCollideCell(cellCollider: IPosList) {

      if(!this.isLine
      || !this.raycast
      || !this.Collision.line_toSquare(this.raycast, cellCollider)) {
         return false;
      }

      return true;
   }

   displayLine() {
      
      if(!this.isLine) return;
      
      const { startX, startY, endX, endY }: INumber = this.raycast;
      const startPos: IPosition = { x: startX, y: startY };
      const endPos:   IPosition = { x: endX,   y: endY   };

      this.drawLine(startPos, endPos);
      this.drawCircle(startPos);
      this.drawCircle(endPos);
   }


   // Out Area
   useOutArea() {

      if(!this.isOutArea) return;
      
      const startCenter: IPosition = this.startCell!.adjustPosition(this.vpPosition!, this.startCell!.center!);
      const endCenter:   IPosition = this.endCell!.adjustPosition(this.vpPosition!, this.endCell!.center!);

      const { x: startCenterX, y: startCenterY }: IPosition = startCenter;
      const { x: endCenterX,   y: endCenterY   }: IPosition = endCenter;

      this.areaPointList = {

         top: {
            x: startCenterX,
            y: startCenterY,
         },

         right: {
            x: endCenterX,
            y: startCenterY,
         },

         bottom: {
            x: endCenterX,
            y: endCenterY,
         },

         left: {
            x: startCenterX,
            y: endCenterY,
         },
      }
   }

   outAreaCollideCell(cellCollider: IPosList) {

      if(!this.isOutArea || !this.areaPointList) return;

      const { x: topX,    y: topY    }: IPosition = this.areaPointList.top;
      const { x: rightX,  y: rightY  }: IPosition = this.areaPointList.right;
      const { x: bottomX, y: bottomY }: IPosition = this.areaPointList.bottom;
      const { x: leftX,   y: leftY   }: IPosition = this.areaPointList.left;
      
      const topSide = {
         startX: topX,
         startY: topY,
         endX:   rightX,
         endY:   rightY,
      }

      const rightSide = {
         startX: rightX,
         startY: rightY,
         endX:   bottomX,
         endY:   bottomY,
      }

      const bottomSide = {
         startX: bottomX,
         startY: bottomY,
         endX:   leftX,
         endY:   leftY,
      }

      const leftSide = {
         startX: leftX,
         startY: leftY,
         endX:   topX,
         endY:   topY,
      }

      if(!this.Collision.line_toSquare(topSide,    cellCollider)
      && !this.Collision.line_toSquare(rightSide,  cellCollider)
      && !this.Collision.line_toSquare(bottomSide, cellCollider)
      && !this.Collision.line_toSquare(leftSide,   cellCollider)) {
         return false;
      };

      return true;
   }

   displayOutArea() {

      if(!this.isOutArea) return;

      const { top, right, bottom, left }: IPosList = this.areaPointList;

      this.drawLine(top,    right );
      this.drawLine(right,  bottom);
      this.drawLine(bottom, left  );
      this.drawLine(left,   top   );

      this.drawCircle(top   );
      this.drawCircle(right );
      this.drawCircle(bottom);
      this.drawCircle(left  );
   }
   
}