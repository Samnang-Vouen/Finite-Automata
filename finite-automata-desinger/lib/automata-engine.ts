import type { Automaton, State, Transition } from "@/types/automata"

export interface MinimizationResult {
  originalDFA: Automaton
  minimizedDFA: Automaton
  stateMapping: Map<string, string> // original state -> minimized state
  partitions: string[][] // final partitions
  equivalentStates: { [minimizedState: string]: string[] } // minimized state -> original states
  combinedTransitions: {
    [minimizedState: string]: {
      [symbol: string]: {
        to: string
        originalTransitions: { from: string; to: string; symbol: string }[]
      }
    }
  }
  algorithm: "Hopcroft" // Algorithm used
  partitioningSteps: {
    step: number
    description: string
    partitionsBefore: string[][]
    partitionsAfter: string[][]
    splittingPartition?: string[]
    symbolsChecked: string[]
    splitDetails: {
      symbol: string
      splitOccurred: boolean
      splitResult?: string[][]
    }[]
  }[]
}

export class AutomataEngine {
  // Helper function to check if a symbol is epsilon
  private static isEpsilon(symbol: string): boolean {
    const result = symbol === "ε" || symbol === "e" || symbol === "E" || symbol === ""
    console.log(`Checking if '${symbol}' is epsilon: ${result}`)
    return result
  }

  static testString(automaton: Automaton, input: string): { accepted: boolean; path?: string[] } {
    if (!automaton.startState) {
      return { accepted: false }
    }

    if (automaton.type === "DFA") {
      return this.testStringDFA(automaton, input)
    } else {
      return this.testStringNFA(automaton, input)
    }
  }

  private static testStringDFA(automaton: Automaton, input: string): { accepted: boolean; path?: string[] } {
    let currentState = automaton.startState!
    const path = [currentState]

    for (const symbol of input) {
      const transition = automaton.transitions.find((t) => t.from === currentState && t.symbol === symbol)

      if (!transition) {
        return { accepted: false, path }
      }

      currentState = transition.to
      path.push(currentState)
    }

    return {
      accepted: automaton.finalStates.includes(currentState),
      path,
    }
  }

  private static testStringNFA(automaton: Automaton, input: string): { accepted: boolean; path?: string[] } {
    let currentStates = new Set([automaton.startState!])

    // Add epsilon closure of start state
    currentStates = this.epsilonClosure(automaton, currentStates)

    const path = [Array.from(currentStates).sort().join(",")]

    for (const symbol of input) {
      const nextStates = new Set<string>()

      for (const state of Array.from(currentStates)) {
        const transitions = automaton.transitions.filter((t) => t.from === state && t.symbol === symbol)

        for (const transition of transitions) {
          nextStates.add(transition.to)
        }
      }

      if (nextStates.size === 0) {
        return { accepted: false, path }
      }

      currentStates = this.epsilonClosure(automaton, nextStates)
      path.push(Array.from(currentStates).sort().join(","))
    }

    const accepted = Array.from(currentStates).some((state) => automaton.finalStates.includes(state))

    return { accepted, path }
  }

  private static epsilonClosure(automaton: Automaton, states: Set<string>): Set<string> {
    const closure = new Set(states)
    const stack = Array.from(states)

    while (stack.length > 0) {
      const state = stack.pop()!
      const epsilonTransitions = automaton.transitions.filter((t) => t.from === state && this.isEpsilon(t.symbol))

      for (const transition of epsilonTransitions) {
        if (!closure.has(transition.to)) {
          closure.add(transition.to)
          stack.push(transition.to)
        }
      }
    }

    return closure
  }

