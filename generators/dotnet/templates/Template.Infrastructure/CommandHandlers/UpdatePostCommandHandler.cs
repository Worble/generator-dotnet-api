namespace <%= infrastructureName %>.CommandHandlers
{
	using System.Threading;
	using System.Threading.Tasks;
	using FluentValidation;
	using MediatR;
	using Microsoft.EntityFrameworkCore;
	using Microsoft.Extensions.Logging;
	using <%= domainName %>.Commands;
	using <%= infrastructureName %>.EntityFramework;

	public class UpdatePostCommandHandler : AsyncRequestHandler<UpdatePostCommand>
	{
		private readonly PostContext _postContext;
		private readonly ILogger<UpdatePostCommandHandler> _logger;

		public UpdatePostCommandHandler(PostContext postContext, ILogger<UpdatePostCommandHandler> logger)
		{
			_postContext = postContext;
			_logger = logger;
		}

		protected async override Task Handle(UpdatePostCommand request, CancellationToken cancellationToken)
		{
			try
			{
				var post = await _postContext
					.Posts
					.FindAsync(request.PostId)
					.ConfigureAwait(false);

				post.UpdateContent(request.Content);
				_postContext.Update(post);
				await _postContext.SaveChangesAsync().ConfigureAwait(false);
			}
			catch (ValidationException argumentException)
			{
				_logger.LogError(argumentException, "Failed to update Post entity");
				throw;
			}
			catch (DbUpdateException dbUpdateException)
			{
				_logger.LogError(dbUpdateException, "Failed to insert Post entity into Database");
				throw;
			}
		}
	}
}
