using System.ComponentModel.DataAnnotations;

public class ProjectTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    
    public bool IsCompleted { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