  static hasNondeterministicTransitions(transitions: Transition[]): boolean {
    const transitionMap = new Map<string, Set<string>>()

    for (const transition of transitions) {
      const key = `${transition.from}-${transition.symbol}`
      console.log(`Processing transition: ${transition.from} --${transition.symbol}--> ${transition.to}`)

      if (!transitionMap.has(key)) {
        transitionMap.set(key, new Set())
      }

      transitionMap.get(key)!.add(transition.to)
    }

    console.log(
      "Transition map:",
      Array.from(transitionMap.entries()).map(([key, destinations]) => ({
        key,
        destinations: Array.from(destinations),
      })),
    )

    // Check if any state-symbol pair has multiple destinations (nondeterminism)
    for (const entry of Array.from(transitionMap.entries())) {
      const [key, destinations] = entry;
      if (destinations.size > 1) {
        console.log(`Nondeterminism found at ${key}: destinations = [${Array.from(destinations).join(", ")}]`)
        return true
      }
    }

    return false
  }

  // Add a new method to check if automaton is complete DFA
  static isCompleteDFA(automaton: Automaton): boolean {
    if (automaton.type === "NFA") return false

    // Check for epsilon transitions
    const hasEpsilon = automaton.transitions.some((t) => this.isEpsilon(t.symbol))
    if (hasEpsilon) return false

    // Check for nondeterministic transitions
    if (this.hasNondeterministicTransitions(automaton.transitions)) return false

    // Get alphabet (excluding epsilon)
    const alphabet = Array.from(new Set(automaton.transitions.map((t) => t.symbol).filter((s) => !this.isEpsilon(s))))

    // Check if every state has a transition for every symbol (completeness)
    for (const state of automaton.states) {
      for (const symbol of alphabet) {
        const hasTransition = automaton.transitions.some((t) => t.from === state.id && t.symbol === symbol)
        if (!hasTransition) {
          return false // Incomplete DFA
        }
      }
    }

    return true
  }

  // Fixed method to determine automaton type
  static determineAutomatonType(automaton: Automaton): "DFA" | "NFA" {
    console.log("=== Determining Automaton Type ===")
    console.log("All transitions:", automaton.transitions)

    // Check for epsilon transitions (including 'e' and 'E')
    const epsilonTransitions = automaton.transitions.filter((t) => this.isEpsilon(t.symbol))
    const hasEpsilon = epsilonTransitions.length > 0

    console.log("Epsilon transitions found:", epsilonTransitions)
    console.log("Has epsilon transitions:", hasEpsilon)

    if (hasEpsilon) {
      console.log("NFA detected: Has epsilon transitions")
      return "NFA"
    }

    // Check for nondeterministic transitions
    const hasNondeterministic = this.hasNondeterministicTransitions(automaton.transitions)
    console.log("Has nondeterministic transitions:", hasNondeterministic)

    if (hasNondeterministic) {
      console.log("NFA detected: Has nondeterministic transitions")
      return "NFA"
    }

    console.log("DFA detected: No epsilon or nondeterministic transitions")
    return "DFA"
  }

  // Add method to analyze automaton properties
  static analyzeAutomaton(automaton: Automaton): {
    hasEpsilonTransitions: boolean
    hasNondeterministicTransitions: boolean
    epsilonTransitions: Transition[]
    nondeterministicTransitions: { from: string; symbol: string; destinations: string[] }[]
  } {
    const epsilonTransitions = automaton.transitions.filter((t) => this.isEpsilon(t.symbol))
    const hasEpsilonTransitions = epsilonTransitions.length > 0

    // Find nondeterministic transitions
    const transitionMap = new Map<string, Set<string>>()
    const nondeterministicTransitions: { from: string; symbol: string; destinations: string[] }[] = []

    for (const transition of automaton.transitions) {
      const key = `${transition.from}-${transition.symbol}`

      if (!transitionMap.has(key)) {
        transitionMap.set(key, new Set())
      }

      transitionMap.get(key)!.add(transition.to)
    }

    // Check for nondeterminism
    for (const entry of Array.from(transitionMap.entries())) {
      const [key, destinations] = entry;
      if (destinations.size > 1) {
        const [from, symbol] = key.split("-")
        nondeterministicTransitions.push({
          from,
          symbol,
          destinations: Array.from(destinations),
        })
      }
    }

    const hasNondeterministicTransitions = nondeterministicTransitions.length > 0

    return {
      hasEpsilonTransitions,
      hasNondeterministicTransitions,
      epsilonTransitions,
      nondeterministicTransitions,
    }
  }

