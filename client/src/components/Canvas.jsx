import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import "../styles/canvas.scss";
import Brush from "../tools/Brush";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Rect from "../tools/Rect";
import Eraser from "../tools/Eraser";
import Circle from "../tools/Circle";
import Line from "../tools/Line";
import axios from "axios";
import WriteText from "../tools/WriteText";
const Canvas = observer(() => {
  const canvasRef = useRef();
  const usernameRef = useRef();
  const roomRef = useRef();
  const params = useParams();
  const [modal, setModal] = useState(true);
  let navigate = useNavigate();
  useEffect(() => {
    if (canvasState.username) {
      const socket = new WebSocket("ws://localhost:5000/");
      canvasState.setSocket(socket);
      canvasState.setSessionId(canvasState.username);
      toolState.setTool(new Brush(canvasRef.current, socket, canvasState.room));
      socket.onopen = () => {
        console.log("Соединение установлено для - " + canvasState.username);
        socket.send(
          JSON.stringify({
            username: canvasState.username,
            id: canvasState.room,
            method: "connection"
          })
        );
      };
      socket.onmessage = (event) => {
        let msg = JSON.parse(event.data);
        switch (msg.method) {
          case "connection":
            console.log("Подключен в комнату: " + canvasState.room);
            break;
          case "draw":
            drawHandler(msg);

            break;

          default:
            break;
        }
      };
    }
    // eslint-disable-next-line
  }, [canvasState.username]);
  useEffect(() => {
    canvasState.setCanvas(canvasRef.current);
    let ctx = canvasRef.current.getContext("2d");
    axios.get(`http://localhost:5000/image?id=${params.id}`).then((response) => {
      const img = new Image();
      img.src = response.data;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
    });
  }, [modal]);

  const drawHandler = (msg) => {
    const figure = msg.figure;
    const ctx = canvasRef.current.getContext("2d");
    switch (figure.type) {
      case "brush":
        Brush.draw(ctx, figure.x, figure.y, figure.color, figure.width);
        break;
      case "rect":
        Rect.staticDraw(ctx, figure.x, figure.y, figure.width, figure.height, figure.color);
        break;
      case "eraser":
        Eraser.draw(ctx, figure.x, figure.y, figure.color);
        break;
      case "circle":
        Circle.staticDraw(ctx, figure.x, figure.y, figure.r, figure.color);
        break;
      case "line":
        Line.staticDraw(ctx, figure.startX, figure.startY, figure.x, figure.y, figure.color);
        break;
      case "text":
        WriteText.staticDraw(ctx, figure.text, figure.x, figure.y, figure.color);
        break;
      case "clear":
        console.log(canvasRef.current.onkeypress);
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        break;
      case "undo":
        canvasState.undo();
        break;
      case "redo":
        canvasState.redo();
        break;
      case "finish":
        ctx.beginPath();
        console.log("finish");
        toolState.setFillColor(figure.color);
        break;

      default:
        break;
    }
  };

  const mouseUpHandler = () => {
    axios
      .post(`http://localhost:5000/image?id=${params.id}`, { img: canvasRef.current.toDataURL() })
      .then((response) => console.log(response.data));
  };

  const [xPosition, setX] = useState(null);
  const [yPosition, setY] = useState(null);
  const [textWriter, setTextWriter] = useState(null);
  const [innerText, setInnerText] = useState("");

  const clickHandler = (e) => {
    if (toolState.tool.clicker) {
      setInnerText("");
      setTextWriter(true);
      setX(e.pageX);
      setY(e.pageY);
    } else {
      console.log("net text");
    }
  };
  const drawText = () => {
    setTextWriter(null);
    toolState.tool.submitHandler(innerText);
  };

  const mouseDownHandler = (e) => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
  };

  const connectionHandler = () => {
    canvasState.setUsername(usernameRef.current.value);
    canvasState.setRoom(roomRef.current.value);
    navigate(canvasState.room);
    setModal(false);
  };

  const clearCanvas = () => {
    canvasState.socket.send(
      JSON.stringify({
        id: canvasState.room,
        method: "draw",
        figure: {
          type: "clear"
        }
      })
    );
  };
  return (
    <div className="canvas">
      {canvasState.username == "IBM" ? (
        <Button style={{ position: "fixed", top: "120px", left: "1px" }} onClick={clearCanvas}>
          Очистить доску
        </Button>
      ) : (
        ""
      )}
      <Modal show={modal} onHide={() => {}}>
        <Modal.Header closeButton>
          <Modal.Title>Вход</Modal.Title>
        </Modal.Header>
        <Form.Group>
          <Modal.Body>
            <Form.Label>Ваше имя</Form.Label>
            <Form.Control ref={usernameRef} />
            <Form.Label>Номер комнаты</Form.Label>
            <Form.Control ref={roomRef} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => connectionHandler()}>Войти</Button>
          </Modal.Footer>
        </Form.Group>
      </Modal>
      {textWriter ? (
        <>
          <label
            htmlFor="textwriter"
            className="textwriter__label"
            style={{
              position: "fixed",
              top: yPosition - 26,
              left: xPosition - 1,
              color: "grey",
              fontSize: "15px",
              textDecoration: "underline"
            }}
          >
            Сохранение текста на Enter
          </label>
          <input
            placeholder="Введите текст"
            className="textwriter"
            onChange={(e) => {
              setInnerText(e.target.value);
            }}
            onKeyDown={(e) => (e.key === "Enter" ? drawText() : "")}
            autoFocus={true}
            style={{ position: "fixed", top: yPosition, left: xPosition, paddingBottom: "20px" }}
          ></input>
        </>
      ) : (
        ""
      )}
      <canvas
        onMouseUp={() => mouseUpHandler()}
        onMouseDown={(e) => mouseDownHandler(e)}
        onClick={(e) => clickHandler(e)}
        ref={canvasRef}
        width={1000}
        height={5000}
      ></canvas>
    </div>
  );
});

export default Canvas;
