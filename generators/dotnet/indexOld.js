/* eslint-disable max-params */
"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const execSync = require("child_process").execSync;
const fs = require("fs");

const efCoreConnectionSqlServer = "SQL Server";
const efCoreConnectionPostgres = "Postgres";
const efCoreConnectionSqlite = "SQLite";
const efCoreConnections = [
  efCoreConnectionSqlServer,
  efCoreConnectionPostgres,
  efCoreConnectionSqlite
];

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
      },
      {
        type: "confirm",
        name: "healthchecks",
        message: "Add healthchecks?",
        default: false
      },
      {
        type: "confirm",
        name: "healthchecksUi",
        message: "Add a seperate healthcheck UI project?",
        default: false,
        when: answers => answers.healthchecks
      },
      {
        type: "confirm",
        name: "efCore",
        message: "Add EF Core to the project?",
        default: false
      },
      {
        type: "list",
        name: "efCoreConnection",
        message: "What type of connection for EF Core?",
        choices: efCoreConnections,
        default: efCoreConnectionPostgres,
        when: answers => answers.ef
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    // // Constants

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

    // Healthcheck constants
    const healthchecks = this.props.healthchecks;
    const healthchecksUi = this.props.healthchecksUi;

    // EF Core constants
    const efCore = this.props.ef;
    const efCoreConnection = this.props.efCoreConnection;

    // // Setups

    // Initial setup
    this._setupProject(projectName, domainName, infrastructureName, webApiName);

    // Delete files we don't need
    this._cleanupProject(domainName, infrastructureName, webApiName);

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

    if (healthchecksUi) {
      this._setupHealthchecksUi(webApiName, projectName, serilog);
    }

    if (efCore) {
      this._setupEfCore();
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
        infrastructureName,
        healthchecks,
        healthchecksUi
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

  // Setups

  _setupProject(projectName, domainName, infrastructureName, webApiName) {
    const solutionName = `${projectName}.sln`;

    this._dotnetCreateNew("sln", projectName);

    this._dotnetCreateNew("classlib", domainName, "netstandard2.1");
    this._dotnetSlnReference(domainName, solutionName);

    this._dotnetCreateNew("classlib", infrastructureName, "netstandard2.1");
    this._dotnetSlnReference(infrastructureName, solutionName);
    this._dotnetReference(infrastructureName, domainName);

    this._dotnetCreateNew("webapi", webApiName, "netcoreapp3.0");
    this._dotnetSlnReference(webApiName, solutionName);
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

  _cleanupProject(domainName, infrastructureName, webApiName) {
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

  _setupSerilog(projName) {
    const serilogNugetPackage = "Serilog.AspNetCore";
    this._addNugetPackage(projName, serilogNugetPackage);
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

  _setupHealthchecksUi(webApiName, projectName, serilog) {
    const healthCheckUiClientNugetPackage = "AspNetCore.HealthChecks.UI.Client";
    const healthCheckSlnName = `${projectName}HealthCheckUI`;
    const healthCheckSlnFullName = `${projectName}HealthCheckUI.sln`;

    const templateHealthCheckProjName = "Template.HealthCheckUI";
    const healthCheckProjName = `${projectName}.HealthCheckUI`;

    const healthCheckUiNugetPackage = "AspNetCore.HealthChecks.UI";

    this._addNugetPackage(webApiName, healthCheckUiClientNugetPackage);

    this._dotnetCreateNew("sln", healthCheckSlnName);
    this._dotnetCreateNew("web", healthCheckProjName, "netcoreapp3.0");
    this._dotnetSlnReference(healthCheckProjName, healthCheckSlnFullName);
    this._addNugetPackage(healthCheckProjName, healthCheckUiNugetPackage);

    if (serilog) {
      this._setupSerilog(healthCheckProjName);
    }

    fs.unlinkSync(this.destinationPath(healthCheckProjName, "Startup.cs"));
    fs.unlinkSync(this.destinationPath(healthCheckProjName, "Program.cs"));
    fs.unlinkSync(
      this.destinationPath(healthCheckProjName, "appsettings.json")
    );

    this.fs.copyTpl(
      this.templatePath(templateHealthCheckProjName, "Program.cs"),
      this.destinationPath(healthCheckProjName, "Program.cs"),
      { healthCheckProjName, serilog }
    );

    this.fs.copyTpl(
      this.templatePath(templateHealthCheckProjName, "Startup.cs"),
      this.destinationPath(healthCheckProjName, "Startup.cs"),
      { healthCheckProjName, serilog }
    );

    this.fs.copyTpl(
      this.templatePath(templateHealthCheckProjName, "appsettings.json"),
      this.destinationPath(healthCheckProjName, "appsettings.json"),
      { healthCheckProjName, serilog }
    );
  }

  _setupEfCore() {}

  // Common

  _dotnetCreateNew(type, projectName, framework) {
    this.log(`Creating ${type} ${projectName}`);
    execSync(
      `dotnet new ${type} -n ${projectName}${
        framework ? " -f " + framework : ""
      }`,
      {
        cwd: this.destinationRoot()
      }
    );
  }

  _dotnetSlnReference(projectName, solutionName) {
    this.log(`Associating ${projectName} with ${solutionName}`);
    execSync(`dotnet sln ${solutionName} add ./${projectName}`, {
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
