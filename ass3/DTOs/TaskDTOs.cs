using System.ComponentModel.DataAnnotations;

public class CreateTaskDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    
    public bool IsCompleted { get; set; }
}

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public DateTime? DueDate { get; set; }
    public bool? IsCompleted { get; set; }
}

public class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public Guid ProjectId { get; set; }
}