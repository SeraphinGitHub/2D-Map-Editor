
// =====================================================================
// SpriteClass
// =====================================================================
export class SpriteClass {

   img:         HTMLImageElement;
   textureSize: number;
   spriteSize:  number;

   constructor(
      settings: any,
   ) {

      this.img         = new Image();
      this.img.src     = settings.source;
      this.textureSize = settings.textureSize;
      this.spriteSize  = settings.spriteSize;
   }
}