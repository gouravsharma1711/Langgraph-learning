import {START,END,StateGraph,Annotation } from '@langchain/langgraph'
import {z} from 'zod'
import { el } from 'zod/locales';


const state = Annotation.Root({
    a:Annotation<number>,
    b:Annotation<number>,
    c:Annotation<number>,
    D:Annotation<number>,
    equation:Annotation<string>,
    result:Annotation<string>
})
type stateSchema = typeof state.State;

const define_equation =(state:stateSchema)=>{
    return {
        "equation":`${state.a}x^2 + ${state.b}x + ${state.c}`
    }
}

const cal_discriminant = (state:stateSchema)=>{

    const cal = Math.pow(state.b,2) - (4 * state.a * state.c)

    return {
        "D":cal
    }
}

const eval_condition = (state:stateSchema)=>{
    if(state.D > 0){
        return "real_roots"
    }else if(state.D == 0){
        return "equal_roots"
    }else{
        return "nonReal_roots"
    }
}

const real_roots = (state:stateSchema)=>{
    const root1 = ((-1)*state.b - Math.sqrt(state.D)) / 2*state.a
    const root2 = ((-1)*state.b + Math.sqrt(state.D)) / 2*state.a
    return {
        "result":`The Equation has real roots which are ${root1} and ${root2}`
    }
}

const equal_roots = (state:stateSchema)=>{
    const root = ( -state.b )/ 2*state.a
    return {
        "result":`The Equation has equal roots which are ${root}`
    }
}

const nonReal_roots = (state:stateSchema)=>{
    return {
        "result":`The Equation has non real root.`
    }
}

// graph

const workflow = new StateGraph(state)
    .addNode("define_equation",define_equation)
    .addNode("cal_discriminant",cal_discriminant)
    .addNode("real_roots",real_roots)
    .addNode("equal_roots",equal_roots)
    .addNode("nonReal_roots",nonReal_roots)
    .addEdge(START,"define_equation")
    .addEdge("define_equation","cal_discriminant")
    .addConditionalEdges("cal_discriminant",eval_condition)
    .addEdge("real_roots",END)
    .addEdge("equal_roots",END)
    .addEdge("nonReal_roots",END)
    .compile()


const initalState = {
    a:1,
    b:2,
    c:1   
}


const result = await workflow.invoke(initalState)
console.log(result)
