import { useState } from 'react'
import { useMyTenant } from '@/hooks/useMyTenant'
import { useDepartments, useDepartmentsTree, useCreateDepartment, type Department } from '@/hooks/hr'
import { Plus, Building2, Users, ChevronRight } from 'lucide-react'

export default function DepartmentsPage() {
  const { tenant } = useMyTenant()
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list')

  const { data: departmentsData, isLoading } = useDepartments(tenant?.id || null)
  const { data: treeData } = useDepartmentsTree(tenant?.id || null)

  const departments = departmentsData?.departments || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Départements
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {departmentsData?.total || 0} départements
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Nouveau département
        </button>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
        >
          Liste
        </button>
        <button
          onClick={() => setViewMode('tree')}
          className={`px-4 py-2 rounded-lg ${viewMode === 'tree' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
        >
          Organigramme
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      )}

      {/* Tree View */}
      {!isLoading && viewMode === 'tree' && treeData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          {treeData.map(dept => (
            <DepartmentTreeNode key={dept.id} node={dept} level={0} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && departments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun département
          </h3>
          <p className="text-gray-500 mb-4">Créez votre premier département</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Créer un département
          </button>
        </div>
      )}
    </div>
  )
}

function DepartmentCard({ department }: { department: Department }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {department.name}
          </h3>
          {department.code && (
            <p className="text-sm text-gray-500">{department.code}</p>
          )}
        </div>
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
          <Building2 className="w-5 h-5 text-cyan-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{department.total_employee} employés</span>
        </div>
        {department.manager_name && (
          <span className="text-sm text-gray-500">
            {department.manager_name}
          </span>
        )}
      </div>
    </div>
  )
}

function DepartmentTreeNode({ node, level }: { node: any; level: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div style={{ marginLeft: level * 24 }}>
      <div
        className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        )}
        {!hasChildren && <span className="w-4" />}
        <Building2 className="w-4 h-4 text-cyan-500" />
        <span className="font-medium text-gray-900 dark:text-white">{node.name}</span>
        <span className="text-sm text-gray-500 ml-2">({node.total_employee})</span>
        {node.manager && (
          <span className="ml-auto text-sm text-gray-500">
            {node.manager.name}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child: any) => (
            <DepartmentTreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
