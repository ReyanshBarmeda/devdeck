import React, { useState, useMemo } from 'react';
import {
  Kanban,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Filter,
  Layers,
  Sparkles,
  Search,
  Check,
  Tag,
  Code2,
} from 'lucide-react';
import { Project, ProjectTask, ViewMode } from '../types';

interface KanbanBoardViewProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onNavigate: (view: ViewMode) => void;
  onSelectProject: (project: Project) => void;
}

type KanbanColumnId = 'backlog' | 'in_progress' | 'in_review' | 'shipped';

interface KanbanTaskItem extends ProjectTask {
  projectId: string;
  projectName: string;
  projectCategory: string;
  columnId: KanbanColumnId;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  projects,
  onUpdateProject,
  onNavigate,
  onSelectProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingTask, setIsAddingTask] = useState<KanbanColumnId | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState<string>(
    projects[0]?.id || ''
  );

  // Flatten and normalize tasks from all projects into kanban items
  const allTasks = useMemo(() => {
    const items: KanbanTaskItem[] = [];

    projects.forEach((proj) => {
      proj.tasks.forEach((task) => {
        // Derive column based on status or completion
        let column: KanbanColumnId = 'backlog';
        if (task.completed) {
          column = 'shipped';
        } else if (proj.status === 'in_progress' || proj.priority === 'urgent') {
          column = 'in_progress';
        } else if (proj.status === 'active') {
          column = 'in_review';
        } else {
          column = 'backlog';
        }

        items.push({
          ...task,
          projectId: proj.id,
          projectName: proj.name,
          projectCategory: proj.category,
          columnId: column,
        });
      });
    });

    return items;
  }, [projects]);

  // Filter tasks based on selections
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesProject = task.projectName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProject) return false;
      }
      return true;
    });
  }, [allTasks, selectedProjectId, searchQuery]);

  const columns: { id: KanbanColumnId; title: string; color: string; bg: string; dot: string }[] = [
    {
      id: 'backlog',
      title: 'Backlog / Planning',
      color: 'text-slate-300',
      bg: 'bg-slate-500/10 border-slate-500/20',
      dot: 'bg-slate-400',
    },
    {
      id: 'in_progress',
      title: 'In Progress / Active',
      color: 'text-blue-300',
      bg: 'bg-blue-500/10 border-blue-500/20',
      dot: 'bg-blue-400',
    },
    {
      id: 'in_review',
      title: 'Code Review & QA',
      color: 'text-amber-300',
      bg: 'bg-amber-500/10 border-amber-500/20',
      dot: 'bg-amber-400',
    },
    {
      id: 'shipped',
      title: 'Completed / Shipped',
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
  ];

  const handleToggleTaskStatus = (task: KanbanTaskItem) => {
    const targetProject = projects.find((p) => p.id === task.projectId);
    if (!targetProject) return;

    const updatedTasks = targetProject.tasks.map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );

    onUpdateProject({
      ...targetProject,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCreateTask = (colId: KanbanColumnId) => {
    if (!newTaskTitle.trim()) return;
    const targetProject = projects.find((p) => p.id === newTaskProjectId) || projects[0];
    if (!targetProject) return;

    const newTask: ProjectTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: colId === 'shipped',
    };

    onUpdateProject({
      ...targetProject,
      tasks: [...targetProject.tasks, newTask],
      updatedAt: new Date().toISOString(),
    });

    setNewTaskTitle('');
    setIsAddingTask(null);
  };

  const handleDeleteTask = (task: KanbanTaskItem) => {
    const targetProject = projects.find((p) => p.id === task.projectId);
    if (!targetProject) return;

    onUpdateProject({
      ...targetProject,
      tasks: targetProject.tasks.filter((t) => t.id !== task.id),
      updatedAt: new Date().toISOString(),
    });
  };

  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.completed).length;
  const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e121a]/80 backdrop-blur-xl border border-white/[0.08] p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Sprint Kanban & Milestones
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {filteredTasks.length} Milestones
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Track deliverables, sprint milestones, and progress across all workspaces
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress & Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Progress pill */}
          <div className="bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl flex items-center gap-3">
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Sprint Velocity</div>
              <div className="text-xs font-bold text-slate-200">{completedTasksCount}/{totalTasksCount} Done ({overallProgress}%)</div>
            </div>
            <div className="w-16 bg-white/[0.1] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Workspaces</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search milestone..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
            />
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.columnId === column.id);

          return (
            <div
              key={column.id}
              className="bg-[#0b0e14]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-3.5 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.dot}`} />
                  <h3 className="text-xs font-semibold text-slate-200">{column.title}</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/[0.06]">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Items List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {columnTasks.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);

                  return (
                    <div
                      key={task.id}
                      className="group bg-[#121620] hover:bg-[#161c28] border border-white/[0.08] hover:border-white/[0.14] p-3 rounded-xl transition-all shadow-sm select-none"
                    >
                      {/* Top: Project Badge */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <button
                          onClick={() => proj && onSelectProject(proj)}
                          className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] truncate max-w-[150px] cursor-pointer"
                        >
                          {task.projectName}
                        </button>

                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Main Task Title & Status Toggle */}
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 hover:text-blue-400" />
                          )}
                        </button>
                        <p
                          className={`text-xs leading-relaxed ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {columnTasks.length === 0 && !isAddingTask && (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No milestones in {column.title}
                  </div>
                )}

                {/* Inline New Task Input Form */}
                {isAddingTask === column.id && (
                  <div className="bg-[#151a24] border border-blue-500/30 p-3 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Milestone description..."
                      className="w-full bg-black/30 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateTask(column.id);
                        if (e.key === 'Escape') setIsAddingTask(null);
                      }}
                    />

                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={newTaskProjectId}
                        onChange={(e) => setNewTaskProjectId(e.target.value)}
                        className="bg-black/30 text-[11px] text-slate-300 border border-white/[0.08] rounded-md px-2 py-1 focus:outline-none max-w-[120px] truncate"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIsAddingTask(null)}
                          className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCreateTask(column.id)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Task Button at bottom of column */}
              {isAddingTask !== column.id && (
                <button
                  onClick={() => {
                    setIsAddingTask(column.id);
                    setNewTaskTitle('');
                  }}
                  className="mt-3 w-full py-2 px-3 rounded-xl border border-dashed border-white/[0.1] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
