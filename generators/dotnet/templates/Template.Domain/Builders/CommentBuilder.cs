namespace <%= domainName %>.Builders
{
	using <%= domainName %>.Builders.Interfaces;
	using <%= domainName %>.Commands;
	using <%= domainName %>.Entities;

	public class CommentBuilder : IBuilder<Comment, CreateCommentCommand>
	{
		public Comment Build(CreateCommentCommand command)
		{
			var comment = new Comment
			{
				Author = command.Author,
				Content = command.Content,
				PostId = command.PostId
			};

			comment.EnsureValid();

			return comment;
		}
	}
}
