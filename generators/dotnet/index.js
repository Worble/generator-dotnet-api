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
        name: "name",
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
    this.log(`Creating sln for ${this.props.name}`);
    execSync(`dotnet new sln -n ${this.props.name}`, {
      cwd: this.destinationRoot()
    });

    this.log(`Creating domain class lib for ${this.props.name}`);
    execSync(`dotnet new classlib -n ${this.props.name}.Domain`, {
      cwd: this.destinationRoot()
    });

    this.log(`Associating domain class lib for ${this.props.name} with sln`);
    execSync(`dotnet sln add ./${this.props.name}.Domain`, {
      cwd: this.destinationRoot()
    });

    this.log(`Creating infrastructure class lib for ${this.props.name}`);
    execSync(`dotnet new classlib -n ${this.props.name}.Infrastructure`, {
      cwd: this.destinationRoot()
    });

    this.log(
      `Associating infrastructure class lib for ${this.props.name} with sln`
    );
    execSync(`dotnet sln add ./${this.props.name}.Infrastructure`, {
      cwd: this.destinationRoot()
    });

    this.log(`Creating web api for ${this.props.name}`);
    execSync(`dotnet new webapi -n ${this.props.name}.WebApi`, {
      cwd: this.destinationRoot()
    });

    this.log(`Associating web api for ${this.props.name} with sln`);
    execSync(`dotnet sln add ./${this.props.name}.WebApi`, {
      cwd: this.destinationRoot()
    });
  }

  install() {
    //this.installDependencies();
  }
};
