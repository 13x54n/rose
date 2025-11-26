import { useState } from 'react';
import { Upload, File, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StorageView() {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateAndAddFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;
        setError(null);

        const validFiles: typeof files = [];

        Array.from(newFiles).forEach(file => {
            if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                setError('Audio and video files are not allowed on this plan.');
                return;
            }

            validFiles.push({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.type || 'Unknown'
            });
        });

        setFiles(prev => [...prev, ...validFiles]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        validateAndAddFiles(e.dataTransfer.files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        validateAndAddFiles(e.target.files);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 max-w-6xl mx-auto"
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Storage</h1>
                <p className="text-muted-foreground">Manage your decentralized files.</p>
            </div>

            {/* Upload Zone */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept="*/*"
                />
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-muted-foreground'
                        }`}>
                        <Upload className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-lg font-medium mb-1">Drop files here or click to upload</p>
                        <p className="text-sm text-muted-foreground">
                            Support for images, documents, and code. <span className="text-red-400">No audio or video.</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 overflow-hidden"
                    >
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File List */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-6">Recent Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {files.map((file, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                        <File className="w-5 h-5" />
                                    </div>
                                    <button className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="font-medium truncate mb-1" title={file.name}>{file.name}</h3>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{file.size}</span>
                                    <span className="uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                        {file.type.split('/')[1] || 'FILE'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {files.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                            No files uploaded yet.
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
