namespace <%= domainName %>.Builders.Interfaces
{
	using <%= domainName %>.Entities.Abstract;

	public interface IBuilder<TEntity, TParameters> : IBuilder where TEntity : BaseEntity where TParameters : IBuilderParameters<TEntity>
	{
		TEntity Build(TParameters command);
	}

	public interface IBuilder
	{
	}
}
