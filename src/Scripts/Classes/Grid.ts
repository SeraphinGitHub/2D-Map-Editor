
import { CellClass } from "./Cell";

// =====================================================================
// GridClass
// =====================================================================
export class GridClass {

   Gd_cellSize:  number;
   Gd_columns:   number;
   Gd_rows:      number;
   Gd_cellsList: Map<string, CellClass>;

   constructor(
      cellSize: number,
      columns:  number,
      rows:     number,
   ) {

      this.Gd_cellSize  = cellSize;
      this.Gd_columns   = columns;
      this.Gd_rows      = rows;
      this.Gd_cellsList = new Map<string, CellClass>();
   }

   // init(schema: number[][]) {
   initGrid() {

      for(let col = 0; col < this.Gd_columns; col++) {
         for(let row = 0; row < this.Gd_rows; row++) {

            const newCell = new CellClass(col, row);
            newCell.setPosition(this.Gd_cellSize);
            this.Gd_cellsList.set(newCell.id, newCell);
         }
      }
   }
}