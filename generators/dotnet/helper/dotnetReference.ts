const execSync = require("child_process").execSync;

export function dotnetReference(
  projectName: string,
  projectTargetReference: string
) {
  this.log(`Associating ${projectName} with ${projectTargetReference}`);
  execSync(`dotnet add ${projectName} reference ${projectTargetReference}`, {
    cwd: this.destinationRoot()
  });
}
