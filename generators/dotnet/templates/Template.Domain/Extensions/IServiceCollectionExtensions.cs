namespace <%= domainName %>.Extensions
{
	using Microsoft.Extensions.DependencyInjection;
	using <%= domainName %>.Builders;
	using <%= domainName %>.Builders.Interfaces;

	public static class IServiceCollectionExtensions
	{
		public static IServiceCollection RegisterDomainServices(this IServiceCollection serviceProvider)
		{
			serviceProvider.AddTransient<IBuilder, PostBuilder>();
			serviceProvider.AddTransient<CommentBuilder>();
			return serviceProvider;
		}
	}
}
