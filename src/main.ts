import { getInputs } from "./inputs-helper";
import { setFailed } from "@actions/core";
import * as artifact from "@actions/artifact";

async function main(): Promise<void> {
  try {
    const inputs = getInputs();
    console.log(inputs);
  } catch (error) {
    setFailed(error instanceof Error ? error : String(error));
  }
}

main();
