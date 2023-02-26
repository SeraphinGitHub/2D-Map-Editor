
import {
   IPosition,
   IPosList,
   INumber,
} from "../Utils/Interfaces";

// =====================================================================
// Collision Class
// =====================================================================
export class CollisionClass {

   line_toLine(
      lineA: INumber,
      lineB: INumber,
   ) {

      const {
         startX: A_startX,
         startY: A_startY,
         endX:   A_endX,
         endY:   A_endY
      }: INumber = lineA;

      const {
         startX: B_startX,
         startY: B_startY,
         endX:   B_endX,
         endY:   B_endY
      }: INumber = lineB;

      const { x: vectA_X, y: vectA_Y }: IPosition = {
         x: A_endX -A_startX,
         y: A_endY -A_startY,
      }
   
      const { x: vectB_X, y: vectB_Y }: IPosition = {
         x: B_endX -B_startX,
         y: B_endY -B_startY,
      }
   
      const { x: vectC_X, y: vectC_Y }: IPosition = {
         x: A_startX -B_startX,
         y: A_startY -B_startY,
      }  
   
      let vectorValueA: number = vectA_X *vectC_Y - vectA_Y *vectC_X;
      let vectorValueB: number = vectB_X *vectC_Y - vectB_Y *vectC_X;
      let denominator:  number = vectB_Y *vectA_X - vectB_X *vectA_Y;
      
      const thousandth: number = 1000;
      let rangeA: number = Math.floor(vectorValueA /denominator *thousandth) /thousandth;
      let rangeB: number = Math.floor(vectorValueB /denominator *thousandth) /thousandth;

      if(rangeA < 0 || rangeA > 1
      || rangeB < 0 || rangeB > 1) {
         return false;
      }
      
      return true;
   }

   line_toSquare(
      line:   INumber,
      square: IPosList,
   ) {

      const { top, right, bottom, left } = square;
      
      const { leftSide, rightSide, topSide, bottomSide } = {

         leftSide: {
            startX: bottom.x,
            startY: bottom.y,
            endX:   top.x,
            endY:   top.y,
         },

         rightSide: {
            startX: right.x,
            startY: right.y,
            endX:   bottom.x,
            endY:   bottom.y,
         },

         topSide: {
            startX: top.x,
            startY: top.y,
            endX:   right.x,
            endY:   right.y,
         },

         bottomSide: {
            startX: bottom.x,
            startY: bottom.y,
            endX:   left.x,
            endY:   left.y,
         },
      };

      let isLeftSide:   boolean = this.line_toLine(line, leftSide  );
      let isRightSide:  boolean = this.line_toLine(line, rightSide );
      let isTopSide:    boolean = this.line_toLine(line, topSide   );
      let isBottomSide: boolean = this.line_toLine(line, bottomSide);

      if(!isLeftSide
      && !isRightSide
      && !isTopSide
      && !isBottomSide) {

         return false;
      }
      
      return true;
   }
}