"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ArrowRight, Zap, ArrowDown, CheckCircle, XCircle } from "lucide-react"
import type { MinimizationResult } from "@/lib/automata-engine"

interface MinimizationDetailsProps {
  minimizationResult: MinimizationResult
  showOriginalDFA: boolean
  onToggleView: () => void
}

export function MinimizationDetails({ minimizationResult, showOriginalDFA, onToggleView }: MinimizationDetailsProps) {
  const { originalDFA, minimizedDFA, equivalentStates, combinedTransitions, algorithm, partitioningSteps } =
    minimizationResult

  return (
    <div className="space-y-4">
      {/* View Toggle - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              DFA Minimization Result
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {algorithm}'s Algorithm
              </Badge>
            </div>
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
          {/* Hopcroft's Algorithm Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Hopcroft's Algorithm Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partitioningSteps.map((step, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    {/* Step Header */}
                    <div className="bg-gray-50 p-3 border-b">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Step {step.step}
                        </Badge>
                        <span className="text-sm font-medium">{step.description}</span>
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="p-3 space-y-3">
                      {/* Before Partitions (only show if not initial step) */}
                      {step.step > 0 && step.partitionsBefore.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">Before:</div>
                          <div className="flex flex-wrap gap-2">
                            {step.partitionsBefore.map((partition, pIndex) => (
                              <Badge
                                key={pIndex}
                                variant={
                                  step.splittingPartition &&
                                  JSON.stringify(partition.sort()) === JSON.stringify(step.splittingPartition.sort())
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {"{"}
                                {partition.join(", ")}
                                {"}"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Symbol Analysis Details */}
                      {step.splitDetails && step.splitDetails.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <div className="text-xs font-medium text-blue-800 mb-3">
                            {step.splittingPartition && (
                              <>
                                Analyzing partition {"{"}
                                {step.splittingPartition.join(", ")}
                                {"}"} with all symbols:
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {step.splitDetails.map((detail, dIndex) => (
                              <div
                                key={dIndex}
                                className={`p-2 rounded border text-xs ${
                                  detail.splitOccurred
                                    ? "bg-green-100 border-green-300 text-green-800"
                                    : "bg-gray-100 border-gray-300 text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {detail.splitOccurred ? (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <XCircle className="w-3 h-3 text-gray-500" />
                                  )}
                                  <span className="font-mono font-medium">Symbol '{detail.symbol}'</span>
                                  <span className="text-xs">
                                    {detail.splitOccurred ? "→ Split occurred" : "→ No split"}
                                  </span>
                                </div>
                                {detail.splitOccurred && detail.splitResult && (
                                  <div className="mt-2">
                                    <div className="text-xs font-medium mb-1">Split result:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {detail.splitResult.map((subPartition, spIndex) => (
                                        <Badge key={spIndex} variant="outline" className="text-xs">
                                          {"{"}
                                          {subPartition.join(", ")}
                                          {"}"}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Arrow */}
                      {step.step > 0 && (
                        <div className="flex justify-center">
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}

                      {/* After Partitions */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          {step.step === 0 ? "Initial partitions:" : "After:"}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {step.partitionsAfter.map((partition, pIndex) => (
                            <Badge
                              key={pIndex}
                              variant={
                                step.splitDetails &&
                                step.splitDetails.some(
                                  (detail) =>
                                    detail.splitResult &&
                                    detail.splitResult.some(
                                      (split) => JSON.stringify(split.sort()) === JSON.stringify(partition.sort()),
                                    ),
                                )
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {"{"}
                              {partition.join(", ")}
                              {"}"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {partitioningSteps.length === 1 && (
                <div className="text-sm text-muted-foreground mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  ℹ️ This DFA was already minimal - no further partitioning was needed after the initial separation of
                  final and non-final states.
                </div>
              )}
            </CardContent>
          </Card>

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
                        : `${originalStates.length} equivalent states merged by Hopcroft's algorithm`}
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