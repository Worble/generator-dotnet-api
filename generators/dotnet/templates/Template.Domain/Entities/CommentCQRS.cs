namespace <%=domainName%>.Entities
{
	using System;
	using FluentValidation;
	using <%= domainName %>.Entities.Abstract;
	using <%= domainName %>.Entities.Interfaces;

	public class Comment : BaseEntity, IEntity<Comment>
	{
		internal Comment()
		{
		}

		public string Content { get; internal set; }
		public string Author { get; internal set; }
		public int PostId { get; internal set; }

		public Post Post { get; }

		internal Comment UpdateContent(string content)
		{
			if (string.IsNullOrEmpty(content))
			{
				throw new ArgumentNullException(nameof(content));
			}
			Content = content;
			return this;
		}

		public Comment EnsureValid()
		{
			var validationResults = new CommentValidator().Validate(this);
			if (!validationResults.IsValid)
			{
				throw new ValidationException(validationResults.Errors);
			}
			return this;
		}

		public Comment UpdateDateCreated(DateTime dateCreated)
		{
			SetDateCreated(dateCreated);
			return this;
		}

		public Comment UpdateDateEdited(DateTime? dateEdited)
		{
			SetDateEdited(dateEdited);
			return this;
		}
	}

	public class CommentValidator : AbstractValidator<Comment>
	{
		public CommentValidator()
		{
			RuleFor(p => p.Author).NotEmpty();
			RuleFor(p => p.Content).NotEmpty();
		}
	}
}
