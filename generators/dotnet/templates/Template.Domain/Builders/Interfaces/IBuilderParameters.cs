namespace <%= domainName %>.Builders.Interfaces
{
	using <%= domainName %>.Entities.Abstract;

	public interface IBuilderParameters<TEntity> where TEntity : BaseEntity
	{
	}
}
