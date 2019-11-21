"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const execSync = require("child_process").execSync;

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the lovely ${chalk.red(
          "generator-dotnet-webapi"
        )} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "projectName",
        message: "Your project name",
        default: this.appname // Default to current folder name
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    const projectName = this.props.name;
    const domainName = `${projectName}.Domain`;
    const infrastructureName = `${projectName}.Infrastructure`;
    const webApiName = `${projectName}.WebApi`;

    this._dotnetCreateNew("sln", projectName);

    this._dotnetCreateNew("classlib", domainName);
    this._dotnetSlnReference(domainName);

    this._dotnetCreateNew("classlib", infrastructureName);
    this._dotnetSlnReference(infrastructureName);
    this._dotnetReference(infrastructureName, domainName);

    this._dotnetCreateNew("webapi", webApiName);
    this._dotnetSlnReference(webApiName);
    this._dotnetReference(webApiName, infrastructureName);
    this._dotnetReference(webApiName, domainName);
  }

  _dotnetCreateNew(type, projectName) {
    this.log(`Creating ${type} ${projectName}`);
    execSync(`dotnet new ${type} -n ${projectName}`, {
      cwd: this.destinationRoot()
    });
  }

  _dotnetSlnReference(projectName) {
    this.log(`Associating ${projectName} with sln`);
    execSync(`dotnet sln add ./${projectName}`, {
      cwd: this.destinationRoot()
    });
  }

  _dotnetReference(projectName, projectTargetReference) {
    this.log(`Associating ${projectName} with ${projectTargetReference}`);
    execSync(`dotnet add ${projectName} reference ${projectTargetReference}`, {
      cwd: this.destinationRoot()
    });
  }
};
