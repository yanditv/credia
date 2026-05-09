'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, Image as ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { uploadApi } from '@/lib/api/upload';
import { ApiError } from '@/lib/api';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

interface FileUploadProps {
  // Devuelve la URL del archivo subido cuando termina
  onUploaded: (url: string) => void;
  // URL ya subida (modo controlado para mostrar preview cuando el form padre persiste)
  value?: string | null;
  // Callback al limpiar la selección (resetea el value en el padre)
  onClear?: () => void;
  // Notifica al padre cuando el upload está en curso, para gating de submit
  onUploadingChange?: (uploading: boolean) => void;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ onUploaded, value, onClear, onUploadingChange, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localFile, setLocalFile] = useState<{ name: string; size: number; preview?: string } | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_MIMETYPES.includes(file.type)) {
      return 'Formato no permitido. Usá JPG, PNG, WebP o PDF';
    }
    if (file.size > MAX_SIZE) {
      return `Archivo demasiado grande (máx 5 MB, tu archivo es ${formatBytes(file.size)})`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      const isImage = file.type.startsWith('image/');
      setLocalFile({
        name: file.name,
        size: file.size,
        preview: isImage ? URL.createObjectURL(file) : undefined,
      });
      setUploading(true);
      onUploadingChange?.(true);

      try {
        const res = await uploadApi.uploadFile(file);
        onUploaded(res.url);
        toast.success('Archivo subido');
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Error al subir el archivo';
        toast.error(message);
        setLocalFile(null);
      } finally {
        setUploading(false);
        onUploadingChange?.(false);
      }
    },
    [onUploaded, onUploadingChange, validateFile],
  );

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // permite re-seleccionar el mismo archivo
  }

  function handleClear() {
    if (localFile?.preview) URL.revokeObjectURL(localFile.preview);
    setLocalFile(null);
    onClear?.();
  }

  // Estado: archivo subido (value tiene URL) — mostrar preview con opción a limpiar
  if (value || localFile) {
    const previewSrc = localFile?.preview ?? value;
    const isImage = previewSrc?.match(/\.(jpe?g|png|webp)$/i);
    return (
      <div className={cn('flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-3', className)}>
        {isImage && previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt="Comprobante"
            className="h-16 w-16 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-400">
            <FileText className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">
            {localFile?.name ?? 'Archivo subido'}
          </p>
          {localFile ? (
            <p className="text-xs text-slate-500">{formatBytes(localFile.size)}</p>
          ) : null}
          {uploading ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Subiendo…
            </p>
          ) : (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-green-400">
              <Check className="h-3 w-3" /> Subido
            </p>
          )}
        </div>
        {!uploading ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Quitar archivo"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    );
  }

  // Estado: vacío — dropzone
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-slate-900/30 p-6 text-center transition-colors',
        dragOver
          ? 'border-green-500 bg-green-500/5'
          : 'border-slate-700 hover:border-slate-600 hover:bg-slate-900/50',
        className,
      )}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-400">
        {dragOver ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-slate-200">
          {dragOver ? 'Soltá el archivo' : 'Arrastrá un archivo o hacé click'}
        </p>
        <p className="text-xs text-slate-500">JPG, PNG, WebP o PDF · máx 5 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIMETYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
