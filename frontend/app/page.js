"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";

import {
  getProjects,
  createProject,
  createTask,
  updateTask,
  deleteTask,
  deleteProject,
} from "../services/api";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [activeTask, setActiveTask] = useState(null);

  const [taskDescription, setTaskDescription] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 2;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Error al cargar los proyectos. Intenta nuevamente.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitProject(e) {
    e.preventDefault();
    if (!name.trim()) {
      alert("El nombre del proyecto es requerido");
      return;
    }
    try {
      await createProject({ name, description });
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Error al crear el proyecto");
    }
  }

  async function handleDeleteProject(id) {
    if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Error al eliminar el proyecto");
    }
  }

  async function handleSubmitTask(e) {
    e.preventDefault();
    if (!taskTitle.trim()) {
      alert("El título de la tarea es requerido");
      return;
    }
    if (!selectedProject) {
      alert("Debes seleccionar un proyecto");
      return;
    }

    try {
      await createTask({
        title: taskTitle,
        description: taskDescription,
        status: "pendiente",
        project_id: parseInt(selectedProject),
      });

      setTaskTitle("");
      setTaskDescription("");
      setSelectedProject("");
      await load();
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Error al crear la tarea");
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;
    try {
      await deleteTask(id);
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          tasks: (p.tasks || []).filter((t) => t.id !== id),
        }))
      );
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Error al eliminar la tarea");
    }
  }

  function findTaskById(id) {
    for (const p of projects) {
      const task = (p.tasks || []).find((t) => t.id === id);
      if (task) return task;
    }
    return null;
  }

  function handleDragStart(event) {
    setActiveTask(findTaskById(event.active.id));
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    if (!["pendiente", "en_progreso", "completada"].includes(newStatus)) return;

    try {
      await updateTask(taskId, { status: newStatus });

      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          tasks: (p.tasks || []).map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          ),
        }))
      );
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Error al actualizar la tarea");
    }
  }

  const projectsArray = Array.isArray(projects) ? projects : [];

  const filteredProjects = projectsArray.map((p) => ({
    ...p,
    tasks: (p.tasks || []).filter((t) => {
      const matchSearch = t.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus = filter === "all" ? true : t.status === filter;

      return matchStatus && matchSearch;
    }),
  }));

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / pageSize)
  );

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  function Task({ task }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: task.id,
    });

    return (
      <div ref={setNodeRef} {...attributes} {...listeners}>
        <div className="w-[280px] bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-grab">
          <p className="font-medium text-gray-800">{task.title}</p>
          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 inline-block mt-2">
            {task.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(task.id);
            }}
            className="text-xs text-red-500 mt-3 block hover:text-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    );
  }

  function Column({ id, title, tasks }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    const bg = {
      pendiente: "bg-gray-50",
      en_progreso: "bg-blue-50",
      completada: "bg-green-50",
    };

    const ring = {
      pendiente: "ring-gray-300",
      en_progreso: "ring-blue-400",
      completada: "ring-green-400",
    };

    return (
      <div
        ref={setNodeRef}
        className={`
          rounded-2xl p-4 min-h-[600px]
          bg-white/70 backdrop-blur
          border border-gray-200
          shadow-sm
          transition-all duration-200
          ${bg[id]}
          ${isOver ? `ring-2 ${ring[id]} scale-[1.01]` : ""}
        `}
      >
        <div className="flex justify-between mb-4">
          <h3 className="text-xs uppercase font-semibold text-gray-600 tracking-widest">
            {title}
          </h3>
          <span className="text-xs bg-white px-2 py-1 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <Task key={t.id} task={t} />
          ))}
        </div>
      </div>
    );
  }

  // Botón de logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Kanban Board
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition text-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* PROJECT FORM */}
        <form
          onSubmit={handleSubmitProject}
          className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border mb-4"
        >
          <input
            className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Nombre del proyecto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition"
          >
            Crear proyecto
          </button>
        </form>

        {/* PROJECT LIST */}
        <div className="mb-4">
          {projectsArray.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay proyectos aún. Crea uno arriba.
            </p>
          ) : (
            projectsArray.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center bg-white p-4 mb-2 rounded-xl shadow-sm border"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  {p.description && (
                    <p className="text-xs text-gray-500">{p.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {p.tasks ? p.tasks.length : 0} tareas
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteProject(p.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>

        {/* TASK FORM */}
        <form
          onSubmit={handleSubmitTask}
          className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border mb-4"
        >
          <input
            className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Título de la tarea"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <textarea
            className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Descripción de la tarea (opcional)"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows="2"
          />

          <select
            className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Seleccionar proyecto</option>
            {projectsArray.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition"
          >
            Crear tarea
          </button>
        </form>

        {/* BUSCADOR */}
        <input
          className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Buscar tareas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTRO */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "pendiente", "en_progreso", "completada"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl text-sm transition ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {f === "all" ? "Todas" : f}
            </button>
          ))}
        </div>

        {/* PAGINACIÓN */}
        {filteredProjects.length > pageSize && (
          <div className="flex gap-3 mb-6 items-center">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-xl transition ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Anterior
            </button>

            <span className="text-sm">
              Página {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-xl transition ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* KANBAN */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {paginatedProjects.length === 0 ? (
            <div className="bg-white/80 backdrop-blur p-8 rounded-2xl text-center border">
              <p className="text-gray-500">
                {search || filter !== "all"
                  ? "No hay tareas que coincidan con los filtros"
                  : "No hay proyectos con tareas. Crea una tarea arriba."}
              </p>
            </div>
          ) : (
            paginatedProjects.map((project) => (
              <div key={project.id} className="mb-10">
                <h2 className="text-xl font-semibold mb-3">
                  {project.name}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {(project.tasks || []).length} tareas
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Column
                    id="pendiente"
                    title="PENDIENTE"
                    tasks={(project.tasks || []).filter(
                      (t) => t.status === "pendiente"
                    )}
                  />

                  <Column
                    id="en_progreso"
                    title="EN PROGRESO"
                    tasks={(project.tasks || []).filter(
                      (t) => t.status === "en_progreso"
                    )}
                  />

                  <Column
                    id="completada"
                    title="COMPLETADA"
                    tasks={(project.tasks || []).filter(
                      (t) => t.status === "completada"
                    )}
                  />
                </div>
              </div>
            ))
          )}

          <DragOverlay>
            {activeTask ? (
              <div className="w-[280px] bg-white p-4 rounded-xl shadow-xl border-2 border-blue-400">
                <p className="font-medium text-gray-800">{activeTask.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activeTask.description}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}