using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Models
{
    public class TaskScheduleRequest
    {
        [Required]
        public List<TaskInput> Tasks { get; set; } = new();
    }

    public class TaskInput
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Range(0.5, 1000)]
        public double EstimatedHours { get; set; }
        
        [Required]
        public DateTime DueDate { get; set; }
        
        public List<string> Dependencies { get; set; } = new();
        
        public int? Priority { get; set; }
    }

    public class ScheduleResponse
    {
        public List<string> RecommendedOrder { get; set; } = new();
        public List<ScheduledTask> Schedule { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public ScheduleMetrics Metrics { get; set; } = new();
    }

    public class ScheduledTask
    {
        public string Title { get; set; } = string.Empty;
        public DateTime SuggestedStartDate { get; set; }
        public DateTime SuggestedEndDate { get; set; }
        public double EstimatedHours { get; set; }
        public int OrderIndex { get; set; }
        public List<string> Dependencies { get; set; } = new();
        public string CriticalPath { get; set; } = "No";
    }

    public class ScheduleMetrics
    {
        public DateTime ProjectStartDate { get; set; }
        public DateTime ProjectEndDate { get; set; }
        public double TotalHours { get; set; }
        public int TotalTasks { get; set; }
        public double CriticalPathLength { get; set; }
    }
}