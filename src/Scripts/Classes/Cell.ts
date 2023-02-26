
import {
   IPosList,
   IPosition,
} from "../Utils/Interfaces";

// =====================================================================
// CellClass
// =====================================================================
export class CellClass {

   id:        string;
   colID:     number;
   rowID:     number;
   
   size:      number    | undefined = undefined;
   position:  IPosition | undefined = undefined;
   center:    IPosition | undefined = undefined;
   collider:  IPosList  | undefined = undefined;
   
   tileIndex: number[] = [];
   itemIndex: number[] = [];
   state:     number   = 1;

   constructor(
      colID: number,
      rowID: number,
   ) {

      this.id        = `${colID}-${rowID}`;
      this.colID     = colID;
      this.rowID     = rowID;
   }

   // Properties
   setPosition(cellSize: number) {
      
      this.size = cellSize;

      let position;
      let center;

      const { x: posX, y: posY }: IPosition = position = {
         x: this.colID *cellSize,
         y: this.rowID *cellSize,
      }

      const { x: centerX, y: centerY }: IPosition = center = {
         x: Math.floor(posX + cellSize /2),
         y: Math.floor(posY + cellSize /2),
      }

      const collider: IPosList = {

         top: {
            x: centerX,
            y: posY,
         },

         right: {
            x: posX +cellSize,
            y: centerY,
         },

         bottom: {
            x: centerX,
            y: posY +cellSize,
         },

         left: {
            x: posX,
            y: centerY,
         },
      }

      this.position = position;
      this.center   = center;
      this.collider = collider;
   }
}