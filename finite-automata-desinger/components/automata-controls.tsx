"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Minimize2, AlertTriangle, Info } from "lucide-react"
import type { Automaton } from "@/types/automata"
import type { MinimizationResult } from "@/lib/automata-engine"
import { AutomataEngine } from "@/lib/automata-engine"
import { MinimizationDetails } from "./minimization-details"

interface AutomataControlsProps {
  automaton: Automaton | null
  onConvertNFAToDFA: () => void
  onMinimizeDFA: () => void
  minimizationResult?: MinimizationResult | null
  showOriginalDFA?: boolean
  onToggleView?: () => void
}

export function AutomataControls({
  automaton,
  onConvertNFAToDFA,
  onMinimizeDFA,
  minimizationResult,
  showOriginalDFA = false,
  onToggleView,
}: AutomataControlsProps) {
  if (!automaton) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Create an automaton to see available operations
        </CardContent>
      </Card>
    )
  }

  const analysis = AutomataEngine.analyzeAutomaton(automaton)
  const isCompleteDFA = AutomataEngine.isCompleteDFA(automaton)

  // Get alphabet
  const alphabet = Array.from(new Set(automaton.transitions.map((t) => t.symbol).filter((s) => s !== "ε" && s !== "")))

  // Check if DFA can be minimized
  const canMinimize = automaton.type === "DFA" && isCompleteDFA

  return (
    <div className="space-y-4">
      {/* Minimization Details */}
      {minimizationResult && onToggleView && (
        <MinimizationDetails
          minimizationResult={minimizationResult}
          showOriginalDFA={showOriginalDFA}
          onToggleView={onToggleView}
        />
      )}

      {/* Automaton Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automaton Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Type:</span>
            <Badge variant={automaton.type === "DFA" ? "default" : "secondary"}>{automaton.type}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>States:</span>
            <span>{automaton.states.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Transitions:</span>
            <span>{automaton.transitions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Start State:</span>
            <span>{automaton.startState || "None"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Final States:</span>
            <span>{automaton.finalStates.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Alphabet Size:</span>
            <span>{alphabet.length}</span>
          </div>

          {/* Show if viewing original vs minimized */}
          {minimizationResult && (
            <div className="flex items-center justify-between">
              <span>Current View:</span>
              <Badge variant={showOriginalDFA ? "secondary" : "default"}>
                {showOriginalDFA ? "Original DFA" : "Minimized DFA"}
              </Badge>
            </div>
          )}

          {/* DFA Completeness Status */}
          {automaton.type === "DFA" && (
            <div className="flex items-center justify-between">
              <span>Complete DFA:</span>
              <Badge variant={isCompleteDFA ? "default" : "destructive"}>{isCompleteDFA ? "Yes" : "No"}</Badge>
            </div>
          )}

          {/* NFA Characteristics */}
          {analysis.hasEpsilonTransitions && (
            <div className="flex items-center justify-between">
              <span>Epsilon Transitions:</span>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                {analysis.epsilonTransitions.length}
              </Badge>
            </div>
          )}

          {analysis.hasNondeterministicTransitions && (
            <div className="flex items-center justify-between">
              <span>Nondeterministic:</span>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Yes
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incomplete DFA Warning */}
      {automaton.type === "DFA" && !isCompleteDFA && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              Incomplete DFA Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-amber-800">
            <p className="text-sm">
              This DFA is incomplete because some states lack transitions for certain alphabet symbols.
            </p>

            <div className="text-xs space-y-2">
              <p>
                <strong>Missing transitions for:</strong>
              </p>
              <div className="space-y-1">
                {automaton.states.map((state) => {
                  const missingSymbols = alphabet.filter(
                    (symbol) => !automaton.transitions.some((t) => t.from === state.id && t.symbol === symbol),
                  )

                  if (missingSymbols.length > 0) {
                    return (
                      <div key={state.id} className="bg-amber-100 p-2 rounded border border-amber-300">
                        State <strong>{state.id}</strong> missing: {missingSymbols.join(", ")}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-100 rounded border border-amber-300">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium mb-1">To enable minimization:</p>
                <p>
                  Add the missing transitions above, or the minimization algorithm will automatically add a dead state
                  to make the DFA complete before minimizing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NFA Details */}
      {(analysis.hasEpsilonTransitions || analysis.hasNondeterministicTransitions) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              NFA Characteristics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.hasEpsilonTransitions && (
              <div>
                <h4 className="font-medium text-sm mb-2">Epsilon Transitions:</h4>
                <div className="space-y-1">
                  {analysis.epsilonTransitions.map((transition, index) => (
                    <div key={index} className="text-xs bg-orange-50 p-2 rounded border border-orange-200">
                      {transition.from} → {transition.to} (ε)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.hasNondeterministicTransitions && (
              <div>
                <h4 className="font-medium text-sm mb-2">Nondeterministic Transitions:</h4>
                <div className="space-y-1">
                  {analysis.nondeterministicTransitions.map((nd, index) => (
                    <div key={index} className="text-xs bg-orange-50 p-2 rounded border border-orange-200">
                      {nd.from} on &#39;{nd.symbol}&#39; → {nd.destinations.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {automaton.type === "NFA" && (
            <>
              <Button onClick={onConvertNFAToDFA} className="w-full" variant="default">
                <ArrowRight className="w-4 h-4 mr-2" />
                Convert NFA to DFA
              </Button>
              <p className="text-xs text-muted-foreground">
                {analysis.hasEpsilonTransitions
                  ? "Convert this epsilon-NFA to a deterministic finite automaton"
                  : "Convert this non-deterministic finite automaton to a deterministic one"}
              </p>
              <Separator />
            </>
          )}

          {automaton.type === "DFA" && (
            <>
              <Button
                onClick={onMinimizeDFA}
                className="w-full bg-transparent"
                variant="outline"
                disabled={!canMinimize}
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Minimize DFA
              </Button>

              {canMinimize ? (
                <p className="text-xs text-muted-foreground">
                  Apply the Hopcroft's Algorithm to create a minimal DFA with detailed analysis
                </p>
              ) : (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Minimization not available</p>
                      <p className="mt-1">
                        {!isCompleteDFA
                          ? "This DFA is incomplete. Minimization algorithms require complete DFAs where every state has transitions for all alphabet symbols."
                          : "This automaton cannot be minimized in its current state."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Alphabet */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alphabet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {alphabet.map((symbol) => (
              <Badge key={symbol} variant="outline">
                {symbol}
              </Badge>
            ))}
            {analysis.hasEpsilonTransitions && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                ε
              </Badge>
            )}
          </div>
          {alphabet.length === 0 && !analysis.hasEpsilonTransitions && (
            <p className="text-sm text-muted-foreground">No transitions defined</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
