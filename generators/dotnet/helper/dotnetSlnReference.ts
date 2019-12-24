const execSync = require("child_process").execSync;

export function dotnetSlnReference(projectName: string, solutionName: string) {
  this.log(`Associating ${projectName} with ${solutionName}`);
  execSync(`dotnet sln ${solutionName} add ./${projectName}`, {
    cwd: this.destinationRoot()
  });
}
