namespace <%= domainName %>.Commands
{
	using MediatR;
	using <%= domainName %>.Builders.Interfaces;
	using <%= domainName %>.Entities;

	public class CreateCommentCommand : IRequest, IBuilderParameters<Comment>
	{
		public int PostId { get; set; }
		public string Content { get; set; }
		public string Author { get; set; }
	}
}
