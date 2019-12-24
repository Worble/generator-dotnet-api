namespace <%= domainName %>.Commands
{
	using <%= domainName %>.Commands.Interfaces;
	using <%= domainName %>.Entities;

	public class CreatePostCommand : ICreateCommand<Post>
	{
		public string Content { get; set; }
		public string Author { get; set; }
	}
}
