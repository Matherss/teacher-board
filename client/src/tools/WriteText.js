import { useSSRSafeId } from "@react-aria/ssr";
import Tool from "./Tool";

export default class WriteText extends Tool {
  constructor(canvas, socket, id) {
    super(canvas, socket, id);
    this.listen();
  }
  listen() {
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
    this.canvas.onkeypress = this.submitHandler.bind(this);
  }
  clicker = true;
  submitHandler(text) {
    console.log("submitHandler");
    this.socket.send(
      JSON.stringify({
        method: "draw",
        id: this.id,
        figure: {
          type: "text",
          text: text,
          x: this.startX,
          y: this.startY,
          color: this.ctx.fillStyle
        }
      })
    );
    this.socket.send(
      JSON.stringify({
        method: "draw",
        id: this.id,
        figure: {
          type: "finish"
        }
      })
    );
  }
  mouseUpHandler(e) {
    this.mouseDown = false;
  }
  mouseDownHandler(e) {
    this.mouseDown = true;
    this.startX = e.pageX - e.target.offsetLeft;
    this.startY = e.pageY - e.target.offsetTop;
  }
  static staticDraw(ctx, text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "32px sans-serif";
    ctx.beginPath();
    ctx.fillText(text, x, y);
  }
}
