namespace <%= domainName %>.Commands
{
	using MediatR;

	public class UpdatePostCommand : IRequest
	{
		public int PostId { get; set; }
		public string Content { get; set; }
	}
}
