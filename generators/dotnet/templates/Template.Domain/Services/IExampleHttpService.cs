namespace <%= domainName %>.Services
{
	using System.Threading.Tasks;

	public interface IExampleHttpService
	{
		Task<string> Send(string url, string content);
	}
}
