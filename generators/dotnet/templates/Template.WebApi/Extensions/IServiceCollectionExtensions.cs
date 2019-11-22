namespace <%= webApiName %>.Extensions
{
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.DependencyInjection;
	using Microsoft.Extensions.Options;

	public static class IServiceCollectionExtensions
	{
		public static IServiceCollection BuildConfiguration<T>(this IServiceCollection serviceCollection, IConfiguration configuration) where T : class, new()
		{
			serviceCollection.Configure<T>(configuration);
			serviceCollection.AddScoped(sp => sp.GetService<IOptionsSnapshot<T>>().Value);
			return serviceCollection;
		}
	}
}
