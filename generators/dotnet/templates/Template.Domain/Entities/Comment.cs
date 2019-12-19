namespace <%=domainName%>.Entities
{
	using <%= domainName %>.Entities.Abstract;

	public class Comment : BaseEntity
	{
		public Comment()
		{
		}

		public string Content { get; set; }
		public string Author { get; set; }
		public int PostId { get; set; }
		public Post Post { get; set; }
	}
}
