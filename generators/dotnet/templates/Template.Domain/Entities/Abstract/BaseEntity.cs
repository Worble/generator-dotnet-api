namespace <%= domainName %>.Entities.Abstract
{
	using System;

	public abstract class BaseEntity
	{
		public int Id { get; private set; }
		public DateTime DateCreated { get; private set; }
		public DateTime? DateEdited { get; private set; }

		public BaseEntity UpdateDateCreated(DateTime dateCreated)
		{
			DateCreated = dateCreated;
			return this;
		}

		public BaseEntity UpdateDateEdited(DateTime? dateEdited)
		{
			DateEdited = dateEdited;
			return this;
		}
	}
}
