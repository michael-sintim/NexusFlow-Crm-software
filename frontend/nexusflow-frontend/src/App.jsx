import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useUIStore } from './store/uiStore'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupForm from './components/auth/SignupForm'
import DashboardPage from './pages/DashboardPage'
import ContactsPage from './pages/ContactsPage'
import ContactDetailPage from './components/contacts/ContactsDetail'
import EditContactPage from './pages/EditContactPage'
import PipelinePage from './pages/PipelinePage'
import TasksPage from './pages/TasksPage'
import TaskForm from './components/tasks/TaskForm'
import TaskDetail from './components/tasks/TaskDetail'
import OpportunityForm from './components/pipeline/OpportunityForm'
import ContactForm from './components/contacts/ContactForm'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/404Page'
import CalendarPage from './pages/CalendarPage'
import EventDetailsPage from './pages/EventDetailsPage'
import './index.css'

function App() {
  const { theme } = useUIStore()

  React.useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  return (
    <Router>
      <div className={`min-h-screen bg-background text-foreground transition-colors duration-300`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupForm />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Redirect root to dashboard */}
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            {/* Add contact detail and edit routes inside layout */}
            <Route path="contacts/:id" element={<ContactDetailPage />} />
            <Route path="contacts/:id/edit" element={<EditContactPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="tasks" element={<TasksPage />} />
            {/* ADD TASK DETAIL ROUTE INSIDE LAYOUT */}
            <Route path="tasks/:id" element={<TaskDetail />} />
            {/* ADD CALENDAR ROUTES */}
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Standalone Protected Routes (without Layout) */}
          <Route path="/tasks/new" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />
          {/* ADD TASK EDIT ROUTE */}
          <Route path="/tasks/:id/edit" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />
          <Route path="/opportunities/new" element={
            <ProtectedRoute>
              <OpportunityForm />
            </ProtectedRoute>
          } />
          {/* ADD OPPORTUNITY EDIT ROUTE */}
          <Route path="/opportunities/:id/edit" element={
            <ProtectedRoute>
              <OpportunityForm />
            </ProtectedRoute>
          } />
          {/* REMOVED: ContactForm route - now handled as modal */}

          {/* ADD CALENDAR EVENT DETAIL ROUTE */}
          <Route path="/calendar/event/:id" element={
            <ProtectedRoute>
              <EventDetailsPage />
            </ProtectedRoute>
          } />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App