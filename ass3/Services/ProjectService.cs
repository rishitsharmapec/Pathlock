using Microsoft.EntityFrameworkCore;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;
    
    public ProjectService(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId)
    {
        return await _context.Projects
            .Where(p => p.UserId == userId)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();
    }
    
    public async Task<ProjectDto> GetProjectAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
            
        if (project == null)
            throw new Exception("Project not found");
            
        return new ProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            CreatedAt = project.CreatedAt
        };
    }
    
    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, Guid userId)
    {
        var project = new Project
        {
            Title = dto.Title,
            Description = dto.Description,
            UserId = userId
        };
        
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        
        return new ProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            CreatedAt = project.CreatedAt
        };
    }
    
    public async Task DeleteProjectAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
            
        if (project == null)
            throw new Exception("Project not found");
            
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }
}