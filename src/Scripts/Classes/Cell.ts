
import { IPosition } from "../Utils/Interfaces";

// =====================================================================
// CellClass
// =====================================================================
export class CellClass {

   id: string;
   col:  number;
   row:  number;

   position:  IPosition;
   center:    IPosition;
   tileIndex: number[];
   itemIndex: number[];
   isBlocked: boolean;

   constructor(
      col: number,
      row: number,
   ) {

      this.id  = `${col}-${row}`;
      this.col = col;
      this.row = row;

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

      let indexPos: number[] = [this.col, this.row];

      let position: number[] = [
         this.position.x = indexPos[0] *cellSize, // posX
         this.position.y = indexPos[1] *cellSize, // posY
      ];

      let center: number[] = this.setCenter(cellSize, position);

      return [indexPos, position, center];
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