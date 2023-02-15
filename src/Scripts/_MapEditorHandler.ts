
import {
   IPosition,
   ISize,
   IViewport,
   ICanvasLayers,
   ICtx,
   IStrokeRect,
   IDrawImage,
} from "./Utils/Interfaces";

import {
   CELL_SIZE,
   COLUMNS,
   ROWS,
   SCROLL_PITCH,
   MIN_ZOOM,
   MAX_ZOOM,
   TILES_MAP,
   ITEMS_MAP,
} from "./Utils/Constantes";

import { SpriteClass } from "./Classes/Sprite";
import { GridClass   } from "./Classes/Grid";
import { CellClass   } from "./Classes/Cell";


// ================================================================================================
// Global Variables
// ================================================================================================
const Viewport: IViewport = {
   x:      0,
   y:      0,
   width:  0,
   height: 0,
};

const CanvasLayers: ICanvasLayers = {};
const Ctx: ICtx = {};

let GridList:   Map<string, CellClass> = new Map<string, CellClass>();
let CellSize:   number = CELL_SIZE;
let TileSprite: SpriteClass;


// ================================================================================================
// Viewport
// ================================================================================================
document.body.oncontextmenu = (event: MouseEvent) => {
   event.preventDefault();
   event.stopPropagation();
}

const setViewport = (viewSize: ISize) => {
   
   Viewport.x      = Math.floor(viewSize.width  *0.5);
   Viewport.y      = Math.floor(viewSize.height *0.5);
   Viewport.height = viewSize.height;
   Viewport.width  = viewSize.width;
}

const setCanvas = (mapSize: ISize, document: Document) => {

   const layers: string[] = [
      "map",
      "select",
   ];

   layers.forEach(layer => {

      CanvasLayers[layer] = document.querySelector(`.canvas-${layer}`) as HTMLCanvasElement;
      let canvas = CanvasLayers[layer];

      canvas.height = mapSize.height;
      canvas.width  = mapSize.width;

      Ctx[layer] = canvas.getContext("2d") as CanvasRenderingContext2D;
   });
}

const clearCanvas = (ctx: CanvasRenderingContext2D) => {

   ctx.clearRect(0, 0, Viewport.width, Viewport.height);
}


// ================================================================================================
// Grid
// ================================================================================================
const cycleGrid = (callback: Function) => {

   GridList.forEach(cell => callback(cell));
}

const withinTheGrid = (mousePos: IPosition, callback: Function) => {
   
   if(mousePos
   && mousePos.x > 0
   && mousePos.x < Viewport.width
   && mousePos.y > 0
   && mousePos.y < Viewport.height) {

      callback();
   }
}


// ================================================================================================
// Mouse Events
// ================================================================================================
const getMousePos = (event: MouseEvent) => {

   let screenBound = CanvasLayers.select.getBoundingClientRect() as DOMRect;

   return {
      x: Math.floor(event.clientX -screenBound.left) as number,
      y: Math.floor(event.clientY -screenBound.top ) as number,
   };
}

const getHoverCell = (mousePos: IPosition) => {

   const cellPos: IPosition = {
      x: mousePos.x - (mousePos.x % CellSize),
      y: mousePos.y - (mousePos.y % CellSize),
   };

   let cellID: string = `${cellPos.x /CellSize}-${cellPos.y /CellSize}`;
   let cell: CellClass | undefined = GridList.get(cellID);
   
   if(cell) return cell;
}

const mouse_Move = (event: MouseEvent) => {
   
   clearCanvas(Ctx.select);
   let mousePos: IPosition = getMousePos(event);
   
   withinTheGrid(mousePos, () => {
      let hoverCell: CellClass | undefined = getHoverCell(mousePos);
      
      if(hoverCell) {
         
         strokeRect({
            ctx: Ctx.select,
            dX: hoverCell.position.x,
            dY: hoverCell.position.y,
            dW: CellSize,
            dH: CellSize,
         }, "blue", 4);
      }
   });
}

const mouse_Scroll = (event: WheelEvent) => {
   
   // Zoom
   if(event.deltaY < 0) {
      if(CellSize < MAX_ZOOM) CellSize += SCROLL_PITCH;
   }

   // Unzoom
   else if(CellSize >= MIN_ZOOM) CellSize -= SCROLL_PITCH;

   refreshMap();
}

const mouse_Click = (event: MouseEvent) => {

   if(event.which === 2) {
      CellSize = CELL_SIZE;
      refreshMap();
   }
}


// ================================================================================================
// Draw
// ================================================================================================
const drawImage = (param: IDrawImage) => {

   param.ctx.drawImage(
      param.img,
      param.sX, param.sY, param.sW, param.sH,
      param.dX, param.dY, param.dW, param.dH,
   );
}

const strokeRect = (
   param:     IStrokeRect,
   color:     string,
   lineWidth: number
) => {

   param.ctx.strokeStyle = color;
   param.ctx.lineWidth   = lineWidth;

   param.ctx.strokeRect(
      param.dX, param.dY, param.dW, param.dH,
   );
}

const renderMap = () => {

   const tileSize = TileSprite.size;
   const tileImg  = TileSprite.img;
   
   cycleGrid((cell: CellClass) => {

      const [[i, j], [x, y]]: number[][] = cell.setPosition(CellSize);

      let spriteIndex: number = j *COLUMNS +i;
      let tile: number[] = TILES_MAP[spriteIndex];
      
      const destination = {
         // dX: x -viewport.x, // ==> ScrollCam
         // dY: y -viewport.y, // ==> ScrollCam
         dX: x,
         dY: y,
         dW: CellSize,
         dH: CellSize,
      }

      if(tile) {
         let [spriteX, spriteY]: number[] = tile;
         let drawX: number = spriteX *tileSize;
         let drawY: number = spriteY *tileSize;
   
         drawImage({
            ctx: Ctx.map,
            img: tileImg,
   
            sX: drawX,
            sY: drawY,
            sW: tileSize,
            sH: tileSize,
   
            ...destination,
         });
      }

      strokeRect({
         ctx: Ctx.map,
         ...destination,
      }, "red", 2);
   });
}

const refreshMap = () => {

   clearCanvas(Ctx.map);
   renderMap();
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


// ================================================================================================
// Exports
// ================================================================================================
const methods = {
   
   init(
      document: Document,
      mapSize:  ISize,
      viewSize: ISize,
   ) {

      const tile_map = [
         [0,1],  [   ],  [1,0],  [1,0],  [0,1],  [   ],
         [   ],  [1,1],  [   ],  [   ],  [1,0],  [1,0],
         [0,1],  [   ],  [1,0],  [1,0],  [0,1],  [   ],
         [   ],  [1,1],  [   ],  [   ],  [1,0],  [1,0],
      ];

      exportSchema(tile_map); // ***************************

      // setViewport(viewSize);
      // setCanvas(mapSize, document);
      
      // TileSprite = new SpriteClass(200, "./TestTilesBlock.png");
      // GridList   = new GridClass(CELL_SIZE, COLUMNS, ROWS).init();

      // refreshMap();

      // window.addEventListener("wheel",     (event) => mouse_Scroll(event));
      // window.addEventListener("mousedown", (event) => mouse_Click (event));
      // window.addEventListener("mousemove", (event) => mouse_Move  (event));
   },
}

export default methods;
