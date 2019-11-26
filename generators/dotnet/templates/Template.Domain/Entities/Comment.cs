namespace <%=domainName%>.Entities
{
	using <%= domainName %>.Entities.Abstract;

	public class Comment : BaseEntity
	{
		private Comment()
		{
		}

		public Comment(string content, string author, int postId)
		{
			Content = content;
			Author = author;
			PostId = postId;
		}

		public string Content { get; private set; }
		public string Author { get; private set; }
		public int PostId { get; private set; }
		public Post Post { get; private set; }

		public Comment UpdateContent(string content)
		{
			Content = content;
			return this;
		}
	}
}
