export enum Inputs {
  Path = "path",
  Names = "names",
  IfNoArtifactFound = "if-no-artifact-found",
  IfArtifactsOverlap = "if-artifacts-overlap",
}

export enum FailureHandlingStrategy {
  warn = "warn",
  error = "error",
  ignore = "ignore",
}
