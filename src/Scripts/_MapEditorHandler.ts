
import {
   ISize,
   IDOM,
   ICanvasSpec,
} from "./Utils/Interfaces";

import { saveAs        } from "file-saver";
import { Constantes    } from "./Utils/Constantes";
import { ViewportClass } from "./Classes/Viewport";
import { SpriteClass   } from "./Classes/Sprite";


// ================================================================================================
// Global Variables / Functions
// ================================================================================================
const formatedKey: string = "formatedMap";
const mapKey:      string = "storedMap";
const sheetKey:    string = "storedSheet";

let exportVarName: string = "Tile_Map_2D";

document.body.oncontextmenu = (event: MouseEvent) => {
   event.preventDefault();
   event.stopPropagation();
}

// ==> Need to create HTML buttons
// ==> then call:
// // saveToLocal(exportVarName, Constantes.map.TILES_SCHEMA);
// // exportSchema();
const formatToExport = (
   varName: string,
   schema: number[][]
) => {
   
   let resultArray = [];
   
   const schemaString = JSON.stringify(schema);
   const rightSplit   = schemaString.split("[[")[1];
   const leftSplit    = rightSplit.split("]]")[0];
   const schemaIndex  = leftSplit.split("],[");

   const col = Constantes.map.COLUMNS;

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

   const result       = resultArray.join("");
   const exportString = `const ${varName} = [\n   [${result}],\n];`

   return exportString;
}

const saveToLocal = (
   varName: string,
   schema: number[][]
) => {

   const content = formatToExport(varName, schema);
   localStorage.setItem(formatedKey, content);
   localStorage.setItem(mapKey, JSON.stringify(schema));
}

const exportSchema = () => {

   let content: string | null = null;

   if(localStorage.getItem(formatedKey) === null) {

      saveToLocal(exportVarName, Constantes.map.TILES_SCHEMA);
      content = formatToExport(exportVarName, Constantes.map.TILES_SCHEMA);
   }
   else content = localStorage.getItem(formatedKey);

   const file = new Blob([ `${content}` ], { type: 'text/plain;charset=utf-8' });
   const name = "2D Map Editor - MapSchema.txt";
   
   saveAs(file, name);
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

      const { TileSprite, SheetVP, MapVP } = this.initClasses(DOM, canvasSpec);

      TileSprite.img.addEventListener("load", () => {
         SheetVP.init();
         MapVP.init();
      });
   },

   initClasses(
      DOM:        IDOM,
      canvasSpec: ICanvasSpec,
   ) {
      const TileSprite: SpriteClass = new SpriteClass(200, "./tiles_sheet.png");

      const SheetVP = new ViewportClass(
         Constantes.sheet,
         TileSprite,
         DOM.sheetVP,
         canvasSpec.sheet,
         sheetKey,
      );

      const MapVP = new ViewportClass(
         Constantes.map,
         TileSprite,
         DOM.mapVP,
         canvasSpec.map,
         mapKey,
      );

      return {
         TileSprite,
         SheetVP,
         MapVP,
      }
   },
}

export default methods;
