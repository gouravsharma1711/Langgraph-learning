// simple parallel-workflow
import {
    START,END,StateSchema,StateGraph,Annotation
} from "@langchain/langgraph"

import {number, z} from "zod"

const state1 = new StateSchema({
    a:z.number(),
    b:z.number(),
    sum:z.number(),
    product:z.number(),
    result:z.string().default("")
});

type StateType =typeof state1.State


// nodes functions

const cal_sum = (state:StateType):object =>{
    return { "sum":state.a + state.b }
}


const cal_product = (state:StateType):object =>{
    return { "product":state.a * state.b }
}

const final_result_eval = (state:StateType):object =>{
    return { "result" : `The sum of ${state.a} and ${state.b} : ${state.sum} and the product is : ${state.product} ` }
}


// graph

const workflow = new StateGraph(state1)
    .addNode("cal_sum",cal_sum)
    .addNode("cal_product",cal_product)
    .addNode("final_result_eval",final_result_eval)
    .addEdge(START,"cal_sum")
    .addEdge(START,"cal_product")
    .addEdge("cal_sum","final_result_eval")
    .addEdge("cal_product","final_result_eval")
    .addEdge("final_result_eval",END)
    .compile()

const response = await workflow.invoke({a:10,b:5})
console.log("result : ",response.result)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// paralle workflows with reducers

const state2 = Annotation.Root({
    nums: Annotation<number[]>({
        default: () => [],
        reducer:(current,update)=>update
    }),
    squares:Annotation<number[]>({
        default: () => [],
        reducer:(current,update)=> current.concat(update)
    }),
    doubles:Annotation<number[]>({
        default: () => [],
        reducer:(current,update)=> current.concat(update)
    }),

})

type StateType2 = typeof state2.State

const Squarer = (state:StateType2):object =>{
    
    const ans:number[]= state.nums.map((num)=> num*num )
    return {"squares":ans}
}

const doubler = (state:StateType2):object =>{

    const ans:number[]= state.nums.map((num)=> num*2 )
    return {"doubles":ans}
}

const worflow = new StateGraph(state2)
    .addNode("Squarer",Squarer)
    .addNode("doubler",doubler)
    .addEdge(START,"Squarer")
    .addEdge(START,"doubler")
    .addEdge("Squarer",END)
    .addEdge("doubler",END)
    .compile()

const r = await worflow.invoke({
    nums:[1,2,3,4,5]
})

console.log("Result 2 : ",r)
