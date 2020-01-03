FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY MyProject.sln .
COPY MyProject.WebApi/*.csproj ./MyProject.WebApi/
COPY MyProject.Infrastructure/*.csproj ./MyProject.Infrastructure/
COPY MyProject.Domain/*.csproj ./MyProject.Domain/
RUN dotnet restore

# copy everything else and build app
COPY MyProject.Domain/ ./MyProject.Domain
COPY MyProject.Infrastructure/ ./MyProject.Infrastructure
COPY MyProject.WebApi/ ./MyProject.WebApi
WORKDIR /app/MyProject.WebApi
RUN dotnet publish -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-alpine AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyProject.WebApi.dll"]