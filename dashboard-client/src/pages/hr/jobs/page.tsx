import { useState } from 'react'
import { useMyTenant } from '@/hooks/useMyTenant'
import { useJobs, useCreateJob, useDepartments, type Job } from '@/hooks/hr'
import { Plus, Briefcase, Users, Building2, Edit, Trash2, X } from 'lucide-react'

export default function JobsPage() {
  const { tenant } = useMyTenant()
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  const { data: jobsData, isLoading } = useJobs(tenant?.id || null)
  const { data: departmentsData } = useDepartments(tenant?.id || null)
  const { mutate: createJob } = useCreateJob()

  const jobs = jobsData?.jobs || []
  const departments = departmentsData?.departments || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Postes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {jobsData?.total || 0} postes définis
          </p>
        </div>
        <button
          onClick={() => {
            setEditingJob(null)
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Nouveau poste
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-40" />
          ))}
        </div>
      )}

      {/* Liste des postes */}
      {!isLoading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => {
                setEditingJob(job)
                setShowModal(true)
              }}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun poste défini
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Créez vos premiers postes pour structurer votre organisation
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Créer un poste
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <JobModal
          job={editingJob}
          departments={departments}
          onClose={() => {
            setShowModal(false)
            setEditingJob(null)
          }}
          onSave={(data) => {
            if (tenant?.id) {
              createJob({ tenant_id: tenant.id, ...data })
              setShowModal(false)
              setEditingJob(null)
            }
          }}
        />
      )}
    </div>
  )
}

function JobCard({ job, onEdit }: { job: Job; onEdit: () => void }) {
  const filledPercentage = job.expected_employees > 0
    ? Math.min(100, (job.no_of_employee / job.expected_employees) * 100)
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <Briefcase className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {job.name}
            </h3>
            {job.department_name && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Building2 className="w-3 h-3" />
                {job.department_name}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">Effectif</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {job.no_of_employee} / {job.expected_employees || '∞'}
          </span>
        </div>
        {job.expected_employees > 0 && (
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                filledPercentage >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${filledPercentage}%` }}
            />
          </div>
        )}
      </div>

      {job.description && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {job.description}
        </p>
      )}
    </div>
  )
}

function JobModal({
  job,
  departments,
  onClose,
  onSave,
}: {
  job: Job | null
  departments: any[]
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    name: job?.name || '',
    department_id: job?.department_id || '',
    expected_employees: job?.expected_employees || 1,
    description: job?.description || '',
    requirements: job?.requirements || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      department_id: formData.department_id ? Number(formData.department_id) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {job ? 'Modifier le poste' : 'Nouveau poste'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Intitulé du poste *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Département
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="">Aucun</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Effectif prévu
            </label>
            <input
              type="number"
              min="0"
              value={formData.expected_employees}
              onChange={(e) => setFormData({ ...formData, expected_employees: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
            >
              {job ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
