
  const App = () => 
    <React.Fragment>
    {from("ProductionLine l").map(
      data => 
        <ProductionLine key={data("l.name")} name={data("l.name")} >
          {from("Task t").where("t.line=l").map(data => <Task key={data("t.customer")}>{data("t.customer")}</Task>)}
          </ProductionLine>
    )}
    <ProductionLine name="Park">
      {from("Task t").where("t.line=nil").map(data => <Task data={data("t.customer")}>{data("t.customer")}</Task>)}
    </ProductionLine>
    <table style={{borderSpacing: "18px", borderCollapse: "separate"}}>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Line</th>
          <th>Start Date</th>
          <th>Days</th>
          <th>End Date</th>
        </tr>
      </thead>
      <tbody>
        {from("Task t").orderBy("t.startDate").map(data => <tr>
          <td><input type="text" value={data("t.customer")} size="10"></input></td>
          <td>{data("t.line.name")}</td>
          <td>{data("t.startDate")}</td>
          <td><input type="text" value={data("t.days")}></input></td>
          </tr>
        )}

      </tbody>
    </table>
   </React.Fragment>

   ReactDOM.render(<App />, document.getElementById("app"));