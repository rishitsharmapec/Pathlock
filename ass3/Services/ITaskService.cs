public interface ITaskService
{
    Task<List<TaskDto>> GetProjectTasksAsync(Guid projectId, Guid userId);
    Task<TaskDto> CreateTaskAsync(Guid projectId, CreateTaskDto dto, Guid userId);
    Task<TaskDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto, Guid userId);
    Task DeleteTaskAsync(Guid taskId, Guid userId);
}