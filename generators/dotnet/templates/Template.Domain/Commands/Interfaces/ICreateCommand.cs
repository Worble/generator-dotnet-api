namespace <%= domainName %>.Commands.Interfaces
{
	using MediatR;
	using <%= domainName %>.Builders.Interfaces;
	using <%= domainName %>.Entities.Abstract;

	public interface ICreateCommand<TEntity> : IRequest, IBuilderParameters<TEntity> where TEntity : BaseEntity
	{
	}
}
