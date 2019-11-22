namespace <%= webApiName %>.Controllers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;<% if(polly) { %>
	using <%= domainName %>.Services;
	using System.Threading.Tasks;<% } %>
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.Extensions.Logging;
	using <%= domainName %>.Models;

	[ApiController]
	[Route("[controller]")]
	public class WeatherForecastController : ControllerBase
	{
		private static readonly string[] Summaries = new[]
		{
			"Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
		};

		private readonly ILogger<WeatherForecastController> _logger;<% if(polly) { %>
		private readonly IExampleHttpService _exampleHttpService;<% } %>

		public WeatherForecastController(ILogger<WeatherForecastController> logger<% if(polly) { %>, IExampleHttpService exampleHttpService<% } %>)
		{
			_logger = logger;<% if(polly) { %>
			_exampleHttpService = exampleHttpService;<% } %>
		}

		[HttpGet]
		public IEnumerable<WeatherForecast> Get()
		{
			_logger.LogInformation("In weather controller GET");
			var rng = new Random();
			return Enumerable.Range(1, 5).Select(index => new WeatherForecast
			{
				Date = DateTime.Now.AddDays(index),
				TemperatureC = rng.Next(-20, 55),
				Summary = Summaries[rng.Next(Summaries.Length)]
			})
			.ToArray();
		}<% if(polly) { %>
		
		[HttpPost]
		public async Task<string> Post()
		{
			_logger.LogInformation("In weather controller POST");
			return await _exampleHttpService.Send("", "").ConfigureAwait(false);
		}<% } %>
	}
}
