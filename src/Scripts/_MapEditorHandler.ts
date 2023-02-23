
import {
   INumber,
   IDOM,
   ICanvasSpec,
} from "./Utils/Interfaces";

import { saveAs        } from "file-saver";
import { ViewportClass } from "./Classes/Viewport";
import { SpriteClass   } from "./Classes/Sprite";


// ================================================================================================
// Global Variables / Functions
// ================================================================================================
const mapKey:      string = "storedMap";
const sheetKey:    string = "storedSheet";

let exportVarName: string = "Tile_Map_2D";

document.body.oncontextmenu = (event: MouseEvent) => {
   event.preventDefault();
   event.stopPropagation();
}


const formatToExport = (
   varName: string,
   schema:  number[][]
) => {
   
   let resultArray = [];
   
   const schemaString = JSON.stringify(schema);
   const rightSplit   = schemaString.split("[[")[1];
   const leftSplit    = rightSplit.split("]]")[0];
   const schemaIndex  = leftSplit.split("],[");

   // const col = mapParams.COLUMNS;
   const col = 8; // <== *******************************

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

const exportSchema = (formatedSchema: string) => {

   const file = new Blob([formatedSchema], { type: 'text/plain;charset=utf-8' });
   const name = "2D Map Editor - MapSchema.txt";
   
   saveAs(file, name);
}


// To set Sheet
let source      = "./tiles_0.png";
let textureSize = 200;
let spriteSize  = 100;


// To set Map
let cellSize = 100;
let width    = 2000;
let height   = 1500;


const setSheetParams = (
   img: HTMLImageElement,
   spriteSize:  number,
   textureSize: number,
) => {
   
   return {
      cellSize: spriteSize,
      columns:  img.naturalWidth  /textureSize,
      rows:     img.naturalHeight /textureSize,
   }
}

const setMapParams = (
   cellSize: number,
   width:    number,
   height:   number,
) => {
   
   return {
      cellSize: cellSize,
      columns:  width  /cellSize,
      rows:     height /cellSize,
   }
}


// ================================================================================================
// Exports
// ================================================================================================
const methods = {
   
   init(
      DOM:        IDOM,
      canvasSpec: ICanvasSpec,
   ) {      

      if(source === undefined) return;

      const SpriteSheet = new SpriteClass(textureSize, source);

      const sheetParams: INumber = setSheetParams(SpriteSheet.img, spriteSize, textureSize);
      const mapParams:   INumber = setMapParams(cellSize, width, height);

      const SheetVP = new ViewportClass(
         sheetParams,
         DOM.sheetVP,
         canvasSpec.sheet,
         sheetKey,
      );

      const MapVP = new ViewportClass(
         mapParams,
         DOM.mapVP,
         canvasSpec.map,
         mapKey,
      );

      SpriteSheet.img.addEventListener("load", () => {
         
         SheetVP.spriteSheet = SpriteSheet;
         SheetVP.init();
         SheetVP.generateSchema();

         MapVP.spriteSheet = SpriteSheet;
         MapVP.init();
      });
   },
}

export default methods;
