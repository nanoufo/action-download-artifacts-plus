import { Minimatch } from "minimatch";
import { FailureHandlingStrategy } from "./constants";

export interface ActionInputs {
  path: string;
  names: Minimatch[];
  ifNoArtifactsMatch: FailureHandlingStrategy;
}
