import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { orgsApi, projectsApi } from '../api/client'

export default function Dashboard() {
  const [orgs, setOrgs] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [addingProject, setAddingProject] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const list = await orgsApi.list()
        if (!cancelled) {
          setOrgs(list)
          if (list.length && !selectedOrgId) setSelectedOrgId(list[0].id)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedOrgId) {
      setProjects([])
      return
    }
    let cancelled = false
    setLoading(true)
    projectsApi
      .list(selectedOrgId)
      .then((list) => {
        if (!cancelled) setProjects(list)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedOrgId])

  async function handleAddProject(e) {
    e.preventDefault()
    if (!newProjectName.trim() || !selectedOrgId) return
    setAddingProject(true)
    try {
      const project = await projectsApi.create(selectedOrgId, newProjectName.trim())
      setProjects((prev) => [...prev, project])
      setNewProjectName('')
      navigate(`/org/${selectedOrgId}/project/${project.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setAddingProject(false)
    }
  }

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId)

  if (loading && orgs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-surface-500">Loading…</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        {orgs.length > 0 && (
          <select
            value={selectedOrgId ?? ''}
            onChange={(e) => setSelectedOrgId(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-surface-200 bg-white text-surface-700"
          >
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {selectedOrg && (
        <>
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-surface-800 mb-4">Projects</h2>
            <form onSubmit={handleAddProject} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="New project name"
                className="flex-1 px-4 py-2 rounded-lg border border-surface-200 focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                type="submit"
                disabled={addingProject || !newProjectName.trim()}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
              >
                {addingProject ? 'Adding…' : 'Add project'}
              </button>
            </form>
            {loading && projects.length === 0 ? (
              <p className="text-surface-500">Loading projects…</p>
            ) : projects.length === 0 ? (
              <p className="text-surface-500">No projects yet. Create one above.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/org/${selectedOrgId}/project/${p.id}`}
                      className="block p-4 rounded-xl border border-surface-200 bg-white hover:border-brand-300 hover:shadow-md transition"
                    >
                      <span className="font-medium text-surface-900">{p.name}</span>
                      {p.description && (
                        <p className="text-sm text-surface-500 mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {orgs.length === 0 && !loading && (
        <p className="text-surface-500">No workspace found. Create an account to get a default workspace.</p>
      )}
    </div>
  )
}
