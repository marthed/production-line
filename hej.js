function hitDatabase(queries){   
    console.log("🚀 ~ file: hej.js ~ line 2 ~ hitDatabase ~ queries", queries)
    return fetch("https://brfenergi.se/task-planner/MakumbaQueryServlet", {
	method: "POST",
	credentials: "include",
	body:
	"request=" +
	    encodeURIComponent(JSON.stringify({ queries})) +
	    "&analyzeOnly=false"
    })
	.then(response => response.json());
}

class QueryState {

  constructor() {
     // discovery part
    this.parent = -1;
    this.queryDiscovery = null;
    this.queries = [],
    this.queryFinder = {},

    // runtime part
    this.dirty = false,
    this.queryDirty = false;
    this.data = null;
  }
    findQuery(q){
      const key=JSON.stringify(q);
      const ret= this.queryFinder[key];
      if(ret)
          return ret;
      this.queryDirty=true;
      this.queries.push({
                projections: [],
                querySections: [q.from,  q.where, q.groupBy, q.orderBy, null, null, null],
                parentIndex: this.parent,
                limit: -1,
                offset: 0
        });
	    return this.queryFinder[key]=this.queries.length-1;
    }
    collectProjections(proj, queryIndex){
	    if (!this.queries[queryIndex].projections.includes(proj)) {
          this.queries[queryIndex].projections.push(proj);
	        this.dirty=true;
	    }
    }
    cleanup(){  
      this.queryFinder={};
      this.queries=[];
    }
};

function from(from){
    return new Query({from});
}

class Query{
    constructor(props){
    Object.assign(this, props)
    this.queryState = props.queryState || new QueryState();
    }

    where(where){ return new Query({...this, where });}
    orderBy(orderBy){ return new Query({...this, orderBy});}
    groupBy(groupBy){ return new Query({...this, groupBy });}

    map(func, qs= this.queryState){
	this.parent=qs.parent;
	let queryIndex= qs.findQuery(this);
	if(!queryIndex)
	    return this.rootMap(func, qs);
	else 
	    return this.childMap(func, qs, queryIndex);
    }

    
    rootMap(func, qs){
	qs.queryDiscovery=true;
	this.dryRun(func, qs, 0);
	qs.queryDiscovery=false;
	const prms= this.runQueries(func, qs);

	prms.toReact=()=>toReact(prms);
	prms.toVue=()=>toVue(prms);
	let ret= prms;
	try{
	    Vue;
	    ret=prms.toVue();
	}catch(e){}
	try{
	    ReactDOM;
	    ret=Object.assign({},prms.toReact());
	}catch(e){}
	if(ret!=prms){
	    ret.then= prms.then.bind(prms);
	    ret.catch= prms.catch.bind(prms);
	}
        return ret;
    }

    async runQueries(func, qs){
        let result;
        do{
	    qs.dirty=false;
	    qs.queryDirty=false;
	    qs.data= (await hitDatabase(qs.queries)).resultData;
	    result= this.iterate(func, qs, 0);
	}while(qs.dirty || qs.queryDirty);
	qs.cleanup();
	return result;
    }

    iterate(func, qs, queryIndex){
	const dt=qs.data;
	try{
	    return qs.data[queryIndex].map(function(d){
		qs.data=d;
		qs.parent=queryIndex;
		return func(function(proj){
		    // TODO: dirty
		    return d[proj];
		});
	    });
	}finally{
	    qs.data=dt;
	    qs.parent=this.parent;
	}
    }
    dryRun(func, qs, queryIndex){
	qs.parent=queryIndex;
	try{
	    func(proj=>  qs.collectProjections(proj, queryIndex), -1, []);
	}finally{ qs.parent=this.parent;}
    }
    childMap(func, qs, queryIndex){
	if(qs.queryDiscovery){
	    this.dryRun(func, qs, queryIndex);
	    return [];
	}
	else return this.iterate(func, qs, queryIndex);
    }
    
}

function RenderPromiseReact({promise}){
    const [data, setData]=React.useState();
    const [error, setError]=React.useState();
    React.useEffect(()=> {promise.then(d=> setData(d)).catch(e=>setError(e));});
    
    return error || data || "waiting";
}

const RenderPromiseVue={
    props:["promise"],
    data(){
	return { data:null, error:null};
    },
    created(){
	this.promise.then(d=>this.data=d).catch(e=>this.error=e);
    },
    render(){
	return this.error || this.data || "loading";	
    }
};

function toReact(promise){
    return React.createElement(RenderPromiseReact, {promise});
}
function toVue(promise){
    return Vue.h(RenderPromiseVue, {promise});
}