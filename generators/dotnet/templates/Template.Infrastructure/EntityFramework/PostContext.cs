namespace <%= infrastructureName %>.EntityFramework
{
	using Microsoft.EntityFrameworkCore;
	using <%= domainName %>.Entities;

	public class PostContext : DbContext
	{
		public PostContext(DbContextOptions<PostContext> options)
			: base(options)
		{
		}

		public DbSet<Post> Posts { get; set; }
		public DbSet<Comment> Comments { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Post>(builder =>
			{
				builder.Property(post => post.Id).IsRequired().Metadata.IsPrimaryKey();
				builder.Property(post => post.Content).IsRequired();
				builder.Property(post => post.Author).IsRequired();
			});

			modelBuilder.Entity<Comment>(builder =>
			{
				builder.Property(comment => comment.Id).IsRequired().Metadata.IsPrimaryKey();
				builder.Property(comment => comment.Content).IsRequired();
				builder.Property(comment => comment.Author).IsRequired();
				builder.HasOne(comment => comment.Post).WithMany().HasForeignKey(comment => comment.PostId).IsRequired();
			});
		}
	}
}
