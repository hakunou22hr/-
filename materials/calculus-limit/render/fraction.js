// A real stacked fraction for small spatial annotations (no slash glyph).
export function drawFraction(c,top,bottom,x,y,size=22,color='#d6edfa'){
 c.save();c.fillStyle=color;c.strokeStyle=color;c.textAlign='center';c.font=`${size}px Georgia,serif`;
 c.fillText(top,x,y-size*.18);c.font=`italic ${size}px Georgia,serif`;c.fillText(bottom,x,y+size*.87);
 c.lineWidth=Math.max(.7,size*.055);c.beginPath();c.moveTo(x-size*.43,y+size*.04);c.lineTo(x+size*.43,y+size*.04);c.stroke();c.restore();
}
