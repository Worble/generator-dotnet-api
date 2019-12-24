const execSync = require("child_process").execSync;

export function dotnetCreateNew(
  type: string,
  projectName?: string,
  framework?: string
) {
  this.log(`Creating ${type} ${projectName ? projectName : ""}`);

  const projectNameCommand = projectName ? ` -n ${projectName}` : "";
  const frameworkCommand = framework ? ` -f ${framework}` : "";

  execSync(`dotnet new ${type}${projectNameCommand}${frameworkCommand}`, {
    cwd: this.destinationRoot()
  });
}
