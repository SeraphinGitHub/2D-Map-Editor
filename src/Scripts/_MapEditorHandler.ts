
import {
   IDOM,
} from "./Utils/Interfaces";

import { saveAs        } from "file-saver";
import { SpriteClass   } from "./Classes/Sprite";
import { ViewportClass } from "./Classes/Viewport";

/** Mouse Binds
 * 
 * Left click:   Set tile
 * Right click:  Delete tile / Disactivate current tools
 * Scroll click: Move grid
 * Scroll front: Zoom In
 * Scroll back:  Zoom Out
 * 
*/

/** Keyboard Binds
 * 
 * Escape: Disactivate tools
 * ²:      Toggle grid
 * 1 (&):  Activ / Disactiv => Tool draw line
 * 2 (é):  Activ / Disactiv => Tool draw outline square
 * 3 (""): Activ / Disactiv => Tool draw filled square
 * 4 ('):  Activ / Disactiv =>Tool draw circle
 * 
*/

/** Combinations
 * 
 * Ctrl + Scroll Click: Reset zoom + center grid
 * 
*/


// ================================================================================================
// Global Variables / Functions
// ================================================================================================
const mapKey:      string = "storedMap";
const sheetKey:    string = "storedSheet";
let exportVarName: string = "TileMapSchema";
let pressedKey:    string | undefined = undefined;


document.body.oncontextmenu = (event: MouseEvent) => {
   event.preventDefault();
   event.stopPropagation();
}

const formatToExport = (
   mapColumns: number,
   schema:     number[][]
) => {
   
   let resultArray = [];
   
   const schemaString = JSON.stringify(schema);
   const rightSplit   = schemaString.split("[[")[1];
   const leftSplit    = rightSplit.split("]]")[0];
   const schemaIndex  = leftSplit.split("],[");

   for(let i = 0; i < schemaIndex.length; i++) {

      let index = schemaIndex[i];
      let checkedIndex;

      if(index === "") checkedIndex = "   ";
      else checkedIndex = index;

      if((i +1) % mapColumns === 0 && i !== schemaIndex.length -1) {
         resultArray.push(`${checkedIndex}],\n   [`);
      }

      else if(i === schemaIndex.length -1) {
         resultArray.push(`${checkedIndex}`);
      }

      else resultArray.push(`${checkedIndex}],  [`);
   }

   const result       = resultArray.join("");
   const exportString = `const ${exportVarName} = [\n   [${result}],\n];`

   return exportString;
}

const exportSchema = (formatedSchema: string) => {

   const file = new Blob([formatedSchema], { type: 'text/plain;charset=utf-8' });
   const name = "2D Map Editor - MapSchema.txt";
   
   saveAs(file, name);
}

const setSheetParams = (
   properties:  any,
   SpriteSheet: SpriteClass,
) => {
   const { img, textureSize, spriteSize } = SpriteSheet;

   return {
      ...properties,

      cellSize: spriteSize,
      columns:  Math.floor(img.naturalWidth  /textureSize),
      rows:     Math.floor(img.naturalHeight /textureSize),
   }
}

const setMapParams = (
   properties: any,
   settings:   any,
) => {
   
   const { cellSize, worldWidth, worldHeight } = settings;

   return {
      ...properties,

      cellSize: cellSize,
      columns:  Math.floor(worldWidth  /cellSize),
      rows:     Math.floor(worldHeight /cellSize),
   }
}

const zoomPrevent = () => {
   
   window.addEventListener("wheel", (event) => {
      if(pressedKey === "Control") event.preventDefault();

   }, { passive: false });
}

const keysPrevent = (event: KeyboardEvent) => {
   
   if(event.key === "'") {
      event.preventDefault();
   }
}

const initKeyboard = (
   SheetGrid: ViewportClass,
   MapGrid:   ViewportClass,
) => {

   window.addEventListener("keydown", (event) => {

      keysPrevent(event);

      pressedKey = event.key;
      SheetGrid.pressedKey = pressedKey;
      MapGrid.pressedKey   = pressedKey;

      MapGrid.handlePressedKeys();
   });
      
   window.addEventListener("keyup", () => {

      pressedKey = undefined;
      SheetGrid.pressedKey = pressedKey;
      MapGrid.pressedKey   = pressedKey;
   });
}


// ================================================================================================
// Exports
// ================================================================================================
const methods = {
   
   init(
      DOM:   IDOM,
      sheet: any,
      map:   any,
   ) {

      if(!sheet.settings.source) return;

      const SpriteSheet = new SpriteClass(sheet.settings);

      SpriteSheet.img.addEventListener("load", () => {

         const sheetParams = setSheetParams(sheet.properties, SpriteSheet);
         const mapParams   = setMapParams(map.properties, map.settings);
   
         const SheetGrid = new ViewportClass(
            DOM.sheetVP,
            sheetKey,
            sheetParams,
         );
   
         const MapGrid = new ViewportClass(
            DOM.mapVP,
            mapKey,
            mapParams,
         );
         
         zoomPrevent();
         initKeyboard(SheetGrid, MapGrid);

         SheetGrid.spriteSheet = SpriteSheet;
         SheetGrid.init();
         SheetGrid.generateSchema();
   
         MapGrid.spriteSheet = SpriteSheet;
         MapGrid.init();
      });
   },
}

export default methods;
