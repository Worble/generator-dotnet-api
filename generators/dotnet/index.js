/* eslint-disable max-params */
"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const execSync = require("child_process").execSync;
const fs = require("fs");

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
      },
      {
        type: "confirm",
        name: "stronglyTypedConfig",
        message:
          "Strongly type the config into the dependency injection provider?",
        default: false
      },
      {
        type: "input",
        name: "stronglyTypedConfigName",
        message: "The class name for your configuration object",
        default: "AppConfig",
        when: answers => answers.stronglyTypedConfig
      },
      {
        type: "confirm",
        name: "serilog",
        message: "Add Serilog?",
        default: false
      },
      {
        type: "confirm",
        name: "swagger",
        message: "Add Swagger?",
        default: false
      },
      {
        type: "confirm",
        name: "polly",
        message: "Setup example HttpClient with Polly policies?",
        default: false
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    // Template name constants
    const templateProjectName = "Template";
    const templateDomainName = `${templateProjectName}.Domain`;
    const templateInfrastructureName = `${templateProjectName}.Infrastructure`;
    const templateWebApiName = `${templateProjectName}.WebApi`;

    // Project name constants
    const projectName = this.props.projectName;
    const domainName = `${projectName}.Domain`;
    const infrastructureName = `${projectName}.Infrastructure`;
    const webApiName = `${projectName}.WebApi`;

    // Strongly typed config constants
    const stronglyTypedConfig = this.props.stronglyTypedConfig;
    const stronglyTypedConfigName = this.props.stronglyTypedConfigName;

    // Serilog constants
    const serilog = this.props.serilog;

    // Swagger constants
    const swagger = this.props.swagger;

    // Polly constants
    const polly = this.props.polly;

    // Initial setup
    this._setupProject(projectName, domainName, infrastructureName, webApiName);

    // Delete files we don't need
    this._cleanupProject(
      templateDomainName,
      templateWebApiName,
      domainName,
      infrastructureName,
      webApiName
    );

    // Add strongly typed config specific files
    if (stronglyTypedConfig) {
      this._setupStrongTypeConfig(
        templateDomainName,
        templateWebApiName,
        domainName,
        webApiName,
        stronglyTypedConfigName
      );
    }

    if (serilog) {
      this._setupSerilog(webApiName);
    }

    if (swagger) {
      this._setupSwagger(webApiName);
    }

    if (polly) {
      this._setupPolly(
        webApiName,
        templateDomainName,
        domainName,
        templateInfrastructureName,
        infrastructureName
      );
    }

    // // Files

    // - WeatherForecast.cs
    this.fs.copyTpl(
      this.templatePath(templateDomainName, "Models", "WeatherForecast.cs"),
      this.destinationPath(domainName, "Models", "WeatherForecast.cs"),
      { domainName }
    );

    // - Startup.cs
    this.fs.copyTpl(
      this.templatePath(templateWebApiName, "Startup.cs"),
      this.destinationPath(webApiName, "Startup.cs"),
      {
        webApiName,
        domainName,
        stronglyTypedConfig,
        stronglyTypedConfigName,
        serilog,
        swagger,
        polly,
        infrastructureName
      }
    );

    // - Program.cs
    this.fs.copyTpl(
      this.templatePath(templateWebApiName, "Program.cs"),
      this.destinationPath(webApiName, "Program.cs"),
      { webApiName, serilog }
    );

    // - appsettings.json
    this.fs.copyTpl(
      this.templatePath(templateWebApiName, "appsettings.json"),
      this.destinationPath(webApiName, "appsettings.json"),
      {
        serilog
      }
    );

    // - WeatherForecastController.cs
    this.fs.copyTpl(
      this.templatePath(
        templateWebApiName,
        "Controllers",
        "WeatherForecastController.cs"
      ),
      this.destinationPath(
        webApiName,
        "Controllers",
        "WeatherForecastController.cs"
      ),
      { domainName, webApiName, polly }
    );
  }

  _setupProject(projectName, domainName, infrastructureName, webApiName) {
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

    this.fs.copy(
      this.templatePath(".editorconfig"),
      this.destinationPath(".editorconfig")
    );
    this.fs.copy(
      this.templatePath(".gitignore.npmsucks"),
      this.destinationPath(".gitignore")
    );
  }

  _cleanupProject(
    templateDomainName,
    templateWebApiName,
    domainName,
    infrastructureName,
    webApiName
  ) {
    fs.unlinkSync(this.destinationPath(domainName, "Class1.cs"));
    fs.unlinkSync(this.destinationPath(infrastructureName, "Class1.cs"));
    fs.unlinkSync(this.destinationPath(webApiName, "WeatherForecast.cs"));
    fs.unlinkSync(this.destinationPath(webApiName, "Startup.cs"));
    fs.unlinkSync(this.destinationPath(webApiName, "Program.cs"));
    fs.unlinkSync(this.destinationPath(webApiName, "appsettings.json"));
    fs.unlinkSync(
      this.destinationPath(
        webApiName,
        "Controllers",
        "WeatherForecastController.cs"
      )
    );
  }

  _setupStrongTypeConfig(
    templateDomainName,
    templateWebApiName,
    domainName,
    webApiName,
    configurationName
  ) {
    this.fs.copyTpl(
      this.templatePath(templateDomainName, "Configuration", "AppConfig.cs"),
      this.destinationPath(domainName, "Configuration", "AppConfig.cs"),
      { domainName, configurationName }
    );
    this.fs.copyTpl(
      this.templatePath(
        templateWebApiName,
        "Extensions",
        "IServiceCollectionExtensions.cs"
      ),
      this.destinationPath(
        webApiName,
        "Extensions",
        "IServiceCollectionExtensions.cs"
      ),
      { webApiName }
    );
  }

  _setupSerilog(webApiName) {
    const serilogNugetPackage = "Serilog.AspNetCore";
    this._addNugetPackage(webApiName, serilogNugetPackage);
  }

  _setupSwagger(webApiName) {
    const swaggerNugetPackage = "--version 5.0.0-rc3 Swashbuckle.AspNetCore";
    this._addNugetPackage(webApiName, swaggerNugetPackage);
  }

  _setupPolly(
    webApiName,
    templateDomainName,
    domainName,
    templateInfrastructureName,
    infrastructureName
  ) {
    const pollyNugetPackage = "Microsoft.Extensions.Http.Polly";
    this._addNugetPackage(webApiName, pollyNugetPackage);

    this.fs.copyTpl(
      this.templatePath(
        templateDomainName,
        "Services",
        "IExampleHttpService.cs"
      ),
      this.destinationPath(domainName, "Services", "IExampleHttpService.cs"),
      { domainName }
    );

    this.fs.copyTpl(
      this.templatePath(
        templateInfrastructureName,
        "Services",
        "ExampleHttpService.cs"
      ),
      this.destinationPath(
        infrastructureName,
        "Services",
        "ExampleHttpService.cs"
      ),
      { infrastructureName, domainName }
    );
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

  _addNugetPackage(project, nugetPackage) {
    this.log(`Adding a reference to ${nugetPackage} in ${project}`);
    execSync(`dotnet add ${project} package ${nugetPackage}`, {
      cwd: this.destinationRoot()
    });
  }
};
