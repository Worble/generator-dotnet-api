namespace <%= infrastructureName %>.CommandHandlers
{
	using System.Collections.Generic;
	using System.Linq;
	using System.Threading;
	using System.Threading.Tasks;
	using FluentValidation;
	using MediatR;
	using Microsoft.EntityFrameworkCore;
	using Microsoft.Extensions.Logging;
	using <%= domainName %>.Builders.Interfaces;
	using <%= domainName %>.Commands.Interfaces;
	using <%= domainName %>.Entities.Abstract;
	using <%= infrastructureName %>.EntityFramework;

	public class CreateCommandHandler<TEntity, TCommand> : AsyncRequestHandler<TCommand>
		where TEntity : BaseEntity
		where TCommand : class, ICreateCommand<TEntity>, new()
	{
		private readonly PostContext _postContext;
		private readonly ILogger<CreateCommandHandler<TEntity, TCommand>> _logger;
		private readonly IBuilder<TEntity, TCommand> _builder;

		public CreateCommandHandler(PostContext postContext, ILogger<CreateCommandHandler<TEntity, TCommand>> logger, IEnumerable<IBuilder> builders)
		{
			_postContext = postContext;
			_logger = logger;
			_builder = builders.OfType<IBuilder<TEntity, TCommand>>().First();
		}

		protected override async Task Handle(TCommand request, CancellationToken cancellationToken)
		{
			try
			{
				var post = _builder.Build(request);

				_postContext.Add(post);

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
