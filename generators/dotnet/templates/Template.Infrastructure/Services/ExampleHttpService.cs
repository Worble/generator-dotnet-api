namespace <%= infrastructureName %>.Services
{
	using System.Net.Http;
	using System.Threading.Tasks;
	using <%= domainName %>.Services;

	public class ExampleHttpService : IExampleHttpService
	{
		private readonly HttpClient _client;

		public ExampleHttpService(HttpClient client)
		{
			_client = client;
		}

		public async Task<string> Send(string url, string content)
		{
			var response = await _client.PostAsync(url, new StringContent(content)).ConfigureAwait(false);
			return await response.Content.ReadAsStringAsync().ConfigureAwait(false);
		}
	}
}
