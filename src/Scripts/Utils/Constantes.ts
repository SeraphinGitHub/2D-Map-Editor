
import { IConstantes } from "./Interfaces";

export const Constantes: IConstantes = {
   
   map: {
      CELL_SIZE: 100,
      COLUMNS:   12,
      ROWS:      8,

      TILES_SCHEMA: [
         [0, 0],  [0, 1],  [0, 2],  [0, 3],  [0, 4],  [0, 5],  [0, 6],  [0, 7],  [],  [],  [],  [],
         [1, 0],  [1, 1],  [1, 2],  [1, 3],  [1, 4],  [1, 5],  [1, 6],  [1, 7],  [],  [],  [],  [],
         [2, 0],  [2, 1],  [2, 2],  [2, 3],  [2, 4],  [2, 5],  [2, 6],  [2, 7],  [],  [],  [],  [],
         [3, 0],  [3, 1],  [3, 2],  [3, 3],  [3, 4],  [3, 5],  [3, 6],  [3, 7],  [],  [],  [],  [],
         [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [],  [],  [],  [],
         [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [],  [],  [],  [],
         [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [],  [],  [],  [],
         [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [    ],  [],  [],  [],  [],
      ],

      ITEMS_SCHEMA: [],
   },

   sheet: {
      CELL_SIZE: 100,
      COLUMNS:   4,
      ROWS:      8,

      TILES_SCHEMA: [
         [0, 0],  [0, 1],  [0, 2],  [0, 3], 
         [0, 4],  [0, 5],  [0, 6],  [0, 7],
         [1, 0],  [1, 1],  [1, 2],  [1, 3],
         [1, 4],  [1, 5],  [1, 6],  [1, 7],
         [2, 0],  [2, 1],  [2, 2],  [2, 3],
         [2, 4],  [2, 5],  [2, 6],  [2, 7],
         [3, 0],  [3, 1],  [3, 2],  [3, 3],
         [3, 4],  [3, 5],  [3, 6],  [3, 7],
      ],

      ITEMS_SCHEMA: [],
   },
}