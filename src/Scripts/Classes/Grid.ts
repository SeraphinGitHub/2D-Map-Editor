
import { CellClass } from "./Cell";

// =====================================================================
// GridClass
// =====================================================================
export class GridClass {

   cellSize:  number;
   columns:   number;
   rows:      number;
   cellsList: Map<string, CellClass>;

   constructor(
      cellSize: number,
      columns:  number,
      rows:     number,
   ) {

      this.cellSize  = cellSize;
      this.columns   = columns;
      this.rows      = rows;
      this.cellsList = new Map<string, CellClass>();
   }

   // init(schema: number[][]) {
   initGrid() {

      for(let col = 0; col < this.columns; col++) {
         for(let row = 0; row < this.rows; row++) {

            const newCell = new CellClass(col, row);
            newCell.setPosition(this.cellSize);
            this.cellsList.set(newCell.id, newCell);
         }
      }
   }
}