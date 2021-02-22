
const drag = (event) => {
  const data = {
    dx: event.offsetX,
    dy: event.offsetY,
    
  }
  event.dataTransfer.setData ("text", event.target.id);
}

const Task = ({ children, id }) => <div id={id} className="task" draggable={true} onDragStart={drag}>{children}</div>