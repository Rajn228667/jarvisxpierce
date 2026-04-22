FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/PierceX.sln ./
COPY backend/src ./src
RUN dotnet restore ./src/PierceX.Api/PierceX.Api.csproj
RUN dotnet publish ./src/PierceX.Api/PierceX.Api.csproj -c Release -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "PierceX.Api.dll"]
