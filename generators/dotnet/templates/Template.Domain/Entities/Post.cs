namespace <%= domainName %>.Entities
{
	using System;
	using System.Collections.Generic;
	using <%= domainName %>.Entities.Abstract;

	public class Post : BaseEntity
	{
		private Post()
		{
		}

		public Post(string content, string author)
		{
			Content = content;
			Author = author;
			Comments = new List<Comment>();
		}

		public string Content { get; private set; }
		public string Author { get; private set; }
		public ICollection<Comment> Comments { get; private set; }

		public Post UpdateContent(string content)
		{
			Content = content;
			return this;
		}

		public Post AddComment(Comment comment)
		{
			if (Comments == null)
			{
				throw new InvalidOperationException("Comments must be loaded before added");
			}
			Comments.Add(comment);
			return this;
		}
	}
}
