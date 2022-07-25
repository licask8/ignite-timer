import { differenceInSeconds } from "date-fns";
import { createContext, ReactNode, useEffect, useReducer, useState } from "react";
import { ActionTypes, addNewCycleAction, interruptCurrentCycleAction, markCurrentCycleAsFinishedAction } from "../reducers/cycles/actions";
import {  Cycle, cyclesReducer } from "../reducers/cycles/reducer";



interface CreateCycleData {
    task: string
    minutesAmount: number
}

interface CyclesContextType {
    cycles: Cycle[]
    activeCycle: Cycle | undefined;
    activeCycleId: String | null
    markCurrentCycleAsFinished: () => void
    amountSecondsPassed: number
    setSecondsPassed : (seconds: number) => void
    createNewCycle: (data: CreateCycleData) => void
    interruptCurrentCycle: () => void
}




interface CyclesContextProviderProps {
    children: ReactNode
}

interface CyclesState {
    cycles: Cycle[]
    activeCycleId: string | null
}

export const CyclesContext = createContext({} as CyclesContextType)





export function CyclesContextProvider( { children }: CyclesContextProviderProps) {

    const [cycleState, dispatch] = useReducer(cyclesReducer, {
        cycles: [],
        activeCycleId: null,
    }, () => {
        const storedStateAsJSON = localStorage.getItem('@ignite-timer:cycles-state')

        if (storedStateAsJSON) {
            return JSON.parse(storedStateAsJSON)
        }
    }
)
    const { cycles, activeCycleId } = cycleState
    const activeCycle = cycles.find(cycle => cycle.id === activeCycleId)

    const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
      if (activeCycle) {
        return  differenceInSeconds(
            new Date(),
            new Date(activeCycle.startDate)
        )

      }
        return 0
    })
    
    useEffect(() => {

        const stateJSON = JSON.stringify(cycleState)

        localStorage.setItem('@ignite-timer:cycles-state', stateJSON)
    },[cycleState])

    
    
    
    
    function setSecondsPassed(seconds: number) {
        setAmountSecondsPassed(seconds)
    }
    
    
    function markCurrentCycleAsFinished( ) {

        dispatch(markCurrentCycleAsFinishedAction())



    //     setCycles(state => state.map(cycle => {
    //         if (cycle.id === activeCycleId) {
    //         return {...cycle, finishedDate: new Date() }
    //         } else {
    //             return cycle
    //         }
    //     }),
    // ) 
    }
    
    
    function createNewCycle(data: CreateCycleData) {
        const newCycle: Cycle = {
            id: String(new Date().getTime()),
            task: data.task,
            minutesAmount: data.minutesAmount,
            startDate: new Date(),
        }

        dispatch(addNewCycleAction(newCycle))
    
        //setCycles(state => [...state, newCycle])
        
        setAmountSecondsPassed(0)
    
       
    } 
    
    function interruptCurrentCycle() {

        dispatch(interruptCurrentCycleAction())

    }
    

    return (
        <CyclesContext.Provider value={{
             activeCycle, 
             activeCycleId, 
             cycles,
             markCurrentCycleAsFinished, 
             amountSecondsPassed, 
             createNewCycle,
             setSecondsPassed,
             interruptCurrentCycle 
        }}
        >
            {children}
        </ CyclesContext.Provider>
    )
}