  static convertNFAToDFA(nfa: Automaton): Automaton {
    if (nfa.type === "DFA") return nfa

    const dfaStates: State[] = []
    const dfaTransitions: Transition[] = []
    const stateMap = new Map<string, string>() // NFA state set -> DFA state name
    const queue: Set<string>[] = []
    let stateCounter = 0
    let deadStateName: string | null = null

    // Start with epsilon closure of start state
    const startClosure = this.epsilonClosure(nfa, new Set([nfa.startState!]))
    const startStateName = this.generateAlphabeticStateName(stateCounter++)

    dfaStates.push({ id: startStateName })
    stateMap.set(this.setToKey(startClosure), startStateName)
    queue.push(startClosure)

    // Get alphabet (excluding epsilon)
    const alphabet = Array.from(new Set(nfa.transitions.map((t) => t.symbol).filter((s) => !this.isEpsilon(s))))

    // Track states that need transitions to dead state
    const missingTransitions: { from: string; symbol: string }[] = []

    while (queue.length > 0) {
      const currentStateSet = queue.shift()!
      const currentStateName = stateMap.get(this.setToKey(currentStateSet))!

      for (const symbol of alphabet) {
        const nextStates = new Set<string>()

        // Find all states reachable by this symbol from current state set
        for (const state of Array.from(currentStateSet)) {
          const transitions = nfa.transitions.filter((t) => t.from === state && t.symbol === symbol)

          for (const transition of transitions) {
            nextStates.add(transition.to)
          }
        }

        // Handle empty set case: δ(currentState, symbol) = ∅
        if (nextStates.size === 0) {
          console.log(
            `Empty transition: δ(${Array.from(currentStateSet).join(",")}, ${symbol}) = ∅ - will create dead state`,
          )
          // Record this missing transition for later dead state creation
          missingTransitions.push({ from: currentStateName, symbol })
          continue
        }

        // Add epsilon closure
        const nextClosure = this.epsilonClosure(nfa, nextStates)
        const nextKey = this.setToKey(nextClosure)
        let nextStateName = stateMap.get(nextKey)

        // Add new state if not seen before
        if (!nextStateName) {
          nextStateName = this.generateAlphabeticStateName(stateCounter++)
          dfaStates.push({ id: nextStateName })
          stateMap.set(nextKey, nextStateName)
          queue.push(nextClosure)
          console.log(`Created new DFA state ${nextStateName} for NFA states {${Array.from(nextClosure).join(",")}}`)
        }

        // Add transition
        dfaTransitions.push({
          from: currentStateName,
          to: nextStateName,
          symbol,
        })
        console.log(`Added transition: ${currentStateName} --${symbol}--> ${nextStateName}`)
      }
    }

    // Create dead state if there are missing transitions
    if (missingTransitions.length > 0) {
      deadStateName = this.generateAlphabeticStateName(stateCounter++)
      dfaStates.push({ id: deadStateName })
      console.log(`Created dead state: ${deadStateName} for empty set transitions`)

      // Add transitions to dead state for all missing transitions
      for (const missing of missingTransitions) {
        dfaTransitions.push({
          from: missing.from,
          to: deadStateName,
          symbol: missing.symbol,
        })
        console.log(`Added dead state transition: ${missing.from} --${missing.symbol}--> ${deadStateName}`)
      }

      // Dead state loops to itself on all alphabet symbols
      for (const symbol of alphabet) {
        dfaTransitions.push({
          from: deadStateName,
          to: deadStateName,
          symbol,
        })
        console.log(`Added dead state self-loop: ${deadStateName} --${symbol}--> ${deadStateName}`)
      }
    }

    // Determine final states (dead state is never final)
    const dfaFinalStates: string[] = []
    for (const [stateSetKey, dfaStateName] of Array.from(stateMap.entries())) {
      const stateSet = this.keyToSet(stateSetKey)
      const isFinal = Array.from(stateSet).some((state) => nfa.finalStates.includes(state))

      if (isFinal) {
        dfaFinalStates.push(dfaStateName)
      }
    }

    return {
      states: dfaStates,
      transitions: dfaTransitions,
      startState: startStateName,
      finalStates: dfaFinalStates,
      type: "DFA",
    }
  }

