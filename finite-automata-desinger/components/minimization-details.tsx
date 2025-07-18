"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import type { MinimizationResult } from "@/lib/automata-engine"

interface MinimizationDetailsProps {
  minimizationResult: MinimizationResult
  showOriginalDFA: boolean
  onToggleView: () => void
}

export function MinimizationDetails({ minimizationResult, showOriginalDFA, onToggleView }: MinimizationDetailsProps) {
  const { originalDFA, minimizedDFA, equivalentStates, combinedTransitions } = minimizationResult

  return (
    <div className="space-y-4">
      {/* View Toggle - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            DFA Minimization Result
            <Button variant="outline" size="sm" onClick={onToggleView}>
              {showOriginalDFA ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showOriginalDFA ? "Show Minimized DFA" : "Show Original DFA"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>
                <strong>Original:</strong> {originalDFA.states.length} states
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>Minimized:</strong> {minimizedDFA.states.length} states
              </span>
            </div>
            <Badge variant={showOriginalDFA ? "secondary" : "default"}>
              {showOriginalDFA ? "Viewing Original DFA" : "Viewing Minimized DFA"}
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Reduction: {((1 - minimizedDFA.states.length / originalDFA.states.length) * 100).toFixed(1)}% fewer states
            {showOriginalDFA ? " • Diagram shows original DFA" : " • Diagram shows minimized DFA"}
          </div>
        </CardContent>
      </Card>

      {/* State Equivalence Classes and Combined Transitions - Only show when viewing minimized DFA */}
      {!showOriginalDFA && (
        <>
          {/* State Equivalence Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">State Equivalence Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(equivalentStates).map(([minState, originalStates]) => (
                  <div key={minState} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="font-mono">
                        {minState}
                      </Badge>
                      <span className="text-sm text-muted-foreground">represents</span>
                      <div className="flex gap-1">
                        {originalStates.map((origState) => (
                          <Badge key={origState} variant="outline" className="font-mono text-xs">
                            {origState}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {originalStates.length === 1
                        ? "Single state (no merging)"
                        : `${originalStates.length} equivalent states merged`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Combined Transitions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Combined Transitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(combinedTransitions).map(([fromState, transitions]) => (
                  <div key={fromState}>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      From State
                      <Badge variant="default" className="font-mono">
                        {fromState}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        (represents {equivalentStates[fromState]?.join(", ")})
                      </span>
                    </h4>
                    <div className="space-y-2 ml-4">
                      {Object.entries(transitions).map(([symbol, transitionInfo]) => (
                        <div key={symbol} className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm">
                              {fromState} --{symbol}-→ {transitionInfo.to}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {transitionInfo.originalTransitions.length} original transition
                              {transitionInfo.originalTransitions.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <strong>Original transitions:</strong>
                            <div className="mt-1 space-y-1">
                              {transitionInfo.originalTransitions.map((origTrans, idx) => (
                                <div key={idx} className="font-mono">
                                  {origTrans.from} --{origTrans.symbol}-→ {origTrans.to}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.keys(transitions).length === 0 && (
                      <div className="text-sm text-muted-foreground ml-4">No outgoing transitions</div>
                    )}
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}