
import { IPosition } from "../Utils/Interfaces";

// =====================================================================
// CellClass
// =====================================================================
export class CellClass {

   id: string;
   colID:  number;
   rowID:  number;

   position:  IPosition;
   center:    IPosition;
   tileIndex: number[];
   itemIndex: number[];
   isBlocked: boolean;

   constructor(
      colID: number,
      rowID: number,
   ) {

      this.id    = `${colID}-${rowID}`;
      this.colID = colID;
      this.rowID = rowID;

      this.position = {
         x: 0,
         y: 0,
      };

      this.center = {
         x: 0,
         y: 0,
      };

      this.tileIndex = [];
      this.itemIndex = [];
      this.isBlocked = false;
   }

   setPosition(cellSize: number) {

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
         this.center.x = Math.floor(posX + cellSize *0.5), // centerX
         this.center.y = Math.floor(posY + cellSize *0.5), // centerY
      ];

      return center;
   }
}