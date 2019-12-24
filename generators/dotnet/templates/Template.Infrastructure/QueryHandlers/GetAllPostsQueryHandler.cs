namespace <%= infrastructureName %>.QueryHandlers
{
	using System.Collections.Generic;
	using System.Threading;
	using System.Threading.Tasks;
	using MediatR;
	using Microsoft.EntityFrameworkCore;
	using <%= domainName %>.Entities;
	using <%= domainName %>.Queries;
	using <%= infrastructureName %>.EntityFramework;

	public class GetAllPostsQueryHandler : IRequestHandler<GetAllPostsQuery, List<Post>>
	{
		private readonly PostContext _context;

		public GetAllPostsQueryHandler(PostContext context)
		{
			_context = context;
		}

		public async Task<List<Post>> Handle(GetAllPostsQuery request, CancellationToken cancellationToken)
		{
			return await _context
				.Posts
				.ToListAsync()
				.ConfigureAwait(false);
		}
	}
}
