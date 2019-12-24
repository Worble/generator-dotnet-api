namespace <%= infrastructureName %>.QueryHandlers
{
	using System.Threading;
	using System.Threading.Tasks;
	using MediatR;
	using Microsoft.EntityFrameworkCore;
	using <%= domainName %>.Entities;
	using <%= domainName %>.Queries;
	using <%= infrastructureName %>.EntityFramework;

	public class GetPostQueryHandler : IRequestHandler<GetPostQuery, Post>
	{
		private readonly PostContext _context;

		public GetPostQueryHandler(PostContext context)
		{
			_context = context;
		}

		async Task<Post> IRequestHandler<GetPostQuery, Post>.Handle(GetPostQuery request, CancellationToken cancellationToken)
		{
			return await _context
				.Posts
				.Include(e => e.Comments)
				.FirstAsync(e => e.Id == request.Id)
				.ConfigureAwait(false);
		}
	}
}