  // Complete DFA by adding dead state for missing transitions
  private static makeCompleteDFA(dfa: Automaton): Automaton {
    if (this.isCompleteDFA(dfa)) {
      console.log("DFA is already complete")
      return dfa
    }

    console.log("Making incomplete DFA complete by adding dead state...")

    // Get alphabet from existing transitions
    const alphabet = Array.from(new Set(dfa.transitions.map((t) => t.symbol).filter((s) => !this.isEpsilon(s))))

    if (alphabet.length === 0) {
      console.log("No alphabet found, returning original DFA")
      return dfa
    }

    // Find missing transitions
    const missingTransitions: { from: string; symbol: string }[] = []

    for (const state of dfa.states) {
      for (const symbol of alphabet) {
        const hasTransition = dfa.transitions.some((t) => t.from === state.id && t.symbol === symbol)
        if (!hasTransition) {
          missingTransitions.push({ from: state.id, symbol })
        }
      }
    }

    if (missingTransitions.length === 0) {
      console.log("No missing transitions found")
      return dfa
    }

    // Create dead state with alphabetic naming
    const existingStateNames = dfa.states.map((s) => s.id)
    let deadStateIndex = 0
    let deadStateName = this.generateAlphabeticStateName(deadStateIndex)

    // Find next available alphabetic name
    while (existingStateNames.includes(deadStateName)) {
      deadStateIndex++
      deadStateName = this.generateAlphabeticStateName(deadStateIndex)
    }

    console.log(`Creating dead state: ${deadStateName}`)

    // Create complete DFA
    const completeDFA: Automaton = {
      states: [...dfa.states, { id: deadStateName }],
      transitions: [...dfa.transitions],
      startState: dfa.startState,
      finalStates: [...dfa.finalStates], // Dead state is never final
      type: "DFA",
    }

    // Add transitions to dead state for missing transitions
    for (const missing of missingTransitions) {
      completeDFA.transitions.push({
        from: missing.from,
        to: deadStateName,
        symbol: missing.symbol,
      })
      console.log(`Added missing transition: ${missing.from} --${missing.symbol}--> ${deadStateName}`)
    }

    // Add self-loops for dead state on all alphabet symbols
    for (const symbol of alphabet) {
      completeDFA.transitions.push({
        from: deadStateName,
        to: deadStateName,
        symbol,
      })
      console.log(`Added dead state self-loop: ${deadStateName} --${symbol}--> ${deadStateName}`)
    }

    console.log(
      `Complete DFA created with ${completeDFA.states.length} states and ${completeDFA.transitions.length} transitions`,
    )

    return completeDFA
  }

