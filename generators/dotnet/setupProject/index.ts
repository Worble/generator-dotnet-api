import { MemFsEditor } from "yeoman-generator";
import {
  dotnetCreateNew,
  dotnetReference,
  dotnetSlnReference
} from "../helper";
import { INamingConstants } from "../types";

export default function setupProject(
  namingConstants: INamingConstants,
  fs: MemFsEditor
) {
  const projectName = namingConstants.project.projectName;
  const domainName = namingConstants.project.domainName;
  const infrastructureName = namingConstants.project.infrastructureName;
  const webApiName = namingConstants.project.webApiName;
  const solutionName = `${projectName}.sln`;

  dotnetCreateNew("sln", projectName);

  dotnetCreateNew("classlib", domainName, "netstandard2.1");
  dotnetSlnReference(domainName, solutionName);

  dotnetCreateNew("classlib", infrastructureName, "netstandard2.1");
  dotnetSlnReference(infrastructureName, solutionName);
  dotnetReference(infrastructureName, domainName);

  dotnetCreateNew("webapi", webApiName, "netcoreapp3.1");
  dotnetSlnReference(webApiName, solutionName);
  dotnetReference(webApiName, infrastructureName);
  dotnetReference(webApiName, domainName);

  fs.copy(
    this.templatePath(".editorconfig"),
    this.destinationPath(".editorconfig")
  );
  fs.copy(
    this.templatePath(".gitignore.npmsucks"),
    this.destinationPath(".gitignore")
  );
}
