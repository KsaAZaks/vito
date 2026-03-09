<?php

namespace App\Http\Controllers;

use App\Exceptions\SSHError;
use App\Models\Server;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Delete;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Prefix;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

#[Prefix('servers/{server}/file-manager')]
#[Middleware(['auth', 'has-project'])]
class FileManagerController extends Controller
{
    private const MAX_READ_SIZE = 1048576; // 1MB

    #[Get('/', name: 'file-manager')]
    public function index(Server $server, Request $request): Response
    {
        $this->authorize('view', $server);

        $siteId = $request->query('site');
        $site = $siteId ? $server->sites()->findOrFail($siteId) : null;

        return Inertia::render('file-manager/index', [
            'site' => $site,
            'initialPath' => $site ? $site->path : '/home/'.$server->getSshUser(),
        ]);
    }

    #[Get('/list', name: 'file-manager.list')]
    public function list(Server $server, Request $request): JsonResponse
    {
        $this->authorize('view', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $files = $server->os()->lsDirectory($path, $site?->user);

            return response()->json([
                'path' => $path,
                'files' => $files,
            ]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to list directory: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Get('/read', name: 'file-manager.read')]
    public function read(Server $server, Request $request): JsonResponse
    {
        $this->authorize('view', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $sizeOutput = trim($server->ssh($site?->user)->exec("sudo stat -c '%s' ".escapeshellarg($path)." 2>/dev/null || sudo stat -f '%z' ".escapeshellarg($path)." 2>/dev/null"));
            $size = (int) $sizeOutput;

            if ($size > self::MAX_READ_SIZE) {
                return response()->json([
                    'error' => 'File is too large to edit (max 1MB). Size: '.number_format($size / 1024, 1).'KB',
                ], 422);
            }

            $content = $server->os()->readFile($path, $site?->user);

            return response()->json([
                'content' => $content,
                'path' => $path,
            ]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to read file: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/write', name: 'file-manager.write')]
    public function write(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'content' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $server->os()->write($path, $request->input('content'), $site?->user);

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to write file: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/create-file', name: 'file-manager.create-file')]
    public function createFile(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $server->ssh($site?->user)->exec('touch '.escapeshellarg($path));

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to create file: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/create-directory', name: 'file-manager.create-directory')]
    public function createDirectory(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $server->os()->mkdir($path, $site?->user);

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to create directory: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/rename', name: 'file-manager.rename')]
    public function rename(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'from' => ['required', 'string'],
            'to' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $from = $request->input('from');
        $to = $request->input('to');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($from, $site);
        $this->validatePath($to, $site);

        try {
            $server->os()->rename($from, $to, $site?->user);

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to rename: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Delete('/delete', name: 'file-manager.delete')]
    public function delete(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        if ($path === '/' || $path === '/home' || $path === '/root') {
            return response()->json([
                'error' => 'Cannot delete system directories.',
            ], 422);
        }

        try {
            $server->os()->deleteFile($path, $site?->user);

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to delete: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/upload', name: 'file-manager.upload')]
    public function upload(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'file' => ['required', 'file', 'max:51200'], // 50MB max
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $file = $request->file('file');
            $localPath = $file->getRealPath();
            $remotePath = rtrim($path, '/').'/'.$file->getClientOriginalName();

            $server->ssh()->upload($localPath, $remotePath, $site?->user);

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Failed to upload file: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Get('/download', name: 'file-manager.download')]
    public function download(Server $server, Request $request): BinaryFileResponse|JsonResponse
    {
        $this->authorize('view', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $filename = basename($path);
            $tmpPath = Storage::disk('tmp')->path($filename.'-'.time());

            $server->ssh()->download($tmpPath, $path);

            return response()->download($tmpPath, $filename)->deleteFileAfterSend();
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Failed to download file: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/chmod', name: 'file-manager.chmod')]
    public function chmod(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'permissions' => ['required', 'string', 'regex:/^[0-7]{3,4}$/'],
            'recursive' => ['boolean'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $server->os()->chmod(
                $path,
                $request->input('permissions'),
                $request->boolean('recursive'),
                $site?->user,
            );

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to change permissions: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/chown', name: 'file-manager.chown')]
    public function chown(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'owner' => ['required', 'string'],
            'group' => ['required', 'string'],
            'recursive' => ['boolean'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        try {
            $server->os()->chown(
                $path,
                $request->input('owner'),
                $request->input('group'),
                $request->boolean('recursive'),
                $site?->user,
            );

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to change ownership: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/archive', name: 'file-manager.archive')]
    public function archive(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);

        $archivePath = $path.'.tar.gz';

        try {
            $server->os()->compress($path, $archivePath, $site?->user);

            return response()->json([
                'success' => true,
                'archive_path' => $archivePath,
            ]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to create archive: '.$e->getMessage(),
            ], 500);
        }
    }

    #[Post('/extract', name: 'file-manager.extract')]
    public function extract(Server $server, Request $request): JsonResponse
    {
        $this->authorize('update', $server);

        $request->validate([
            'path' => ['required', 'string'],
            'destination' => ['nullable', 'string'],
            'site' => ['nullable', 'integer'],
        ]);

        $path = $request->input('path');
        $destination = $request->input('destination', dirname($path));
        $site = $this->resolveSite($server, $request);

        $this->validatePath($path, $site);
        $this->validatePath($destination, $site);

        try {
            $server->os()->extract($path, $destination, $site?->user);

            return response()->json(['success' => true]);
        } catch (SSHError $e) {
            return response()->json([
                'error' => 'Failed to extract archive: '.$e->getMessage(),
            ], 500);
        }
    }

    private function resolveSite(Server $server, Request $request): ?Site
    {
        $siteId = $request->input('site');
        if (! $siteId) {
            return null;
        }

        return $server->sites()->findOrFail($siteId);
    }

    private function validatePath(string $path, ?Site $site): void
    {
        if ($path === '' || ! str_starts_with($path, '/')) {
            abort(422, 'Invalid path: must be an absolute path.');
        }

        if (str_contains($path, '..')) {
            abort(422, 'Invalid path: directory traversal is not allowed.');
        }

        if ($site) {
            $sitePath = rtrim($site->path, '/');
            $normalizedPath = rtrim($path, '/');

            if ($normalizedPath !== $sitePath && ! str_starts_with($normalizedPath, $sitePath.'/')) {
                abort(422, 'Access denied: path is outside the site directory.');
            }
        }
    }
}
