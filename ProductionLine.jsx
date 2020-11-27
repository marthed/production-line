

const ProductionLine = ({ name, children }) => {

  return (
    <div className="production-line" style={{overflow: "hidden"}}>
        <span className="lineLabel">{name}</span>
        <div className="line">
        {children}
        </div>
    </div>)
}
