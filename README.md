# action-download-artifacts-plus
Advanced action for downloading multiple artifacts.

## Features 
1. Download multiple artifacts to the same directory. If some artifacts have overlapping files, the contents of the last artifact downloaded will override the files of previous ones.
2. Select which artifacts to download.

## Example

```yaml
- name: Download all .deb and .rpm artifacts 
  uses: nanoufo/action-download-artifacts-plus@v1.0  
  with:
    path: ./artifacts
    names: |
      *.deb
      *.rpm
    if-no-artifacts-match: error
```

## Inputs
- `path` (optional): Specifies the directory where the downloaded artifacts will be stored. The directory along with its parents will be created if it does not exist. Default: workspace directory.
- `names` (optional): A list of wildcard patterns used to match against artifact names. Each pattern should be placed on a separate line, and at least one of the patterns must match the artifact name for it to be downloaded. Default: '*'.
- `if-no-artifacts-match` (optional): Specifies the desired behavior when there is a pattern with no matching artifacts. Available options are 'warn' (display a warning but do not fail the action), 'error' (fail the action with an error message), and 'ignore' (do not output any warnings or errors). Default: 'warn'.
