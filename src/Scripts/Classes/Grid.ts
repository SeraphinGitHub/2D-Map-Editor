
import { CellClass } from "./Cell";

// =====================================================================
// GridClass
// =====================================================================
export class GridClass {

   cellSize:  number;
   columns:   number;
   rows:      number;

   constructor(
      cellSize:  number,
      columns:   number,
      rows:      number,
   ) {

      this.cellSize  = cellSize;
      this.columns   = columns;
      this.rows      = rows;
   }

   init() {
      
      let cellsList = new Map<string, CellClass>();

      for(let i = 0; i < this.columns; i++) {
         for(let j = 0; j < this.rows; j++) {
            
            const newCell = new CellClass(this.cellSize, i, j);
            cellsList.set(newCell.id, newCell);
         }
      }

      return cellsList;
   }
}