  // Hopcroft's Algorithm for DFA Minimization
  static minimizeDFAWithDetails(dfa: Automaton): MinimizationResult {
    if (dfa.type !== "DFA") {
      return {
        originalDFA: dfa,
        minimizedDFA: dfa,
        stateMapping: new Map(),
        partitions: [],
        equivalentStates: {},
        combinedTransitions: {},
        algorithm: "Hopcroft",
        partitioningSteps: [],
      }
    }

    console.log("=== Starting Hopcroft's DFA Minimization Algorithm ===")

    // Step 1: Make DFA complete by adding dead state if necessary
    const completeDFA = this.makeCompleteDFA(dfa)

    // Step 2: Remove unreachable states
    const reachableStates = this.getReachableStates(completeDFA)
    const reachableDFA: Automaton = {
      ...completeDFA,
      states: completeDFA.states.filter((s) => reachableStates.has(s.id)),
      transitions: completeDFA.transitions.filter((t) => reachableStates.has(t.from) && reachableStates.has(t.to)),
      finalStates: completeDFA.finalStates.filter((s) => reachableStates.has(s)),
    }

    // Step 3: Apply Hopcroft's Algorithm
    const alphabet = Array.from(new Set(reachableDFA.transitions.map((t) => t.symbol)))
    const partitioningSteps: MinimizationResult["partitioningSteps"] = []

    // Initial partition: separate final and non-final states
    const finalStates = new Set(reachableDFA.finalStates)
    const nonFinalStates = reachableDFA.states.map((s) => s.id).filter((s) => !finalStates.has(s))

    const partitions: string[][] = []
    if (nonFinalStates.length > 0) {
      partitions.push(nonFinalStates)
    }
    if (reachableDFA.finalStates.length > 0) {
      partitions.push([...reachableDFA.finalStates])
    }

    partitioningSteps.push({
      step: 0,
      description: "Initial partition: separate final and non-final states",
      partitionsBefore: [],
      partitionsAfter: partitions.map((p) => [...p]),
      symbolsChecked: [],
      splitDetails: [],
    })

    console.log("Initial partitions:", partitions)

    // Hopcroft's Algorithm: Iteratively refine partitions
    let stepCounter = 1
    let changed = true

    while (changed) {
      changed = false

      for (let i = 0; i < partitions.length && !changed; i++) {
        const partition = partitions[i]

        if (partition.length <= 1) {
          continue
        }

        const partitionsBefore = partitions.map((p) => [...p])
        const splitDetails: MinimizationResult["partitioningSteps"][0]["splitDetails"] = []

        // Try ALL symbols for this partition
        for (const symbol of alphabet) {
          const subPartitions = this.splitPartitionHopcroft(reachableDFA, partition, partitions, symbol)

          splitDetails.push({
            symbol,
            splitOccurred: subPartitions.length > 1,
            splitResult: subPartitions.length > 1 ? subPartitions.map((p) => [...p]) : undefined,
          })

          if (subPartitions.length > 1) {
            // Replace the original partition with its sub-partitions
            partitions.splice(i, 1, ...subPartitions)
            changed = true

            partitioningSteps.push({
              step: stepCounter++,
              description: `Analyzing partition {${partition.join(", ")}} with all symbols`,
              partitionsBefore,
              partitionsAfter: partitions.map((p) => [...p]),
              splittingPartition: [...partition],
              symbolsChecked: [...alphabet],
              splitDetails,
            })

            console.log(`Split partition [${partition.join(", ")}] using symbols:`, splitDetails)
            break // Move to next iteration after a split
          }
        }

        // If no split occurred, still record the step to show all symbols were checked
        if (!changed) {
          partitioningSteps.push({
            step: stepCounter++,
            description: `Checked partition {${partition.join(", ")}} with all symbols - no split needed`,
            partitionsBefore,
            partitionsAfter: partitions.map((p) => [...p]),
            splittingPartition: [...partition],
            symbolsChecked: [...alphabet],
            splitDetails,
          })
        }
      }
    }

    console.log("Final partitions:", partitions)

    // Step 4: Build minimized DFA with detailed mapping
    const stateMapping = new Map<string, string>()
    const equivalentStates: { [minimizedState: string]: string[] } = {}
    const minStates: State[] = []

    partitions.forEach((partition, index) => {
      const newStateName = this.generateAlphabeticStateName(index)
      minStates.push({ id: newStateName })
      equivalentStates[newStateName] = [...partition]

      for (const state of partition) {
        stateMapping.set(state, newStateName)
      }
    })

    // Build transitions and track combined transitions
    const minTransitions: Transition[] = []
    const transitionSet = new Set<string>()
    const combinedTransitions: {
      [minimizedState: string]: {
        [symbol: string]: {
          to: string
          originalTransitions: { from: string; to: string; symbol: string }[]
        }
      }
    } = {}

    // Initialize combined transitions structure
    for (const minState of minStates) {
      combinedTransitions[minState.id] = {}
    }

    for (const transition of reachableDFA.transitions) {
      const fromState = stateMapping.get(transition.from)!
      const toState = stateMapping.get(transition.to)!
      const key = `${fromState}-${toState}-${transition.symbol}`

      // Track original transitions for each combined transition
      if (!combinedTransitions[fromState][transition.symbol]) {
        combinedTransitions[fromState][transition.symbol] = {
          to: toState,
          originalTransitions: [],
        }
      }

      combinedTransitions[fromState][transition.symbol].originalTransitions.push({
        from: transition.from,
        to: transition.to,
        symbol: transition.symbol,
      })

      if (!transitionSet.has(key)) {
        transitionSet.add(key)
        minTransitions.push({
          from: fromState,
          to: toState,
          symbol: transition.symbol,
        })
      }
    }

    const minStartState = stateMapping.get(reachableDFA.startState!)!
    const minFinalStates = Array.from(new Set(reachableDFA.finalStates.map((s) => stateMapping.get(s)!)))

    const minimizedDFA: Automaton = {
      states: minStates,
      transitions: minTransitions,
      startState: minStartState,
      finalStates: minFinalStates,
      type: "DFA",
    }

    return {
      originalDFA: dfa,
      minimizedDFA,
      stateMapping,
      partitions,
      equivalentStates,
      combinedTransitions,
      algorithm: "Hopcroft",
      partitioningSteps,
    }
  }

