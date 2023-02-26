
import {
   IViewport,
   IPosition,
   IPosList,
} from "../Utils/Interfaces";

// =====================================================================
// Draw Class
// =====================================================================
export class DrawClass {

   image(
      ctx:     CanvasRenderingContext2D,
      img:     HTMLImageElement,
      srcPos:  IViewport,
      destPos: IViewport,
   ) {
      
      const {
         x:      sX,
         y:      sY,
         width:  sW,
         height: sH
      }: IViewport = srcPos;

      const {
         x:      dX,
         y:      dY,
         width:  dW,
         height: dH
      }: IViewport = destPos;

      ctx.drawImage(
         img,
         sX, sY, sW, sH,
         dX, dY, dW, dH,
      );
   }
   
   line(
      ctx:        CanvasRenderingContext2D,
      startPos:   IPosition,
      endPos:     IPosition,
      color:      string,
      lineWidth:  number,
   ) {

      const { x: startPosX, y: startPosY }: IPosition = startPos;
      const { x: endPosX,   y: endPosY   }: IPosition = endPos;

      ctx.strokeStyle = color;
      ctx.lineWidth   = lineWidth;

      ctx.beginPath();
      ctx.moveTo(startPosX, startPosY);
      ctx.lineTo(endPosX,   endPosY  );
      ctx.stroke();
   }

   strokeRect(
      ctx:       CanvasRenderingContext2D,
      position:  IViewport,
      color:     string,
      lineWidth: number
   ) {

      const { x, y, width, height }: IViewport = position;
   
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineWidth;

      ctx.strokeRect(
         x,
         y,
         width,
         height
      );
   }

   fillRect(
      ctx:      CanvasRenderingContext2D,
      position: IViewport,
      color:    string,
   ) {

      const { x, y, width, height }: IViewport = position;

      ctx.fillStyle = color;
      ctx.fillRect(
         x,
         y,
         width,
         height
      );
   }

   diamond(
      ctx:     CanvasRenderingContext2D,
      diamond: IPosList,
      color:   string,
   ) {

      const { top, right, bottom, left } = diamond;

      ctx.fillStyle = color;
      ctx.beginPath();
      
      ctx.moveTo(top.x,    top.y   );
      ctx.lineTo(right.x,  right.y );
      ctx.lineTo(bottom.x, bottom.y);
      ctx.lineTo(left.x,   left.y  );
      ctx.fill();
   }

   circle(
      ctx:    CanvasRenderingContext2D,
      center: IPosition,
      radius: number,
      color:  string,
   ) {

      const { x: centerX, y: centerY }: IPosition = center;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
         centerX,
         centerY,
         radius, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
   }
}