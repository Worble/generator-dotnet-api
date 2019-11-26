/* eslint-disable max-params */
"use strict";

const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const execSync = require("child_process").execSync;
const fs = require("fs");

enum EfCoreConnectionEnum {
  SqlServer = "SQL Server",
  Postgres = "Postgres",
  Sqlite = "SQLite"
}

function getEfNugetPackageName(efCoreConnection: EfCoreConnectionEnum) {
  switch (efCoreConnection) {
    case EfCoreConnectionEnum.SqlServer:
      return "Microsoft.EntityFrameworkCore.SqlServer";
    case EfCoreConnectionEnum.Postgres:
      return "Npgsql.EntityFrameworkCore.PostgreSQL";
    case EfCoreConnectionEnum.Sqlite:
      return "Microsoft.EntityFrameworkCore.SQLite";
  }
}

function getEfStartupUseString(efCoreConnection: EfCoreConnectionEnum) {
  switch (efCoreConnection) {
    case EfCoreConnectionEnum.SqlServer:
      return "options.UseSqlServer(";
    case EfCoreConnectionEnum.Postgres:
      return "options.UseNpgsql(";
    case EfCoreConnectionEnum.Sqlite:
      return "options.UseSqlite(";
  }
}

interface INamingConstants {
  template: IProjectNamingConstants;
  project: IProjectNamingConstants;
}

interface IProjectNamingConstants {
  projectName: string;
  domainName: string;
  infrastructureName: string;
  webApiName: string;
}

