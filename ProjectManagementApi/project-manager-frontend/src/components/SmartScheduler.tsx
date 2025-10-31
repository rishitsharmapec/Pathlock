import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Loader2, Plus, Trash2, ArrowRight } from 'lucide-react';

interface Task {
  title: string;
  estimatedHours: number;
  dueDate: string;
  dependencies: string[];
  priority?: number;
}

interface ScheduledTask {
  title: string;
  suggestedStartDate: string;
  suggestedEndDate: string;
  estimatedHours: number;
  orderIndex: number;
  dependencies: string[];
  criticalPath: string;
}

interface ScheduleResponse {
  recommendedOrder: string[];
  schedule: ScheduledTask[];
  warnings: string[];
  metrics: {
    projectStartDate: string;
    projectEndDate: string;
    totalHours: number;
    totalTasks: number;
    criticalPathLength: number;
  };
}

const SmartScheduler: React.FC = () => {
  const [projectId] = useState('project-123');
  const [tasks, setTasks] = useState<Task[]>([
    {
      title: 'Design API',
      estimatedHours: 5,
      dueDate: '2025-11-25',
      dependencies: [],
      priority: 5
    },
    {
      title: 'Implement Backend',
      estimatedHours: 12,
      dueDate: '2025-11-28',
      dependencies: ['Design API'],
      priority: 4
    },
    {
      title: 'Build Frontend',
      estimatedHours: 10,
      dueDate: '2025-11-30',
      dependencies: ['Design API'],
      priority: 3
    },
    {
      title: 'End-to-End Test',
      estimatedHours: 8,
      dueDate: '2025-12-01',
      dependencies: ['Implement Backend', 'Build Frontend'],
      priority: 5
    }
  ]);
  
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = () => {
    setTasks([...tasks, {
      title: '',
      estimatedHours: 1,
      dueDate: new Date().toISOString().split('T')[0],
      dependencies: [],
      priority: 3
    }]);
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const toggleDependency = (taskIndex: number, depTitle: string) => {
    const newTasks = [...tasks];
    const deps = newTasks[taskIndex].dependencies;
    
    if (deps.includes(depTitle)) {
      newTasks[taskIndex].dependencies = deps.filter(d => d !== depTitle);
    } else {
      newTasks[taskIndex].dependencies = [...deps, depTitle];
    }
    
    setTasks(newTasks);
  };

  const generateSchedule = async () => {
    setLoading(true);
    setError(null);
    setSchedule(null);

    try {
      const response = await fetch(`http://localhost:5218/api/v1/projects/${projectId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate schedule');
      }

      const data = await response.json();
      setSchedule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Smart Scheduler
        </h2>
        <p className="text-gray-600">
          Automatically plan your work with intelligent task scheduling
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Task Input */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Tasks</h3>
            <button
              onClick={addTask}
              className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {tasks.map((task, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    placeholder="Task title"
                    className="flex-1 text-base font-semibold border-b border-gray-300 focus:border-indigo-500 outline-none pb-1"
                  />
                  <button
                    onClick={() => removeTask(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Hours</label>
                    <input
                      type="number"
                      value={task.estimatedHours}
                      onChange={(e) => updateTask(index, 'estimatedHours', parseFloat(e.target.value))}
                      min="0.5"
                      step="0.5"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Due Date</label>
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Priority</label>
                    <select
                      value={task.priority || 3}
                      onChange={(e) => updateTask(index, 'priority', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="5">High</option>
                      <option value="3">Medium</option>
                      <option value="1">Low</option>
                    </select>
                  </div>
                </div>

                {tasks.length > 1 && (
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Dependencies</label>
                    <div className="flex flex-wrap gap-1">
                      {tasks.map((t, i) => i !== index && t.title && (
                        <button
                          key={i}
                          onClick={() => toggleDependency(index, t.title)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            task.dependencies.includes(t.title)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {t.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={generateSchedule}
            disabled={loading || tasks.length === 0 || tasks.some(t => !t.title)}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Calendar size={20} />
                Generate Smart Schedule
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Schedule Output */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={18} />
              <div>
                <p className="font-semibold text-red-900 text-sm">Error</p>
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            </div>
          )}

          {!schedule && !error && (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Add tasks and click "Generate Smart Schedule"</p>
            </div>
          )}

          {schedule && (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <Clock size={16} />
                    <span className="font-semibold text-sm">Total Hours</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{schedule.metrics.totalHours}h</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-700 mb-1">
                    <CheckCircle size={16} />
                    <span className="font-semibold text-sm">Total Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{schedule.metrics.totalTasks}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
                <p className="text-xs text-indigo-700 mb-1">Project Timeline</p>
                <p className="text-sm font-semibold text-indigo-900">
                  {formatDate(schedule.metrics.projectStartDate)} → {formatDate(schedule.metrics.projectEndDate)}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Critical Path: {schedule.metrics.criticalPathLength}h
                </p>
              </div>

              {/* Warnings */}
              {schedule.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={16} />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1 text-sm">Warnings</p>
                      <ul className="space-y-1">
                        {schedule.warnings.map((warning, i) => (
                          <li key={i} className="text-yellow-700 text-xs">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduled Tasks */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <ArrowRight size={16} />
                  Recommended Order
                </h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {schedule.schedule.map((task, index) => (
                    <div
                      key={index}
                      className={`border-l-4 rounded-lg p-3 ${
                        task.criticalPath === 'Yes'
                          ? 'border-red-500 bg-red-50'
                          : 'border-indigo-500 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                            {task.orderIndex}
                          </span>
                          <h5 className="font-semibold text-gray-900 text-sm">{task.title}</h5>
                          {task.criticalPath === 'Yes' && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-600">{task.estimatedHours}h</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>Start: {formatDate(task.suggestedStartDate)}</p>
                        <p>End: {formatDate(task.suggestedEndDate)}</p>
                        {task.dependencies.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Depends on: {task.dependencies.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartScheduler;