import React from "react";
import "../styles/toolbar.scss";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import canvasState from "../store/canvasState";
import Rect from "../tools/Rect";
import Circle from "../tools/Circle";
import Eraser from "../tools/Eraser";
import Line from "../tools/Line";
import WriteText from "../tools/WriteText";
import { observer } from "mobx-react-lite";
import Input from "./Input";

const Toolbar = observer(() => {
  const download = () => {
    const dataUrl = canvasState.canvas.toDataURL();
    console.log(dataUrl);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = canvasState.room + ".jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="toolbar">
      <button
        className="toolbar__btn brush"
        onClick={() => toolState.setTool(new Brush(canvasState.canvas, canvasState.socket, canvasState.room))}
      ></button>
      <button
        className="toolbar__btn rect"
        onClick={() => toolState.setTool(new Rect(canvasState.canvas, canvasState.socket, canvasState.room))}
      ></button>
      <button
        className="toolbar__btn circle"
        onClick={() => toolState.setTool(new Circle(canvasState.canvas, canvasState.socket, canvasState.room))}
      ></button>
      <button
        className="toolbar__btn eraser"
        onClick={() => toolState.setTool(new Eraser(canvasState.canvas, canvasState.socket, canvasState.room))}
      ></button>
      <button
        className="toolbar__btn text"
        onClick={() => toolState.setTool(new WriteText(canvasState.canvas, canvasState.socket, canvasState.room))}
      ></button>
      <button
        className="toolbar__btn line"
        onClick={() => toolState.setTool(new Line(canvasState.canvas, canvasState.socket, canvasState.room))}
      ></button>
      <Input toolState={toolState} />
      <button
        className="toolbar__btn undo"
        onClick={() => {
          canvasState.socket.send(
            JSON.stringify({
              id: canvasState.room,
              method: "draw",
              figure: {
                type: "undo"
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
        }}
      ></button>
      <button
        className="toolbar__btn redo"
        onClick={() => {
          canvasState.socket.send(
            JSON.stringify({
              id: canvasState.room,
              method: "draw",
              figure: {
                type: "redo"
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
        }}
      ></button>
      <button className="toolbar__btn save" onClick={() => download()}></button>
    </div>
  );
});

export default Toolbar;
