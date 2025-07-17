import { useState, useEffect, useCallback, useMemo } from 'react';
import { dbUtils } from '../utils/database';

// 自定義項目 Hook
export const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await dbUtils.projects.getById(projectId);
      if (fetchError) {
        setError(fetchError);
        setProject(null);
      } else {
        setProject(data);
      }
    } catch (err) {
      setError(err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const projectData = useMemo(() => ({
    project,
    loading,
    error
  }), [project, loading, error]);

  return projectData;
};

// 自定義項目列表 Hook
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await dbUtils.projects.getAll();
      if (fetchError) {
        setError(fetchError);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      setError(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const projectsData = useMemo(() => ({
    projects,
    loading,
    error,
    fetchProjects
  }), [projects, loading, error, fetchProjects]);

  return projectsData;
};