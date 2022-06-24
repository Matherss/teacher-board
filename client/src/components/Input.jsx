import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";

const Input = observer(({ toolState }) => {
  const colorRef = useRef();
  const [color, setColor] = useState(toolState?.tool?.ctx?.fillColor ? toolState.tool.ctx.fillColor : "#000000");

  const changeColor = (e) => {
    toolState.setStrokeColor(e.target.value);
    toolState.setFillColor(e.target.value);
  };
  const colorRerenderChanger = () => {
    colorRef.current.value = toolState?.tool?.ctx?.fillStyle;
  };
  useEffect(() => {
    console.log("WWWWW");
    setColor(toolState?.tool?.fillStyle);
    colorRef.current.value = toolState?.tool?.ctx?.fillStyle;
    colorRerenderChanger();
  }, [toolState?.tool?.ctx?.fillStyle]);
  return (
    <input
      ref={colorRef}
      value={color}
      onChange={(e) => {
        changeColor(e);
        colorRerenderChanger();
      }}
      style={{ marginLeft: 20 }}
      type="color"
    />
  );
});

export default Input;
