namespace <%= infrastructureName %>.Extensions
{
	using MediatR;
	using Microsoft.Extensions.DependencyInjection;
	using <%= domainName %>.Commands;
	using <%= domainName %>.Entities;
	using <%= infrastructureName %>.CommandHandlers;

	public static class IServiceCollectionExtensions
	{
		public static IServiceCollection RegisterInfrastructureServices(this IServiceCollection serviceProvider)
		{
			serviceProvider.AddTransient<IRequestHandler<CreatePostCommand, Unit>, CreateCommandHandler<Post, CreatePostCommand>>();

			return serviceProvider;
		}
	}
}
