<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\Project;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class TaskController extends AbstractController
{
    #[Route('/api/tasks', methods: ['GET'])]
    public function index(TaskRepository $repo): JsonResponse
    {
        $tasks = $repo->findAll();

        $data = [];

        foreach ($tasks as $task) {
            $data[] = [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'status' => $task->getStatus(),
                'project_id' => $task->getProject()?->getId(),
                'description' => $task->getDescription(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/tasks/{id}', methods: ['GET'])]
    public function show(Task $task): JsonResponse
    {
        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'status' => $task->getStatus(),
            'project_id' => $task->getProject()?->getId(),
            'description' => $task->getDescription(),
            
        ]);
    }

    #[Route('/api/tasks', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $task = new Task();
        $task->setTitle($data['title'] ?? '');
        $task->setStatus($data['status'] ?? 'todo');
        $task->setDescription($data['description'] ?? null);

        if (!empty($data['project_id'])) {
            $project = $em->getRepository(Project::class)->find($data['project_id']);
            if ($project) {
                $task->setProject($project);
            }
        }

        $em->persist($task);
        $em->flush();

        return $this->json($task, 201);
    }

    #[Route('/api/tasks/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        $task->setTitle($data['title'] ?? $task->getTitle());
        $task->setStatus($data['status'] ?? $task->getStatus());
        $task->setDescription($data['description'] ?? $task->getDescription());

        if (isset($data['project_id'])) {
            $project = $em->getRepository(Project::class)->find($data['project_id']);
            if ($project) {
                $task->setProject($project);
            }
        }

        $em->flush();

        return $this->json($task);
    }

    #[Route('/api/tasks/{id}', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        $em->remove($task);
        $em->flush();

        return $this->json(['message' => 'Task deleted']);
    }
}