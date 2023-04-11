import * as core from "@actions/core";
import { ActionInputs } from "./action-inputs";
import { FailureHandlingStrategy, Inputs } from "./constants";
import { InputOptions } from "@actions/core";

interface GetInputHelper<T> {
  (name: string, options: InputOptions & { required: true }): T;
  (name: string, options?: InputOptions): T | undefined;
}

interface ValueParser<T> {
  (value: string): T;
}

const makeInputHelper = <T>(parser: ValueParser<T>): GetInputHelper<T> => {
  return (name: string, options?: InputOptions): any => {
    const value = core.getInput(name, options);
    if (value === "" && options?.required !== true) {
      // core.getInput returns "" if the value is not defined
      return undefined;
    }
    try {
      return parser(value);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid value for ${name}: ${errMessage}`);
    }
  };
};

const makeEnumInputHelper = <T extends Record<string, string>>(
  enumT: T
): GetInputHelper<T[keyof T]> => {
  const enumValues = Object.values(enumT);
  return makeInputHelper((valueStr) => {
    if (!enumValues.includes(valueStr)) {
      throw Error("value must be one of " + enumValues.join(", "));
    }
    return valueStr as T[keyof T];
  });
};

const getStringInput = makeInputHelper((valueStr) => valueStr);
const getFailureHandlingStrategyInput = makeEnumInputHelper(
  FailureHandlingStrategy
);

export function getInputs(): ActionInputs {
  // required means that either the input must be provided directly or via the default value in action.yml
  const inputs: ActionInputs = {
    path: getStringInput(Inputs.Path, { required: true }),
    names: getStringInput(Inputs.Names, { required: true })
      .split("\n")
      .filter((line) => line.trim()),
    ifNoArtifactsFound: getFailureHandlingStrategyInput(
      Inputs.IfNoArtifactFound,
      { required: true }
    ),
    ifArtifactsOverlap: getFailureHandlingStrategyInput(
      Inputs.IfArtifactsOverlap,
      { required: true }
    ),
  };

  return inputs;
}
