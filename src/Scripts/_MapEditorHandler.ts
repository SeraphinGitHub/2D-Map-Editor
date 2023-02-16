
import {
   IPosition,
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
// Global Variables
// ================================================================================================
document.body.oncontextmenu = (event: MouseEvent) => {
   event.preventDefault();
   event.stopPropagation();
}

let CellSize:      number = MAP_CELL_SIZE;
let TileSprite:    SpriteClass;


// ================================================================================================
// Mouse Events
// ================================================================================================
const getMousePos = (event: MouseEvent) => {

   // let screenBound = CanvasLayers["map-select"].getBoundingClientRect() as DOMRect;

   // return {
   //    x: Math.floor(event.clientX -screenBound.left) as number,
   //    y: Math.floor(event.clientY -screenBound.top ) as number,
   // };
}

const getHoverCell = (mousePos: IPosition) => {  // **** TO DO (try recast) ****

   // const cellPos: IPosition = {
   //    x: mousePos.x - (mousePos.x % CellSize),
   //    y: mousePos.y - (mousePos.y % CellSize),
   // };

   // let cellID: string = `${cellPos.x /CellSize}-${cellPos.y /CellSize}`;
   // let cell: CellClass | undefined = MapGridList.get(cellID);
   
   // if(cell) return cell;
}

const mouse_Move = (event: MouseEvent) => {
   
   // let ctx = Ctx["map-select"];
   // clearCanvas("map-select");

   // let mousePos: IPosition = getMousePos(event);
   
   // withinTheGrid(mousePos, () => {
   //    let hoverCell: CellClass | undefined = getHoverCell(mousePos);
      
   //    if(hoverCell) {
         
   //       strokeRect({
   //          ctx: ctx,
   //          dX: hoverCell.position.x,
   //          dY: hoverCell.position.y,
   //          dW: CellSize,
   //          dH: CellSize,
   //       }, "blue", 4);
   //    }
   // });
}

const mouse_Scroll = (event: WheelEvent, refreshMap: Function) => {
   
   // // Zoom
   // if(event.deltaY < 0) {
   //    if(CellSize < MAX_ZOOM) CellSize += SCROLL_PITCH;
   // }

   // // Unzoom
   // else if(CellSize > MIN_ZOOM) CellSize -= SCROLL_PITCH;
   
   // refreshMap();
}

const mouse_Click = (event: MouseEvent) => {

   // if(event.which === 2) {
   //    CellSize = MAP_CELL_SIZE;
   //    refreshMap();
   // }
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

      TileSprite = new SpriteClass(200, "./tiles_sheet.png");
      
      const MapVP = new ViewportClass(
         MAP_CELL_SIZE,
         MAP_COLUMNS,
         MAP_ROWS,
         DOM.mapVP,
         canvasSpec.map
      );
      MapVP.init();
      
      const SheetVP = new ViewportClass(
         SHEET_CELL_SIZE,
         SHEET_COLUMNS,
         SHEET_ROWS,
         DOM.sheetVP,
         canvasSpec.sheet
      );
      SheetVP.init();

      const refresh = {
         mapSprite:   () => MapVP.refreshSprite  (TileSprite, MAP_TILES, "red"),
         mapSelect:   () => {},
         sheetSprite: () => SheetVP.refreshSprite(TileSprite, SHEET_TILES, "yellow"),
         sheetSelect: () => {},
      }
      
      refresh.mapSprite();
      refresh.sheetSprite();

      // **** TO DO (try recast) ****
      // MapGridList   = new GridClass(MAP_CELL_SIZE, MAP_COLUMNS, MAP_ROWS).init(  TILES_MAP  );
      // SheetGridList = new GridClass(SHEET_CELL_SIZE, SHEET_COLUMNS, SHEET_ROWS).init(  TILES_MAP  );
      // **** TO DO (try recast) ****

      window.addEventListener("wheel",     (event) => mouse_Scroll(event, refresh.mapSprite));
      window.addEventListener("mousedown", (event) => mouse_Click (event));
      window.addEventListener("mousemove", (event) => mouse_Move  (event));
   },
}

export default methods;
