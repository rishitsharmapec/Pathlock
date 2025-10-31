using System;
using System.Collections.Generic;
using System.Linq;
using ProjectManager.Models;

namespace ProjectManager.Services
{
    public class SchedulerService : ISchedulerService
    {
        private const int WorkHoursPerDay = 8;

        public ScheduleResponse GenerateSchedule(List<TaskInput> tasks)
        {
            var response = new ScheduleResponse();
            var warnings = new List<string>();

            // Validate and detect cycles
            var (isValid, errorMessage) = ValidateTasks(tasks);
            if (!isValid)
            {
                throw new InvalidOperationException(errorMessage);
            }

            // Topological sort with priority consideration
            var orderedTasks = TopologicalSort(tasks);
            response.RecommendedOrder = orderedTasks.Select(t => t.Title).ToList();

            // Calculate schedule with work hours
            var scheduledTasks = CalculateSchedule(orderedTasks, warnings);
            response.Schedule = scheduledTasks;
            response.Warnings = warnings;

            // Calculate metrics
            response.Metrics = CalculateMetrics(scheduledTasks, tasks);

            return response;
        }

        private (bool isValid, string errorMessage) ValidateTasks(List<TaskInput> tasks)
        {
            var taskTitles = new HashSet<string>(tasks.Select(t => t.Title));

            // Check for duplicate task titles
            if (taskTitles.Count != tasks.Count)
            {
                return (false, "Duplicate task titles found. Each task must have a unique title.");
            }

            // Validate dependencies exist
            foreach (var task in tasks)
            {
                foreach (var dep in task.Dependencies)
                {
                    if (!taskTitles.Contains(dep))
                    {
                        return (false, $"Task '{task.Title}' has invalid dependency: '{dep}'");
                    }
                }
            }

            // Check for circular dependencies
            if (HasCircularDependency(tasks))
            {
                return (false, "Circular dependency detected in task dependencies.");
            }

            return (true, string.Empty);
        }

        private bool HasCircularDependency(List<TaskInput> tasks)
        {
            var visited = new HashSet<string>();
            var recursionStack = new HashSet<string>();
            var taskDict = tasks.ToDictionary(t => t.Title);

            bool DFS(string taskTitle)
            {
                visited.Add(taskTitle);
                recursionStack.Add(taskTitle);

                if (taskDict.TryGetValue(taskTitle, out var task))
                {
                    foreach (var dep in task.Dependencies)
                    {
                        if (!visited.Contains(dep))
                        {
                            if (DFS(dep)) return true;
                        }
                        else if (recursionStack.Contains(dep))
                        {
                            return true;
                        }
                    }
                }

                recursionStack.Remove(taskTitle);
                return false;
            }

            foreach (var task in tasks)
            {
                if (!visited.Contains(task.Title))
                {
                    if (DFS(task.Title)) return true;
                }
            }

            return false;
        }

        private List<TaskInput> TopologicalSort(List<TaskInput> tasks)
        {
            var inDegree = new Dictionary<string, int>();
            var graph = new Dictionary<string, List<string>>();
            var taskDict = tasks.ToDictionary(t => t.Title);

            // Initialize
            foreach (var task in tasks)
            {
                inDegree[task.Title] = 0;
                graph[task.Title] = new List<string>();
            }

            // Build graph and calculate in-degrees
            foreach (var task in tasks)
            {
                foreach (var dep in task.Dependencies)
                {
                    graph[dep].Add(task.Title);
                    inDegree[task.Title]++;
                }
            }

            // Kahn's algorithm with priority queue
            var queue = new SortedSet<(int priority, DateTime dueDate, string title)>(
                Comparer<(int priority, DateTime dueDate, string title)>.Create((a, b) =>
                {
                    int result = b.priority.CompareTo(a.priority);
                    if (result == 0) result = a.dueDate.CompareTo(b.dueDate);
                    if (result == 0) result = string.Compare(a.title, b.title, StringComparison.Ordinal);
                    return result;
                })
            );

            foreach (var task in tasks.Where(t => inDegree[t.Title] == 0))
            {
                queue.Add((task.Priority ?? 0, task.DueDate, task.Title));
            }

            var result = new List<TaskInput>();

            while (queue.Count > 0)
            {
                var current = queue.Min;
                queue.Remove(current);
                var task = taskDict[current.title];
                result.Add(task);

                foreach (var neighbor in graph[current.title])
                {
                    inDegree[neighbor]--;
                    if (inDegree[neighbor] == 0)
                    {
                        var neighborTask = taskDict[neighbor];
                        queue.Add((neighborTask.Priority ?? 0, neighborTask.DueDate, neighbor));
                    }
                }
            }

            return result;
        }

