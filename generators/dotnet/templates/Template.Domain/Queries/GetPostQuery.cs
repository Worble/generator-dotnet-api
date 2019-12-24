namespace <%= domainName %>.Queries
{
	using MediatR;
	using <%= domainName %>.Entities;

	public class GetPostQuery : IRequest<Post>
	{
		public int Id { get; set; }
	}
}
