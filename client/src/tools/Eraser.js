import Brush from "./Brush";

export default class Eraser extends Brush {
  mouseMoveHandler(e) {
    if (this.mouseDown) {
      // this.draw(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "eraser",
            x: e.pageX - e.target.offsetLeft,
            y: e.pageY - e.target.offsetTop,
            color: "white"
          }
        })
      );
    }
  }
  static draw(ctx, x, y, color) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}
