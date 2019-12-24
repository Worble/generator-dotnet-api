namespace <%= domainName %>.Queries
{
	using System.Collections.Generic;
	using MediatR;
	using <%= domainName %>.Entities;

	public class GetAllPostsQuery : IRequest<List<Post>>
	{
	}
}
