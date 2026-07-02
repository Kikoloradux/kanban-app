const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Función auxiliar para obtener el token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export async function getProjects() {
  try {
    const token = getToken();
    
    if (!token) {
      console.warn('No hay token de autenticación');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return [];
    }

    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return [];
      }
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en getProjects:', error);
    return [];
  }
}

export async function createProject(project) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(project)
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en createProject:', error);
    throw error;
  }
}

export async function createTask(task) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(task)
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en createTask:', error);
    throw error;
  }
}

export async function updateTask(id, data) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    const res = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en updateTask:', error);
    throw error;
  }
}

export async function deleteTask(id) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    const res = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en deleteTask:', error);
    throw error;
  }
}

export async function deleteProject(id) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    const res = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en deleteProject:', error);
    throw error;
  }
}