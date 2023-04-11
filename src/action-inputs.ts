import { FailureHandlingStrategy } from "./constants";

export interface ActionInputs {
  path: string;
  names: string[];
  ifNoArtifactsFound: FailureHandlingStrategy;
  ifArtifactsOverlap: FailureHandlingStrategy;
}
