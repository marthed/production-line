const drag = (event) => {
  event.dataTransfer.setData("text", JSON.stringify({ dx: event.offsetX, dy: event.offsetY }));
  event.dataTransfer.effectAllowed = 'move';
}

const drop = (event) => {
  event.preventDefault();
  const data = JSON.parse(event.dataTransfer.getData("text"));
}

const dragOver = (event) => {
  event.preventDefault();
}

function makdrop(event){
  event.preventDefault();
  var data=JSON.parse(event.dataTransfer.getData("makDnD"));
  
  var dest=tMgr.getNodeProperties(this);
  if(dest.objects['line']!=null){
    rMgr.updateWhere(
      data.objects['t'].type+" t, "+dest.objects['line'].type+" line",
      "t.line=line, t.startDate=dateAdd('2011-01-01', :x, 'day')",
      "t=:t AND line=:line",
      {t:data.objects['t'].value, line:dest.objects['line'].value, x: event.pageX-this.offsetLeft-data.dx}
      );
 }else
   {
    rMgr.updateWhere(
        data.objects['t'].type+" t",
        "t.line=nil, t.startDate=nil", 
        "t=:t",
        {t:data.objects['t'].value}
        );
   }
 rMgr.updateScene(document);
}