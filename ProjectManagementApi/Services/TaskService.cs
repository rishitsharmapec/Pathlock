using Microsoft.EntityFrameworkCore;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    
    public TaskService(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<TaskDto>> GetProjectTasksAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
            
        if (project == null)
            throw new Exception("Project not found");
            
        return await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                IsCompleted = t.IsCompleted,
                ProjectId = t.ProjectId
            })
            .ToListAsync();
    }
    
    public async Task<TaskDto> CreateTaskAsync(Guid projectId, CreateTaskDto dto, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
            
        if (project == null)
            throw new Exception("Project not found");
            
        var task = new ProjectTask
        {
            Title = dto.Title,
            DueDate = dto.DueDate,
            IsCompleted = dto.IsCompleted,
            ProjectId = projectId
        };
        
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            ProjectId = task.ProjectId
        };
    }
    
    public async Task<TaskDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);
            
        if (task == null)
            throw new Exception("Task not found");
            
        if (dto.Title != null) task.Title = dto.Title;
        if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;
        if (dto.IsCompleted.HasValue) task.IsCompleted = dto.IsCompleted.Value;
        
        await _context.SaveChangesAsync();
        
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            ProjectId = task.ProjectId
        };
    }
    
    public async Task DeleteTaskAsync(Guid taskId, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);
            
        if (task == null)
            throw new Exception("Task not found");
            
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }
}
