public interface IProjectService
{
    Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId);
    Task<ProjectDto> GetProjectAsync(Guid projectId, Guid userId);
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, Guid userId);
    Task DeleteProjectAsync(Guid projectId, Guid userId);
}