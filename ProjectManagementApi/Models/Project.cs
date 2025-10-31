using System.ComponentModel.DataAnnotations;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}