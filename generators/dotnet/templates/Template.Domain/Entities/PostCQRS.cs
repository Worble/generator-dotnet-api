namespace <%= domainName %>.Entities
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using FluentValidation;
	using <%= domainName %>.Builders;
	using <%= domainName %>.Commands;
	using <%= domainName %>.Entities.Abstract;
	using <%= domainName %>.Entities.Interfaces;

	public sealed class Post : BaseEntity, IEntity<Post>
	{
		internal Post()
		{
		}

		public string Content { get; internal set; }

		public string Author { get; internal set; }

		public ICollection<Comment> Comments { get; }

		public Post UpdateContent(string content)
		{
			if (string.IsNullOrWhiteSpace(content))
			{
				throw new ArgumentNullException(nameof(content));
			}

			Content = content;

			return EnsureValid();
		}

		public Post AddComment(Comment comment)
		{
			if (Comments == null)
			{
				throw new InvalidOperationException("Comments must be loaded before adding");
			}

			Comments.Add(comment);

			return EnsureValid();
		}

		public Post RemoveComment(int id)
		{
			if (Comments == null)
			{
				throw new InvalidOperationException("Comments must be loaded before removing");
			}

			Comments.Remove(Comments.First(comment => comment.Id == id));

			return EnsureValid();
		}

		public Post AddComment(CommentBuilder builder, CreateCommentCommand request)
		{
			if (Comments == null)
			{
				throw new InvalidOperationException("Comments must be loaded before adding");
			}

			Comments.Add(builder.Build(request));

			return EnsureValid();
		}

		public Post UpdateCommentContent(int id, string content)
		{
			if (Comments == null)
			{
				throw new InvalidOperationException("Comments must be loaded before editing");
			}

			Comments
				.First(comment => comment.Id == id)
				.UpdateContent(content);

			return EnsureValid();
		}

		public Post EnsureValid()
		{
			var validationResults = new PostValidator().Validate(this);
			if (!validationResults.IsValid)
			{
				throw new ValidationException(validationResults.Errors);
			}
			return this;
		}

		public Post UpdateDateCreated(DateTime dateCreated)
		{
			SetDateCreated(dateCreated);
			return this;
		}

		public Post UpdateDateEdited(DateTime? dateEdited)
		{
			SetDateEdited(dateEdited);
			return this;
		}
	}

	public class PostValidator : AbstractValidator<Post>
	{
		public PostValidator()
		{
			RuleFor(p => p.Author).NotEmpty();
			RuleFor(p => p.Content).NotEmpty();
		}
	}
}
