
import {
   INumber,
   IPosition,
} from "../Utils/Interfaces";

import { CellClass      } from "./Cell";
import { CollisionClass } from "./Collision";
import { DrawClass      } from "./Draw";

// =====================================================================
// Tool Class
// =====================================================================
export class ToolClass {

   // Classes
   private Collision: CollisionClass = new CollisionClass();
   private Draw:      DrawClass      = new DrawClass();

   hoverCellsIDArray: CellClass[] = [];
   raycast:    INumber = {};
   
   isActive:   boolean = false;
   isLine:     boolean = false;
   isOutArea:  boolean = false;
   isFillArea: boolean = false;
   isCircle:   boolean = false;

   updateRaycast(vpPosition: IPosition) {

      const { x: vpX, y: vpY             }: IPosition = vpPosition;
      const { startX, startY, endX, endY }: INumber   = this.raycast;
      console.log(this.raycast); // ******************************************************

      this.raycast = {
         startX: startX -vpX,
         startY: startY -vpY,
         endX:   endX   -vpX,
         endY:   endY   -vpY,
      }

      console.log(this.raycast); // ******************************************************
   }

   drawLine(
      selectCtx: CanvasRenderingContext2D,
      startCell: CellClass,
      endCell:   CellClass,
      adjustPos: Function,
   ) {

      if(!this.isLine) return;
      
      let startCenter;
      let endCenter;

      const { x: startX, y: startY }: IPosition = startCenter = startCell.center!;
      const { x: endX,   y: endY   }: IPosition = endCenter   = endCell.center!;

      this.raycast = {
         startX,
         startY,
         endX,
         endY,
      }

      const startPos: IPosition = adjustPos(startCenter);
      const endPos:   IPosition = adjustPos(endCenter);

      // if(!this.Collision.line_toSquare(raycast, hoverCell!.collider!) || hoverCell === startCell) end

      // this.tempCellIDArray.push(hoverCell!.id); // ***********


      this.Draw.line(selectCtx, startPos, endPos, "red", 4);
   }
}