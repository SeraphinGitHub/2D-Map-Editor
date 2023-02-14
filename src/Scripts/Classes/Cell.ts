
import { IPosition } from "../../Utils/Interfaces";

// =====================================================================
// CellClass
// =====================================================================
export class CellClass {

   id:   string;
   size: number;

   i: number;
   j: number;
   x: number;
   y: number;

   center:    IPosition;
   tileIndex: number[];
   itemIndex: number[];
   isBlocked: boolean;

   constructor(
      size: number,
      i: number,
      j: number,
   ) {

      // Need to recalculate position
      // and center on zoom and unzoom

      this.id   = `${i}-${j}`;
      this.size = size;
      
      this.i = i ;
      this.j = j ;
      this.x = i *this.size;
      this.y = j *this.size;
      
      this.center = {
         x: Math.floor(this.x + this.size/2),
         y: Math.floor(this.y + this.size/2),
      };
      
      this.tileIndex = [0, 0];
      this.itemIndex = [0, 0];
      this.isBlocked = false;
   }
}