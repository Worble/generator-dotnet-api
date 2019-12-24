namespace <%= domainName %>.Builders
{
	using <%= domainName %>.Builders.Interfaces;
	using <%= domainName %>.Commands;
	using <%= domainName %>.Entities;

	public class PostBuilder : IBuilder<Post, CreatePostCommand>
	{
		public Post Build(CreatePostCommand command)
		{
			var post = new Post()
			{
				Author = command.Author,
				Content = command.Content
			};
			post.EnsureValid();
			return post;
		}
	}
}
