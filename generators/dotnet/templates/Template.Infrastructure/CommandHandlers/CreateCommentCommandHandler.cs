namespace <%= infrastructureName %>.CommandHandlers
{
	using System.Threading;
	using System.Threading.Tasks;
	using FluentValidation;
	using MediatR;
	using Microsoft.EntityFrameworkCore;
	using Microsoft.Extensions.Logging;
	using <%= domainName %>.Builders;
	using <%= domainName %>.Commands;
	using <%= infrastructureName %>.EntityFramework;

	public class CreateCommentCommandHandler : AsyncRequestHandler<CreateCommentCommand>
	{
		private readonly PostContext _postContext;
		private readonly ILogger<CreateCommentCommandHandler> _logger;
		private readonly CommentBuilder _builder;

		public CreateCommentCommandHandler(PostContext postContext, ILogger<CreateCommentCommandHandler> logger, CommentBuilder builder)
		{
			_postContext = postContext;
			_logger = logger;
			_builder = builder;
		}

		protected override async Task Handle(CreateCommentCommand request, CancellationToken cancellationToken)
		{
			try
			{
				var post = await _postContext
					.Posts
					.Include(e => e.Comments)
					.FirstAsync(e => e.Id == request.PostId)
					.ConfigureAwait(false);

				post.AddComment(_builder, request);
				//_postContext.Add(post);
				await _postContext.SaveChangesAsync().ConfigureAwait(false);
			}
			catch (ValidationException argumentException)
			{
				_logger.LogError(argumentException, "Failed to create entity");
				throw;
			}
			catch (DbUpdateException dbUpdateException)
			{
				_logger.LogError(dbUpdateException, "Failed to insert entity into database");
				throw;
			}
		}
	}
}
