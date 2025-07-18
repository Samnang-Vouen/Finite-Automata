"use client"

import { useState, useCallback } from "react"
import type { Automaton, State, Transition } from "@/types/automata"
import { AutomataEngine, type MinimizationResult } from "@/lib/automata-engine"

export function useAutomata() {
  const [automaton, setAutomaton] = useState<Automaton | null>(null)
  const [minimizationResult, setMinimizationResult] = useState<MinimizationResult | null>(null)
  const [showOriginalDFA, setShowOriginalDFA] = useState(false)

  const addState = useCallback((state: State) => {
    setAutomaton((prev) => {
      if (!prev) {
        return {
          states: [state],
          transitions: [],
          startState: null,
          finalStates: [],
          type: "DFA",
        }
      }

      // Check if state already exists
      if (prev.states.some((s) => s.id === state.id)) {
        return prev
      }

      return {
        ...prev,
        states: [...prev.states, state],
      }
    })
  }, [])

  const removeState = useCallback((stateId: string) => {
    setAutomaton((prev) => {
      if (!prev) return null

      return {
        ...prev,
        states: prev.states.filter((s) => s.id !== stateId),
        transitions: prev.transitions.filter((t) => t.from !== stateId && t.to !== stateId),
        startState: prev.startState === stateId ? null : prev.startState,
        finalStates: prev.finalStates.filter((id) => id !== stateId),
      }
    })
  }, [])

  const addTransition = useCallback((transition: Transition) => {
    setAutomaton((prev) => {
      if (!prev) return null

      // Check if states exist
      const fromExists = prev.states.some((s) => s.id === transition.from)
      const toExists = prev.states.some((s) => s.id === transition.to)

      if (!fromExists || !toExists) {
        return prev
      }

      // Check if transition already exists
      const exists = prev.transitions.some(
        (t) => t.from === transition.from && t.to === transition.to && t.symbol === transition.symbol,
      )

      if (exists) return prev

      const newTransitions = [...prev.transitions, transition]

      // Create updated automaton
      const updatedAutomaton = {
        ...prev,
        transitions: newTransitions,
      }

      // Determine the correct type using the engine
      const automatonType = AutomataEngine.determineAutomatonType(updatedAutomaton)

      return {
        ...updatedAutomaton,
        type: automatonType,
      }
    })
  }, [])

  const removeTransition = useCallback((from: string, to: string, symbol: string) => {
    setAutomaton((prev) => {
      if (!prev) return null

      const newTransitions = prev.transitions.filter((t) => !(t.from === from && t.to === to && t.symbol === symbol))

      // Create updated automaton
      const updatedAutomaton = {
        ...prev,
        transitions: newTransitions,
      }

      // Re-determine the type
      const automatonType = AutomataEngine.determineAutomatonType(updatedAutomaton)

      return {
        ...updatedAutomaton,
        type: automatonType,
      }
    })
  }, [])

  const setStartState = useCallback((stateId: string) => {
    setAutomaton((prev) => {
      if (!prev || !prev.states.some((s) => s.id === stateId)) return prev

      return {
        ...prev,
        startState: stateId,
      }
    })
  }, [])

  const setFinalStates = useCallback((stateIds: string[]) => {
    setAutomaton((prev) => {
      if (!prev) return null

      // Filter to only include existing states
      const validStateIds = stateIds.filter((id) => prev.states.some((s) => s.id === id))

      return {
        ...prev,
        finalStates: validStateIds,
      }
    })
  }, [])

  const testString = useCallback(
    (input: string) => {
      if (!automaton) return { accepted: false }

      // Always test against the currently displayed automaton
      return AutomataEngine.testString(automaton, input)
    },
    [automaton],
  )

  const convertNFAToDFA = useCallback(() => {
    if (!automaton || automaton.type === "DFA") return

    const dfa = AutomataEngine.convertNFAToDFA(automaton)
    setAutomaton(dfa)
    // Clear minimization result when converting
    setMinimizationResult(null)
    setShowOriginalDFA(false)
  }, [automaton])

  const minimizeDFA = useCallback(() => {
    if (!automaton || automaton.type !== "DFA") return

    // Check if DFA is complete before allowing minimization
    const isComplete = AutomataEngine.isCompleteDFA(automaton)
    if (!isComplete) {
      console.warn("Cannot minimize incomplete DFA. DFA must be complete for minimization.")
      return
    }

    const result = AutomataEngine.minimizeDFAWithDetails(automaton)
    setMinimizationResult(result)
    setAutomaton(result.minimizedDFA)
    setShowOriginalDFA(false)
  }, [automaton])

  const toggleDFAView = useCallback(() => {
    if (!minimizationResult) return

    setShowOriginalDFA((prev) => {
      const newShowOriginal = !prev
      // Update the automaton state to trigger graph re-rendering
      setAutomaton(newShowOriginal ? minimizationResult.originalDFA : minimizationResult.minimizedDFA)
      return newShowOriginal
    })
  }, [minimizationResult])

  const clearAutomaton = useCallback(() => {
    setAutomaton(null)
    setMinimizationResult(null)
    setShowOriginalDFA(false)
  }, [])

  const forceTypeReevaluation = useCallback(() => {
    setAutomaton((prev) => {
      if (!prev) return null

      const correctType = AutomataEngine.determineAutomatonType(prev)

      if (prev.type !== correctType) {
        return {
          ...prev,
          type: correctType,
        }
      }

      return prev
    })
  }, [])

  // New function to set automaton and clear minimization state (for loading from database)
  const setAutomatonFromExternal = useCallback((newAutomaton: Automaton | null) => {
    setAutomaton(newAutomaton)
    // Clear minimization result when loading external automaton
    setMinimizationResult(null)
    setShowOriginalDFA(false)
  }, [])

  return {
    automaton,
    setAutomaton: setAutomatonFromExternal, // Use the new function that clears minimization state
    addState,
    removeState,
    addTransition,
    removeTransition,
    setStartState,
    setFinalStates,
    testString,
    convertNFAToDFA,
    minimizeDFA,
    clearAutomaton,
    forceTypeReevaluation,
    minimizationResult,
    showOriginalDFA,
    toggleDFAView,
  }
}