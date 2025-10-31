using ProjectManager.Models;

namespace ProjectManager.Services
{
    public interface ISchedulerService
    {
        ScheduleResponse GenerateSchedule(List<TaskInput> tasks);
    }
}