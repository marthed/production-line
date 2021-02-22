

const drop = (event) => {
  console.log('Append child');
  event.preventDefault();
  const id = event.dataTransfer.getData("text");
  const node = document.getElementById(id);
  event.target.appendChild(node);
}

const allowDrop = (event) => {
  event.preventDefault();
  console.log('Allow drop');
  return true;
}

const ProductionLine = ({ name, onDrop, children }) => {

  return (
    <div className="production-line" style={{overflow: "hidden"}}>
        <span className="lineLabel">{name}</span>
        <div className="line" onDragOver={allowDrop} onDrop={drop}>
        {children}
        </div>
    </div>)
}
