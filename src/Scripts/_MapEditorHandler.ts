
import {
   ISize,
   IDOM,
   ICanvasSpec,
} from "./Utils/Interfaces";

import {
   SHEET_CELL_SIZE,
   SHEET_COLUMNS,
   SHEET_ROWS,
   MAP_CELL_SIZE,
   MAP_COLUMNS,
   MAP_ROWS,
   SCROLL_PITCH,
   MIN_ZOOM,
   MAX_ZOOM,
   MAP_TILES,
   MAP_ITEMS,
   SHEET_TILES,
} from "./Utils/Constantes";

import { ViewportClass } from "./Classes/Viewport";
import { SpriteClass   } from "./Classes/Sprite";
import { GridClass     } from "./Classes/Grid";
import { CellClass     } from "./Classes/Cell";


// ================================================================================================
// Global Variables / Functions
// ================================================================================================
document.body.oncontextmenu = (event: MouseEvent) => {
   event.preventDefault();
   event.stopPropagation();
}



const exportSchema = (schema: number[][]) => {

   /*
      * schema to export
      * COLUMNS
      * ROWS
      * TILE_MAP
      * varName for export (ex: "Tile_Map_2D")
   */
   
   const col = 6;

   let varName = "Tile_Map_2D";
   let resultArray = [];
   
   let schemaString = JSON.stringify(schema);
   
   let rightSplit   = schemaString.split("[[")[1];
   let leftSplit    = rightSplit.split("]]")[0];
   let schemaIndex  = leftSplit.split("],[");

   for(let i = 0; i < schemaIndex.length; i++) {

      let index = schemaIndex[i];
      let checkedIndex;

      if(index === "") checkedIndex = "   ";
      else checkedIndex = index;

      if((i +1) % col === 0 && i !== schemaIndex.length -1) {
         resultArray.push(`${checkedIndex}],\n   [`);
      }
      
      else if(i === schemaIndex.length -1) {
         resultArray.push(`${checkedIndex}`);
      }

      else resultArray.push(`${checkedIndex}],  [`);
   }

   let result = resultArray.join("");
   let exportString = `const ${varName} = [\n   [${result}],\n];`

   console.log(exportString); // ******************************************************
}

// **** TO DO ****
const createGrid = (
   tileSchema: number[][],
   itemSchema: number[][]
) => {

   let cellsList: Map<string, CellClass> = new Map<string, CellClass>();

   for(let col = 0; col < MAP_COLUMNS; col++) {
      for(let row = 0; row < MAP_ROWS; row++) {
         
         let index: number   = row *MAP_COLUMNS +col;
         let tile:  number[] = tileSchema[index];
         let item:  number[] = itemSchema[index];

         const newCell = new CellClass(col, row);

         if(tile) newCell.tileIndex = tile;
         if(item) newCell.tileIndex = item;

         newCell.setPosition(MAP_CELL_SIZE);
         cellsList.set(newCell.id, newCell);
      }
   }

   return cellsList;
}



// ================================================================================================
// Exports
// ================================================================================================
const methods = {
   
   init(
      DOM:        IDOM,
      canvasSpec: ICanvasSpec,
      worldSize:  ISize,
   ) {

      const TileSprite: SpriteClass = new SpriteClass(200, "./tiles_sheet.png");
      
      const SheetVP = new ViewportClass(
         SHEET_CELL_SIZE,
         SHEET_COLUMNS,
         SHEET_ROWS,
         SHEET_TILES,
         TileSprite,
         DOM.sheetVP,
         canvasSpec.sheet,
      );
      SheetVP.init();

      const MapVP = new ViewportClass(
         MAP_CELL_SIZE,
         MAP_COLUMNS,
         MAP_ROWS,
         MAP_TILES,
         TileSprite,
         DOM.mapVP,
         canvasSpec.map,
      );
      MapVP.init();
   },
}

export default methods;
