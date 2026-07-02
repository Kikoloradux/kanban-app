<?php

namespace App\Controller;

use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/projects')]
class ProjectController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $projects = $em->getRepository(Project::class)->findAll();

        $data = [];

        foreach ($projects as $project) {
        $tasks = [];

        foreach ($project->getTasks() as $task) {
            $tasks[] = [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'status' => $task->getStatus(),
                'description' => $task->getDescription(),
            ];
        }

        $data[] = [
            'id' => $project->getId(),
            'name' => $project->getName(),
            'description' => $project->getDescription(),
            'tasks' => $tasks
        ];
    }

    return $this->json($data);
}

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $project = new Project();
        $project->setName($data['name']);
        $project->setDescription($data['description'] ?? '');
        $project->setUser($this->getUser());

        $em->persist($project);
        $em->flush();

        return $this->json($project);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Project $project, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $project->setName($data['name']);
        }

        if (isset($data['description'])) {
            $project->setDescription($data['description']);
        }

        $em->flush();

        return $this->json($project);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Project $project, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($project);
        $em->flush();

        return $this->json(['message' => 'Project deleted']);
    }
}