  // Hopcroft's partition splitting method
  private static splitPartitionHopcroft(
    dfa: Automaton,
    partition: string[],
    allPartitions: string[][],
    symbol: string,
  ): string[][] {
    if (partition.length <= 1) return [partition]

    // Group states by which partition their transition on 'symbol' leads to
    const transitionGroups = new Map<number, string[]>()

    for (const state of partition) {
      const transition = dfa.transitions.find((t) => t.from === state && t.symbol === symbol)
      let targetPartitionIndex = -1

      if (transition) {
        // Find which partition the target state belongs to
        for (let i = 0; i < allPartitions.length; i++) {
          if (allPartitions[i].includes(transition.to)) {
            targetPartitionIndex = i
            break
          }
        }
      }

      if (!transitionGroups.has(targetPartitionIndex)) {
        transitionGroups.set(targetPartitionIndex, [])
      }
      transitionGroups.get(targetPartitionIndex)!.push(state)
    }

    // Return the groups as separate partitions
    return Array.from(transitionGroups.values())
  }

  static minimizeDFA(dfa: Automaton): Automaton {
    const result = this.minimizeDFAWithDetails(dfa)
    return result.minimizedDFA
  }

  private static getReachableStates(dfa: Automaton): Set<string> {
    if (!dfa.startState) return new Set()

    const reachable = new Set<string>()
    const queue = [dfa.startState]
    reachable.add(dfa.startState)

    while (queue.length > 0) {
      const current = queue.shift()!

      for (const transition of dfa.transitions) {
        if (transition.from === current && !reachable.has(transition.to)) {
          reachable.add(transition.to)
          queue.push(transition.to)
        }
      }
    }

    return reachable
  }

  // Generate alphabetic state names: A, B, C, ..., Z, AA, AB, AC, ...
  private static generateAlphabeticStateName(index: number): string {
    let result = ""
    let num = index

    do {
      result = String.fromCharCode(65 + (num % 26)) + result
      num = Math.floor(num / 26)
    } while (num > 0)

    return result
  }

  private static setToKey(stateSet: Set<string>): string {
    return Array.from(stateSet).sort().join(",")
  }

  private static keyToSet(key: string): Set<string> {
    if (key === "") return new Set();
    return new Set(key.split(","));
  }
}