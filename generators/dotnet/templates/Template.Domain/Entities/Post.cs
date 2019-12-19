namespace <%= domainName %>.Entities
{
	using System;
	using System.Collections.Generic;
	using <%= domainName %>.Entities.Abstract;

	public class Post : BaseEntity
	{
		public Post()
		{
		}

		public string Content { get; set; }
		public string Author { get; set; }
		public ICollection<Comment> Comments { get; set; } = new List<Comment>();
	}
}
