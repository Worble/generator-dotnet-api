namespace <%= domainName %>.Entities.Abstract
{
	using System;

	public abstract class BaseEntity
	{
		public int Id { get; set; }
		public DateTime DateCreated { get; set; } = DateTime.Now;
		public DateTime? DateEdited { get; set; }
	}
}
