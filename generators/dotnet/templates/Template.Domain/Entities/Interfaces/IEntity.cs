namespace <%= domainName %>.Entities.Interfaces
{
	using System;
	using <%= domainName %>.Entities.Abstract;

	internal interface IEntity<TEntity> where TEntity : BaseEntity
	{
		TEntity UpdateDateCreated(DateTime dateCreated);

		TEntity UpdateDateEdited(DateTime? dateEdited);

		TEntity EnsureValid();
	}
}
