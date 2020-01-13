/* eslint-disable max-params */
"use strict";
const chalk = require("chalk");
const Generator = require("yeoman-generator");
const yosay = require("yosay");
const fs = require("fs");
const execSync = require("child_process").execSync;
var EfCoreConnectionEnum;
(function (EfCoreConnectionEnum) {
    EfCoreConnectionEnum["SqlServer"] = "SQL Server";
    EfCoreConnectionEnum["Postgres"] = "Postgres";
    EfCoreConnectionEnum["Sqlite"] = "SQLite";
})(EfCoreConnectionEnum || (EfCoreConnectionEnum = {}));
function getEfNugetPackageName(efCoreConnection) {
    switch (efCoreConnection) {
        case EfCoreConnectionEnum.SqlServer:
            return "Microsoft.EntityFrameworkCore.SqlServer";
        case EfCoreConnectionEnum.Postgres:
            return "Npgsql.EntityFrameworkCore.PostgreSQL";
        case EfCoreConnectionEnum.Sqlite:
            return "Microsoft.EntityFrameworkCore.SQLite";
    }
}
function getEfHealthCheckNugetPackageName(efCoreConnection) {
    switch (efCoreConnection) {
        case EfCoreConnectionEnum.SqlServer:
            return "AspNetCore.HealthChecks.SqlServer";
        case EfCoreConnectionEnum.Postgres:
            return "AspNetCore.HealthChecks.Npgsql";
        case EfCoreConnectionEnum.Sqlite:
            return "AspNetCore.HealthChecks.SqLite";
    }
}
function getEfStartupUseString(efCoreConnection) {
    switch (efCoreConnection) {
        case EfCoreConnectionEnum.SqlServer:
            return "options.UseSqlServer(";
        case EfCoreConnectionEnum.Postgres:
            return "options.UseNpgsql(";
        case EfCoreConnectionEnum.Sqlite:
            return "options.UseSqlite(";
    }
}
function getEfHealthcheckString(efCoreConnection) {
    switch (efCoreConnection) {
        case EfCoreConnectionEnum.SqlServer:
            return `.AddSqlServer(Configuration.GetConnectionString(\"PostContext\"))`;
        case EfCoreConnectionEnum.Postgres:
            return `.AddNpgSql(Configuration.GetConnectionString(\"PostContext\"))`;
        case EfCoreConnectionEnum.Sqlite:
            return `.AddSqlite(Configuration.GetConnectionString(\"PostContext\"))`;
    }
}
module.exports = class extends Generator {
    prompting() {
        // Have Yeoman greet the user.
        this.log(yosay(`Welcome to the lovely ${chalk.red("generator-dotnet-webapi")} generator!`));
        const prompts = [
            {
                type: "input",
                name: "projectName",
                message: "Your project name",
                default: this.appname
            },
            {
                type: "confirm",
                name: "stronglyTypedConfig",
                message: "Strongly type the config into the dependency injection provider?",
                default: false
            },
            {
                type: "input",
                name: "stronglyTypedConfigName",
                message: "The class name for your configuration object",
                default: "AppConfig",
                when: (answers) => answers.stronglyTypedConfig
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
                when: (answers) => answers.healthchecks
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
                when: (answers) => answers.efCore
            },
            {
                type: "input",
                name: "efCoreConnectionString",
                message: "Enter your EF Core connection string",
                default: "",
                when: (answers) => answers.efCore
            },
            {
                type: "confirm",
                name: "cqrs",
                message: "Setup DDD and CQRS infrastructure with Mediatr?",
                default: false
            },
            {
                type: "confirm",
                name: "docker",
                message: "Add Docker support?",
                default: false
            }
        ];
        return this.prompt(prompts).then((props) => {
            // To access props later use this.props.someAnswer;
            this._props = props;
        });
    }
    writing() {
        // // Constants
        const props = this._props;
        // Template name constants
        const templateProjectName = "Template";
        const templateDomainName = `${templateProjectName}.Domain`;
        const templateInfrastructureName = `${templateProjectName}.Infrastructure`;
        const templateWebApiName = `${templateProjectName}.WebApi`;
        // Project name constants
        const projectName = props.projectName;
        const domainName = `${projectName}.Domain`;
        const infrastructureName = `${projectName}.Infrastructure`;
        const webApiName = `${projectName}.WebApi`;
        const namingConstants = {
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
        const stronglyTypedConfig = props.stronglyTypedConfig;
        const stronglyTypedConfigName = props.stronglyTypedConfigName;
        // Serilog constants
        const serilog = props.serilog;
        // Swagger constants
        const swagger = props.swagger;
        // Polly constants
        const polly = props.polly;
        // Healthcheck constants
        const healthchecks = props.healthchecks;
        const healthchecksUi = props.healthchecksUi;
        // EF Core constants
        const efCore = props.efCore;
        const efCoreConnection = props.efCoreConnection;
        const efCoreConnectionString = props.efCoreConnectionString;
        const efCoreOptionsUse = getEfStartupUseString(efCoreConnection);
        const efCoreHealthString = getEfHealthcheckString(efCoreConnection);
        // CQRS constants
        const cqrs = props.cqrs;
        // docker constants
        const docker = props.docker;
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
        if (healthchecks) {
            this._setupHealthChecks(namingConstants, efCore, efCoreConnection);
            if (healthchecksUi) {
                this._setupHealthchecksUi(namingConstants, serilog);
            }
        }
        this._setupEntityFiles(namingConstants, efCore, cqrs);
        if (efCore) {
            this._setupEfCore(namingConstants, efCoreConnection);
        }
        if (cqrs) {
            this._setupCqrs(namingConstants);
        }
        if (docker) {
            this._setupDocker(healthchecksUi);
        }
        // // Files
        // - WeatherForecast.cs
        this.fs.copyTpl(this.templatePath(templateDomainName, "Models", "WeatherForecast.cs"), this.destinationPath(domainName, "Models", "WeatherForecast.cs"), { domainName });
        // - Startup.cs
        this.fs.copyTpl(this.templatePath(templateWebApiName, "Startup.cs"), this.destinationPath(webApiName, "Startup.cs"), {
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
            efCoreOptionsUse,
            efCoreHealthString,
            cqrs
        });
        // - Program.cs
        this.fs.copyTpl(this.templatePath(templateWebApiName, "Program.cs"), this.destinationPath(webApiName, "Program.cs"), { webApiName, serilog });
        // - appsettings.json
        this.fs.copyTpl(this.templatePath(templateWebApiName, "appsettings.json"), this.destinationPath(webApiName, "appsettings.json"), {
            serilog,
            efCore,
            efCoreConnectionString
        });
        // - WeatherForecastController.cs
        this.fs.copyTpl(this.templatePath(templateWebApiName, "Controllers", "WeatherForecastController.cs"), this.destinationPath(webApiName, "Controllers", "WeatherForecastController.cs"), { domainName, webApiName, polly });
    }
    // Setups
    _setupProject(namingConstants) {
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
        this._dotnetCreateNew("webapi", webApiName, "netcoreapp3.1");
        this._dotnetSlnReference(webApiName, solutionName);
        this._dotnetReference(webApiName, infrastructureName);
        this._dotnetReference(webApiName, domainName);
        this.fs.copy(this.templatePath(".editorconfig"), this.destinationPath(".editorconfig"));
        this.fs.copy(this.templatePath(".gitignore.npmsucks"), this.destinationPath(".gitignore"));
    }
    _cleanupProject(namingConstants) {
        const domainName = namingConstants.project.domainName;
        const infrastructureName = namingConstants.project.infrastructureName;
        const webApiName = namingConstants.project.webApiName;
        fs.unlinkSync(this.destinationPath(domainName, "Class1.cs"));
        fs.unlinkSync(this.destinationPath(infrastructureName, "Class1.cs"));
        fs.unlinkSync(this.destinationPath(webApiName, "WeatherForecast.cs"));
        fs.unlinkSync(this.destinationPath(webApiName, "Startup.cs"));
        fs.unlinkSync(this.destinationPath(webApiName, "Program.cs"));
        fs.unlinkSync(this.destinationPath(webApiName, "appsettings.json"));
        fs.unlinkSync(this.destinationPath(webApiName, "Controllers", "WeatherForecastController.cs"));
    }
    _setupStrongTypeConfig(namingConstants, configurationName) {
        const templateDomainName = namingConstants.template.domainName;
        const templateWebApiName = namingConstants.template.webApiName;
        const domainName = namingConstants.project.domainName;
        const webApiName = namingConstants.project.webApiName;
        this.fs.copyTpl(this.templatePath(templateDomainName, "Configuration", "AppConfig.cs"), this.destinationPath(domainName, "Configuration", "AppConfig.cs"), { domainName, configurationName });
        this.fs.copyTpl(this.templatePath(templateWebApiName, "Extensions", "IServiceCollectionExtensions.cs"), this.destinationPath(webApiName, "Extensions", "IServiceCollectionExtensions.cs"), { webApiName });
    }
    _setupSerilog(projName) {
        const serilogNugetPackage = "Serilog.AspNetCore";
        this._addNugetPackage(projName, serilogNugetPackage);
    }
    _setupSwagger(projName) {
        const swaggerNugetPackage = "--version 5.0.0-rc3 Swashbuckle.AspNetCore";
        this._addNugetPackage(projName, swaggerNugetPackage);
    }
    _setupPolly(namingConstants) {
        const webApiName = namingConstants.project.webApiName;
        const templateDomainName = namingConstants.template.domainName;
        const domainName = namingConstants.project.domainName;
        const templateInfrastructureName = namingConstants.template.infrastructureName;
        const infrastructureName = namingConstants.project.infrastructureName;
        const pollyNugetPackage = "Microsoft.Extensions.Http.Polly";
        this._addNugetPackage(webApiName, pollyNugetPackage);
        this.fs.copyTpl(this.templatePath(templateDomainName, "Services", "IExampleHttpService.cs"), this.destinationPath(domainName, "Services", "IExampleHttpService.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "Services", "ExampleHttpService.cs"), this.destinationPath(infrastructureName, "Services", "ExampleHttpService.cs"), { infrastructureName, domainName });
    }
    _setupHealthChecks(namingConstants, efCore, efCoreConnection) {
        const webApiName = namingConstants.project.webApiName;
        if (efCore) {
            const efCoreHealthCheckNugetPackage = getEfHealthCheckNugetPackageName(efCoreConnection);
            this._addNugetPackage(webApiName, efCoreHealthCheckNugetPackage);
        }
    }
    _setupHealthchecksUi(namingConstants, serilog) {
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
        fs.unlinkSync(this.destinationPath(healthCheckProjName, "appsettings.json"));
        this.fs.copyTpl(this.templatePath(templateHealthCheckProjName, "Program.cs"), this.destinationPath(healthCheckProjName, "Program.cs"), { healthCheckProjName, serilog });
        this.fs.copyTpl(this.templatePath(templateHealthCheckProjName, "Startup.cs"), this.destinationPath(healthCheckProjName, "Startup.cs"), { healthCheckProjName, serilog });
        this.fs.copyTpl(this.templatePath(templateHealthCheckProjName, "appsettings.json"), this.destinationPath(healthCheckProjName, "appsettings.json"), { healthCheckProjName, serilog });
    }
    _setupEntityFiles(namingConstants, efCore, cqrs) {
        const templateDomainName = namingConstants.template.domainName;
        const domainName = namingConstants.project.domainName;
        if (cqrs) {
            this.fs.copyTpl(this.templatePath(templateDomainName, "Entities", "Abstract", "BaseEntityCQRS.cs"), this.destinationPath(domainName, "Entities", "Abstract", "BaseEntity.cs"), { domainName });
            this.fs.copyTpl(this.templatePath(templateDomainName, "Entities", "Interfaces", "IEntity.cs"), this.destinationPath(domainName, "Entities", "Interfaces", "IEntity.cs"), { domainName });
            this.fs.copyTpl(this.templatePath(templateDomainName, "Entities", "PostCQRS.cs"), this.destinationPath(domainName, "Entities", "Post.cs"), { domainName });
            this.fs.copyTpl(this.templatePath(templateDomainName, "Entities", "CommentCQRS.cs"), this.destinationPath(domainName, "Entities", "Comment.cs"), { domainName });
        }
        else if (efCore) {
            this.fs.copyTpl(this.templatePath(templateDomainName, "Entities", "Abstract", "BaseEntity.cs"), this.destinationPath(domainName, "Entities", "Abstract", "BaseEntity.cs"), { domainName });
            this.fs.copyTpl(this.templatePath(templateDomainName, "Entities", "Post.cs"), this.destinationPath(domainName, "Entities", "Post.cs"), { domainName });
            this.fs.copyTpl(this.templatePath(templateDomainName, "Entities", "Comment.cs"), this.destinationPath(domainName, "Entities", "Comment.cs"), { domainName });
        }
    }
    _setupEfCore(namingConstants, efCoreConnection) {
        const efNugetPackage = getEfNugetPackageName(efCoreConnection);
        this._addNugetPackage(namingConstants.project.infrastructureName, efNugetPackage);
        const efDesignNugetPackage = "Microsoft.EntityFrameworkCore.Design";
        this._addNugetPackage(namingConstants.project.webApiName, efDesignNugetPackage);
        const domainName = namingConstants.project.domainName;
        const templateInfrastructureName = namingConstants.template.infrastructureName;
        const infrastructureName = namingConstants.project.infrastructureName;
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "EntityFramework", "PostContext.cs"), this.destinationPath(infrastructureName, "EntityFramework", "PostContext.cs"), { infrastructureName, domainName });
        this._dotnetCreateNew("tool-manifest");
        this.log(`Installing dotnet ef tools`);
        execSync(`dotnet tool install dotnet-ef`, {
            cwd: this.destinationRoot()
        });
    }
    _setupCqrs(namingConstants) {
        const domainName = namingConstants.project.domainName;
        const infrastructureName = namingConstants.project.infrastructureName;
        const webApiName = namingConstants.project.webApiName;
        const mediatrNugetPackage = "MediatR";
        this._addNugetPackage(domainName, mediatrNugetPackage);
        this._addNugetPackage(infrastructureName, mediatrNugetPackage);
        this._addNugetPackage(webApiName, mediatrNugetPackage);
        const aspnetMediatrNugetPackage = "MediatR.Extensions.Microsoft.DependencyInjection";
        this._addNugetPackage(webApiName, aspnetMediatrNugetPackage);
        const fluentValidationNugetPackage = "FluentValidation";
        this._addNugetPackage(domainName, fluentValidationNugetPackage);
        this._addNugetPackage(infrastructureName, fluentValidationNugetPackage);
        const dependencyInjectionNugetPackage = "Microsoft.Extensions.DependencyInjection.Abstractions";
        this._addNugetPackage(domainName, dependencyInjectionNugetPackage);
        this._addNugetPackage(infrastructureName, dependencyInjectionNugetPackage);
        const webApiNewtonsoftNugetPackage = "Microsoft.AspNetCore.Mvc.NewtonsoftJson";
        this._addNugetPackage(webApiName, webApiNewtonsoftNugetPackage);
        const logginExtensionsNugetPackage = "Microsoft.Extensions.Logging";
        this._addNugetPackage(infrastructureName, logginExtensionsNugetPackage);
        this._setupCqrsDomain(namingConstants);
        this._setupCqrsInfrastructure(namingConstants);
        this._setupCqrsWebApi(namingConstants);
    }
    _setupCqrsDomain(namingConstants) {
        const templateDomainName = namingConstants.template.domainName;
        const domainName = namingConstants.project.domainName;
        this._setupCqrsDomainBuilders(templateDomainName, domainName);
        this._setupCqrsDomainCommands(templateDomainName, domainName);
        this._setupCqrsDomainQueries(templateDomainName, domainName);
        this.fs.copyTpl(this.templatePath(templateDomainName, "Extensions", "IServiceCollectionExtensions.cs"), this.destinationPath(domainName, "Extensions", "IServiceCollectionExtensions.cs"), { domainName });
    }
    _setupCqrsDomainBuilders(templateDomainName, domainName) {
        this.fs.copyTpl(this.templatePath(templateDomainName, "Builders", "Interfaces", "IBuilder.cs"), this.destinationPath(domainName, "Builders", "Interfaces", "IBuilder.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateDomainName, "Builders", "Interfaces", "IBuilderParameters.cs"), this.destinationPath(domainName, "Builders", "Interfaces", "IBuilderParameters.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateDomainName, "Builders", "CommentBuilder.cs"), this.destinationPath(domainName, "Builders", "CommentBuilder.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateDomainName, "Builders", "PostBuilder.cs"), this.destinationPath(domainName, "Builders", "PostBuilder.cs"), { domainName });
    }
    _setupCqrsDomainCommands(templateDomainName, domainName) {
        this.fs.copyTpl(this.templatePath(templateDomainName, "Commands", "Interfaces", "ICreateCommand.cs"), this.destinationPath(domainName, "Commands", "Interfaces", "ICreateCommand.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateDomainName, "Commands", "CreateCommentCommand.cs"), this.destinationPath(domainName, "Commands", "CreateCommentCommand.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateDomainName, "Commands", "CreatePostCommand.cs"), this.destinationPath(domainName, "Commands", "CreatePostCommand.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateDomainName, "Commands", "UpdatePostCommand.cs"), this.destinationPath(domainName, "Commands", "UpdatePostCommand.cs"), { domainName });
    }
    _setupCqrsDomainQueries(templateDomainName, domainName) {
        this.fs.copyTpl(this.templatePath(templateDomainName, "Queries", "GetAllPostsQuery.cs"), this.destinationPath(domainName, "Queries", "GetAllPostsQuery.cs"), { domainName });
        this.fs.copyTpl(this.templatePath(templateDomainName, "Queries", "GetPostQuery.cs"), this.destinationPath(domainName, "Queries", "GetPostQuery.cs"), { domainName });
    }
    _setupCqrsInfrastructure(namingConstants) {
        const templateInfrastructureName = namingConstants.template.infrastructureName;
        const infrastructureName = namingConstants.project.infrastructureName;
        const domainName = namingConstants.project.domainName;
        this._setupCqrsInfrastructureCommandHandlers(templateInfrastructureName, infrastructureName, domainName);
        this._setupCqrsInfrastructureQueryHandlers(templateInfrastructureName, infrastructureName, domainName);
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "Extensions", "IServiceCollectionExtensions.cs"), this.destinationPath(infrastructureName, "Extensions", "IServiceCollectionExtensions.cs"), { infrastructureName, domainName });
    }
    _setupCqrsInfrastructureCommandHandlers(templateInfrastructureName, infrastructureName, domainName) {
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "CommandHandlers", "CreateCommandHandler.cs"), this.destinationPath(infrastructureName, "CommandHandlers", "CreateCommandHandler.cs"), { infrastructureName, domainName });
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "CommandHandlers", "CreateCommentCommandHandler.cs"), this.destinationPath(infrastructureName, "CommandHandlers", "CreateCommentCommandHandler.cs"), { infrastructureName, domainName });
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "CommandHandlers", "UpdatePostCommandHandler.cs"), this.destinationPath(infrastructureName, "CommandHandlers", "UpdatePostCommandHandler.cs"), { infrastructureName, domainName });
    }
    _setupCqrsInfrastructureQueryHandlers(templateInfrastructureName, infrastructureName, domainName) {
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "QueryHandlers", "GetPostQueryHandler.cs"), this.destinationPath(infrastructureName, "QueryHandlers", "GetPostQueryHandler.cs"), { infrastructureName, domainName });
        this.fs.copyTpl(this.templatePath(templateInfrastructureName, "QueryHandlers", "GetAllPostsQueryHandler.cs"), this.destinationPath(infrastructureName, "QueryHandlers", "GetAllPostsQueryHandler.cs"), { infrastructureName, domainName });
    }
    _setupCqrsWebApi(namingConstants) {
        const templateWebApiName = namingConstants.template.webApiName;
        const webApiName = namingConstants.project.webApiName;
        const domainName = namingConstants.project.domainName;
        this.fs.copyTpl(this.templatePath(templateWebApiName, "Controllers", "PostsController.cs"), this.destinationPath(webApiName, "Controllers", "PostsController.cs"), { webApiName, domainName });
    }
    _setupDocker(healthchecksui) {
        this.fs.copy(this.templatePath("DockerfileDevelopment"), this.destinationPath("DockerfileDevelopment"));
        this.fs.copy(this.templatePath("DockerfileRelease"), this.destinationPath("DockerfileRelease"));
        this.fs.copy(this.templatePath(".dockerignore"), this.destinationPath(".dockerignore"));
        if (healthchecksui) {
            this.fs.copy(this.templatePath("Dockerfile-HealthCheckDevelopment"), this.destinationPath("Dockerfile-HealthCheckDevelopment"));
            this.fs.copy(this.templatePath("Dockerfile-HealthCheckRelease"), this.destinationPath("Dockerfile-HealthCheckRelease"));
        }
    }
    // Common
    _dotnetCreateNew(type, projectName, framework) {
        this.log(`Creating ${type} ${projectName ? projectName : ""}`);
        const projectNameCommand = projectName ? ` -n ${projectName}` : "";
        const frameworkCommand = framework ? ` -f ${framework}` : "";
        execSync(`dotnet new ${type}${projectNameCommand}${frameworkCommand}`, {
            cwd: this.destinationRoot()
        });
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