        private List<ScheduledTask> CalculateSchedule(List<TaskInput> orderedTasks, List<string> warnings)
        {
            var scheduledTasks = new List<ScheduledTask>();
            var taskEndDates = new Dictionary<string, DateTime>();
            var currentDate = DateTime.Now.Date;

            // Calculate critical path
            var criticalPathTasks = IdentifyCriticalPath(orderedTasks);

            for (int i = 0; i < orderedTasks.Count; i++)
            {
                var task = orderedTasks[i];
                var startDate = currentDate;

                // Consider dependency completion dates
                if (task.Dependencies.Any())
                {
                    var maxDepEndDate = task.Dependencies
                        .Where(d => taskEndDates.ContainsKey(d))
                        .Select(d => taskEndDates[d])
                        .DefaultIfEmpty(currentDate)
                        .Max();
                    
                    startDate = maxDepEndDate > startDate ? maxDepEndDate : startDate;
                }

                // Skip weekends
                while (startDate.DayOfWeek == DayOfWeek.Saturday || startDate.DayOfWeek == DayOfWeek.Sunday)
                {
                    startDate = startDate.AddDays(1);
                }

                var workingDays = Math.Ceiling(task.EstimatedHours / WorkHoursPerDay);
                var endDate = AddWorkingDays(startDate, (int)workingDays);

                // Check if deadline is feasible
                if (endDate > task.DueDate)
                {
                    warnings.Add($"Task '{task.Title}' may miss deadline. Estimated completion: {endDate:yyyy-MM-dd}, Due: {task.DueDate:yyyy-MM-dd}");
                }

                scheduledTasks.Add(new ScheduledTask
                {
                    Title = task.Title,
                    SuggestedStartDate = startDate,
                    SuggestedEndDate = endDate,
                    EstimatedHours = task.EstimatedHours,
                    OrderIndex = i + 1,
                    Dependencies = task.Dependencies,
                    CriticalPath = criticalPathTasks.Contains(task.Title) ? "Yes" : "No"
                });

                taskEndDates[task.Title] = endDate;
                currentDate = endDate;
            }

            return scheduledTasks;
        }

        private DateTime AddWorkingDays(DateTime startDate, int days)
        {
            var current = startDate;
            var addedDays = 0;

            while (addedDays < days)
            {
                current = current.AddDays(1);
                if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
                {
                    addedDays++;
                }
            }

            return current;
        }

        private HashSet<string> IdentifyCriticalPath(List<TaskInput> tasks)
        {
            var criticalPath = new HashSet<string>();
            var taskDict = tasks.ToDictionary(t => t.Title);
            var earliestStart = new Dictionary<string, double>();
            var latestStart = new Dictionary<string, double>();

            // Calculate earliest start times (forward pass)
            foreach (var task in tasks)
            {
                if (!task.Dependencies.Any())
                {
                    earliestStart[task.Title] = 0;
                }
                else
                {
                    earliestStart[task.Title] = task.Dependencies
                        .Select(d => earliestStart.GetValueOrDefault(d) + taskDict[d].EstimatedHours)
                        .Max();
                }
            }

            // Find project duration
            var projectDuration = tasks.Select(t => earliestStart[t.Title] + t.EstimatedHours).Max();

            // Calculate latest start times (backward pass)
            foreach (var task in tasks.AsEnumerable().Reverse())
            {
                var dependents = tasks.Where(t => t.Dependencies.Contains(task.Title)).ToList();
                if (!dependents.Any())
                {
                    latestStart[task.Title] = projectDuration - task.EstimatedHours;
                }
                else
                {
                    latestStart[task.Title] = dependents
                        .Select(d => latestStart[d.Title])
                        .Min() - task.EstimatedHours;
                }
            }

            // Identify critical path (slack = 0)
            foreach (var task in tasks)
            {
                var slack = latestStart[task.Title] - earliestStart[task.Title];
                if (Math.Abs(slack) < 0.01)
                {
                    criticalPath.Add(task.Title);
                }
            }

            return criticalPath;
        }

        private ScheduleMetrics CalculateMetrics(List<ScheduledTask> scheduledTasks, List<TaskInput> tasks)
        {
            var startDate = scheduledTasks.Min(t => t.SuggestedStartDate);
            var endDate = scheduledTasks.Max(t => t.SuggestedEndDate);
            var totalHours = tasks.Sum(t => t.EstimatedHours);
            var criticalPathLength = scheduledTasks.Where(t => t.CriticalPath == "Yes").Sum(t => t.EstimatedHours);

            return new ScheduleMetrics
            {
                ProjectStartDate = startDate,
                ProjectEndDate = endDate,
                TotalHours = totalHours,
                TotalTasks = tasks.Count,
                CriticalPathLength = criticalPathLength
            };
        }
    }
}