namespace <%= domainName %>.Entities.Abstract
{
	using System;

	public abstract class BaseEntity
	{
		public int Id { get; private set; }
		public DateTime DateCreated { get; private set; } = DateTime.Now;
		public DateTime? DateEdited { get; private set; }
	}
}
