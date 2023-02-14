
// =====================================================================
// SpriteClass
// =====================================================================
export class SpriteClass {

   size: number;
   src:  string;
   img:  HTMLImageElement;

   constructor(
      size: number,
      src:  string,
   ) {

      this.size    = size;
      this.src     = src;
      this.img     = new Image();
      this.img.src = src;
   }
}