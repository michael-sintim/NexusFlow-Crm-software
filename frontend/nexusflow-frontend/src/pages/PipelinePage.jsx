import React from 'react'
import { Plus } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import KanbanBoard from '../components/pipeline/KanbanBoard'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const PipelinePage = () => {
  const { opportunities, fetchOpportunities, pipelineData } = useDataStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main container - fixed width, no horizontal scroll */}
      <div className="w-full  ">
        {/* Fixed Header Section - doesn't scroll */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div> 
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sales Pipeline
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track and manage your sales opportunities
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/opportunities/new')}
              className="mt-4 sm:mt-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </div>

          {/* Pipeline Stats - doesn't scroll */}
          {pipelineData && (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {pipelineData.map((stage) => (
                <div key={stage.stage} className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stage.count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stage.name}
                  </div> 
                  <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                    ${(stage.value / 1000).toFixed(0)}K
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Kanban Board Section - only this scrolls horizontally */}
        <div className="mt-6">
          <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            <div className="min-w-fit">
              <KanbanBoard opportunities={opportunities} />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PipelinePage