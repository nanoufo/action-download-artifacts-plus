import { normalize, resolve } from "path";
import { getInputs } from "./inputs-helper";
import { info, setFailed, warning } from "@actions/core";
import { DownloadHttpClient } from "@actions/artifact/lib/internal/download-http-client";
import { ArtifactResponse } from "@actions/artifact/lib/internal/contracts";
import {
  DownloadSpecification,
  getDownloadSpecification,
} from "@actions/artifact/lib/internal/download-specification";
import {
  createDirectoriesForArtifact,
  createEmptyFilesForArtifact,
} from "@actions/artifact/lib/internal/utils";
import { FailureHandlingStrategy } from "./constants";

function formatArtifactList(artifacts: ArtifactResponse[]): string {
  return artifacts.map((a) => a.name).join(", ");
}

async function downloadArtifact(
  client: DownloadHttpClient,
  specification: DownloadSpecification
) {
  await createDirectoriesForArtifact(specification.directoryStructure);
  await createEmptyFilesForArtifact(specification.emptyFilesToCreate);
  await client.downloadSingleArtifact(specification.filesToDownload);
}

async function main(): Promise<void> {
  // Get inputs
  const inputs = getInputs();
  if (inputs.names.length === 0) {
    info("Empty list of name patterns provided, nothing to do");
    return;
  }
  const destinationPath = resolve(normalize(inputs.path));

  // We use internals of @actions/artifact, it is not a problem since we bundle the fixed version of it
  const downloadHttpClient = new DownloadHttpClient();
  const allArtifacts = (await downloadHttpClient.listArtifacts()).value;

  // Filter artifacts
  const artifactSetToDownload = new Set<ArtifactResponse>();
  for (const namePattern of inputs.names) {
    let someArtifactMatches = false;
    for (const artifact of allArtifacts) {
      if (namePattern.match(artifact.name)) {
        artifactSetToDownload.add(artifact);
        someArtifactMatches = true;
      }
    }
    if (!someArtifactMatches) {
      const errorMessage = `No artifacts match the pattern: ${namePattern.pattern}`;
      switch (inputs.ifNoArtifactsMatch) {
        case FailureHandlingStrategy.ignore:
          break;
        case FailureHandlingStrategy.warn:
          warning(errorMessage);
          break;
        case FailureHandlingStrategy.error:
          throw Error(errorMessage);
      }
    }
  }
  const artifactsToDownload = [...artifactSetToDownload].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Download artifacts
  if (artifactsToDownload.length === 0) {
    console.info("No artifacts to download");
    return;
  }
  info(
    `${artifactsToDownload.length} of ${
      allArtifacts.length
    } artifacts to be downloaded: ${formatArtifactList(artifactsToDownload)}`
  );
  for (const artifact of artifactsToDownload) {
    info(`Downloading ${artifact.name}`);
    const items = await downloadHttpClient.getContainerItems(
      artifact.name,
      artifact.fileContainerResourceUrl
    );
    const downloadSpecification = getDownloadSpecification(
      artifact.name,
      items.value,
      destinationPath,
      false
    );
    await downloadArtifact(downloadHttpClient, downloadSpecification);
  }
}

main().catch((err) => setFailed(err instanceof Error ? err : String(err)));
