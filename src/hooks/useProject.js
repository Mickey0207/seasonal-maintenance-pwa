import { useState, useEffect } from 'react';
import { dbUtils } from '../utils/database';

// 自定義項目 Hook
export const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
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
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
};

// 自定義項目列表 Hook
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
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
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, fetchProjects };
};