import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { projectsApi, tasksApi } from '../api/client'

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

export default function ProjectDetail() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [proj, taskList] = await Promise.all([
          projectsApi.get(Number(orgId), Number(projectId)),
          tasksApi.list(Number(orgId), Number(projectId)),
        ])
        if (!cancelled) {
          setProject(proj)
          setTasks(taskList || [])
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [orgId, projectId])

  async function handleAddTask(e) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setAddingTask(true)
    try {
      const task = await tasksApi.create(Number(orgId), Number(projectId), {
        title: newTaskTitle.trim(),
        status: 'todo',
      })
      setTasks((prev) => [...prev, task])
      setNewTaskTitle('')
    } catch (e) {
      setError(e.message)
    } finally {
      setAddingTask(false)
    }
  }

  async function handleStatusChange(task, newStatus) {
    try {
      const updated = await tasksApi.update(Number(orgId), Number(projectId), task.id, {
        status: newStatus,
      })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDeleteTask(task) {
    if (!confirm('Delete this task?')) return
    try {
      await tasksApi.delete(Number(orgId), Number(projectId), task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-surface-500">Loading…</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-surface-500 mb-4">Project not found.</p>
        <Link to="/" className="text-brand-600 hover:underline">Back to dashboard</Link>
      </div>
    )
  }

  const byStatus = (status) => tasks.filter((t) => t.status === status)

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/"
          className="text-sm text-brand-600 hover:underline mb-2 inline-block"
        >
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-surface-900">{project.name}</h1>
        {project.description && (
          <p className="text-surface-600 mt-1">{project.description}</p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAddTask} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task"
          className="flex-1 px-4 py-2 rounded-lg border border-surface-200 focus:ring-2 focus:ring-brand-500 outline-none"
        />
        <button
          type="submit"
          disabled={addingTask || !newTaskTitle.trim()}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {addingTask ? 'Adding…' : 'Add task'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <div key={value} className="rounded-xl border border-surface-200 bg-surface-50/50 p-4">
            <h3 className="font-semibold text-surface-700 mb-3">{label}</h3>
            <ul className="space-y-2">
              {byStatus(value).map((task) => (
                <li
                  key={task.id}
                  className="bg-white rounded-lg border border-surface-200 p-3 flex items-center justify-between gap-2"
                >
                  <span className="text-surface-900 flex-1 min-w-0 truncate">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="text-xs rounded border border-surface-200 px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task)}
                      className="text-surface-400 hover:text-red-600 text-sm"
                      aria-label="Delete task"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
              {byStatus(value).length === 0 && (
                <li className="text-sm text-surface-400 italic">No tasks</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
