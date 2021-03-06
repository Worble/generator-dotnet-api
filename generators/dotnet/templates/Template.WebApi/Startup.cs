namespace <%= webApiName %>
{
	using Microsoft.AspNetCore.Builder;
	using Microsoft.AspNetCore.Hosting;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.DependencyInjection;
	using Microsoft.Extensions.Hosting;<% if(swagger) { %>
	using Microsoft.OpenApi.Models;<% } %><% if(polly) { %>
	using System;
	using Polly;
	using <%= infrastructureName %>.Services;
	using <%= domainName %>.Services;<% } %><% if(serilog) { %>
	using Serilog;<% } %><% if(stronglyTypedConfig) { %>
	using <%= domainName %>.Configuration;
	using <%= webApiName %>.Extensions;<% } %><% if(healthchecksUi) { %>
	using Microsoft.AspNetCore.Diagnostics.HealthChecks;
    using HealthChecks.UI.Client;<% } %><% if(efCore) { %>
	using System.Reflection;
	using Microsoft.EntityFrameworkCore;
	using <%= infrastructureName %>.EntityFramework;<% } %><% if(cqrs) { %>
	using System.Linq;
	using MediatR;
	using <%= domainName %>.Extensions;
	using <%= infrastructureName %>.Extensions;<% } %>
	
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{<% if(stronglyTypedConfig) { %>
			services.BuildConfiguration<<%= stronglyTypedConfigName %>>(Configuration);
			<% } %><% if(efCore) { %>
			// See https://docs.microsoft.com/en-us/aspnet/core/data/ef-rp/intro?view=aspnetcore-3.0&tabs=visual-studio-code
			services.AddDbContext<PostContext>(options =>
				<%= efCoreOptionsUse %>
					Configuration.GetConnectionString("PostContext"),
					builder => builder.MigrationsAssembly(Assembly.GetExecutingAssembly().GetName().Name)
				)
			);
			<% } %><% if(polly) { %>
			// See https://github.com/App-vNext/Polly/wiki/Polly-and-HttpClientFactory and https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests?view=aspnetcore-3.0#use-polly-based-handlers
			services.AddHttpClient<IExampleHttpService, ExampleHttpService>()
				.AddTransientHttpErrorPolicy(builder => builder.WaitAndRetryAsync(new[]
				{
					TimeSpan.FromSeconds(1),
					TimeSpan.FromSeconds(5),
					TimeSpan.FromSeconds(10)
				}));
			<% } %><% if(healthchecks) { %>
			// See https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks
            services.AddHealthChecks()<% if(efCore) { %><%- efCoreHealthString %><% } %>;
			<% } %><% if(cqrs) { %>
			services.RegisterDomainServices();
			services.RegisterInfrastructureServices();

			// See https://github.com/jbogard/MediatR
			services.AddMediatR(AppDomain
				.CurrentDomain
				.GetAssemblies()
				.First(assembly => assembly.GetName().Name == "<%- infrastructureName %>"));
			<% } %>
			services.AddControllers()<% if(cqrs) { %>.AddNewtonsoftJson(x => x
					.SerializerSettings
					.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore)<% } %>;<% if(swagger) { %>
			
			// See https://github.com/domaindrivendev/Swashbuckle.AspNetCore
			services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" }));<% } %>
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseHttpsRedirection();<% if(serilog) { %>
			
			app.UseSerilogRequestLogging();<% } %>

			app.UseRouting();

			app.UseAuthorization();<% if(swagger) { %>
			
			app.UseSwagger();
			app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1"));<% } %>

			app.UseEndpoints(endpoints => {
				endpoints.MapControllers();<% if(healthchecks) { %>
				endpoints.MapHealthChecks("/healthz"<% if(healthchecksUi) { %>, new HealthCheckOptions
					{
						Predicate = _ => true,
						ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
					}<% } %>);<% } %>
			});
		}
	}
}
