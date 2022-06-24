import { makeAutoObservable, observable } from "mobx";

class ToolState {
  tool = { fillColor: "#000000" };
  constructor() {
    makeAutoObservable(this, {
      tool: observable
    });
  }
  get color() {
    return this.tool.fillStyle;
  }
  setTool(tool) {
    this.tool = tool;
  }
  setFillColor(color) {
    this.tool.fillColor = color;
  }
  setStrokeColor(color) {
    this.tool.strokeStyle = color;
  }
  setLineWidth(width) {
    this.tool.lineWidth = width;
  }
}
export default new ToolState();
