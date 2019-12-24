namespace <%= webApiName %>.Controllers
{
	using System.Collections.Generic;
	using System.Threading.Tasks;
	using MediatR;
	using Microsoft.AspNetCore.Mvc;
	using <%= domainName %>.Commands;
	using <%= domainName %>.Entities;
	using <%= domainName %>.Queries;

	[ApiController]
	[Route("[controller]")]
	public class PostsController : ControllerBase
	{
		private readonly IMediator _mediator;

		public PostsController(IMediator mediator)
		{
			_mediator = mediator;
		}

		[HttpGet]
		public async Task<IEnumerable<Post>> GetPosts()
		{
			return await _mediator.Send(new GetAllPostsQuery()).ConfigureAwait(false);
		}

		[HttpGet("{id}")]
		public async Task<Post> GetPosts(int id)
		{
			return await _mediator.Send(new GetPostQuery() { Id = id }).ConfigureAwait(false);
		}

		[HttpPost]
		public async Task<ActionResult> CreatePost([FromBody]CreatePostCommand createPostCommand)
		{
			await _mediator
				.Send(createPostCommand)
				.ConfigureAwait(false);

			return Ok();
		}

		[HttpPatch("{id}")]
		public async Task<ActionResult> UpdatePost(int id, [FromBody]UpdatePostCommand updatePostCommand)
		{
			updatePostCommand.PostId = id;
			await _mediator
				.Send(updatePostCommand)
				.ConfigureAwait(false);

			return Ok();
		}

		[HttpPost("{id}/comment")]
		public async Task<ActionResult> AddComment(int id, [FromBody]CreateCommentCommand createCommentCommand)
		{
			createCommentCommand.PostId = id;
			await _mediator
				.Send(createCommentCommand)
				.ConfigureAwait(false);

			return Ok();
		}
	}
}