interface IGeneratorPrompts {
  projectName: string;
  stronglyTypedConfig: boolean;
  stronglyTypedConfigName: string;
  serilog: boolean;
  swagger: boolean;
  polly: boolean;
  healthchecks: boolean;
  healthchecksUi: boolean;
  efCore: boolean;
  efCoreConnection: EfCoreConnectionEnum;
  efCoreConnectionString: string;
}

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
        when: (answers: IGeneratorPrompts) => answers.stronglyTypedConfig
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
        when: (answers: IGeneratorPrompts) => answers.healthchecks
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
        choices: Object.values(EfCoreConnectionEnum),
        default: EfCoreConnectionEnum.Postgres,
        when: (answers: IGeneratorPrompts) => answers.efCore
      },
      {
        type: "input",
        name: "efCoreConnectionString",
        message: "Enter your EF Core connection string",
        default: "",
        when: (answers: IGeneratorPrompts) => answers.efCore
      }
    ];

    return this.prompt(prompts).then((props: IGeneratorPrompts) => {
      // To access props later use this.props.someAnswer;
      this._props = props;
    });
  }

  _props: IGeneratorPrompts;

  writing() {
    // // Constants
    const props: IGeneratorPrompts = this._props;

    // Template name constants
    const templateProjectName: string = "Template";
    const templateDomainName: string = `${templateProjectName}.Domain`;
    const templateInfrastructureName: string = `${templateProjectName}.Infrastructure`;
    const templateWebApiName: string = `${templateProjectName}.WebApi`;

    // Project name constants
    const projectName: string = props.projectName;
    const domainName: string = `${projectName}.Domain`;
    const infrastructureName: string = `${projectName}.Infrastructure`;
    const webApiName: string = `${projectName}.WebApi`;

    const namingConstants: INamingConstants = {
      template: {
        projectName: templateProjectName,
        domainName: templateDomainName,
        infrastructureName: templateInfrastructureName,
        webApiName: templateWebApiName
      },
      project: {
        projectName,
        domainName,
        infrastructureName,
        webApiName
      }
    };

    // Strongly typed config constants
    const stronglyTypedConfig: boolean = props.stronglyTypedConfig;
    const stronglyTypedConfigName: string = props.stronglyTypedConfigName;

    // Serilog constants
    const serilog: boolean = props.serilog;

    // Swagger constants
    const swagger: boolean = props.swagger;

    // Polly constants
    const polly: boolean = props.polly;

    // Healthcheck constants
    const healthchecks: boolean = props.healthchecks;
    const healthchecksUi: boolean = props.healthchecksUi;

    // EF Core constants
    const efCore: boolean = props.efCore;
    const efCoreConnection: EfCoreConnectionEnum = props.efCoreConnection;
    const efCoreConnectionString: string = props.efCoreConnectionString;
    const efCoreOptionsUse: string = getEfStartupUseString(efCoreConnection);

    // // Setups

    // Initial setup
    this._setupProject(namingConstants);

    // Delete files we don't need
    this._cleanupProject(namingConstants);

    if (stronglyTypedConfig) {
      this._setupStrongTypeConfig(namingConstants, stronglyTypedConfigName);
    }

    if (serilog) {
      this._setupSerilog(namingConstants.project.webApiName);
    }

    if (swagger) {
      this._setupSwagger(namingConstants.project.webApiName);
    }

    if (polly) {
      this._setupPolly(namingConstants);
    }

    if (healthchecksUi) {
      this._setupHealthchecksUi(namingConstants, serilog);
    }

    if (efCore) {
      this._setupEfCore(namingConstants, efCoreConnection);
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
        healthchecksUi,
        efCore,
        efCoreOptionsUse
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
        serilog,
        efCore,
        efCoreConnectionString
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

  _setupProject(namingConstants: INamingConstants) {
    const projectName = namingConstants.project.projectName;
    const domainName = namingConstants.project.domainName;
    const infrastructureName = namingConstants.project.infrastructureName;
    const webApiName = namingConstants.project.webApiName;
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

  _cleanupProject(namingConstants: INamingConstants) {
    const domainName = namingConstants.project.domainName;
    const infrastructureName = namingConstants.project.infrastructureName;
    const webApiName = namingConstants.project.webApiName;

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
    namingConstants: INamingConstants,
    configurationName: string
  ) {
    const templateDomainName = namingConstants.template.domainName;
    const templateWebApiName = namingConstants.template.webApiName;
    const domainName = namingConstants.project.domainName;
    const webApiName = namingConstants.project.webApiName;

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

  _setupSerilog(projName: string) {
    const serilogNugetPackage = "Serilog.AspNetCore";
    this._addNugetPackage(projName, serilogNugetPackage);
  }

  _setupSwagger(projName: string) {
    const swaggerNugetPackage = "--version 5.0.0-rc3 Swashbuckle.AspNetCore";
    this._addNugetPackage(projName, swaggerNugetPackage);
  }

  _setupPolly(namingConstants: INamingConstants) {
    const webApiName = namingConstants.project.webApiName;
    const templateDomainName = namingConstants.template.domainName;
    const domainName = namingConstants.project.domainName;
    const templateInfrastructureName =
      namingConstants.template.infrastructureName;
    const infrastructureName = namingConstants.project.infrastructureName;

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

  _setupHealthchecksUi(namingConstants: INamingConstants, serilog: boolean) {
    const projectName = namingConstants.project.projectName;
    const webApiName = namingConstants.project.webApiName;

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

  _setupEfCore(
    namingConstants: INamingConstants,
    efCoreConnection: EfCoreConnectionEnum
  ) {
    const efNugetPackage = getEfNugetPackageName(efCoreConnection);
    this._addNugetPackage(
      namingConstants.project.infrastructureName,
      efNugetPackage
    );

    const efDesignNugetPackage = "Microsoft.EntityFrameworkCore.Design";
    this._addNugetPackage(
      namingConstants.project.webApiName,
      efDesignNugetPackage
    );

    const templateDomainName = namingConstants.template.domainName;
    const domainName = namingConstants.project.domainName;
    const templateInfrastructureName =
      namingConstants.template.infrastructureName;
    const infrastructureName = namingConstants.project.infrastructureName;

    this.fs.copyTpl(
      this.templatePath(
        templateDomainName,
        "Entities",
        "Abstract",
        "BaseEntity.cs"
      ),
      this.destinationPath(domainName, "Entities", "Abstract", "BaseEntity.cs"),
      { domainName }
    );

    this.fs.copyTpl(
      this.templatePath(templateDomainName, "Entities", "Post.cs"),
      this.destinationPath(domainName, "Entities", "Post.cs"),
      { domainName }
    );

    this.fs.copyTpl(
      this.templatePath(templateDomainName, "Entities", "Comment.cs"),
      this.destinationPath(domainName, "Entities", "Comment.cs"),
      { domainName }
    );

    this.fs.copyTpl(
      this.templatePath(
        templateInfrastructureName,
        "EntityFramework",
        "PostContext.cs"
      ),
      this.destinationPath(
        infrastructureName,
        "EntityFramework",
        "PostContext.cs"
      ),
      { infrastructureName, domainName }
    );

    this._dotnetCreateNew("tool-manifest");

    this.log(`Installing dotnet ef tools`);
    execSync(`dotnet tool install dotnet-ef --version 3.0.0`, {
      cwd: this.destinationRoot()
    });
  }

  // Common

  _dotnetCreateNew(type: string, projectName?: string, framework?: string) {
    this.log(`Creating ${type} ${projectName ? projectName : ""}`);

    const projectNameCommand = projectName ? ` -n ${projectName}` : "";
    const frameworkCommand = framework ? ` -f ${framework}` : "";

    execSync(`dotnet new ${type}${projectNameCommand}${frameworkCommand}`, {
      cwd: this.destinationRoot()
    });
  }

  _dotnetSlnReference(projectName: string, solutionName: string) {
    this.log(`Associating ${projectName} with ${solutionName}`);
    execSync(`dotnet sln ${solutionName} add ./${projectName}`, {
      cwd: this.destinationRoot()
    });
  }

  _dotnetReference(projectName: string, projectTargetReference: string) {
    this.log(`Associating ${projectName} with ${projectTargetReference}`);
    execSync(`dotnet add ${projectName} reference ${projectTargetReference}`, {
      cwd: this.destinationRoot()
    });
  }

  _addNugetPackage(project: string, nugetPackage: string) {
    this.log(`Adding a reference to ${nugetPackage} in ${project}`);
    execSync(`dotnet add ${project} package ${nugetPackage}`, {
      cwd: this.destinationRoot()
    });
  }
};
